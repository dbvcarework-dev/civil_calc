const { Router } = require('express');
const pool = require('../db');
const { v4: uuidv4 } = require("uuid");

const router = Router();
const changeGroupId = uuidv4();

router.post('/', async (req, res) => {
    try {
        const emp_id = req.user.emp_id;
        const { moduleName, tcTable, tcMax, mulimFactor, changes } = req.body;
        const config_json = { tcTable, tcMax, mulimFactor };

        // saving the whole configuration to the configurations table
        const { rows } = await pool.query(`INSERT INTO configurations (user_id, module_name, config_json) VALUES ($1,$2,$3) RETURNING *`,
            [emp_id, moduleName, config_json,]);

        // saving the changes to the config_logs table
        if (changes && Array.isArray(changes) && changes.length > 0) {
            for (const change of changes) {
                await pool.query(
                    "INSERT INTO config_logs (user_id, field, old_value, new_value, module_name, change_group_id) VALUES ($1, $2, $3, $4, $5, $6)",
                    [emp_id, change.field, String(change.oldValue), String(change.newValue), moduleName, changeGroupId]
                );
            }
        }

        res.json({ message: 'Configuration saved successfully!', data: rows[0] });
    } catch (error) {
        console.error("Error saving configuration:", error);
        res.status(500).json({ error: "Failed to save configuration" });
    }
});


router.get('/logs', async (req, res) => {
    try {
        const moduleName = req.query.module || 'beam-design';
        const result = await pool.query(
            `SELECT id, user_id, field, old_value, new_value, change_group_id, changed_at
             FROM config_logs WHERE module_name = $1 AND user_id = $2 ORDER BY id DESC LIMIT 50`,
            [moduleName, req.user.emp_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching config logs:", err);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

router.get('/', async (req, res) => {
    const emp_id = req.user.emp_id;
    const moduleName = 'beam-design';
    const result = await pool.query(
        "SELECT config_json FROM configurations WHERE user_id = $1 AND module_name = $2 ORDER BY id DESC LIMIT 1",
        [emp_id, moduleName]
    );

    res.json(result.rows[0]?.config_json || null);
});
module.exports = router;