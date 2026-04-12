'use strict';

const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messageId:  String,
  subject:    String,
  from:       String,
  actionTaken:String,
  ruleId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Rule', default: null },
  ruleName:   String,
  intent:     String,
  success:    Boolean,
  detail:     String,
  timestamp:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailLog', LogSchema);
