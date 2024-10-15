use std::env;

use reqwest::Client;
use serde::Serialize;

pub struct PushsaferService {
    client: Client,
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
            u: message.u
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

impl PushsaferService {
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    pub async fn send_notification(
        &self,
        pushsafer_message: Notification
    ) -> Result<(), Box<dyn std::error::Error>> {
        let pushsafer_key = env::var("PUSHSAFER_KEY").expect("PUSHSAFER_KEY not found");

        let internal_message = PushsaferMessageInternal::from_public(pushsafer_message, pushsafer_key);

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
}
