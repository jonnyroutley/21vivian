use std::env;

use migration::{ Migrator, MigratorTrait };
use poem::{ listener::TcpListener, Server };
use sea_orm::{ Database, DatabaseConnection, DbErr };
mod routes;

async fn setup() -> Result<DatabaseConnection, DbErr> {
    let db_url = match env::var("DB_URL") {
        Ok(db_url) => db_url.to_string(),
        Err(e) => panic!("Couldn't read DB_URL ({})", e),
    };

    let db = match Database::connect(&db_url).await {
        Ok(db) => db,
        Err(e) => panic!("Couldn't connect to the database ({})", e),
    };

    println!("Connected to the database");
    Ok(db)
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    match dotenvy::dotenv() {
        Ok(_) => println!("dotenv loaded"),
        Err(e) => panic!("Couldn't load dotenv ({})", e),
    }
    // Connect to the database

    let db = setup().await.unwrap();
    Migrator::up(&db, None).await.unwrap();

    let app = routes::app_routes(db);

    let api_base_url = env::var("API_BASE_URL").unwrap();
    // let api_base_url = "127.0.0.1:8000";

    Server::new(TcpListener::bind(api_base_url)).run(app).await
}
