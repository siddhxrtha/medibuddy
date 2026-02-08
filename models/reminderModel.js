const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');

function getDB() {
  return new sqlite3.Database(dbPath);
}

function initReminderTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS medication_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      elderly_id INTEGER NOT NULL,
      medication_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      scheduled_time TEXT NOT NULL,
      sent_at DATETIME,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(elderly_id) REFERENCES elderly_profiles(id),
      FOREIGN KEY(medication_id) REFERENCES medications(id),
      FOREIGN KEY(schedule_id) REFERENCES medication_schedules(id)
    )
  `, (err) => {
    if (err) console.error('Error creating medication_reminders table:', err);
    db.close();
  });
}

module.exports = {
  initReminderTable
};
