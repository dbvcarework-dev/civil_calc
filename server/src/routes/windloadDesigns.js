const { Router } = require('express');
const pool = require('../db');

const router = Router();

// POST /api/windload - Save a new wind load design
router.post('/', async (req, res) => {
    const emp_id = req.user.emp_id;
    const { project_name, inputs, results, finalConfig } = req.body;

    if (!project_name || !inputs || !results) {
        return res.status(400).json({ error: 'project_name, inputs, and results are required' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO windload_designs (project_name, inputs, results, user_id, configuration_used)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [project_name, inputs, results, emp_id, finalConfig]
        );
        res.status(201).json({ message: 'Wind load design saved successfully', data: rows[0] });
    } catch (err) {
        console.error('Save wind load design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/windload - Get all wind load designs
router.get('/', async (req, res) => {
    const emp_id = req.user.emp_id;
    try {
        const { rows } = await pool.query('SELECT * FROM windload_designs WHERE user_id = $1 ORDER BY created_at DESC', [emp_id]);
        res.status(200).json({
            message: 'Wind load designs fetched successfully',
            data: rows
        });
    } catch (err) {
        console.error('Fetch wind load designs error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/windload/:id - Delete a wind load design
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM windload_designs WHERE id = $1', [id]);
        res.status(200).json({ message: 'Wind load design deleted successfully' });
    } catch (err) {
        console.error('Delete wind load design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/windload/:id - Update full inputs + results
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { inputs, results } = req.body;

        if (!inputs || !results) {
            return res.status(400).json({ error: 'inputs and results are required' });
        }

        const existing = await pool.query('SELECT id FROM windload_designs WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Wind load design not found' });
        }

        const { rows } = await pool.query(
            `UPDATE windload_designs
             SET project_name = $1,
                 inputs       = $2,
                 results      = $3
             WHERE id = $4
             RETURNING *`,
            [inputs.projectName || 'Untitled Wind Load', inputs, results, id]
        );

        res.status(200).json({ message: 'Wind load design updated!', data: rows[0] });
    } catch (err) {
        console.error('Update wind load design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
