const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');

function getDB() {
  return new sqlite3.Database(dbPath);
}

function initConfirmationTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS medication_confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      elderly_id INTEGER NOT NULL,
      medication_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      scheduled_time TEXT NOT NULL,
      status TEXT NOT NULL,
      confirmed_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(elderly_id) REFERENCES elderly_profiles(id),
      FOREIGN KEY(medication_id) REFERENCES medications(id),
      FOREIGN KEY(schedule_id) REFERENCES medication_schedules(id)
    )
  `, (err) => {
    if (err) console.error('Error creating medication_confirmations table:', err);
    db.close();
  });
}

module.exports = {
  initConfirmationTable,

  createConfirmation: function ({ elderly_id, medication_id, schedule_id, scheduled_time, status, confirmed_at }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        INSERT INTO medication_confirmations
        (elderly_id, medication_id, schedule_id, scheduled_time, status, confirmed_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(stmt, [elderly_id, medication_id, schedule_id, scheduled_time, status, confirmed_at], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  getConfirmationsByElderly: function (elderly_id, limit = 100) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `
        SELECT * FROM medication_confirmations
        WHERE elderly_id = ?
        ORDER BY confirmed_at DESC
        LIMIT ?
      `;
      db.all(stmt, [elderly_id, limit], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
};
