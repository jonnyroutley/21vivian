use std::env;

use reqwest::Client;
use serde::Serialize;

pub struct PushsaferService {
    client: Client,
}

#[derive(Serialize, Debug)]
struct PushSaferMessage<'a> {
    k: &'a str, // Your private or alias key
    m: &'a str, // The message you want to send
    t: &'a str, // The title of the notification
}

const PUSHSAFER_URL: &str = "https://www.pushsafer.com/api";

impl PushsaferService {
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    pub async fn send_notification(
        &self,
        title: &str,
        message: &str
    ) -> Result<(), Box<dyn std::error::Error>> {
        let pushsafer_key = env::var("PUSHSAFER_KEY").expect("PUSHSAFER_KEY not found");
        println!("{:?}", pushsafer_key);
        let message = PushSaferMessage {
            k: &pushsafer_key,
            m: message,
            t: title,
        };

        let response = match self.client.post(PUSHSAFER_URL).form(&message).send().await {
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
