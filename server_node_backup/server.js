const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for face images
app.use(express.static('uploads'));

const authRoutes = require('./routes/auth');
const dtrRoutes = require('./routes/dtr');

app.use('/api/auth', authRoutes);
app.use('/api/dtr', dtrRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
    res.json({ message: 'DTR Server is running...' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
