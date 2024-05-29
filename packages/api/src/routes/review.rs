use poem_openapi::{ payload::PlainText, OpenApi, Tags };

#[derive(Tags)]
enum ApiTags {
    Review,
}

pub struct ReviewApi;

#[OpenApi]
impl ReviewApi {
    #[oai(path = "/review", method = "get", tag = "ApiTags::Review")]
    async fn get_review(&self) -> PlainText<String> {
        PlainText("Get Review".to_string())
    }

    #[oai(path = "/review/create", method = "post", tag = "ApiTags::Review")]
    async fn create_review(&self) -> PlainText<String> {
        PlainText("Create Review".to_string())
    }

    #[oai(path = "/review/delete", method = "delete", tag = "ApiTags::Review")]
    async fn delete_review(&self) -> PlainText<String> {
        PlainText("Delete Review".to_string())
    }
}
