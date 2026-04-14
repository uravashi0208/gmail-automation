'use strict';

const mongoose = require('mongoose');

/**
 * Tracks which messageIds have already been processed per user,
 * so the scheduler never applies rules to the same email twice.
 * TTL index auto-expires entries after 30 days.
 */
const ProcessedMessageSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageId: { type: String, required: true },
  processedAt: { type: Date, default: Date.now }
});

ProcessedMessageSchema.index({ userId: 1, messageId: 1 }, { unique: true });
// Auto-delete after 30 days so the collection doesn't grow forever
ProcessedMessageSchema.index({ processedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ProcessedMessage', ProcessedMessageSchema);
