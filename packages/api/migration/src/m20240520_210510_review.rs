use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        manager.create_table(
            Table::create()
                .table(Review::Table)
                .if_not_exists()
                .col(ColumnDef::new(Review::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(Review::Title).string().not_null())
                .col(ColumnDef::new(Review::Description).string().not_null())
                .col(ColumnDef::new(Review::Stars).integer().not_null())
                .col(ColumnDef::new(Review::IsArchived).boolean().not_null())
                .to_owned()
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        manager.drop_table(Table::drop().table(Review::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum Review {
    Table,
    Id,
    Title,
    Description,
    Stars,
    IsArchived,
}
