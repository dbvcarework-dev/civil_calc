const { Router } = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');

const router = Router();

router.post('/', async (req, res) => {
    const { employee_id, name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query('INSERT INTO users (emp_id, name, password) VALUES ($1, $2, $3) RETURNING *', [employee_id, name, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully', data: rows[0] });
});


module.exports = router;

