pub mod event;
pub mod review;
pub mod info;
pub mod upload;

use std::env;

use chrono::{ DateTime, Utc };
use poem::Route;
use poem_openapi::{ OpenApi, OpenApiService, Webhook };
use sea_orm::DatabaseConnection;
use std::fs::File;
use std::io::Write;

pub fn save_spec_to_file(yaml: String, path: &String) -> std::io::Result<()> {
    let mut file = File::create(path)?;
    file.write_all(yaml.as_bytes())?;
    Ok(())
}

pub fn save_spec<T: OpenApi, W: Webhook>(service: &OpenApiService<T, W>) {
    let yaml_spec = service.spec_yaml();
    let yaml_save_location = "spec.yml".to_string();
    match save_spec_to_file(yaml_spec, &yaml_save_location) {
        Ok(()) => print!("Saved yaml to {}", yaml_save_location),
        Err(e) => print!("Failed to save yaml {:?}", e),
    }
}

pub fn app_routes(db: DatabaseConnection, startup_time: DateTime<Utc>) -> Route {
    let api_base_url = match env::var("API_BASE_URL") {
        Ok(e) => e.to_string(),
        Err(_) => panic!("Fail to get API_BASE_URL variable"),
    };

    let all_routes = (
        review::ReviewApi { db: db.clone() },
        event::EventApi { db: db.clone() },
        info::InfoApi { startup_time },
    );
    let api_service = OpenApiService::new(all_routes, "API", "1.0").server(
        format!("http://{}", api_base_url)
    );
    save_spec(&api_service);

    let ui = api_service.swagger_ui();
    let yaml = api_service.spec_endpoint_yaml();

    Route::new().nest("/", api_service).nest("/docs", ui).nest("/docs/spec", yaml)
}
