use std::sync::Arc;

use poem_openapi::{ payload::Json, OpenApi, Tags, Object, ApiResponse };
use sea_orm::DatabaseConnection;
use uuid::Uuid;
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

#[derive(Clone, PartialEq, Eq, Debug, Object)]
struct UploadImageDto {
    pub image_id: i32,
}

#[derive(Clone, PartialEq, Eq, Debug, Object)]
struct UploadImageRequest {
    pub image: String,
    pub file_name: String,
}

#[derive(ApiResponse)]
enum UploadImageResponse {
    /// Returns a list of the events
    #[oai(status = 200)]
    Ok(Json<UploadImageDto>),
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

    #[oai(path = "/upload", method = "post", tag = "ApiTags::Upload")]
    async fn upload_image(&self, Json(upload): Json<UploadImageRequest>) -> UploadImageResponse {
        let object = format!(
            "{uuid}{file_name}",
            uuid = Uuid::new_v4().to_string(),
            file_name = upload.file_name
        );

        match self.s3_service.upload_file("21vivian-bucket", &object, Vec::new()).await {
            Ok(_) =>
                UploadImageResponse::Ok(
                    Json(UploadImageDto { image_id: 23 }) // FIXME:
                ),
            Err(e) => {
                println!("{:?}", e);
                UploadImageResponse::InternalServerError
            }
        }
    }
}
