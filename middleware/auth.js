// Simple session-based auth middleware
module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.session && req.session.userId) return next();
    // If request expects JSON, return 401 JSON; otherwise redirect to login
    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.redirect('/login.html');
  }
};
