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

// ── Update Design Route (Metadata Only) ─────────────────
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { beam_name, beam_type, Mu, Mulim, AstReq, AstProv, Vu, StirrupSpacing, MuCheck, SteelCheck, ShearCheck, ShearSectionOk, Bar1Count, Bar1Dia, Bar2Count, Bar2Dia } = req.body;

        if (!beam_name || !beam_type) {
            return res.status(400).json({ error: 'information is required' });
        }

        // 1. Fetch the existing row to get the missing parameters (b, D, fck, fy, etc.)
        const existingRowQuery = await pool.query('SELECT * FROM beam_designs WHERE id = $1', [id]);
        if (existingRowQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Design not found' });
        }

        const existing = existingRowQuery.rows[0];

        // 2. Prepare the complete inputs for calculateBeam
        const inputsForCalc = {
            Mu: Number(Mu || existing.mu || 0),
            Vu: Number(Vu || existing.vu || 0),
            cover: Number(existing.cover || 0),
            fck: Number(existing.fck || 0),
            fy: Number(existing.fy || 0),
            b: Number(existing.b || 0),
            D: Number(existing.d_total || 0),
            bar1Count: Number(Bar1Count || existing.bar1_count || 0),
            bar1Dia: Number(Bar1Dia || existing.bar1_dia || 0),
            bar2Count: Number(Bar2Count || existing.bar2_count || 0),
            bar2Dia: Number(Bar2Dia || existing.bar2_dia || 0),
            providedStirrupSpacing: Number(StirrupSpacing || existing.stirrup_spacing || 0),
            stirrupDia: 10,  // fallback constants if required
            stirrupLegs: 2,
            sfrCount: 0,
            sfrDia: 0
        };

        // 3. Recalculate
        const result = calculateBeam(inputsForCalc);
        if (!result) {
            return res.status(400).json({ error: 'Invalid input parameters for calculation' });
        }

        // 4. Update the DB with the newly calculated fields
        const { rows } = await pool.query(
            'UPDATE beam_designs SET beam_name = $1, beam_type = $2, mu = $3, mulim = $4, ast_req = $5, ast_prov = $6, vu = $7, stirrup_spacing = $8, mu_check = $9, steel_check = $10, stirrup_check = $11, shear_section_ok = $12, bar1_count = $13, bar1_dia = $14, bar2_count = $15, bar2_dia = $16 WHERE id = $17 RETURNING *',
            [
                beam_name, beam_type,
                inputsForCalc.Mu,
                result.Mulim,
                result.AstReq,
                result.AstProv,
                inputsForCalc.Vu,
                result.stirrupSpacing,
                result.muCheck,
                result.steelCheck,
                result.stirrupCheck,
                result.shearSectionOk,
                inputsForCalc.bar1Count,
                inputsForCalc.bar1Dia,
                inputsForCalc.bar2Count,
                inputsForCalc.bar2Dia,
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
