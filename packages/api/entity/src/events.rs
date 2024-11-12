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
    pub starts_at: String,
    pub ends_at: String,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Attendees,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::Attendees => Entity::has_many(super::attendees::Entity).into(),
        }
    }
}

impl Related<super::attendees::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Attendees.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
