use std::{env, sync::Arc};

use chrono::Utc;
use migration::{Migrator, MigratorTrait};
use poem::{
    listener::TcpListener,
    middleware::{Cors, Tracing},
    EndpointExt, Server,
};
use sea_orm::{Database, DatabaseConnection, DbErr};
use services::{
    ai_service::AiService, notification_service::PushsaferService, upload_service::S3Service,
};
use tracing_subscriber::{fmt::format::FmtSpan, EnvFilter};

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
    // Initialize the logging subscriber
    tracing_subscriber::fmt()
        // Log all requests with INFO level or higher
        .with_env_filter(EnvFilter::from("info"))
        // Log the request START, RESPONSE details, and any ERRORS
        .with_span_events(FmtSpan::NEW | FmtSpan::CLOSE)
        // Format timestamps for readability
        .with_target(false)
        // .with_thread_ids(true)
        // .with_line_number(true)
        // .with_file(true)
        .init();

    match dotenvy::dotenv() {
        Ok(_) => println!("dotenv loaded"),
        Err(e) => println!("Couldn't load .env file ({})", e),
    }
    // Connect to the database

    let db = setup().await.unwrap();
    Migrator::up(&db, None).await.unwrap();

    let shared_config = aws_config::load_from_env().await;

    let s3_client = aws_sdk_s3::Client::new(&shared_config);
    let s3_service = S3Service::new(s3_client);

    let pushsafer_client = reqwest::Client::new();
    let pushsafer_service = PushsaferService::new(pushsafer_client);

    let ai_client = reqwest::Client::new();
    let ai_service = AiService::new(
        ai_client,
        env::var("GEMINI_API_KEY").unwrap(),
        env::var("GEMINI_BASE_URL").unwrap(),
    );

    let startup_time = Utc::now();
    let app = routes::app_routes(
        Arc::new(db),
        startup_time,
        s3_service,
        Arc::new(pushsafer_service),
        Arc::new(ai_service),
    )
    .with(Tracing);

    let api_base_url = env::var("API_BASE_URL").unwrap();

    Server::new(TcpListener::bind(api_base_url))
        .run(app.with(Cors::new()))
        .await
}
