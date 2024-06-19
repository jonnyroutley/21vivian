use poem_openapi::{ payload::Json, ApiResponse, OpenApi, Tags };
use entity::reviews;
use sea_orm::{ ActiveModelTrait, Set, DatabaseConnection };

#[derive(Tags)]
enum ApiTags {
    Review,
}

pub struct ReviewApi {
    pub db: DatabaseConnection,
}

#[derive(ApiResponse)]
enum CreateReviewResponse {
    /// Returns when the review is successfully created.
    #[oai(status = 201)]
    Ok,
    #[oai(status = 400)]
    BadRequest,
    #[oai(status = 500)]
    InternalServerError,
}

#[OpenApi]
impl ReviewApi {
    // #[oai(path = "/review", method = "get", tag = "ApiTags::Review")]
    // async fn get_review(&self) -> Json<entity::reviews::InputModel> {
    //     PlainText("Get Review".to_string())
    // }

    #[oai(path = "/review/create", method = "post", tag = "ApiTags::Review")]
    async fn create_review(
        &self,
        Json(create_review): Json<reviews::InputModel>
    ) -> CreateReviewResponse {
        if create_review.name.ends_with("bad") {
            return CreateReviewResponse::BadRequest;
        }

        print!("Review: {:?}", create_review);

        let review = reviews::ActiveModel {
            name: Set(create_review.name.to_string()),
            title: Set(create_review.title),
            description: Set(create_review.description),
            stars: Set(create_review.stars),
            is_archived: Set(false),
            ..Default::default()
        };

        match review.insert(&self.db).await {
            Ok(_) => println!("Review created successfully"),
            Err(err) => {
                println!("Error creating review:\n{:?}", err);
                return CreateReviewResponse::InternalServerError;
            }
        }

        CreateReviewResponse::Ok
    }

    // #[oai(path = "/review/delete", method = "delete", tag = "ApiTags::Review")]
    // async fn delete_review(&self) -> PlainText<String> {
    //     PlainText("Delete Review".to_string())
    // }
}
