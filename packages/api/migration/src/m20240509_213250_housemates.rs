use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create()
                .table(Housemate::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(Housemate::Id)
                        .integer()
                        .not_null()
                        .auto_increment()
                        .primary_key()
                )
                .col(ColumnDef::new(Housemate::FirstName).string().not_null())
                .col(ColumnDef::new(Housemate::LastName).string().not_null())
                .col(ColumnDef::new(Housemate::Birthday).string().not_null())
                .to_owned()
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Housemate::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum Housemate {
    Table,
    Id,
    FirstName,
    LastName,
    Birthday,
}
