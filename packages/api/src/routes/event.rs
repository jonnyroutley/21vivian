use std::{ ptr::null, sync::Arc };

use chrono::{ DateTime, NaiveDateTime };
use poem_openapi::{ payload::Json, ApiResponse, Object, OpenApi, Tags };
use sea_orm::{
    ActiveModelTrait,
    ColumnTrait,
    ConnectionTrait,
    DatabaseConnection,
    DbBackend,
    DbErr,
    EntityTrait,
    FromQueryResult,
    QueryFilter,
    Set,
    Statement,
    TransactionTrait,
};
use entity::{ attendees, events, uploads };

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
    pub image_id: i32,
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

struct Attendee {
    id: i32,
    name: String,
}

#[derive(FromQueryResult, Clone)]
struct EventWithUpload {
    id: i32,
    name: String,
    location: String,
    description: String,
    starts_at: NaiveDateTime,
    ends_at: NaiveDateTime,
    upload_id: Option<i32>,
}

#[OpenApi]
impl EventApi {
    #[oai(path = "/events", method = "get", tag = "ApiTags::Event")]
    async fn get_events(&self) -> GetEventsResponse {
        // Then in your code:
        let events = EventWithUpload::find_by_statement(
            Statement::from_sql_and_values(
                DbBackend::Postgres,
                r#"SELECT 
        event.*,
        upload.id as upload_id
        FROM event 
        LEFT JOIN upload ON upload.entity_id = event.id 
        AND upload.entity_type = 'event';"#,
                []
            )
        )
            .all(&*self.db).await
            .unwrap();

        // Fetch attendees separately for each event
        let events_with_attendees = futures::future::join_all(
            events.into_iter().map(|event| {
                let event_clone = event.clone();
                async move {
                    let attendees = attendees::Entity
                        ::find()
                        .filter(attendees::Column::EventId.eq(event_clone.id))
                        .all(&*self.db).await
                        .unwrap_or_default();

                    EventDto {
                        id: event_clone.id,
                        name: event_clone.name,
                        location: event_clone.location,
                        description: event_clone.description,
                        starts_at: event_clone.starts_at.to_string(),
                        ends_at: event_clone.ends_at.to_string(),
                        attendees,
                        image_id: event_clone.upload_id.unwrap_or(0),
                    }
                }
            })
        ).await;
        GetEventsResponse::Ok(Json(events_with_attendees))
        //         match
        //             EventWithUploadAndAttendees::find_by_statement(
        //                 Statement::from_sql_and_values(
        //                     DbBackend::Postgres,
        //                     r#"SELECT
        //     event.*,
        //     upload.id as upload_id,
        //     array_agg(attendee.id) as attendee_ids,
        //     array_agg(jsonb_build_object('id', attendee.id, 'name', attendee.name)) as attendees
        // FROM event
        // LEFT JOIN upload ON upload.entity_id = event.id
        //     AND upload.entity_type = 'event'
        // LEFT JOIN attendee ON attendee.event_id = event.id
        // GROUP BY event.id, upload.id;"#,
        //                     []
        //                 )
        //             ).all(&*self.db).await
        //         {
        //             Ok(events) => {
        //                 let events_mapped: Vec<EventDto> = events
        //                     .into_iter()
        //                     .map(|event| {
        //                         EventDto {
        //                             id: event.id,
        //                             name: event.name,
        //                             location: event.location,
        //                             description: event.description,
        //                             starts_at: event.starts_at.to_string(),
        //                             ends_at: event.ends_at.to_string(),
        //                             attendees: event.attendees,
        //                             image_id: event.upload_id.unwrap_or(0),
        //                         }
        //                     })
        //                     .collect();

        //                 return GetEventsResponse::Ok(Json(events_mapped));
        //             }
        //             Err(e) => {
        //                 print!("Failed to get events with error: {:?}", e);
        //                 return GetEventsResponse::InternalServerError;
        //             }
        //         }
    }

    #[oai(path = "/events", method = "post", tag = "ApiTags::Event")]
    async fn create_event(
        &self,
        Json(create_event): Json<CreateEventInput>
    ) -> CreateEventResponse {
        println!("Creating event: {:?}", create_event);

        let event_body = events::ActiveModel {
            name: Set(create_event.name),
            description: Set(create_event.description),
            location: Set(create_event.location),
            starts_at: Set(
                DateTime::parse_from_rfc3339(&create_event.starts_at).unwrap().naive_utc()
            ),
            ends_at: Set(DateTime::parse_from_rfc3339(&create_event.ends_at).unwrap().naive_utc()),
            ..Default::default()
        };
        println!("Event: {:?}", event_body);

        let transaction_result = self.db.transaction::<_, (), DbErr>(|txn| {
            Box::pin(async move {
                let event_result = event_body.insert(txn).await.unwrap();

                let upload: Option<uploads::Model> = uploads::Entity
                    ::find_by_id(create_event.image_id)
                    .one(txn).await
                    .unwrap();

                let mut upload: uploads::ActiveModel = upload.unwrap().into();
                upload.entity_type = Set(Some("event".to_string()));
                upload.entity_id = Set(Some(event_result.id));

                upload.save(txn).await.unwrap();

                Ok(())
            })
        }).await;

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
