use chrono::{ DateTime, Utc };
use poem_openapi::{ payload::PlainText, ApiResponse, OpenApi, Tags };

#[derive(Tags)]
enum ApiTags {
    Info,
}

pub struct InfoApi {
    pub startup_time: DateTime<Utc>,
}

#[derive(ApiResponse)]  
enum GetInfoResponse {
    /// Returns the last deployment time
    #[oai(status = 200)]
    Ok(PlainText<String>),
}

#[OpenApi]
impl InfoApi {
    #[oai(path = "/info", method = "get", tag = "ApiTags::Info")]
    async fn get_info(&self) -> GetInfoResponse {
        GetInfoResponse::Ok(PlainText(format!("Last deployed: {}", self.startup_time)))
    }
}
