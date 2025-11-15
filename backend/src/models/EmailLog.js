const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messageId: String,
  subject: String,
  actionTaken: String,
  success: Boolean,
  detail: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailLog', LogSchema);
