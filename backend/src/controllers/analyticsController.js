'use strict';

const Rule              = require('../models/Rule');
const EmailLog          = require('../models/EmailLog');
const EmailRelationship = require('../models/EmailRelationship');
const { rulesOverlap }  = require('../services/scheduler');
const { suggestRules }  = require('../services/intentService');

// ── Automation Health Score ────────────────────────────────────────────────
exports.getHealthScores = async (req, res) => {
  try {
    const rules = await Rule.find({ userId: req.userId });
    const now   = Date.now();
    const DAYS30 = 30 * 24 * 60 * 60 * 1000;

    const scores = rules.map(r => {
      const matched      = r.stats?.totalMatched || 0;
      const lastMatched  = r.stats?.lastMatchedAt;
      const minsPerMatch = r.stats?.minutesPerMatch || 2;
      const daysSince    = lastMatched ? Math.floor((now - new Date(lastMatched)) / 86400000) : null;
      const timeSavedMin = matched * minsPerMatch;
      let health = 'healthy';
      if (matched === 0)           health = 'unused';
      else if (daysSince > 14)     health = 'stale';
      return {
        _id:          r._id,
        name:         r.name,
        active:       r.active,
        matched,
        lastMatchedAt: lastMatched,
        daysSinceMatch: daysSince,
        timeSavedMin,
        timeSavedHours: +(timeSavedMin / 60).toFixed(1),
        health,
        shouldArchive: health === 'unused' || health === 'stale'
      };
    });

    const totalTimeSaved = scores.reduce((s, r) => s + r.timeSavedMin, 0);
    res.json({ scores, totalTimeSavedMin: totalTimeSaved });
  } catch (err) {
    console.error('getHealthScores error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Rule Conflict Detection ────────────────────────────────────────────────
exports.getConflicts = async (req, res) => {
  try {
    const rules     = await Rule.find({ userId: req.userId, active: true });
    const conflicts = [];
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        if (rulesOverlap(rules[i], rules[j])) {
          conflicts.push({ rule1: { _id: rules[i]._id, name: rules[i].name }, rule2: { _id: rules[j]._id, name: rules[j].name } });
        }
      }
    }
    res.json({ conflicts });
  } catch (err) {
    console.error('getConflicts error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Conversation Memory / Relationship Graph ───────────────────────────────
exports.getRelationships = async (req, res) => {
  try {
    const rels = await EmailRelationship.find({ userId: req.userId })
      .sort({ totalEmails: -1 })
      .limit(50);
    res.json(rels);
  } catch (err) {
    console.error('getRelationships error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Behavioral Pattern Rule Suggester ─────────────────────────────────────
exports.getSuggestedRules = async (req, res) => {
  try {
    const logs = await EmailLog.find({ userId: req.userId, success: true })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('from subject intent');

    const samples = logs.map(l => ({ from: l.from || '', subject: l.subject || '' }));
    const suggestions = await suggestRules(samples);
    res.json({ suggestions });
  } catch (err) {
    console.error('getSuggestedRules error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Enhanced Dashboard Stats ───────────────────────────────────────────────
exports.getEnhancedStats = async (req, res) => {
  try {
    const [total, success, byIntent, topSenders] = await Promise.all([
      EmailLog.countDocuments({ userId: req.userId }),
      EmailLog.countDocuments({ userId: req.userId, success: true }),
      EmailLog.aggregate([
        { $match: { userId: req.userId, intent: { $exists: true, $ne: null } } },
        { $group: { _id: '$intent', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EmailRelationship.find({ userId: req.userId })
        .sort({ totalEmails: -1 })
        .limit(5)
        .select('senderEmail senderName totalEmails isVip bestSendHour')
    ]);

    res.json({ total, success, byIntent, topSenders });
  } catch (err) {
    console.error('getEnhancedStats error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};
