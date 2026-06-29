use std::sync::Arc;
use std::time::Duration;

use chrono::{DateTime, NaiveDateTime, Utc};
use entity::car_bookings;
use poem_openapi::{param::Path, payload::Json, ApiResponse, Object, OpenApi, Tags};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, QueryOrder,
    Set,
};

use crate::services::notification_service::{NotificationBuilder, PushsaferService};

const SITE_URL: &str = "https://21vivian.com";

#[derive(Tags)]
enum ApiTags {
    Car,
}

pub struct CarApi {
    pub db: Arc<DatabaseConnection>,
    pub pushsafer_service: Arc<PushsaferService>,
}

#[derive(Object)]
#[oai(rename = "CarErrorMessage")]
struct ErrorMessage {
    message: String,
}

#[derive(Clone, Debug, Object)]
struct CarBookingDto {
    id: i32,
    driver_name: String,
    starts_at: String,
    ends_at: String,
    miles: Option<i32>,
    paid_for_fuel: bool,
    fuel_cost: Option<f64>,
    trip_note: Option<String>,
    completed_at: Option<String>,
    created_at: String,
    /// One of: upcoming, active, awaiting_completion, completed
    status: String,
}

#[derive(Object, Debug)]
struct CreateBookingInput {
    driver_name: String,
    starts_at: String,
    ends_at: String,
}

#[derive(Object, Debug)]
struct CompleteBookingInput {
    miles: i32,
    paid_for_fuel: bool,
    fuel_cost: Option<f64>,
    trip_note: Option<String>,
}

#[derive(ApiResponse)]
enum GetBookingsResponse {
    #[oai(status = 200)]
    Ok(Json<Vec<CarBookingDto>>),
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(ApiResponse)]
enum GetBookingResponse {
    #[oai(status = 200)]
    Ok(Json<CarBookingDto>),
    #[oai(status = 404)]
    NotFound,
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(ApiResponse)]
enum CreateBookingResponse {
    #[oai(status = 201)]
    Ok(Json<CarBookingDto>),
    /// The booking clashes with an existing one, or the dates are invalid.
    #[oai(status = 409)]
    Conflict(Json<ErrorMessage>),
    #[oai(status = 400)]
    BadRequest(Json<ErrorMessage>),
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(ApiResponse)]
enum CompleteBookingResponse {
    #[oai(status = 200)]
    Ok(Json<CarBookingDto>),
    #[oai(status = 404)]
    NotFound,
    #[oai(status = 400)]
    BadRequest(Json<ErrorMessage>),
    #[oai(status = 500)]
    InternalServerError,
}

#[derive(ApiResponse)]
enum DeleteBookingResponse {
    #[oai(status = 204)]
    NoContent,
    #[oai(status = 404)]
    NotFound,
    #[oai(status = 500)]
    InternalServerError,
}

fn to_utc_string(dt: NaiveDateTime) -> String {
    dt.and_utc().to_rfc3339()
}

fn compute_status(booking: &car_bookings::Model, now: NaiveDateTime) -> &'static str {
    if booking.completed_at.is_some() {
        "completed"
    } else if now < booking.starts_at {
        "upcoming"
    } else if now <= booking.ends_at {
        "active"
    } else {
        "awaiting_completion"
    }
}

fn to_dto(booking: car_bookings::Model, now: NaiveDateTime) -> CarBookingDto {
    let status = compute_status(&booking, now).to_string();
    CarBookingDto {
        id: booking.id,
        driver_name: booking.driver_name,
        starts_at: to_utc_string(booking.starts_at),
        ends_at: to_utc_string(booking.ends_at),
        miles: booking.miles,
        paid_for_fuel: booking.paid_for_fuel,
        fuel_cost: booking.fuel_cost,
        trip_note: booking.trip_note,
        completed_at: booking.completed_at.map(to_utc_string),
        created_at: to_utc_string(booking.created_at),
        status,
    }
}

fn parse_datetime(input: &str) -> Result<NaiveDateTime, ()> {
    DateTime::parse_from_rfc3339(input)
        .map(|dt| dt.naive_utc())
        .map_err(|_| ())
}

