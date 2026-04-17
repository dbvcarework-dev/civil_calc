// ── Database Connection ─────────────────────────────────
// This file creates one shared connection pool to PostgreSQL.
// We import this wherever we need to run a query.

const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

module.exports = pool;
