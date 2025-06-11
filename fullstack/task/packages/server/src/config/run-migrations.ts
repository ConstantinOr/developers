import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

interface MigrationRecord {
    name: string;
}

async function runMigrations() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5430,
        username: 'postgres',
        password: 'postgres',
        database: 'dev',
    });

    try {
        await dataSource.initialize();
        // eslint-disable-next-line no-console
        console.log('Connected to database');

        // Create migrations table if it doesn't exist
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                timestamp BIGINT NOT NULL,
                name VARCHAR(255) NOT NULL
            );
        `);

        // Get all migration files
        const migrationsDir = path.join(__dirname, '..', 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.ts'))
            .sort();

        // Get executed migrations
        const executedMigrations = await queryRunner.query('SELECT name FROM migrations') as MigrationRecord[];
        const executedMigrationNames = executedMigrations.map((row: MigrationRecord) => row.name);

        // Run pending migrations
        await Promise.all(migrationFiles.map(async (file) => {
            if (!executedMigrationNames.includes(file)) {
                // eslint-disable-next-line no-console
                console.log(`Running migration: ${file}`);
                
                // Import migration file
                const migrationPath = path.join(migrationsDir, file);
                const migrationModule = await import(migrationPath);
                const MigrationClass = migrationModule.default;
                
                await queryRunner.startTransaction();
                try {
                    const migration = new MigrationClass();
                    await migration.up(queryRunner);
                    const timestamp = parseInt(file.split('-')[0]);
                    await queryRunner.query('INSERT INTO migrations (timestamp, name) VALUES ($1, $2)', [timestamp, file]);
                    await queryRunner.commitTransaction();
                    // eslint-disable-next-line no-console
                    console.log(`Migration ${file} completed successfully`);
                } catch (error) {
                    await queryRunner.rollbackTransaction();
                    // eslint-disable-next-line no-console
                    console.error(`Error running migration ${file}:`, error);
                    throw error;
                }
            }
        }));

        // eslint-disable-next-line no-console
        console.log('All migrations completed');
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error:', err);
    } finally {
        await dataSource.destroy();
    }
}

runMigrations(); 