use chrono::NaiveDateTime;
use poem_openapi::Object;
use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Object)]
#[sea_orm(table_name = "upload")]
#[oai(rename = "Upload")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub region: String,
    pub bucket: String,
    pub key: String,
    pub created_at: NaiveDateTime,
    pub entity_type: String,
    pub entity_id: i32,
}

#[derive(Object, Debug)]
pub struct InputModel {
    pub region: String,
    pub bucket: String,
    pub key: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
