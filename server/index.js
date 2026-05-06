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
const beamConfigRoutes = require('./src/routes/beamConfig');
const pool = require('./src/db');
const cookieParser = require('cookie-parser');
const auth = require('./src/middleware/auth');
require('dotenv').config();
const windConfigRoutes = require('./src/routes/windConfig');


pool.connect().then(() => {
    console.log('Database connected successfully');
}).catch((err) => {
    console.log('Database connection failed', err);
});

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:5173', // or your frontend URL
    credentials: true
}));           // allow all origins (fine for local dev)
app.use(express.json());   // parse JSON request bodies
app.use(cookieParser());


// ── Routes ──────────────────────────────────────────────

app.use('/api/saveddesigns', auth, designRoutes);
app.use('/api/tankdesigns', auth, tankDesignRoutes);
app.use('/api/windload', auth, windloadDesignRoutes);
app.use('/api/users', userRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/beamconfig', auth, beamConfigRoutes);
app.use('/api/windconfig', auth, windConfigRoutes);



app.get('/api/saved-designs', auth, async (req, res) => {
    const emp_id = req.user.emp_id;
    const { rows } = await pool.query('SELECT * FROM beam_designs WHERE user_id = $1 ORDER BY created_at DESC', [emp_id]);
    res.status(200).json({
        message: 'Designs fetched successfully',
        data: rows
    })
});

app.get('/api/saved-designs/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM beam_designs WHERE id = $1', [id]);


    res.status(200).json({
        message: 'Design fetched successfully',
        data: rows[0]
    })
});

app.get('/api/saved-windloads/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM windload_designs WHERE id = $1', [id]);


    res.status(200).json({
        message: 'Design fetched successfully',
        data: rows[0]
    })
});

app.get('/api/tankdesigns/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM tank_designs WHERE id = $1', [id]);


    res.status(200).json({
        message: 'Design fetched successfully',
        data: rows[0]
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
