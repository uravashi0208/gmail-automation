'use strict';

const mongoose = require('mongoose');

// Tracks per-sender relationship data for Conversation Memory Engine
const EmailRelationshipSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderEmail: { type: String, required: true, lowercase: true, trim: true },
  senderName:  String,
  totalEmails: { type: Number, default: 0 },
  firstSeenAt: { type: Date,   default: Date.now },
  lastSeenAt:  { type: Date,   default: Date.now },
  // array of ISO hour strings (0-23) when emails were received — for send-time optimizer
  receivedHours: [Number],
  // detected topics / keywords from subjects
  topics: [String],
  // VIP flag set if > 10 interactions
  isVip:   { type: Boolean, default: false },
  // suggested best send hour (0-23), null = not enough data
  bestSendHour: { type: Number, default: null }
});

// compound unique index
EmailRelationshipSchema.index({ userId: 1, senderEmail: 1 }, { unique: true });

module.exports = mongoose.model('EmailRelationship', EmailRelationshipSchema);
