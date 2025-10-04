use std::sync::Arc;

use chrono::DateTime;
use entity::{attendees, events, uploads};
use poem_openapi::{payload::Json, ApiResponse, Object, OpenApi, Tags};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, Set,
    TransactionTrait,
};

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
    pub attendees: Vec<entity::attendees::Model>,
    pub upload_key: Option<String>,
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

#[derive(Object, Debug)]
struct CreateEventInput {
    pub name: String,
    pub location: String,
    pub description: String,
    pub starts_at: String,
    pub ends_at: String,
    pub image_id: i32,
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
        let events_with_attendees = match events::Entity::find()
            .find_with_related(attendees::Entity)
            .all(&*self.db)
            .await
        {
            Ok(events) => events,
            Err(err) => {
                println!("Error fetching events:\n{:?}", err);
                return GetEventsResponse::InternalServerError;
            }
        };

        let uploads = match uploads::Entity::find()
            .filter(uploads::Column::EntityType.eq("event"))
            .all(&*self.db)
            .await
        {
            Ok(uploads) => uploads,
            Err(err) => {
                println!("Error fetching uploads:\n{:?}", err);
                return GetEventsResponse::InternalServerError;
            }
        };

        let events_mapped: Vec<EventDto> = events_with_attendees
            .into_iter()
            .map(|(event, attendees)| {
                let upload = uploads.iter().find(|u| u.entity_id == Some(event.id));
                EventDto {
                    id: event.id,
                    name: event.name,
                    location: event.location,
                    description: event.description,
                    starts_at: event.starts_at.to_string(),
                    ends_at: event.ends_at.to_string(),
                    attendees,
                    upload_key: upload.map(|u| Some(u.key.clone())).unwrap_or(None),
                }
            })
            .collect();

        GetEventsResponse::Ok(Json(events_mapped))
    }

    #[oai(path = "/events", method = "post", tag = "ApiTags::Event")]
    async fn create_event(
        &self,
        Json(create_event): Json<CreateEventInput>,
    ) -> CreateEventResponse {
        println!("Creating event: {:?}", create_event);

        let event_body = events::ActiveModel {
            name: Set(create_event.name),
            description: Set(create_event.description),
            location: Set(create_event.location),
            starts_at: Set(DateTime::parse_from_rfc3339(&create_event.starts_at)
                .unwrap()
                .naive_utc()),
            ends_at: Set(DateTime::parse_from_rfc3339(&create_event.ends_at)
                .unwrap()
                .naive_utc()),
            ..Default::default()
        };
        println!("Event: {:?}", event_body);

        let transaction_result = self
            .db
            .transaction::<_, (), DbErr>(|txn| {
                Box::pin(async move {
                    let event_result = event_body.insert(txn).await.unwrap();

                    let upload: Option<uploads::Model> =
                        uploads::Entity::find_by_id(create_event.image_id)
                            .one(txn)
                            .await
                            .unwrap();

                    let mut upload: uploads::ActiveModel = upload.unwrap().into();
                    upload.entity_type = Set(Some("event".to_string()));
                    upload.entity_id = Set(Some(event_result.id));

                    upload.save(txn).await.unwrap();

                    Ok(())
                })
            })
            .await;

        match transaction_result {
            Ok(_) => CreateEventResponse::Ok,
            Err(err) => {
                println!("Error persisting event:\n{:?}", err);
                return CreateEventResponse::InternalServerError;
            }
        }
    }

    #[oai(path = "/events/attendee", method = "post", tag = "ApiTags::Event")]
    async fn create_attendee(
        &self,
        Json(create_attendee): Json<attendees::AttendeeInputModel>,
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
