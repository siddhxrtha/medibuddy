const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.post('/api/medications', medicationController.createMedication);
router.get('/api/medications', medicationController.getMedications);
router.put('/api/medications/:id', medicationController.updateMedication);
router.delete('/api/medications/:id', medicationController.deleteMedication);

module.exports = router;
