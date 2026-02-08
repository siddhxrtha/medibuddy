const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');

function getDB() {
  return new sqlite3.Database(dbPath);
}

function ensureColumn(db, tableName, columnName, columnDef) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) return reject(err);
      const exists = rows.some(r => r.name === columnName);
      if (exists) return resolve(false);
      db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`, (alterErr) => {
        if (alterErr) return reject(alterErr);
        resolve(true);
      });
    });
  });
}

// Initialize medication schedule table
function initScheduleTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS medication_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      elderly_id INTEGER,
      medication_id INTEGER,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      time TEXT NOT NULL,
      frequency TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, async (err) => {
    if (err) console.error('Error creating schedule table:', err);
    try {
      await ensureColumn(db, 'medication_schedules', 'elderly_id', 'INTEGER');
      await ensureColumn(db, 'medication_schedules', 'medication_id', 'INTEGER');
    } catch (alterErr) {
      console.error('Error altering schedule table:', alterErr);
    }
    db.close();
  });
}

module.exports = {
  initScheduleTable,

  createSchedule: function ({ user_id, elderly_id, medication_id, medication_name, dosage, time, frequency, start_date, end_date, notes }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        INSERT INTO medication_schedules 
        (user_id, elderly_id, medication_id, medication_name, dosage, time, frequency, start_date, end_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(stmt, [user_id, elderly_id || null, medication_id || null, medication_name, dosage, time, frequency, start_date, end_date, notes], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  getSchedulesByUserId: function (user_id, elderly_id = null) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        SELECT * FROM medication_schedules 
        WHERE user_id = ? AND is_active = 1
        ${elderly_id ? 'AND elderly_id = ?' : ''}
        ORDER BY time ASC
      `;
      const params = elderly_id ? [user_id, elderly_id] : [user_id];
      db.all(stmt, params, (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  updateSchedule: function (id, { medication_name, dosage, time, frequency, end_date, notes }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        UPDATE medication_schedules 
        SET medication_name = ?, dosage = ?, time = ?, frequency = ?, end_date = ?, notes = ?
        WHERE id = ?
      `;
      db.run(stmt, [medication_name, dosage, time, frequency, end_date, notes, id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  },

  deleteSchedule: function (id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `UPDATE medication_schedules SET is_active = 0 WHERE id = ?`;
      db.run(stmt, [id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  },

  getScheduleById: function (id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      db.get(`SELECT * FROM medication_schedules WHERE id = ?`, [id], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
};
