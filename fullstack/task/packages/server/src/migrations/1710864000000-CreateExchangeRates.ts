import { MigrationInterface, QueryRunner, Table } from "typeorm";

export default class CreateExchangeRates1710864000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "exchange_rates",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "currency",
                        type: "varchar",
                    },
                    {
                        name: "rate",
                        type: "decimal",
                        precision: 10,
                        scale: 4,
                        isNullable: true,
                    },
                    {
                        name: "amount",
                        type: "decimal",
                        precision: 10,
                        scale: 4,
                        isNullable: true,
                    },
                    {
                        name: "country",
                        type: "varchar",
                    },
                    {
                        name: "lastUpdated",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("exchange_rates");
    }
} 