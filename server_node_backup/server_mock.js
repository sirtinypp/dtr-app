const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'YOUR_SECRET_KEY';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('uploads'));
app.use(express.static('../client')); // Serve client files


// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/') },
    filename: function (req, file, cb) { cb(null, 'snapshot-' + Date.now() + path.extname(file.originalname)) }
});
const upload = multer({ storage: storage });

// MOCK DATA
let USERS = [{ id: 1, username: 'admin', password: 'admin', full_name: 'Admin User', role: 'supervisor' }];
let LOGS = [];

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try {
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user;
        next();
    } catch { res.sendStatus(403); }
};

// Routes
app.post('/api/auth/register', upload.single('face_image'), (req, res) => {
    const { username, password, full_name } = req.body;
    // Check if user exists
    if (USERS.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
        id: USERS.length + 1,
        username,
        password,
        full_name,
        role: 'staff',
        face_image: req.file ? req.file.filename : null
    };
    USERS.push(newUser);
    res.json({ message: 'User registered.' });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Auto-promote to supervisor if username is 'admin'
    if (username === 'admin') user.role = 'supervisor';

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, SECRET_KEY);
    res.json({ auth: true, token, user });
});

app.post('/api/dtr/log', authenticateToken, upload.single('snapshot'), (req, res) => {
    const { type, verification_score } = req.body;
    const log = {
        id: LOGS.length + 1,
        user_id: req.user.id,
        type,
        timestamp: new Date(),
        snapshot_image: req.file ? req.file.filename : null,
        verification_score
    };
    LOGS.push(log);
    res.json({ message: 'Logged', logId: log.id });
});

app.get('/api/dtr/my-logs', authenticateToken, (req, res) => {
    const myLogs = LOGS.filter(l => l.user_id === req.user.id).sort((a, b) => b.timestamp - a.timestamp);
    res.json(myLogs);
});

app.get('/api/dtr/all-logs', authenticateToken, (req, res) => {
    const allLogs = LOGS.map(l => {
        const u = USERS.find(u => u.id === l.user_id);
        return { ...l, full_name: u?.full_name, username: u?.username };
    }).sort((a, b) => b.timestamp - a.timestamp);
    res.json(allLogs);
});

// Start
app.listen(PORT, () => {
    console.log(`MOCK Server running on http://localhost:${PORT}`);
    console.log(`(NOTE: Passwords are not hashed in Mock mode)`);
});
