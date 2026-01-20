const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { ensureAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(ensureAuthenticated);

// Create a new medication schedule
router.post('/api/schedules', scheduleController.createSchedule);

// Get all schedules for the current user
router.get('/api/schedules', scheduleController.getSchedules);

// Update a schedule
router.put('/api/schedules/:id', scheduleController.updateSchedule);

// Delete a schedule
router.delete('/api/schedules/:id', scheduleController.deleteSchedule);

module.exports = router;
