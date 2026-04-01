const pool = require('./src/db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS windload_designs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                project_name VARCHAR(255) NOT NULL,
                inputs JSONB NOT NULL,
                results JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('windload_designs table created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        pool.end();
    }
}

createTable();
