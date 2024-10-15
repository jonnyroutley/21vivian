pub mod event;
pub mod review;
pub mod info;
pub mod upload;

use std::env;
use std::sync::Arc;

use chrono::{ DateTime, Utc };
use poem::Route;
use poem_openapi::{ OpenApi, OpenApiService, Webhook };
use sea_orm::DatabaseConnection;
use std::fs::File;
use std::io::Write;

use crate::services::notification_service::PushsaferService;
use crate::services::upload_service::S3Service;

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

pub fn app_routes(
    db: Arc<DatabaseConnection>,
    startup_time: DateTime<Utc>,
    s3_service: S3Service,
    pushsafer_service: PushsaferService
) -> Route {
    let api_base_url = match env::var("API_BASE_URL") {
        Ok(url) => url.to_string(),
        Err(_) => panic!("Fail to get API_BASE_URL variable"),
    };

    let all_routes = (
        review::ReviewApi { db: Arc::clone(&db), pushsafer_service },
        event::EventApi { db: Arc::clone(&db) },
        upload::UploadApi { db: Arc::clone(&db), s3_service },
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
