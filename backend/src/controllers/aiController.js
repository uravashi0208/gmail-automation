'use strict';

const EmailLog          = require('../models/EmailLog');
const EmailRelationship = require('../models/EmailRelationship');
const Rule              = require('../models/Rule');

// ── Helpers ────────────────────────────────────────────────────────────────

async function callClaude(prompt, maxTokens = 500) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await resp.json();
  return (data?.content?.[0]?.text || '').trim();
}

// ── Priority Score Engine ──────────────────────────────────────────────────
// Scores each recent log entry 0-100 based on intent, sender VIP status, recency

exports.getPriorityScores = async (req, res) => {
  try {
    const [logs, rels] = await Promise.all([
      EmailLog.find({ userId: req.userId, success: true })
        .sort({ timestamp: -1 })
        .limit(100),
      EmailRelationship.find({ userId: req.userId }).select('senderEmail isVip bestSendHour totalEmails')
    ]);

    const relMap = {};
    rels.forEach(r => { relMap[r.senderEmail.toLowerCase()] = r; });

    const urgentIntents = new Set(['urgent', 'complaint', 'refund', 'approval']);

    const scored = logs.map(log => {
      let score = 0;
      // Intent weight
      if (log.intent === 'urgent')    score += 40;
      else if (log.intent === 'complaint') score += 35;
      else if (log.intent === 'refund')    score += 30;
      else if (log.intent === 'approval')  score += 25;
      else if (log.intent === 'invoice')   score += 15;
      else score += 5;

      // VIP sender bonus
      const fromEmail = (log.from || '').toLowerCase().match(/<([^>]+)>/)?.[1] || (log.from || '').toLowerCase();
      const rel = relMap[fromEmail];
      if (rel?.isVip) score += 30;
      else if (rel && rel.totalEmails >= 5) score += 10;

      // Recency bonus (last 1h = +20, last 6h = +10, last 24h = +5)
      const ageMs = Date.now() - new Date(log.timestamp).getTime();
      if (ageMs < 3_600_000)   score += 20;
      else if (ageMs < 21_600_000)  score += 10;
      else if (ageMs < 86_400_000)  score += 5;

      // Success bonus
      if (log.success) score += 5;

      return {
        _id: log._id,
        subject: log.subject,
        from: log.from,
        intent: log.intent,
        ruleName: log.ruleName,
        timestamp: log.timestamp,
        score: Math.min(score, 100),
        isVip: !!rel?.isVip,
        isUrgent: urgentIntents.has(log.intent)
      };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json({ scores: scored });
  } catch (err) {
    console.error('getPriorityScores error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Daily Digest Generator ─────────────────────────────────────────────────

exports.getDailyDigest = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [logs, rules, rels] = await Promise.all([
      EmailLog.find({ userId: req.userId, timestamp: { $gte: since } }).sort({ timestamp: -1 }),
      Rule.find({ userId: req.userId }),
      EmailRelationship.find({ userId: req.userId, isVip: true }).limit(10)
    ]);

    const intentBreakdown = {};
    logs.forEach(l => {
      if (l.intent) intentBreakdown[l.intent] = (intentBreakdown[l.intent] || 0) + 1;
    });

    const topIntents = Object.entries(intentBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([intent, count]) => `${intent}: ${count}`)
      .join(', ');

    const vipNames = rels.map(r => r.senderName || r.senderEmail).slice(0, 5).join(', ');
    const activeRules = rules.filter(r => r.active).length;
    const successRate = logs.length ? Math.round((logs.filter(l => l.success).length / logs.length) * 100) : 0;

    const prompt = `You are an executive email assistant. Write a concise daily digest summary (3-4 sentences max) for these stats:
- Emails processed in last 24h: ${logs.length}
- Success rate: ${successRate}%
- Intent breakdown: ${topIntents || 'no data'}
- Active automation rules: ${activeRules}
- VIP senders active today: ${vipNames || 'none'}

Be professional, data-driven, and highlight any urgent patterns. No markdown, plain text only.`;

    const summary = await callClaude(prompt, 200);

    res.json({
      summary,
      stats: {
        totalEmails: logs.length,
        successRate,
        intentBreakdown,
        activeRules,
        vipContacts: rels.length,
        topSubjects: logs.slice(0, 5).map(l => l.subject).filter(Boolean)
      }
    });
  } catch (err) {
    console.error('getDailyDigest error:', err);
    res.status(500).json({ error: 'Failed to generate digest' });
  }
};

// ── Smart Rule Optimizer ───────────────────────────────────────────────────
// Analyzes existing rules + logs and suggests improvements

exports.getOptimizationTips = async (req, res) => {
  try {
    const [rules, logs] = await Promise.all([
      Rule.find({ userId: req.userId }),
      EmailLog.find({ userId: req.userId, success: true })
        .sort({ timestamp: -1 })
        .limit(200)
        .select('intent from subject ruleName ruleId success')
    ]);

    // Find rules with 0 matches
    const unusedRules = rules.filter(r => (r.stats?.totalMatched || 0) === 0).map(r => r.name);

    // Find most common unmatched intents (emails without a ruleId)
    const unmatchedIntents = {};
    logs.filter(l => !l.ruleId).forEach(l => {
      if (l.intent) unmatchedIntents[l.intent] = (unmatchedIntents[l.intent] || 0) + 1;
    });

    // Find duplicate senders with no rule
    const senderCounts = {};
    logs.filter(l => !l.ruleId).forEach(l => {
      if (l.from) senderCounts[l.from] = (senderCounts[l.from] || 0) + 1;
    });
    const topUnmatchedSenders = Object.entries(senderCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([from, count]) => `${from} (${count}x)`);

    const prompt = `You are an email automation expert. Analyze this data and give exactly 3 specific, actionable optimization tips (numbered list). Be concise and concrete.

Current rules: ${rules.map(r => r.name).join(', ') || 'none'}
Unused rules: ${unusedRules.join(', ') || 'none'}
Unmatched intents: ${JSON.stringify(unmatchedIntents)}
Top senders with no matching rule: ${topUnmatchedSenders.join(', ') || 'none'}

Reply with exactly 3 numbered tips. No markdown headers.`;

    const tips = await callClaude(prompt, 300);

    res.json({
      tips,
      unusedRuleCount: unusedRules.length,
      unmatchedIntents,
      topUnmatchedSenders
    });
  } catch (err) {
    console.error('getOptimizationTips error:', err);
    res.status(500).json({ error: 'Failed to generate tips' });
  }
};

// ── Bulk Auto-Label Preview ────────────────────────────────────────────────
// Returns a dry-run preview of what bulk labeling would do

exports.getBulkLabelPreview = async (req, res) => {
  try {
    const { intent, label } = req.query;
    if (!intent || !label) return res.status(400).json({ error: 'intent and label are required' });

    const logs = await EmailLog.find({ userId: req.userId, intent, success: true })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('subject from timestamp messageId');

    res.json({
      intent,
      label,
      totalAffected: logs.length,
      preview: logs.slice(0, 10).map(l => ({
        subject: l.subject,
        from: l.from,
        timestamp: l.timestamp,
        messageId: l.messageId
      }))
    });
  } catch (err) {
    console.error('getBulkLabelPreview error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Sender Intelligence ────────────────────────────────────────────────────
// Deep analysis for a specific sender

exports.getSenderIntelligence = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const [rel, logs] = await Promise.all([
      EmailRelationship.findOne({ userId: req.userId, senderEmail: email.toLowerCase() }),
      EmailLog.find({ userId: req.userId, from: { $regex: email, $options: 'i' } })
        .sort({ timestamp: -1 })
        .limit(50)
    ]);

    if (!rel) return res.status(404).json({ error: 'Sender not found' });

    const intentBreakdown = {};
    logs.forEach(l => {
      if (l.intent) intentBreakdown[l.intent] = (intentBreakdown[l.intent] || 0) + 1;
    });

    const prompt = `Analyze this email contact and write a 2-sentence intelligence summary. Be data-driven and professional.

Sender: ${rel.senderName || email} (${email})
Total emails: ${rel.totalEmails}
VIP status: ${rel.isVip ? 'Yes' : 'No'}
First seen: ${rel.firstSeenAt}
Topics discussed: ${[...new Set(rel.topics || [])].slice(0, 10).join(', ')}
Intent breakdown: ${JSON.stringify(intentBreakdown)}
Best reply hour: ${rel.bestSendHour !== null ? `${rel.bestSendHour}:00` : 'unknown'}

Plain text, no markdown, 2 sentences max.`;

    const intelligence = await callClaude(prompt, 150);

    res.json({
      sender: rel,
      intentBreakdown,
      recentEmails: logs.slice(0, 10),
      intelligence
    });
  } catch (err) {
    console.error('getSenderIntelligence error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Live Stats Stream (polling endpoint) ──────────────────────────────────

exports.getLiveStats = async (req, res) => {
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour

    const [recentLogs, totalRules, totalVips] = await Promise.all([
      EmailLog.find({ userId: req.userId, timestamp: { $gte: since } })
        .sort({ timestamp: -1 })
        .limit(20),
      Rule.countDocuments({ userId: req.userId, active: true }),
      EmailRelationship.countDocuments({ userId: req.userId, isVip: true })
    ]);

    const intentCounts = {};
    recentLogs.forEach(l => {
      if (l.intent) intentCounts[l.intent] = (intentCounts[l.intent] || 0) + 1;
    });

    res.json({
      lastHour: {
        processed: recentLogs.length,
        success: recentLogs.filter(l => l.success).length,
        byIntent: intentCounts,
        latest: recentLogs.slice(0, 5).map(l => ({
          subject: l.subject,
          from: l.from,
          intent: l.intent,
          success: l.success,
          timestamp: l.timestamp
        }))
      },
      totals: {
        activeRules: totalRules,
        vipContacts: totalVips
      },
      serverTime: new Date()
    });
  } catch (err) {
    console.error('getLiveStats error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ── Manual Run Now Trigger ─────────────────────────────────────────────────
// Triggers immediate email processing for the current user (outside cron)

exports.runNow = async (req, res) => {
  try {
    const User = require('../models/User');
    const { processForUser } = require('../services/scheduler');

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.tokensEncrypted) return res.status(400).json({ error: 'No Gmail tokens. Please re-login.' });

    // Fire async, respond immediately
    processForUser(user).catch(err => console.error('runNow error:', err.message));

    res.json({ ok: true, message: 'Processing started. Check Mail Logs in a few seconds.' });
  } catch (err) {
    console.error('runNow error:', err);
    res.status(500).json({ error: 'Failed to trigger processing' });
  }
};
