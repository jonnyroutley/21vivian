use poem::http::HeaderMap;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
pub struct AiService {
    client: Client,
    api_key: String,
    base_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiResponse {
    pub candidates: Vec<Candidate>,
    pub usage_metadata: UsageMetadata,
    pub model_version: String,
    pub response_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Candidate {
    pub content: Content,
    pub finish_reason: String,
    pub avg_logprobs: f64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Content {
    pub parts: Vec<Part>,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Part {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageMetadata {
    pub prompt_token_count: u32,
    pub candidates_token_count: u32,
    pub total_token_count: u32,
    pub prompt_tokens_details: Vec<TokenDetail>,
    pub candidates_tokens_details: Vec<TokenDetail>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenDetail {
    pub modality: String,
    pub token_count: u32,
}

impl AiService {
    pub fn new(client: Client, api_key: String, base_url: String) -> Self {
        Self {
            client,
            api_key,
            base_url,
        }
    }

    pub async fn generate_content(
        &self,
        prompt: String,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let mut headers = HeaderMap::new();
        headers.insert("X-goog-api-key", self.api_key.parse().unwrap());
        headers.insert("content-type", "application/json".parse().unwrap());

        let body = json!({
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        });
        let response = self
            .client
            .post(&self.base_url)
            .body(body.to_string())
            .headers(headers)
            .send()
            .await?;

        let response_json = response.json::<GeminiResponse>().await?;
        let text = response_json
            .candidates
            .first()
            .and_then(|candidate| candidate.content.parts.first())
            .map(|part| part.text.clone())
            .ok_or("No text response found")?;

        Ok(text)
    }
}
