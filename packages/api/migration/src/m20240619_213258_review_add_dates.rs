use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Review::Table)
                    .add_column(
                        ColumnDef::new(Review::CreatedAt)
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
            .alter_table(
                Table::alter()
                    .table(Review::Table)
                    .drop_column(Alias::new("created_at"))
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Review {
    Table,
    CreatedAt,
}
