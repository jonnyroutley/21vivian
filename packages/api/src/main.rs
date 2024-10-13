use std::{ env, sync::Arc };

use aws_sdk_s3::Client;
use chrono::Utc;
use migration::{ Migrator, MigratorTrait };
use poem::{ listener::TcpListener, Server, middleware::Cors, EndpointExt };
use sea_orm::{ Database, DatabaseConnection, DbErr };
use services::upload_service::S3Service;

mod routes;
pub mod services;

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

    let shared_config = aws_config::load_from_env().await;

    let client = Client::new(&shared_config);
    let s3_service = S3Service::new(client);

    let startup_time = Utc::now();
    let app = routes::app_routes(Arc::new(db), startup_time, s3_service);

    let api_base_url = env::var("API_BASE_URL").unwrap();

    Server::new(TcpListener::bind(api_base_url)).run(app.with(Cors::new())).await
}
