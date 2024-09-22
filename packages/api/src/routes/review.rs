use poem_openapi::{ payload::Json, ApiResponse, Object, OpenApi, Tags };
use entity::reviews;
use sea_orm::{ ActiveModelTrait, EntityTrait, Set, DatabaseConnection };
use std::sync::Arc;

#[derive(Tags)]
enum ApiTags {
    Review,
}

pub struct ReviewApi {
    pub db: Arc<DatabaseConnection>,
}

#[derive(ApiResponse)]
enum CreateReviewResponse {
    /// Returns when the review is successfully created.
    #[oai(status = 201)]
    Ok,
    /// The user has sent bad data.
    #[oai(status = 400)]
    BadRequest(Json<ErrorMessage>),
    /// Issue adding the review to the database.
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(Object)]
pub struct ErrorMessage {
    message: String
}

#[derive(ApiResponse)]
enum GetReviewsResponse {
    /// Returns when the review is successfully created.
    #[oai(status = 201)]
    Ok(Json<Vec<entity::reviews::Model>>),
    /// Likely an issue with the database connection.
    #[oai(status = 500)]
    InternalServerError,
}

fn validate_stars(stars: i32) -> Result<(), ErrorMessage> {
    if stars < 0 || stars > 5 {
        return Err(ErrorMessage{message: "Stars must be between 0 and 5".to_string()});
    }
    Ok(())
}

#[OpenApi]
impl ReviewApi {
    #[oai(path = "/reviews", method = "post", tag = "ApiTags::Review")]
    async fn create_review(
        &self,
        Json(create_review): Json<reviews::InputModel>
    ) -> CreateReviewResponse {
        match validate_stars(create_review.stars) {
            Ok(_) => (),
            Err(error) => { return CreateReviewResponse::BadRequest(Json(error)); }
        }

        let review = reviews::ActiveModel {
            name: Set(create_review.name.to_string()),
            title: Set(create_review.title),
            description: Set(create_review.description),
            stars: Set(create_review.stars),
            is_archived: Set(false),
            ..Default::default()
        };

        match review.insert(&*self.db).await {
            Ok(_) => println!("Review persisted successfully"),
            Err(err) => {
                println!("Error persisting review:\n{:?}", err);
                return CreateReviewResponse::InternalServerError;
            }
        }

        CreateReviewResponse::Ok
    }

    #[oai(path = "/reviews", method = "get", tag = "ApiTags::Review")]
    async fn get_all(
        &self,
    ) -> GetReviewsResponse {
        match reviews::Entity::find().all(&*self.db).await {
            Ok(reviews) => return GetReviewsResponse::Ok(Json(reviews)),
            Err(e) => {
                print!("{:?}", e);
                return GetReviewsResponse::InternalServerError;
            }
        };
    }
}
