const medicationModel = require('../models/medicationModel');

function requireActiveElderly(req, res) {
  const activeElderlyId = req.session.activeElderlyId;
  if (!activeElderlyId) {
    res.status(400).json({ error: 'No active elderly profile selected' });
    return null;
  }
  return activeElderlyId;
}

exports.createMedication = async (req, res) => {
  try {
    const elderly_id = requireActiveElderly(req, res);
    if (!elderly_id) return;

    const { name, dosage, instructions } = req.body;
    if (!name || !dosage) return res.status(400).json({ error: 'Missing required fields' });

    const result = await medicationModel.createMedication({
      elderly_id,
      name,
      dosage,
      instructions: instructions || null
    });

    res.json({ success: true, medication_id: result.id });
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
};

exports.getMedications = async (req, res) => {
  try {
    const elderly_id = requireActiveElderly(req, res);
    if (!elderly_id) return;

    const medications = await medicationModel.getMedicationsByElderly(elderly_id);
    res.json({ medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
};

exports.updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, instructions } = req.body;

    const result = await medicationModel.updateMedication(id, { name, dosage, instructions });
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
};

exports.deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await medicationModel.deleteMedication(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
};
