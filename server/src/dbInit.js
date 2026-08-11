const { Pool } = require('pg');

async function initDatabase(pool) {
    const maxRetries = 10;
    const retryDelayMs = 3000;
    let connected = false;
    let retries = 0;

    console.log('Database connection initialization started...');

    while (!connected && retries < maxRetries) {
        try {
            const client = await pool.connect();
            console.log('Database connected successfully');
            client.release();
            connected = true;
        } catch (err) {
            retries++;
            console.error(`Database connection attempt ${retries}/${maxRetries} failed:`, err.message);
            if (retries >= maxRetries) {
                console.error('Max database connection retries reached. Exiting...');
                throw err;
            }
            await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
    }

    try {
        console.log('Running database schema migrations...');

        // Enable pgcrypto extension for gen_random_uuid()
        await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                emp_id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "users" verified/created.');

        // Create beam_designs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS beam_designs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                beam_name VARCHAR(255) NOT NULL,
                beam_type VARCHAR(255) NOT NULL,
                inputs JSONB NOT NULL,
                results JSONB NOT NULL,
                user_id VARCHAR(255) REFERENCES users(emp_id) ON DELETE CASCADE,
                configuration_used JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "beam_designs" verified/created.');

        // Create tank_designs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tank_designs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                tank_name VARCHAR(255) NOT NULL,
                inputs JSONB NOT NULL,
                results JSONB NOT NULL,
                user_id VARCHAR(255) REFERENCES users(emp_id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "tank_designs" verified/created.');

        // Create windload_designs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS windload_designs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                project_name VARCHAR(255) NOT NULL,
                inputs JSONB NOT NULL,
                results JSONB NOT NULL,
                user_id VARCHAR(255) REFERENCES users(emp_id) ON DELETE CASCADE,
                configuration_used JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "windload_designs" verified/created.');

        // Create configurations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS configurations (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(emp_id) ON DELETE CASCADE,
                module_name VARCHAR(255) NOT NULL,
                config_json JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "configurations" verified/created.');

        // Create config_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS config_logs (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(emp_id) ON DELETE CASCADE,
                field VARCHAR(255) NOT NULL,
                old_value TEXT,
                new_value TEXT,
                module_name VARCHAR(255) NOT NULL,
                change_group_id UUID NOT NULL,
                changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "config_logs" verified/created.');
        console.log('Database schema migration completed successfully.');

    } catch (err) {
        console.error('Error during database schema migrations:', err);
        throw err;
    }
}

module.exports = { initDatabase };
