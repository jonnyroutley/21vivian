use chrono::NaiveDateTime;
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
struct FlattenedEvent {
    pub id: i32,
    pub name: String,
    pub location: String,
    pub description: String,
    pub starts_at: NaiveDateTime,
    pub ends_at: NaiveDateTime,
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
    Ok(Json<Vec<FlattenedEvent>>),
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
                println!("{:?}", events);

                let events_mapped: Vec<FlattenedEvent> = events
                    .into_iter()
                    .map(|(event, attendees)| {
                        FlattenedEvent {
                            id: event.id,
                            name: event.name,
                            location: event.location,
                            description:event.description,
                            starts_at: event.starts_at,
                            ends_at: event.ends_at,
                            attendees,
                        }
                    })
                    .collect();

                return GetEventsResponse::Ok(Json(events_mapped));
            }
            Err(e) => {
                print!("Failed to get events with error: {:?}", e);
                return GetEventsResponse::InternalServerError;
            }
        }
    }
}
