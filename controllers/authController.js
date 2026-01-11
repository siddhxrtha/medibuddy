const bcrypt = require('bcrypt');
const users = require('../models/userModel');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10; // bcrypt salt

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body || {};
      if (!name || !email || !password || !confirmPassword) return res.status(400).json({ error: 'All fields are required' });
      if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

      // Prevent duplicate
      const existing = await users.findByEmail(email);
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await users.createUser({ name, email, passwordHash: hash });
      return res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      // If unique constraint triggered from DB, show friendly message
      if (err && err.message && err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
      return res.status(500).json({ error: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
      const user = await users.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
      // create session
      req.session.userId = user.id;
      req.session.userName = user.name;
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  },

  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: 'Failed to logout' });
      // clear cookie
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  }
};
