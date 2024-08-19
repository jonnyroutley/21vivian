use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create()
                .table(Image::Table)
                .if_not_exists()
                .col(ColumnDef::new(Image::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(Image::Region).string().not_null())
                .col(ColumnDef::new(Image::Bucket).string().not_null())
                .col(ColumnDef::new(Image::Key).string().not_null())
                .col(
                    ColumnDef::new(Image::CreatedAt)
                        .date_time()
                        .not_null()
                        .default(Expr::current_timestamp())
                )
                .to_owned()
        ).await?;

        manager.alter_table(
            Table::alter()
                .table(Event::Table)
                .add_column(ColumnDef::new(Event::ImageId).integer())
                .add_foreign_key(
                    TableForeignKey::new()
                        .name("fk-event_id")
                        .from_tbl(Event::Table)
                        .from_col(Event::ImageId)
                        .to_tbl(Image::Table)
                        .to_col(Image::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                )
                .to_owned()
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.alter_table(
            Table::alter()
                .table(Event::Table)
                .drop_column(Event::ImageId)
                .to_owned()
        ).await?;
        manager.drop_table(Table::drop().table(Image::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum Image {
    Table,
    Id,
    Region,
    Bucket,
    Key,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Event {
    Table,
    ImageId,
}
