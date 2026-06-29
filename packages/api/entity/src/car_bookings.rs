use chrono::NaiveDateTime;
use poem_openapi::Object;
use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Object)]
#[sea_orm(table_name = "car_booking")]
#[oai(rename = "CarBooking")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub driver_name: String,
    pub starts_at: NaiveDateTime,
    pub ends_at: NaiveDateTime,
    pub miles: Option<i32>,
    pub paid_for_fuel: bool,
    pub fuel_cost: Option<f64>,
    pub trip_note: Option<String>,
    pub reminder_sent_at: Option<NaiveDateTime>,
    pub completed_at: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
