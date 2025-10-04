use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Upload::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Upload::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Upload::Region).string().not_null())
                    .col(ColumnDef::new(Upload::Bucket).string().not_null())
                    .col(ColumnDef::new(Upload::Key).string().not_null())
                    .col(
                        ColumnDef::new(Upload::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Upload::EntityType).string())
                    .col(ColumnDef::new(Upload::EntityId).integer())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Event::Table)
                    .drop_column(Event::ImageId)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(Image::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Upload {
    Table,
    Id,
    Region,
    Bucket,
    Key,
    CreatedAt,
    EntityType,
    EntityId,
}

#[derive(DeriveIden)]
enum Event {
    Table,
    ImageId,
}

#[derive(DeriveIden)]
enum Image {
    Table,
}