#[OpenApi]
impl CarApi {
    #[oai(path = "/car/bookings", method = "get", tag = "ApiTags::Car")]
    async fn get_bookings(&self) -> GetBookingsResponse {
        let bookings = match car_bookings::Entity::find()
            .order_by_asc(car_bookings::Column::StartsAt)
            .all(&*self.db)
            .await
        {
            Ok(bookings) => bookings,
            Err(err) => {
                println!("Error fetching car bookings:\n{:?}", err);
                return GetBookingsResponse::InternalServerError;
            }
        };

        let now = Utc::now().naive_utc();
        let dtos = bookings.into_iter().map(|b| to_dto(b, now)).collect();
        GetBookingsResponse::Ok(Json(dtos))
    }

    #[oai(path = "/car/bookings/:id", method = "get", tag = "ApiTags::Car")]
    async fn get_booking(&self, Path(id): Path<i32>) -> GetBookingResponse {
        match car_bookings::Entity::find_by_id(id).one(&*self.db).await {
            Ok(Some(booking)) => {
                let now = Utc::now().naive_utc();
                GetBookingResponse::Ok(Json(to_dto(booking, now)))
            }
            Ok(None) => GetBookingResponse::NotFound,
            Err(err) => {
                println!("Error fetching car booking {}:\n{:?}", id, err);
                GetBookingResponse::InternalServerError
            }
        }
    }

    #[oai(path = "/car/bookings", method = "post", tag = "ApiTags::Car")]
    async fn create_booking(
        &self,
        Json(input): Json<CreateBookingInput>,
    ) -> CreateBookingResponse {
        let driver_name = input.driver_name.trim().to_string();
        if driver_name.is_empty() {
            return CreateBookingResponse::BadRequest(Json(ErrorMessage {
                message: "Please choose who is driving".to_string(),
            }));
        }

        let starts_at = match parse_datetime(&input.starts_at) {
            Ok(dt) => dt,
            Err(_) => {
                return CreateBookingResponse::BadRequest(Json(ErrorMessage {
                    message: "Invalid start date/time".to_string(),
                }))
            }
        };
        let ends_at = match parse_datetime(&input.ends_at) {
            Ok(dt) => dt,
            Err(_) => {
                return CreateBookingResponse::BadRequest(Json(ErrorMessage {
                    message: "Invalid end date/time".to_string(),
                }))
            }
        };

        if ends_at <= starts_at {
            return CreateBookingResponse::BadRequest(Json(ErrorMessage {
                message: "The end time must be after the start time".to_string(),
            }));
        }

        // Two bookings overlap when each starts before the other ends.
        let clash = car_bookings::Entity::find()
            .filter(car_bookings::Column::StartsAt.lt(ends_at))
            .filter(car_bookings::Column::EndsAt.gt(starts_at))
            .one(&*self.db)
            .await;

        match clash {
            Ok(Some(existing)) => {
                return CreateBookingResponse::Conflict(Json(ErrorMessage {
                    message: format!(
                        "Muriel is already booked by {} during that time",
                        existing.driver_name
                    ),
                }));
            }
            Ok(None) => {}
            Err(err) => {
                println!("Error checking for booking clash:\n{:?}", err);
                return CreateBookingResponse::InternalServerError;
            }
        }

        let booking = car_bookings::ActiveModel {
            driver_name: Set(driver_name.clone()),
            starts_at: Set(starts_at),
            ends_at: Set(ends_at),
            paid_for_fuel: Set(false),
            ..Default::default()
        };

        let created = match booking.insert(&*self.db).await {
            Ok(created) => created,
            Err(err) => {
                println!("Error persisting car booking:\n{:?}", err);
                return CreateBookingResponse::InternalServerError;
            }
        };

        let notification = NotificationBuilder::new(
            "Muriel is booked 🚗".to_string(),
            format!(
                "{} has the keys from {} to {}",
                driver_name,
                starts_at.format("%a %d %b %H:%M"),
                ends_at.format("%a %d %b %H:%M"),
            ),
        )
        .url(format!("{}/car", SITE_URL))
        .build();
        let _ = self.pushsafer_service.send_notification(notification).await;

        let now = Utc::now().naive_utc();
        CreateBookingResponse::Ok(Json(to_dto(created, now)))
    }

