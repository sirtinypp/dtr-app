const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'dtr.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initSchema();
    }
});

function initSchema() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'staff', -- 'staff' or 'supervisor'
            full_name TEXT,
            face_descriptor TEXT, -- JSON string of face embeddings
            current_challenge TEXT, -- For WebAuthn
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'IN' or 'OUT'
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            snapshot_image TEXT, -- Base64 or Path to image
            verification_score REAL, -- Confidence score of face match
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        console.log('Database tables initialized.');
    });
}

module.exports = db;
