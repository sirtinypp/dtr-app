const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Face Snapshots
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'snapshot-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Clock In/Out
router.post('/log', authenticateToken, upload.single('snapshot'), (req, res) => {
    const userId = req.user.id;
    const { type, verification_score } = req.body; // 'IN' or 'OUT'
    const snapshotPath = req.file ? req.file.filename : null;

    if (!['IN', 'OUT'].includes(type)) {
        return res.status(400).json({ error: 'Invalid log type' });
    }

    db.run(`INSERT INTO logs (user_id, type, snapshot_image, verification_score) VALUES (?, ?, ?, ?)`,
        [userId, type, snapshotPath, verification_score],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Successfully Clocked ${type}`, logId: this.lastID });
        }
    );
});

// Get My Logs
router.get('/my-logs', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.all(`SELECT * FROM logs WHERE user_id = ? ORDER BY timestamp DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Supervisor: Get All Logs (with filters)
router.get('/all-logs', authenticateToken, requireRole('supervisor'), (req, res) => {
    // Add filtering logic here (date, user, etc)
    db.all(`SELECT logs.*, users.full_name, users.username FROM logs JOIN users ON logs.user_id = users.id ORDER BY timestamp DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
