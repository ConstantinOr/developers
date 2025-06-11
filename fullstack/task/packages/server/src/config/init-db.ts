import config from './typeorm.config';

export async function initDatabase(): Promise<void> {
    const dataSource = await config.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();
} 