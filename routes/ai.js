const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { ensureAuthenticated } = require('../middleware/auth');

// All AI routes require authentication
router.use(ensureAuthenticated);

// Chat with AI assistant
router.post('/chat', aiController.chat);

// Get predefined health tips
router.get('/tips', aiController.getHealthTips);

module.exports = router;
