use std::sync::Arc;

use poem_openapi::{ payload::Json, OpenApi, Tags, Object, ApiResponse };
use sea_orm::DatabaseConnection;
use crate::services::upload_service::S3Service;

#[derive(Tags)]
enum ApiTags {
    Upload,
}

pub struct UploadApi {
    pub db: Arc<DatabaseConnection>,
    pub s3_service: S3Service,
}

#[derive(Clone, PartialEq, Eq, Debug, Object)]
struct PresignedLinkDto {
    pub presigned_link: String,
}

#[derive(Object)]
pub struct ErrorMessage {
    message: String,
}

#[derive(ApiResponse)]
enum GetUploadLinkResponse {
    /// Returns a list of the events
    #[oai(status = 200)]
    Ok(Json<PresignedLinkDto>),
    /// Likely an issue with the database connection.
    #[oai(status = 500)]
    InternalServerError,
}

#[OpenApi]
impl UploadApi {
    #[oai(path = "/upload/presigned-link", method = "get", tag = "ApiTags::Upload")]
    async fn get_presigned_uri(&self) -> GetUploadLinkResponse {
        match self.s3_service.get_presigned_uri("21vivian-bucket", "test.txt", 60 * 5).await {
            Ok(link) => GetUploadLinkResponse::Ok(Json(PresignedLinkDto { presigned_link: link })),
            Err(e) => {
                println!("{:?}", e);
                GetUploadLinkResponse::InternalServerError
            }
        }
    }
}
