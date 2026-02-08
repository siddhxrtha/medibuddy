const scheduleModel = require('../models/scheduleModel');
const medicationModel = require('../models/medicationModel');

function requireActiveElderly(req, res) {
  const activeElderlyId = req.session.activeElderlyId;
  if (!activeElderlyId) {
    res.status(400).json({ error: 'No active elderly profile selected' });
    return null;
  }
  return activeElderlyId;
}

exports.createSchedule = async (req, res) => {
  try {
    const { medication_id, medication_name, dosage, time, frequency, start_date, end_date, notes, instructions } = req.body;
    const user_id = req.session.userId;
    const elderly_id = requireActiveElderly(req, res);
    if (!elderly_id) return;

    if ((!medication_name || !dosage) && !medication_id) {
      return res.status(400).json({ error: 'Medication info is required' });
    }

    if (!time || !frequency || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let finalMedicationId = medication_id;
    let finalMedicationName = medication_name;
    let finalDosage = dosage;

    if (!finalMedicationId) {
      const created = await medicationModel.createMedication({
        elderly_id,
        name: medication_name,
        dosage,
        instructions: instructions || null
      });
      finalMedicationId = created.id;
    } else {
      const med = await medicationModel.getMedicationById(finalMedicationId);
      if (med) {
        finalMedicationName = med.name;
        finalDosage = med.dosage;
      }
    }

    const result = await scheduleModel.createSchedule({
      user_id,
      elderly_id,
      medication_id: finalMedicationId,
      medication_name: finalMedicationName,
      dosage: finalDosage,
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
    const elderly_id = requireActiveElderly(req, res);
    if (!elderly_id) return;

    const schedules = await scheduleModel.getSchedulesByUserId(user_id, elderly_id);
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
