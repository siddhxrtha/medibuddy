const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');

function getDB() {
  return new sqlite3.Database(dbPath);
}

function initMedicationTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      elderly_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      instructions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(elderly_id) REFERENCES elderly_profiles(id)
    )
  `, (err) => {
    if (err) console.error('Error creating medications table:', err);
    db.close();
  });
}

module.exports = {
  initMedicationTable,

  createMedication: function ({ elderly_id, name, dosage, instructions }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        INSERT INTO medications (elderly_id, name, dosage, instructions)
        VALUES (?, ?, ?, ?)
      `;
      db.run(stmt, [elderly_id, name, dosage, instructions || null], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  getMedicationsByElderly: function (elderly_id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        SELECT * FROM medications
        WHERE elderly_id = ? AND is_active = 1
        ORDER BY created_at DESC
      `;
      db.all(stmt, [elderly_id], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getMedicationById: function (id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      db.get(`SELECT * FROM medications WHERE id = ? AND is_active = 1`, [id], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  updateMedication: function (id, { name, dosage, instructions }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        UPDATE medications
        SET name = ?, dosage = ?, instructions = ?
        WHERE id = ? AND is_active = 1
      `;
      db.run(stmt, [name, dosage, instructions || null, id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  },

  deleteMedication: function (id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `UPDATE medications SET is_active = 0 WHERE id = ?`;
      db.run(stmt, [id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  }
};
