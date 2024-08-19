use chrono::NaiveDateTime;
use poem_openapi::Object;
use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Object)]
#[sea_orm(table_name = "image")]
#[oai(rename = "Image")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub region: String,
    pub bucket: String,
    pub key: String,
    pub created_at: NaiveDateTime,
}

#[derive(Object, Debug)]
pub struct InputModel {
    pub region: String,
    pub bucket: String,
    pub key: String,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Events,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::Events => Entity::has_one(super::events::Entity).into(),
        }
    }
}

impl Related<super::events::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Events.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
