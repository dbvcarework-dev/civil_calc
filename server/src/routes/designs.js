// ── Save Design Route ───────────────────────────────────
// This file handles ONE thing: saving a beam design to the DB.
//
// How it works:
//   1. React sends POST /api/saveddesigns with { inputs, results }
//   2. We pull the values we want to store
//   3. We run an INSERT query into beam_designs table
//   4. We send back the saved row

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
                (beam_name, beam_type,
                 mu, vu, b, d_total, cover, fck, fy,
                 mulim, ast_req, pt_req, ast_prov, pt_prov, stirrup_spacing,
                 mu_check, steel_check, stirrup_check, shear_section_ok,
                 bar1_count, bar1_dia, bar2_count, bar2_dia, user_id)
             VALUES
                ($1,  $2,
                 $3,  $4,  $5,  $6,  $7,  $8,  $9,
                 $10, $11, $12, $13,
                 $14, $15, $16, $17,
                 $18, $19, $20, $21, $22, $23, $24)
             RETURNING *`,
            [
                // Identification
                inputs.beamName,          // $1
                inputs.bendingMomentDirection,          // $2

                // Inputs
                inputs.Mu,                // $3   Bending Moment
                inputs.Vu,                // $4   Shear Force
                inputs.b,                 // $5   Width
                inputs.D,                 // $6   Total Depth
                inputs.cover,             // $7   Effective Cover
                inputs.fck,               // $8   Concrete Grade
                inputs.fy,                // $9   Steel Grade

                // Key Results
                results.Mulim,            // $10  Limiting Moment
                results.AstReq,           // $11  Required Steel Area
                results.PtReq,            // $12  Required Steel Percentage
                results.AstProv,          // $13  Provided Steel Area
                results.PtProv,           // $14  Provided Steel Percentage
                results.stirrupSpacing,   // $15  Stirrup Spacing

                // Design Checks
                results.muCheck,          // $16  Flexure check
                results.steelCheck,       // $17  Steel check
                results.stirrupCheck,     // $18  Shear check
                results.shearSectionOk,   // $19  Section size check

                // Reinforcement Details
                inputs.bar1Count,         // $20
                inputs.bar1Dia,           // $21
                inputs.bar2Count,         // $22
                inputs.bar2Dia,           // $23
                emp_id                   // $24
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
