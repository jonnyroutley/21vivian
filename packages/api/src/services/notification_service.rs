use std::{ collections::HashMap, env };

use reqwest::Client;
use serde::Serialize;

pub struct PushsaferService {
    client: Client,
    templates: HashMap<String, NotificationTemplate>,
}

pub struct Notification {
    m: String, // The message you want to send
    t: String, // The title of the notification
    u: Option<String>, // url link
}

#[derive(Serialize)]
struct PushsaferMessageInternal {
    k: String, // Your private or alias key
    m: String, // The message you want to send
    t: String, // The title of the notification
    u: Option<String>, // url link
}

impl PushsaferMessageInternal {
    pub fn from_public(message: Notification, key: String) -> PushsaferMessageInternal {
        PushsaferMessageInternal {
            k: key,
            m: message.m,
            t: message.t,
            u: message.u,
        }
    }
}

impl Notification {
    pub fn builder() -> NotificationBuilder {
        NotificationBuilder::default()
    }
}

#[derive(Default)]
pub struct NotificationBuilder {
    m: String,
    t: String,
    u: Option<String>,
}

impl NotificationBuilder {
    pub fn new(title: String, message: String) -> NotificationBuilder {
        NotificationBuilder {
            t: title,
            m: message,
            u: None,
        }
    }

    pub fn url(mut self, url: String) -> NotificationBuilder {
        self.u = Some(url);
        self
    }

    pub fn build(self) -> Notification {
        Notification {
            m: self.m,
            t: self.t,
            u: self.u,
        }
    }
}

const PUSHSAFER_URL: &str = "https://www.pushsafer.com/api";

struct NotificationTemplate {
    title: String,
    message: String,
}

impl PushsaferService {
    pub fn new(client: Client) -> Self {
        let mut templates = HashMap::new();
        templates.insert("dinner".to_string(), NotificationTemplate {
            title: "Dinner time".to_string(),
            message: "No dilly-dallying".to_string(),
        });
        templates.insert("sexy".to_string(), NotificationTemplate {
            title: "Mr Sexy in da house".to_string(),
            message: "meooow".to_string(),
        });
        templates.insert("dave".to_string(), NotificationTemplate {
            title: "Dave is here!".to_string(),
            message: "".to_string(),
        });
        templates.insert("pints".to_string(), NotificationTemplate {
            title: "Pint time".to_string(),
            message: "It's 5 o'clock somewhere".to_string(),
        });
        templates.insert("girlfriend".to_string(), NotificationTemplate {
            title: "Girlfriend alert !".to_string(),
            message: "Tops off fellas!".to_string(),
        });
        templates.insert("summers".to_string(), NotificationTemplate {
            title: "Summers family alert !".to_string(),
            message: "Tops on fellas!".to_string(),
        });

        Self { client, templates }
    }

    fn get_template(&self, template_name: &str) -> Option<&NotificationTemplate> {
        self.templates.get(template_name)
    }

    pub async fn send_notification(
        &self,
        pushsafer_message: Notification
    ) -> Result<(), Box<dyn std::error::Error>> {
        let pushsafer_key = env::var("PUSHSAFER_KEY").expect("PUSHSAFER_KEY not found");

        let internal_message = PushsaferMessageInternal::from_public(
            pushsafer_message,
            pushsafer_key
        );

        let response = match self.client.post(PUSHSAFER_URL).form(&internal_message).send().await {
            Ok(result) => result,
            Err(e) => {
                return Err(Box::new(e));
            }
        };

        if response.status().is_success() {
            println!("Notification sent");
        } else {
            println!("Failed to send notification");
        }

        Ok(())
    }

    pub async fn send_template_notification(&self, template_name: &str) -> Result<(), String> {
        match self.get_template(template_name) {
            Some(template) => {
                println!("Sending notification: {}", template.title);

                let notification = NotificationBuilder::new(
                    template.title.clone(),
                    template.message.clone()
                ).build();

                let _ = self.send_notification(notification).await;
                Ok(())
            }
            None => Err(format!("Template '{}' not found", template_name)),
        }
    }
}
