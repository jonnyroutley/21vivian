// use std::{ error::Error, time::Duration };

// use aws_sdk_s3::{ presigning::PresigningConfig, Client };
// use poem_openapi::{ payload::Json, OpenApi, Tags, Object, ApiResponse };
// use sea_orm::DatabaseConnection;

// async fn get_object(
//     client: &Client,
//     bucket: &str,
//     object: &str,
//     expires_in: u64
// ) -> Result<(), Box<dyn Error>> {
//     let expires_in = Duration::from_secs(expires_in);
//     let presigned_request = client
//         .get_object()
//         .bucket(bucket)
//         .key(object)
//         .presigned(PresigningConfig::expires_in(expires_in)?).await?;

//     println!("Object URI: {}", presigned_request.uri());

//     Ok(())
// }

// async fn put_object(
//     client: &Client,
//     bucket: &str,
//     object: &str,
//     expires_in: u64
// ) -> Result<(), Box<dyn Error>> {
//     let expires_in = Duration::from_secs(expires_in);

//     let presigned_request = client
//         .put_object()
//         .bucket(bucket)
//         .key(object)
//         .presigned(PresigningConfig::expires_in(expires_in)?).await?;

//     println!("Object URI: {}", presigned_request.uri());

//     Ok(())
// }

// #[derive(Tags)]
// enum ApiTags {
//     Upload,
// }

// pub struct EventApi {
//     pub db: DatabaseConnection,
// }

// #[derive(Clone, PartialEq, Eq, Debug, Object)]
// struct PresignedLinkDto {
//     pub presigned_link: String,
// }

// #[derive(Object)]
// pub struct ErrorMessage {
//     message: String,
// }

// #[derive(ApiResponse)]
// enum GetUploadLinkResponse {
//     /// Returns a list of the events
//     #[oai(status = 200)]
//     Ok(Json<PresignedLinkDto>),
//     /// Likely an issue with the database connection.
//     #[oai(status = 500)]
//     InternalServerError,
// }

// #[OpenApi]
// impl EventApi {
//     #[oai(path = "/upload/presigned-link", method = "get", tag = "ApiTags::Upload")]
//     async fn get_presigned_link(&self) -> GetUploadLinkResponse {
//         GetUploadLinkResponse
//     }
// }
