'use strict';

const cron = require('node-cron');
const { google } = require('googleapis');

const User              = require('../models/User');
const Rule              = require('../models/Rule');
const EmailLog          = require('../models/EmailLog');
const EmailRelationship = require('../models/EmailRelationship');
const gmailService      = require('./gmailService');
const { detectIntent }  = require('./intentService');

// ── helpers ────────────────────────────────────────────────────────────────

async function getLabelId(user, labelName) {
  const auth  = await gmailService.getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth });
  const res   = await gmail.users.labels.list({ userId: 'me' });
  let label   = res.data.labels.find(l => l.name === labelName);
  if (!label) {
    const newLabel = await gmail.users.labels.create({
      userId: 'me',
      requestBody: { name: labelName, labelListVisibility: 'labelShow', messageListVisibility: 'show' }
    });
    label = newLabel.data;
  }
  return label.id;
}

function getHeader(message, name) {
  return (message.payload.headers.find(h => h.name === name) || {}).value || '';
}

function extractEmailAddress(raw) {
  const m = raw.match(/<([^>]+)>/);
  return m ? m[1].toLowerCase() : raw.toLowerCase().trim();
}

function extractSnippet(message) {
  return message.snippet || '';
}

// ── Conversation Memory Engine ─────────────────────────────────────────────

async function updateRelationship(userId, senderRaw, subject, receivedHour) {
  const senderEmail = extractEmailAddress(senderRaw);
  const senderName  = senderRaw.replace(/<[^>]+>/, '').trim().replace(/"/g, '') || senderEmail;

  // extract topic keywords from subject (simple: words > 4 chars)
  const topicWords = (subject || '')
    .split(/\s+/)
    .map(w => w.toLowerCase().replace(/[^a-z]/g, ''))
    .filter(w => w.length > 4);

  await EmailRelationship.findOneAndUpdate(
    { userId, senderEmail },
    {
      $setOnInsert: { firstSeenAt: new Date() },
      $set:         { senderName, lastSeenAt: new Date() },
      $inc:         { totalEmails: 1 },
      $push: {
        receivedHours: { $each: [receivedHour], $slice: -100 },
        topics:        { $each: topicWords,     $slice: -200 }
      }
    },
    { upsert: true, new: true }
  );

  // update VIP flag and best send hour
  const rel = await EmailRelationship.findOne({ userId, senderEmail });
  if (rel) {
    const isVip = rel.totalEmails >= 10;
    let bestSendHour = null;
    if (rel.receivedHours.length >= 5) {
      // find most frequent hour
      const freq = {};
      rel.receivedHours.forEach(h => { freq[h] = (freq[h] || 0) + 1; });
      bestSendHour = parseInt(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
    }
    await EmailRelationship.updateOne({ _id: rel._id }, { isVip, bestSendHour });
  }
}

// ── Rule conflict detection ─────────────────────────────────────────────────

function rulesOverlap(r1, r2) {
  const c1 = r1.conditions || {};
  const c2 = r2.conditions || {};
  const subjectOverlap =
    !c1.subjectContains || !c2.subjectContains ||
    c1.subjectContains.toLowerCase().includes(c2.subjectContains.toLowerCase()) ||
    c2.subjectContains.toLowerCase().includes(c1.subjectContains.toLowerCase());
  const fromOverlap =
    !c1.from || !c2.from ||
    c1.from.toLowerCase().includes(c2.from.toLowerCase()) ||
    c2.from.toLowerCase().includes(c1.from.toLowerCase());
  const intentOverlap =
    !c1.intentTrigger || !c2.intentTrigger || c1.intentTrigger === c2.intentTrigger;
  return subjectOverlap && fromOverlap && intentOverlap;
}

// ── Condition matching ──────────────────────────────────────────────────────

function matchesConditions(message, conditions, intent) {
  const subject = getHeader(message, 'Subject').toLowerCase();
  const from    = getHeader(message, 'From').toLowerCase();

  if (conditions.subjectContains && !subject.includes(conditions.subjectContains.toLowerCase())) return false;
  if (conditions.from && !from.includes(conditions.from.toLowerCase())) return false;
  if (conditions.intentTrigger && conditions.intentTrigger !== 'other' && intent !== conditions.intentTrigger) return false;
  return true;
}

// ── Apply rule ──────────────────────────────────────────────────────────────

async function applyRuleToMessage(user, rule, message, intent) {
  try {
    if (rule.actions.label) {
      const labelId = await getLabelId(user, rule.actions.label);
      await gmailService.modifyMessage(user, message.id, { addLabelIds: [labelId] });
    }
    if (rule.actions.archive) {
      await gmailService.modifyMessage(user, message.id, { removeLabelIds: ['INBOX'] });
    }
    if (rule.actions.autoReply && rule.actions.autoReplyTemplate) {
      await gmailService.sendReply(user, message, rule.actions.autoReplyTemplate);
    }
    if (rule.actions.forwardTo) {
      await gmailService.sendReply(user, message, `Forwarded to: ${rule.actions.forwardTo}`);
    }

    // update rule health stats
    await Rule.updateOne(
      { _id: rule._id },
      { $inc: { 'stats.totalMatched': 1 }, $set: { 'stats.lastMatchedAt': new Date() } }
    );

    await EmailLog.create({
      userId:      user._id,
      messageId:   message.id,
      subject:     getHeader(message, 'Subject'),
      from:        getHeader(message, 'From'),
      actionTaken: `Applied rule: ${rule.name}`,
      ruleId:      rule._id,
      ruleName:    rule.name,
      intent,
      success:     true
    });
  } catch (err) {
    await EmailLog.create({
      userId:      user._id,
      messageId:   message.id,
      subject:     getHeader(message, 'Subject'),
      from:        getHeader(message, 'From'),
      actionTaken: `Error: ${err.message}`,
      ruleId:      rule._id,
      ruleName:    rule.name,
      intent,
      success:     false,
      detail:      err.stack
    });
  }
}

// ── Main per-user processor ─────────────────────────────────────────────────

async function processForUser(user) {
  if (!user?.tokensEncrypted) return;
  const rules    = await Rule.find({ userId: user._id, active: true });
  const messages = await gmailService.listUnreadMessages(user);

  for (const m of messages) {
    const full    = await gmailService.getMessage(user, m.id);
    const subject = getHeader(full, 'Subject');
    const from    = getHeader(full, 'From');
    const hour    = new Date().getHours();

    // update conversation memory
    await updateRelationship(user._id, from, subject, hour);

    // detect intent (AI)
    const intent = await detectIntent(subject, extractSnippet(full));

    // apply matching rules
    for (const rule of rules) {
      if (matchesConditions(full, rule.conditions, intent)) {
        await applyRuleToMessage(user, rule, full, intent);
      }
    }
  }
}

// ── Scheduler ───────────────────────────────────────────────────────────────

function startScheduler() {
  const schedule = process.env.CRON_SCHEDULE || '*/1 * * * *';
  cron.schedule(schedule, async () => {
    try {
      const users = await User.find({ 'settings.enabled': true });
      for (const u of users) await processForUser(u);
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  }, { timezone: process.env.TZ || 'Europe/Warsaw' });
}

module.exports = { startScheduler, processForUser, rulesOverlap };
