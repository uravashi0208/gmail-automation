const EmailLog = require('../models/EmailLog');

exports.getLogs = async (req, res) => {
  const logs = await EmailLog.find({ userId: req.userId }).sort({ timestamp: -1 }).limit(200);
  res.json(logs);
};

exports.getStats = async (req, res) => {
  const total = await EmailLog.countDocuments({ userId: req.userId });
  const success = await EmailLog.countDocuments({ userId: req.userId, success: true });
  res.json({ total, success });
};
