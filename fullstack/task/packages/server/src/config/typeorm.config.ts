import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ExchangeRateEntity } from '../services/exchange-rate/exchange-rate.entity';

const config: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5430', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'dev',
    entities: [ExchangeRateEntity],
    migrations: [path.join(__dirname, '..', 'migrations', '*.ts')],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
};

export default new DataSource(config);