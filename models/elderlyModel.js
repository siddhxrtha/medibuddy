const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');

function getDB() {
  return new sqlite3.Database(dbPath);
}

function initElderlyTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS elderly_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caregiver_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      relationship TEXT NOT NULL,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(caregiver_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating elderly_profiles table:', err);
    db.close();
  });
}

module.exports = {
  initElderlyTable,

  createElderlyProfile: function ({ caregiver_id, full_name, age, relationship, notes }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        INSERT INTO elderly_profiles (caregiver_id, full_name, age, relationship, notes)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(stmt, [caregiver_id, full_name, age, relationship, notes || null], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  getProfilesByCaregiver: function (caregiver_id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        SELECT * FROM elderly_profiles
        WHERE caregiver_id = ? AND is_active = 1
        ORDER BY created_at DESC
      `;
      db.all(stmt, [caregiver_id], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getProfileById: function (id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      db.get(`SELECT * FROM elderly_profiles WHERE id = ? AND is_active = 1`, [id], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  updateProfile: function (id, { full_name, age, relationship, notes }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        UPDATE elderly_profiles
        SET full_name = ?, age = ?, relationship = ?, notes = ?
        WHERE id = ? AND is_active = 1
      `;
      db.run(stmt, [full_name, age, relationship, notes || null, id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  },

  deleteProfile: function (id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `UPDATE elderly_profiles SET is_active = 0 WHERE id = ?`;
      db.run(stmt, [id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  }
};
