const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  conditions: {
    subjectContains: String,
    from: String,
    hasLabel: String
  },
  actions: {
    label: String,
    archive: { type: Boolean, default: false },
    autoReply: { type: Boolean, default: false },
    autoReplyTemplate: { type: String, default: '' },
    forwardTo: { type: String, default: '' }
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rule', RuleSchema);
