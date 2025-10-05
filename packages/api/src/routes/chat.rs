use std::sync::Arc;

use poem_openapi::{param::Path, payload::Json, ApiResponse, Object, OpenApi, Tags};

use crate::services::ai_service::{AiService, Housemate};

pub struct ChatApi {
    pub ai_service: Arc<AiService>,
}

#[derive(Tags)]
enum ApiTags {
    Chat,
}
#[derive(Object)]
struct ChatDto {
    message: String,
}

#[derive(ApiResponse)]
enum ChatResponse {
    #[oai(status = 200)]
    Ok(Json<ChatDto>),
}

#[derive(Object, Debug)]
struct ChatInput {
    message: String,
}

#[OpenApi]
impl ChatApi {
    #[oai(path = "/chat", method = "post", tag = "ApiTags::Chat")]
    async fn chat(&self, Json(chat): Json<ChatInput>) -> ChatResponse {
        let response = self.ai_service.generate_content(chat.message).await;
        ChatResponse::Ok(Json(ChatDto {
            message: response.unwrap(),
        }))
    }

    #[oai(path = "/chat/:housemate", method = "post", tag = "ApiTags::Chat")]
    async fn chat_with_housemate(
        &self,
        Json(chat): Json<ChatInput>,
        housemate: Path<Housemate>,
    ) -> ChatResponse {
        let response = self
            .ai_service
            .generate_housemate_response(chat.message, housemate.0)
            .await;
        ChatResponse::Ok(Json(ChatDto {
            message: response.unwrap(),
        }))
    }
}
