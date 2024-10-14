use std::env;

use reqwest::Client;
use serde::Serialize;

pub struct PushSaferService {
    client: Client,
}

#[derive(Serialize)]
struct PushSaferMessage<'a> {
    k: &'a str, // Your private or alias key
    m: &'a str, // The message you want to send
    t: &'a str, // The title of the notification
    d: &'a str, // The target device or group (0 = all devices)
    s: &'a str, // Sound (optional, can be "1" or "2" etc. See Pushsafer docs)
    v: &'a str, // Vibration pattern (optional)
    i: &'a str, // Icon (optional)
}

impl PushSaferService {
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    pub async fn send_notification(
        &self,
        title: &str,
        message: &str
    ) -> Result<(), Box<dyn std::error::Error>> {
        let pushsafer_key = env::var("PUSHSAFER_KEY").expect("PUSHSAFER_KEY not found");

        let message = PushSaferMessage {
            k: &pushsafer_key,
            m: message,
            t: title,
            d: "0", // Send to all devices (default)
            s: "1", // Use default sound
            v: "1", // Default vibration
            i: "1", // Default icon
        };

        let response = self.client
            .post("https://www.pushsafer.com/api")
            .json(&message)
            .send().await?;

        if response.status().is_success() {
            println!("Notification sent");
        } else {
            println!("Failed to send notification");
        }

        Ok(())
    }
}
