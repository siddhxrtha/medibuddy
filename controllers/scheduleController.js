const scheduleModel = require('../models/scheduleModel');

exports.createSchedule = async (req, res) => {
  try {
    const { medication_name, dosage, time, frequency, start_date, end_date, notes } = req.body;
    const user_id = req.session.userId;

    if (!medication_name || !dosage || !time || !frequency || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await scheduleModel.createSchedule({
      user_id,
      medication_name,
      dosage,
      time,
      frequency,
      start_date,
      end_date: end_date || null,
      notes: notes || ''
    });

    res.json({ success: true, schedule_id: result.id });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const user_id = req.session.userId;
    const schedules = await scheduleModel.getSchedulesByUserId(user_id);
    res.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { medication_name, dosage, time, frequency, end_date, notes } = req.body;

    const result = await scheduleModel.updateSchedule(id, {
      medication_name,
      dosage,
      time,
      frequency,
      end_date,
      notes
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await scheduleModel.deleteSchedule(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};
