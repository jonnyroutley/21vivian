use chrono::NaiveDateTime;
use poem_openapi::Object;
use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Object)]
#[sea_orm(table_name = "attendee")]
#[oai(rename = "Attendee")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub event_id: i32,
    pub name: String,
    pub created_at: NaiveDateTime,
}

#[derive(Object, Debug)]
pub struct AttendeeInputModel {
    pub name: String,
    pub event_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Event,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::Event =>
                Entity::belongs_to(super::events::Entity)
                    .from(Column::EventId)
                    .to(super::events::Column::Id)
                    .into(),
        }
    }
}

impl Related<super::events::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Event.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
