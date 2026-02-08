const scheduleModel = require('../models/scheduleModel');
const confirmationModel = require('../models/confirmationModel');

exports.createConfirmation = async (req, res) => {
  try {
    const { schedule_id, status, scheduled_time } = req.body;
    if (!schedule_id || !status || !scheduled_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const schedule = await scheduleModel.getScheduleById(schedule_id);
    if (!schedule || !schedule.elderly_id || !schedule.medication_id) {
      return res.status(404).json({ error: 'Schedule not found or not linked to an elderly profile' });
    }

    const result = await confirmationModel.createConfirmation({
      elderly_id: schedule.elderly_id,
      medication_id: schedule.medication_id,
      schedule_id,
      scheduled_time,
      status,
      confirmed_at: new Date().toISOString()
    });

    res.json({ success: true, confirmation_id: result.id });
  } catch (error) {
    console.error('Error creating confirmation:', error);
    res.status(500).json({ error: 'Failed to create confirmation' });
  }
};

exports.getConfirmations = async (req, res) => {
  try {
    const elderly_id = req.session.activeElderlyId;
    if (!elderly_id) return res.status(400).json({ error: 'No active elderly profile selected' });

    const confirmations = await confirmationModel.getConfirmationsByElderly(elderly_id);
    res.json({ confirmations });
  } catch (error) {
    console.error('Error fetching confirmations:', error);
    res.status(500).json({ error: 'Failed to fetch confirmations' });
  }
};
