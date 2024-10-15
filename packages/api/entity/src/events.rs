use chrono::NaiveDateTime;
use poem_openapi::Object;
use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Object)]
#[sea_orm(table_name = "event")]
#[oai(rename = "Event")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub location: String,
    pub description: String,
    pub starts_at: NaiveDateTime,
    pub ends_at: NaiveDateTime,
    pub is_archived: bool,
    pub created_at: NaiveDateTime,
    pub image_id: i32,
}

#[derive(Object, Debug)]
pub struct EventInputModel {
    pub name: String,
    pub location: String,
    pub description: String,
    pub starts_at: NaiveDateTime,
    pub ends_at: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Attendees,
    Images,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::Attendees => Entity::has_many(super::attendees::Entity).into(),
            Self::Images =>
                Entity::has_one(super::images::Entity)
                    .from(Column::ImageId)
                    .to(super::images::Column::Id)
                    .into(),
        }
    }
}

impl Related<super::attendees::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Attendees.def()
    }
}

impl Related<super::images::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Images.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
