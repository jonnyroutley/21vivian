pub use sea_orm_migration::prelude::*;

mod m20240509_213250_housemates;
mod m20240509_214830_birdy;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240509_213250_housemates::Migration),
            Box::new(m20240509_214830_birdy::Migration),
        ]
    }
}
