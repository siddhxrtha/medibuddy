require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup - stores sessions in SQLite for modest persistence (suitable for SIP)
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './db' }),
  secret: process.env.SESSION_SECRET || 'dev-secret-please-change',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Public static files (login/register assets)
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiter for auth login endpoint - simple protection
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 6, message: { error: 'Too many login attempts, try again later.' } });

// Mount auth routes (controllers handle validation & responses)
app.use('/api/auth', (req, res, next) => {
  if (req.path === '/login') return loginLimiter(req, res, next);
  next();
}, authRoutes);

// Mount AI assistant routes
app.use('/api/ai', aiRoutes);

// Endpoint for front-end to check current session / user
app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const users = require('./models/userModel');
  users.findById(req.session.userId).then(u => {
    if (!u) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: { id: u.id, name: u.name, email: u.email } });
  }).catch(err => { console.error(err); res.status(500).json({ error: 'Server error' }); });
});

// Protected dashboard route (serves protected HTML)
const { ensureAuthenticated } = require('./middleware/auth');
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Check Ollama status
app.get('/api/ollama-status', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
    res.json({ 
      running: true, 
      message: 'Ollama is running',
      models: response.data.models 
    });
  } catch (error) {
    res.status(503).json({ 
      running: false, 
      message: 'Ollama is not running. Start it with: ollama serve'
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Initialize DB and start
db.init().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to initialize DB', err);
  process.exit(1);
});
