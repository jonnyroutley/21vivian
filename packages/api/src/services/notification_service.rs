use std::env;

use reqwest::Client;
use serde::Serialize;

pub struct PushsaferService {
    client: Client,
}

#[derive(Serialize)]
pub struct PushsaferMessage {
    k: Option<String>, // Your private or alias key
    m: String, // The message you want to send
    t: String, // The title of the notification
    u: Option<String>, // url link
}

impl PushsaferMessage {
    pub fn builder() -> NotificationBuilder {
        NotificationBuilder::default()
    }

    pub fn set_key(&mut self, key: String) {
        self.k = Some(key);
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

    pub fn build(self) -> PushsaferMessage {
        PushsaferMessage {
            k: None,
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
        mut pushsafer_message: PushsaferMessage
    ) -> Result<(), Box<dyn std::error::Error>> {
        let pushsafer_key = env::var("PUSHSAFER_KEY").expect("PUSHSAFER_KEY not found");

        pushsafer_message.set_key(pushsafer_key);

        let response = match self.client.post(PUSHSAFER_URL).form(&pushsafer_message).send().await {
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
