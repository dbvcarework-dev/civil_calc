// ── Database Connection ─────────────────────────────────
// This file creates one shared connection pool to PostgreSQL.
// We import this wherever we need to run a query.

const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    user: process.env.DB_USER || process.env.USER,
    host: process.env.DB_HOST || process.env.HOST,
    database: process.env.DB_NAME || process.env.DATABASE,
    password: process.env.DB_PASSWORD || process.env.PASSWORD,
    port: process.env.DB_PORT || process.env.PORT,
});

module.exports = pool;
