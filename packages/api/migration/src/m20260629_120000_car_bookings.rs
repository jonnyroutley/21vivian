use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(CarBooking::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(CarBooking::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(CarBooking::DriverName).string().not_null())
                    .col(ColumnDef::new(CarBooking::StartsAt).date_time().not_null())
                    .col(ColumnDef::new(CarBooking::EndsAt).date_time().not_null())
                    .col(ColumnDef::new(CarBooking::Miles).integer())
                    .col(
                        ColumnDef::new(CarBooking::PaidForFuel)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(ColumnDef::new(CarBooking::FuelCost).double())
                    .col(ColumnDef::new(CarBooking::TripNote).text())
                    .col(ColumnDef::new(CarBooking::ReminderSentAt).date_time())
                    .col(ColumnDef::new(CarBooking::CompletedAt).date_time())
                    .col(
                        ColumnDef::new(CarBooking::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(CarBooking::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum CarBooking {
    Table,
    Id,
    DriverName,
    StartsAt,
    EndsAt,
    Miles,
    PaidForFuel,
    FuelCost,
    TripNote,
    ReminderSentAt,
    CompletedAt,
    CreatedAt,
}
