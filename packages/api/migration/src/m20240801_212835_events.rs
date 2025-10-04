use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Event::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Event::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Event::Name).string().not_null())
                    .col(ColumnDef::new(Event::Description).string().not_null())
                    .col(ColumnDef::new(Event::Location).string().not_null())
                    .col(ColumnDef::new(Event::StartsAt).date_time().not_null())
                    .col(ColumnDef::new(Event::EndsAt).date_time())
                    .col(
                        ColumnDef::new(Event::IsArchived)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(Event::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(Attendee::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Attendee::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Attendee::EventId).integer().not_null())
                    .col(ColumnDef::new(Attendee::Name).string().not_null())
                    .col(
                        ColumnDef::new(Attendee::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-event_id")
                            .from(Attendee::Table, Attendee::EventId)
                            .to(Event::Table, Event::Id),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Event::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Attendee::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Event {
    Table,
    Id,
    Name,
    Location,
    Description,
    StartsAt,
    EndsAt,
    IsArchived,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Attendee {
    Table,
    Id,
    EventId,
    Name,
    CreatedAt,
}
