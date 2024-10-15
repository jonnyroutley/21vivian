use std::env;

use reqwest::Client;
use serde::Serialize;

pub struct PushsaferService {
    client: Client,
}

#[derive(Serialize, Debug)]
struct PushsaferMessage<'a> {
    k: &'a str, // Your private or alias key
    m: &'a str, // The message you want to send
    t: &'a str, // The title of the notification
    u: &'a str, // url link
}

const PUSHSAFER_URL: &str = "https://www.pushsafer.com/api";

impl PushsaferService {
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    pub async fn send_notification(
        &self,
        title: &str,
        message: &str,
        url: &str
    ) -> Result<(), Box<dyn std::error::Error>> {
        let pushsafer_key = env::var("PUSHSAFER_KEY").expect("PUSHSAFER_KEY not found");
        println!("{:?}", pushsafer_key);
        let message = PushsaferMessage {
            k: &pushsafer_key,
            m: message,
            t: title,
            u: url,
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
