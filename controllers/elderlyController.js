const elderlyModel = require('../models/elderlyModel');

exports.createProfile = async (req, res) => {
  try {
    const caregiver_id = req.session.userId;
    const { full_name, age, relationship, notes } = req.body;

    if (!full_name || !age || !relationship) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await elderlyModel.createElderlyProfile({
      caregiver_id,
      full_name,
      age: Number(age),
      relationship,
      notes: notes || null
    });

    if (!req.session.activeElderlyId) {
      req.session.activeElderlyId = result.id;
    }

    res.json({ success: true, elderly_id: result.id });
  } catch (error) {
    console.error('Error creating elderly profile:', error);
    res.status(500).json({ error: 'Failed to create elderly profile' });
  }
};

exports.getProfiles = async (req, res) => {
  try {
    const caregiver_id = req.session.userId;
    const profiles = await elderlyModel.getProfilesByCaregiver(caregiver_id);
    res.json({ profiles, activeElderlyId: req.session.activeElderlyId || null });
  } catch (error) {
    console.error('Error fetching elderly profiles:', error);
    res.status(500).json({ error: 'Failed to fetch elderly profiles' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, age, relationship, notes } = req.body;

    const result = await elderlyModel.updateProfile(id, {
      full_name,
      age: Number(age),
      relationship,
      notes: notes || null
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating elderly profile:', error);
    res.status(500).json({ error: 'Failed to update elderly profile' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await elderlyModel.deleteProfile(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (String(req.session.activeElderlyId) === String(id)) {
      req.session.activeElderlyId = null;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting elderly profile:', error);
    res.status(500).json({ error: 'Failed to delete elderly profile' });
  }
};

exports.setActiveProfile = async (req, res) => {
  try {
    const caregiver_id = req.session.userId;
    const { elderly_id } = req.body;
    if (!elderly_id) return res.status(400).json({ error: 'elderly_id is required' });

    const profile = await elderlyModel.getProfileById(elderly_id);
    if (!profile || profile.caregiver_id !== caregiver_id) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    req.session.activeElderlyId = profile.id;
    res.json({ success: true, activeElderlyId: profile.id });
  } catch (error) {
    console.error('Error setting active elderly profile:', error);
    res.status(500).json({ error: 'Failed to set active profile' });
  }
};
