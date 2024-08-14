use chrono::NaiveDateTime;
use poem_openapi::{ payload::Json, OpenApi, Tags, Object, ApiResponse };
use sea_orm::{ EntityTrait, DatabaseConnection, Set, ActiveModelTrait };
use entity::{ events, attendees };

#[derive(Tags)]
enum ApiTags {
    Event,
}

pub struct EventApi {
    pub db: DatabaseConnection,
}

#[derive(Clone, PartialEq, Eq, Debug, Object)]
struct EventDto {
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
    Ok(Json<Vec<EventDto>>),
    /// Likely an issue with the database connection.
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(ApiResponse)]
enum CreateAttendeeResponse {
    /// Returns a list of the events
    #[oai(status = 200)]
    Ok,
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
                let events_mapped: Vec<EventDto> = events
                    .into_iter()
                    .map(|(event, attendees)| {
                        EventDto {
                            id: event.id,
                            name: event.name,
                            location: event.location,
                            description: event.description,
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

    #[oai(path = "/events/attendee", method = "post", tag = "ApiTags::Event")]
    async fn create_attendee(
        &self,
        Json(create_attendee): Json<attendees::AttendeeInputModel>
    ) -> CreateAttendeeResponse {
        print!("Saving Attendee: {} for event {}", create_attendee.name, create_attendee.event_id);

        let attendee = attendees::ActiveModel {
            name: Set(create_attendee.name.to_string()),
            event_id: Set(create_attendee.event_id),
            ..Default::default()
        };

        match attendee.insert(&self.db).await {
            Ok(_) => println!("Attendee added to event {}", create_attendee.event_id),
            Err(err) => {
                println!("Error persisting attendee:\n{:?}", err);
                return CreateAttendeeResponse::InternalServerError;
            }
        }

        return CreateAttendeeResponse::Ok;
    }
}
