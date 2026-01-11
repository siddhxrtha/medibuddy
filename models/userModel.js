const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');

function getDB() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  createUser: function ({ name, email, passwordHash }) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      const stmt = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
      db.run(stmt, [name, email, passwordHash], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  findByEmail: function (email) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      db.get(`SELECT id, name, email, password FROM users WHERE email = ?`, [email], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  findById: function (id) {
    return new Promise((resolve, reject) => {
      const db = getDB();
      db.get(`SELECT id, name, email FROM users WHERE id = ?`, [id], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
};
