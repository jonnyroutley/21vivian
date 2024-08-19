pub use sea_orm_migration::prelude::*;

mod m20240520_210510_review;
mod m20240619_213258_review_add_dates;
mod m20240619_220003_review_add_name;
mod m20240801_212835_events;
mod m20240819_214601_images;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240520_210510_review::Migration),
            Box::new(m20240619_213258_review_add_dates::Migration),
            Box::new(m20240619_220003_review_add_name::Migration),
            Box::new(m20240801_212835_events::Migration),
            Box::new(m20240819_214601_images::Migration),
        ]
    }
}
