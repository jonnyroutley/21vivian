pub use sea_orm_migration::prelude::*;

mod m20240520_210510_review;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240520_210510_review::Migration)
        ]
    }
}
