const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DB_DIR = path.join(__dirname);
const DB_FILE = path.join(DB_DIR, 'database.sqlite');

function init() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    const db = new sqlite3.Database(DB_FILE, (err) => {
      if (err) return reject(err);
      // Create users table if not exists
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return reject(err);
        db.close();
        resolve();
      });
    });
  });
}

module.exports = { init, DB_FILE };
