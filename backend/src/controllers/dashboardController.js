'use strict';

const EmailLog = require('../models/EmailLog');

exports.getLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    console.error('dashboard.getLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, success] = await Promise.all([
      EmailLog.countDocuments({ userId: req.userId }),
      EmailLog.countDocuments({ userId: req.userId, success: true })
    ]);
    res.json({ total, success });
  } catch (err) {
    console.error('dashboard.getStats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
