const { Router } = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = Router();

router.post('/', async (req, res) => {
    const { employee_id, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE emp_id = $1', [employee_id]);

    if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user.id, emp_id: user.emp_id, name: user.name },
        process.env.JWT_SECRET || 'fallbacksecret',
        { expiresIn: '24h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, name: user.name, emp_id: user.emp_id }
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/', async (req, res) => {
    res.send('Login page');
});


module.exports = router;