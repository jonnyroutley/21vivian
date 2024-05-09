use std::env;
use poem::{ get, handler, listener::TcpListener, web::Path, Route, Server };
use sea_orm::{ DatabaseConnection, Database, DbErr };
use migration::{ Migrator, MigratorTrait };

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

#[handler]
fn hello(Path(name): Path<String>) -> String {
    format!("hello: {}", name)
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

    let app = Route::new().at("/hello/:name", get(hello));
    Server::new(TcpListener::bind("0.0.0.0:8000")).run(app).await
}