    #[oai(
        path = "/car/bookings/:id/complete",
        method = "post",
        tag = "ApiTags::Car"
    )]
    async fn complete_booking(
        &self,
        Path(id): Path<i32>,
        Json(input): Json<CompleteBookingInput>,
    ) -> CompleteBookingResponse {
        if input.miles < 0 {
            return CompleteBookingResponse::BadRequest(Json(ErrorMessage {
                message: "Miles can't be negative".to_string(),
            }));
        }

        let booking = match car_bookings::Entity::find_by_id(id).one(&*self.db).await {
            Ok(Some(booking)) => booking,
            Ok(None) => return CompleteBookingResponse::NotFound,
            Err(err) => {
                println!("Error fetching car booking {}:\n{:?}", id, err);
                return CompleteBookingResponse::InternalServerError;
            }
        };

        let now = Utc::now().naive_utc();
        let fuel_cost = if input.paid_for_fuel {
            input.fuel_cost
        } else {
            None
        };
        let trip_note = input
            .trip_note
            .map(|note| note.trim().to_string())
            .filter(|note| !note.is_empty());

        let mut active: car_bookings::ActiveModel = booking.into();
        active.miles = Set(Some(input.miles));
        active.paid_for_fuel = Set(input.paid_for_fuel);
        active.fuel_cost = Set(fuel_cost);
        active.trip_note = Set(trip_note);
        active.completed_at = Set(Some(now));

        match active.update(&*self.db).await {
            Ok(updated) => CompleteBookingResponse::Ok(Json(to_dto(updated, now))),
            Err(err) => {
                println!("Error completing car booking {}:\n{:?}", id, err);
                CompleteBookingResponse::InternalServerError
            }
        }
    }

    #[oai(path = "/car/bookings/:id", method = "delete", tag = "ApiTags::Car")]
    async fn delete_booking(&self, Path(id): Path<i32>) -> DeleteBookingResponse {
        match car_bookings::Entity::delete_by_id(id).exec(&*self.db).await {
            Ok(result) if result.rows_affected == 0 => DeleteBookingResponse::NotFound,
            Ok(_) => DeleteBookingResponse::NoContent,
            Err(err) => {
                println!("Error deleting car booking {}:\n{:?}", id, err);
                DeleteBookingResponse::InternalServerError
            }
        }
    }
}

/// Periodically pushes a reminder for any booking that has ended but hasn't had
/// its mileage logged yet, then marks it so we only nudge once.
pub async fn run_reminder_loop(
    db: Arc<DatabaseConnection>,
    pushsafer_service: Arc<PushsaferService>,
) {
    let interval = Duration::from_secs(300);
    loop {
        if let Err(err) = send_due_reminders(&db, &pushsafer_service).await {
            println!("Error sending car booking reminders:\n{:?}", err);
        }
        tokio::time::sleep(interval).await;
    }
}

async fn send_due_reminders(
    db: &DatabaseConnection,
    pushsafer_service: &PushsaferService,
) -> Result<(), DbErr> {
    let now = Utc::now().naive_utc();

    let due = car_bookings::Entity::find()
        .filter(car_bookings::Column::EndsAt.lt(now))
        .filter(car_bookings::Column::CompletedAt.is_null())
        .filter(car_bookings::Column::ReminderSentAt.is_null())
        .all(db)
        .await?;

    for booking in due {
        let notification = NotificationBuilder::new(
            "Muriel needs your mileage 🚗".to_string(),
            format!(
                "{}, log your trip: miles, fuel and a note.",
                booking.driver_name
            ),
        )
        .url(format!("{}/car/complete/{}", SITE_URL, booking.id))
        .build();
        let _ = pushsafer_service.send_notification(notification).await;

        let mut active: car_bookings::ActiveModel = booking.into();
        active.reminder_sent_at = Set(Some(now));
        if let Err(err) = active.update(db).await {
            println!("Error marking reminder as sent:\n{:?}", err);
        }
    }

    Ok(())
}
