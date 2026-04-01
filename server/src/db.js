// ── Database Connection ─────────────────────────────────
// This file creates one shared connection pool to PostgreSQL.
// We import this wherever we need to run a query.

const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'first_db',
    password: 'pass123',
    port: 5433,
});

module.exports = pool;
