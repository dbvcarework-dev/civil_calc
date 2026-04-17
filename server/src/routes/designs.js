// ── Save Design Route ───────────────────────────────────
// This file handles ONE thing: saving a beam design to the DB.
//


const { Router } = require('express');
const pool = require('../db');
const { calculateBeam } = require('../utils/beamCalc');



const router = Router();

router.post('/', async (req, res) => {
    // Step 1 — Get data sent from React
    const emp_id = req.user.emp_id;

    const { inputs, results } = req.body;

    // Step 2 — Basic validation
    if (!inputs || !results) {
        return res.status(400).json({ error: 'inputs and results are required' });
    }

    // Step 3 — Build the SQL query and run it
    try {
        const { rows } = await pool.query(
            `INSERT INTO beam_designs
                (beam_name, beam_type, inputs, results, user_id)
             VALUES
                ($1,  $2,  $3,  $4,  $5)
             RETURNING *`,
            [
                // Identification
                inputs.beamName,          // $1
                inputs.bendingMomentDirection,          // $2
                // Inputs
                inputs,                 // $3  
                // Results
                results,                // $4   
                // User ID
                emp_id                  // $5
            ]
        );

        // Step 4 — Return the saved row to React
        res.status(201).json({ message: 'Design saved!', data: rows[0] });

    } catch (err) {
        // If DB throws an error, we log it AND return the actual message
        // so it's visible in the browser Network tab
        console.error('Save error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ── Delete Design Route ─────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM beam_designs WHERE id = $1', [id]);
        res.status(200).json({ message: 'Design deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ── Update Design Route ──────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { inputs, results } = req.body;

        if (!inputs || !results) {
            return res.status(400).json({ error: 'inputs and results are required' });
        }

        // Verify the design exists before updating
        const existing = await pool.query('SELECT id FROM beam_designs WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Design not found' });
        }

        const { rows } = await pool.query(
            `UPDATE beam_designs
             SET beam_name = $1,
                 beam_type = $2,
                 inputs    = $3,
                 results   = $4
             WHERE id = $5
             RETURNING *`,
            [
                inputs.beamName,
                inputs.bendingMomentDirection,
                inputs,
                results,
                id
            ]
        );

        res.status(200).json({ message: 'Design updated!', data: rows[0] });
    } catch (err) {
        console.error('Update error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
