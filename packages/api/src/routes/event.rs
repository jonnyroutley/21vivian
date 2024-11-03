use std::sync::Arc;

use chrono::{ DateTime };
use poem_openapi::{ payload::Json, OpenApi, Tags, Object, ApiResponse };
use sea_orm::{ EntityTrait, DatabaseConnection, Set, ActiveModelTrait };
use entity::{ events, attendees };

#[derive(Tags)]
enum ApiTags {
    Event,
}

pub struct EventApi {
    pub db: Arc<DatabaseConnection>,
}

#[derive(Clone, PartialEq, Eq, Debug, Object)]
struct EventDto {
    pub id: i32,
    pub name: String,
    pub location: String,
    pub description: String,
    pub starts_at: String,
    pub ends_at: String,
    // pub starts_at: NaiveDateTime,
    // pub ends_at: NaiveDateTime,
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

#[derive(ApiResponse)]
enum CreateEventResponse {
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
        match events::Entity::find().find_with_related(attendees::Entity).all(&*self.db).await {
            Ok(events) => {
                let events_mapped: Vec<EventDto> = events
                    .into_iter()
                    .map(|(event, attendees)| {
                        EventDto {
                            id: event.id,
                            name: event.name,
                            location: event.location,
                            description: event.description,
                            starts_at: event.starts_at.to_string(),
                            ends_at: event.ends_at.to_string(),
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

    #[oai(path = "/events", method = "post", tag = "ApiTags::Event")]
    async fn create_event(
        &self,
        Json(create_event): Json<events::EventInputModel>
    ) -> CreateEventResponse {
        println!("Creating event: {:?}", create_event);
        let foo = match DateTime::parse_from_rfc3339(&create_event.starts_at) {
            Ok(foo) => foo,
            Err(e) => {
                println!("Failed to parse starts_at: {:?}", e);
                return CreateEventResponse::InternalServerError;
            }
        };

        let event = events::ActiveModel {
            name: Set(create_event.name),
            description: Set(create_event.description),
            location: Set(create_event.location),
            starts_at: Set(
                DateTime::parse_from_rfc3339(&create_event.starts_at).unwrap().naive_utc()
            ),
            ends_at: Set(DateTime::parse_from_rfc3339(&create_event.ends_at).unwrap().naive_utc()),
            // ends_at: Set(create_event.ends_at),
            ..Default::default()
        };
        println!("Event: {:?}", event);

        match event.insert(&*self.db).await {
            Ok(_) => println!("Event successfully created"),
            Err(e) => {
                println!("Failed to create event with error: {:?}", e);
                return CreateEventResponse::InternalServerError;
            }
        }
        print!("Event created successfully");

        CreateEventResponse::Ok
    }

    #[oai(path = "/events/attendee", method = "post", tag = "ApiTags::Event")]
    async fn create_attendee(
        &self,
        Json(create_attendee): Json<attendees::AttendeeInputModel>
    ) -> CreateAttendeeResponse {
        let attendee = attendees::ActiveModel {
            name: Set(create_attendee.name.to_string()),
            event_id: Set(create_attendee.event_id),
            ..Default::default()
        };

        match attendee.insert(self.db.as_ref()).await {
            Ok(_) => println!("Attendee added to event {}", create_attendee.event_id),
            Err(err) => {
                println!("Error persisting attendee:\n{:?}", err);
                return CreateAttendeeResponse::InternalServerError;
            }
        }

        return CreateAttendeeResponse::Ok;
    }
}
