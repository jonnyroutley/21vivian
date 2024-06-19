pub mod review;
pub mod event;

use std::env;

use poem::Route;
use poem_openapi::OpenApiService;
use sea_orm::DatabaseConnection;

pub fn app_routes(db: DatabaseConnection) -> Route {
    let api_base_url = env::var("API_BASE_URL").unwrap();
    let all_routes = (review::ReviewApi{db}, event::EventApi);
    let api_service = OpenApiService::new(all_routes, "API", "1.0").server(
        format!("http://{}", api_base_url)
    );

    let ui = api_service.swagger_ui();
    let yaml = api_service.spec_endpoint_yaml();

    Route::new().nest("/", api_service).nest("/docs", ui).nest("/docs/spec", yaml)
}
