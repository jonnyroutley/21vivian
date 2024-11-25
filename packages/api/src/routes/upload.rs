use std::sync::Arc;
use sea_orm::ActiveModelTrait;
use entity::uploads;
use poem_openapi::{
    param::Path,
    payload::Json,
    types::multipart::Upload,
    ApiResponse,
    Multipart,
    Object,
    OpenApi,
    Tags,
};
use sea_orm::{ DatabaseConnection, Set };
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

#[derive(ApiResponse)]
enum UploadImageResponse {
    /// Returns a list of the events
    #[oai(status = 200)]
    Ok(Json<UploadImageDto>),
    /// Likely an issue with the database connection.
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(Multipart)]
struct GenericUpload {
    #[oai(rename = "upload")]
    file: Upload,
}

#[OpenApi]
impl UploadApi {
    #[oai(path = "/upload/presigned-link/:object", method = "get", tag = "ApiTags::Upload")]
    async fn get_presigned_uri(&self, object: Path<String>) -> GetUploadLinkResponse {
        match self.s3_service.get_presigned_uri("21vivian-bucket", &object, 60 * 5).await {
            Ok(link) => GetUploadLinkResponse::Ok(Json(PresignedLinkDto { presigned_link: link })),

            Err(e) => {
                println!("{:?}", e);
                GetUploadLinkResponse::InternalServerError
            }
        }
    }

    #[oai(path = "/upload", method = "post", tag = "ApiTags::Upload")]
    async fn upload_image(&self, upload: GenericUpload) -> UploadImageResponse {
        const MAX_SIZE: usize = 10 * 1024 * 1024; // 10 MB
        if upload.file.size() > MAX_SIZE {
            return UploadImageResponse::InternalServerError;
        }

        let file_name = upload.file.file_name().unwrap_or_else(|| "unnamed");

        let extension = std::path::Path
            ::new(&file_name)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("");

        let allowed_extensions = ["jpg", "jpeg", "png", "gif"];
        if !allowed_extensions.contains(&extension.to_lowercase().as_str()) {
            return UploadImageResponse::InternalServerError;
        }

        let object = format!("{}-{}", Uuid::new_v4().to_string(), file_name);

        let upload_body = uploads::ActiveModel {
            key: Set(object.clone()),
            bucket: Set("21vivian-bucket".to_string()),
            region: Set("eu-west-2".to_string()),
            ..Default::default()
        };

        self.s3_service
            .upload_file("21vivian-bucket", &object, upload.file.into_vec().await.unwrap()).await
            .unwrap();

        let result = upload_body.save(&*self.db).await.unwrap();

        println!("{:?}", result);

        UploadImageResponse::Ok(Json(UploadImageDto { image_id: result.id.unwrap() }))
    }
}
