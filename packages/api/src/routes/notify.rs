use std::sync::Arc;

use poem_openapi::{payload::Json, ApiResponse, Object, OpenApi, Tags};

use crate::services::notification_service;

#[derive(Tags)]
enum ApiTags {
    Notify,
}

pub struct NotifyApi {
    pub notification_service: Arc<notification_service::PushsaferService>,
}

#[derive(Object)]
pub struct SuccessMessage {
    message: String,
}
#[derive(Object)]
pub struct ErrorMessage {
    message: String,
}

#[derive(ApiResponse)]
enum SendNotificationResponse {
    /// Returns a list of the events
    #[oai(status = 200)]
    Ok(Json<SuccessMessage>),
    /// Likely an issue with the database connection.
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(Object, Clone, Debug)]
struct SendNotificationRequest {
    id: String,
}

#[OpenApi]
impl NotifyApi {
    #[oai(path = "/notify", method = "post", tag = "ApiTags::Notify")]
    async fn get_events(
        &self,
        Json(body): Json<SendNotificationRequest>,
    ) -> SendNotificationResponse {
        match self
            .notification_service
            .send_template_notification(&body.id)
            .await
        {
            Ok(_) => SendNotificationResponse::Ok(Json(SuccessMessage {
                message: "Notification sent".to_string(),
            })),
            Err(_) => SendNotificationResponse::InternalServerError,
        }
    }
}
