const { Router } = require('express');
const pool = require('../db');

const router = Router();

// POST /api/tankdesigns - Save a new tank design
router.post('/', async (req, res) => {
    const emp_id = req.user.emp_id;
    const { tank_name, inputs, results } = req.body;

    if (!tank_name || !inputs || !results) {
        return res.status(400).json({ error: 'tank_name, inputs, and results are required' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO tank_designs (tank_name, inputs, results, user_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [tank_name, inputs, results, emp_id]
        );
        res.status(201).json({ message: 'Tank design saved successfully', data: rows[0] });
    } catch (err) {
        console.error('Save tank design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/tankdesigns - Get all tank designs
router.get('/', async (req, res) => {
    const emp_id = req.user.emp_id;
    try {
        const { rows } = await pool.query('SELECT * FROM tank_designs WHERE user_id = $1 ORDER BY created_at DESC', [emp_id]);
        res.status(200).json({
            message: 'Tank designs fetched successfully',
            data: rows
        });
    } catch (err) {
        console.error('Fetch tank designs error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/tankdesigns/:id - Delete a tank design
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tank_designs WHERE id = $1', [id]);
        res.status(200).json({ message: 'Tank design deleted successfully' });
    } catch (err) {
        console.error('Delete tank design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/tankdesigns/:id - Update full inputs + results
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { inputs, results } = req.body;

        if (!inputs || !results) {
            return res.status(400).json({ error: 'inputs and results are required' });
        }

        const existing = await pool.query('SELECT id FROM tank_designs WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Tank design not found' });
        }

        const { rows } = await pool.query(
            `UPDATE tank_designs
             SET tank_name = $1,
                 inputs    = $2,
                 results   = $3
             WHERE id = $4
             RETURNING *`,
            [inputs.tankName || 'Untitled Tank', inputs, results, id]
        );

        res.status(200).json({ message: 'Tank design updated!', data: rows[0] });
    } catch (err) {
        console.error('Update tank design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
