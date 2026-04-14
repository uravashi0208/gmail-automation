'use strict';

const Rule = require('../models/Rule');

exports.list = async (req, res) => {
  try {
    const rules = await Rule.find({ userId: req.userId });
    res.json(rules);
  } catch (err) {
    console.error('rules.list error:', err);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

exports.create = async (req, res) => {
  try {
    const rule = new Rule({ ...req.body, userId: req.userId });
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    console.error('rules.create error:', err);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Rule.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Rule not found' });
    res.json(updated);
  } catch (err) {
    console.error('rules.update error:', err);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await Rule.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Rule not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('rules.remove error:', err);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

// ── Bulk enable/disable ───────────────────────────────────────────────────
exports.bulkSetActive = async (req, res) => {
  try {
    const { ids, active } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' });

    const result = await Rule.updateMany(
      { _id: { $in: ids }, userId: req.userId },
      { active: Boolean(active) }
    );
    res.json({ ok: true, modified: result.modifiedCount });
  } catch (err) {
    console.error('rules.bulkSetActive error:', err);
    res.status(500).json({ error: 'Failed to update rules' });
  }
};

// ── Bulk delete ───────────────────────────────────────────────────────────
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' });

    const result = await Rule.deleteMany({ _id: { $in: ids }, userId: req.userId });
    res.json({ ok: true, deleted: result.deletedCount });
  } catch (err) {
    console.error('rules.bulkDelete error:', err);
    res.status(500).json({ error: 'Failed to delete rules' });
  }
};

// ── Duplicate a rule ──────────────────────────────────────────────────────
exports.duplicate = async (req, res) => {
  try {
    const original = await Rule.findOne({ _id: req.params.id, userId: req.userId });
    if (!original) return res.status(404).json({ error: 'Rule not found' });

    const copy = new Rule({
      userId:     req.userId,
      name:       `${original.name} (copy)`,
      conditions: original.conditions,
      actions:    original.actions,
      active:     false // start disabled — user enables manually
    });
    await copy.save();
    res.status(201).json(copy);
  } catch (err) {
    console.error('rules.duplicate error:', err);
    res.status(500).json({ error: 'Failed to duplicate rule' });
  }
};
