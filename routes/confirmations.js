const express = require('express');
const router = express.Router();
const confirmationController = require('../controllers/confirmationController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.post('/api/confirmations', confirmationController.createConfirmation);
router.get('/api/confirmations', confirmationController.getConfirmations);

module.exports = router;
