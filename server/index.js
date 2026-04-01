// ── Server Entry Point ──────────────────────────────────
// This is where everything comes together.
// Run with: node index.js

const express = require('express');
const cors = require('cors');
const designRoutes = require('./src/routes/designs');
const tankDesignRoutes = require('./src/routes/tankDesigns');
const windloadDesignRoutes = require('./src/routes/windloadDesigns');
const userRoutes = require('./src/routes/users');
const loginRoutes = require('./src/routes/login');
const pool = require('./src/db');


pool.connect().then(() => {
    console.log('Database connected successfully');
}).catch((err) => {
    console.log('Database connection failed', err);
});

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());           // allow all origins (fine for local dev)
app.use(express.json());   // parse JSON request bodies

// ── Routes ──────────────────────────────────────────────

app.use('/api/saveddesigns', designRoutes);
app.use('/api/tankdesigns', tankDesignRoutes);
app.use('/api/windload', windloadDesignRoutes);
app.use('/api/users', userRoutes);
app.use('/api/login', loginRoutes);

app.get('/api/saved-designs', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM beam_designs ORDER BY created_at DESC');
    res.status(200).json({
        message: 'Designs fetched successfully',
        data: rows
    })
});


// Health check — open http://localhost:3000 to test the server is running
app.get('/', async (req, res) => {
    res.send('Server is running');
});

// ── Start Server ─────────────────────────────────────────
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
