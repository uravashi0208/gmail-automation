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
