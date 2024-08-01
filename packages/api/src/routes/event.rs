use poem_openapi::{ payload::Json, OpenApi, Tags, Object, ApiResponse };
use sea_orm::{ EntityTrait, DatabaseConnection };
use entity::{ events, attendees };

#[derive(Tags)]
enum ApiTags {
    Event,
}

pub struct EventApi {
    pub db: DatabaseConnection,
}

#[derive(Clone, PartialEq, Eq, Debug, Object)]
struct EventResponse {
    pub event: entity::events::Model,
    pub attendees: Vec<entity::attendees::Model>,
}

#[derive(Object)]
pub struct ErrorMessage {
    message: String,
}

#[derive(ApiResponse)]
enum GetEventsResponse {
    /// Returns a list of the events
    #[oai(status = 200)]
    Ok(Json<Vec<EventResponse>>),
    // Ok(Json<Vec<(entity::events::Model, Vec<entity::attendees::Model>)>>),
    /// Likely an issue with the database connection.
    #[oai(status = 500)]
    InternalServerError,
}

#[OpenApi]
impl EventApi {
    #[oai(path = "/events", method = "get", tag = "ApiTags::Event")]
    async fn get_events(&self) -> GetEventsResponse {
        match events::Entity::find().find_with_related(attendees::Entity).all(&self.db).await {
            Ok(events) => {
                println!("We are here");
                println!("{:?}", events);

                let events_mapped: Vec<EventResponse> = events.iter().map(|e| {
                    return EventResponse {
                        event: e.0.clone(),
                        attendees: e.1.clone()
                    }
                }).collect();
                
                return GetEventsResponse::Ok(Json(events_mapped));
            }
            Err(e) => {
                print!("Failed to get events with error: {:?}", e);
                return GetEventsResponse::InternalServerError;
            }
        }
    }
}
