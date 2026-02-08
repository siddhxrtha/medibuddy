const express = require('express');
const router = express.Router();
const elderlyController = require('../controllers/elderlyController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.post('/api/elderly', elderlyController.createProfile);
router.get('/api/elderly', elderlyController.getProfiles);
router.put('/api/elderly/:id', elderlyController.updateProfile);
router.delete('/api/elderly/:id', elderlyController.deleteProfile);
router.post('/api/elderly/active', elderlyController.setActiveProfile);

module.exports = router;
