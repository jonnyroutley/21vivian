use poem_openapi::{ payload::PlainText, OpenApi, Tags };

#[derive(Tags)]
enum ApiTags {
    Event,
}

pub struct EventApi;

#[OpenApi]
impl EventApi {
    #[oai(path = "/event", method = "get", tag = "ApiTags::Event")]
    async fn get_review(&self) -> PlainText<String> {
        PlainText("Get Review".to_string())
    }

    #[oai(path = "/event/create", method = "post", tag = "ApiTags::Event")]
    async fn create_review(&self) -> PlainText<String> {
        PlainText("Create Review".to_string())
    }

    #[oai(path = "/event/delete", method = "delete", tag = "ApiTags::Event")]
    async fn delete_review(&self) -> PlainText<String> {
        PlainText("Delete Review".to_string())
    }
}
