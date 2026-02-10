const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs'); // Using bcryptjs pure JS
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'YOUR_SECRET_KEY'; // In prod use env var

// Register Route (Basic)
router.post('/register', (req, res) => {
    const { username, password, full_name } = req.body;
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)`,
        [username, hashedPassword, full_name],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID, message: 'User registered.' });
        }
    );
});

// Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        res.json({ auth: true, token, user: { id: user.id, username: user.username, role: user.role } });
    });
});

module.exports = router;
