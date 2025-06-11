import { Client } from 'pg';

async function testConnection() {
    const client = new Client({
        host: 'localhost',
        port: 5430,
        user: 'postgres',
        password: 'postgres',
        database: 'dev'
    });

    try {
        await client.connect();
        console.log('Successfully connected to database');
        
        const result = await client.query('SELECT NOW()');
        console.log('Current time:', result.rows[0].now);
        
        await client.end();
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
}

testConnection(); 