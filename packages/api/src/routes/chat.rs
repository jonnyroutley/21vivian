use poem_openapi::{payload::Json, ApiResponse, Object, OpenApi, Tags};

pub struct ChatApi {}

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
        ChatResponse::Ok(Json(ChatDto {
            message: format!("You sent the message: '{}'", chat.message),
        }))
    }
}
