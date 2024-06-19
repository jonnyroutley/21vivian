use sea_orm::entity::prelude::*;
use poem_openapi::Object;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "review")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub title: String,
    pub description: String,
    pub stars: i32,
    pub is_archived: bool,
    pub created_at: DateTime,
}

#[derive(Object, Debug)]
pub struct InputModel {
    pub name: String,
    pub title: String,
    pub description: String,
    pub stars: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
