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


const { initDatabase } = require('./src/dbInit');

const app = express();

// ── Middleware ──────────────────────────────────────────
const corsOrigin = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
    : ['http://localhost:5173', 'https://localhost', 'http://localhost'];
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
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

// ── Auth Check ─────────────────────────────────────────
// Lightweight endpoint to verify cookie-based JWT from the client
app.get('/api/auth/me', auth, (req, res) => {
    res.status(200).json({ user: req.user });
});



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
const PORT = process.env.SERVER_PORT || 3000;

initDatabase(pool).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to initialize database schema. Exiting...', err);
    process.exit(1);
});
