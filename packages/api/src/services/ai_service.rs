use std::{
    collections::HashMap,
    fmt::{self, Display},
};

use poem::http::HeaderMap;
use poem_openapi::Enum;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
pub struct AiService {
    client: Client,
    api_key: String,
    base_url: String,
    housemate_contexts: HashMap<Housemate, HousemateContext>,
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

#[derive(Debug, Hash, Eq, PartialEq, Serialize, Deserialize, Enum)]
#[serde(rename_all = "lowercase")]
pub enum Housemate {
    Luke,
    Jonny,
    George,
    Fraser,
}
impl Display for Housemate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Housemate::Luke => write!(f, "Luke"),
            Housemate::Jonny => write!(f, "Jonny"),
            Housemate::George => write!(f, "George"),
            Housemate::Fraser => write!(f, "Fraser"),
        }
    }
}

struct HousemateContext {
    persona: String,
    interest: String,
}

impl AiService {
    pub fn new(client: Client, api_key: String, base_url: String) -> Self {
        let mut housemate_contexts: HashMap<Housemate, HousemateContext> = HashMap::new();
        housemate_contexts.insert(
            Housemate::Luke,
            HousemateContext {
                persona: "Luke is 25 years old, born in Hampstead, London and lives in Bow (East London). He works in marketing on Ready-To-Drink (RTD) beverages for Diageo.".to_string(),
                interest: "Arsenal football club, the financial times, modern British history, Cambridge University, Smirnoff Vodka and saying that he's 'bullish' or 'bearish' on things.".to_string(),
            },
        );
        housemate_contexts.insert(
            Housemate::Jonny,
            HousemateContext {
                persona: "Jonny is 25 years old, born in London and lives in Bow (East London). He works as a software engineer at Healthtech-1 (a healthcare startup).".to_string(),
                interest: "Fine wine, fat-washed cocktails, sous-vide steaks, doing 100 pushups, working on his house website '21vivian.com'. ".to_string(),
            },
        );
        housemate_contexts.insert(
            Housemate::George,
            HousemateContext {
                persona: "George 26 years old, born near Bristol and lives in Bow (East London). He works as a policy consultant for Flint Global (a consultancy firm).".to_string(),
                interest: "Cycling in bib shorts, natural wine, going on the same holidays as Luke, vaping and going to 8 birthday parties on the same night.".to_string(),
            },
        );
        housemate_contexts.insert(
            Housemate::Fraser,
            HousemateContext {
                persona: "Fraser is 24 years old, born in Glasgow and lives in Bow (East London). He works as a software engineer at Amazon.".to_string(),
                interest: "Bullying the interns on his team, working on his side business 'OxFarm to Fork', running fast to see how high his heart rate can go, and eating 500g of pasta with 6 boiled eggs every night.".to_string(),
            },
        );

        Self {
            client,
            api_key,
            base_url,
            housemate_contexts,
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

    pub async fn generate_housemate_response(
        &self,
        prompt: String,
        housemate: Housemate,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let housemate_context = self.housemate_contexts.get(&housemate).unwrap();
        let prompt_with_context = format!(
            "Respond to the prompt below as '{}'. Your persona is: '{}', and your notable interests are: '{}'. Try to keep the response concise and only use one or two of your interests at a time. The prompt is: {}",
            housemate,
            housemate_context.persona,
            housemate_context.interest,
            prompt
        );
        self.generate_content(prompt_with_context).await
    }
}
