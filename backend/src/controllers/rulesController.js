const Rule = require('../models/Rule');

exports.list = async (req, res) => {
  const rules = await Rule.find({ userId: req.userId });
  res.json(rules);
};

exports.create = async (req, res) => {
  const data = req.body;
  const rule = new Rule({ ...data, userId: req.userId });
  await rule.save();
  res.status(201).json(rule);
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const updated = await Rule.findOneAndUpdate({ _id: id, userId: req.userId }, req.body, { new: true });
  res.json(updated);
};

exports.remove = async (req, res) => {
  await Rule.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
};
