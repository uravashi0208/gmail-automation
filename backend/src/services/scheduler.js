const cron = require('node-cron');
const User = require('../models/User');
const Rule = require('../models/Rule');
const EmailLog = require('../models/EmailLog');
const gmailService = require('./gmailService');
const { google } = require('googleapis');


async function getLabelId(user, labelName) {
  const auth = await gmailService.getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.labels.list({ userId: 'me' });
  let label = res.data.labels.find(l => l.name === labelName);
  if (!label) {
    const newLabel = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      }
    });
    label = newLabel.data;
  }
  return label.id;
}

function matchesConditions(message, conditions) {
  const headers = message.payload.headers;
  const subjectHeader = headers.find(h => h.name === 'Subject') || { value: '' };
  const fromHeader = headers.find(h => h.name === 'From') || { value: '' };
  const subject = subjectHeader.value.toLowerCase();
  const from = fromHeader.value.toLowerCase();

  if (conditions.subjectContains && !subject.includes(conditions.subjectContains.toLowerCase())) return false;
  if (conditions.from && !from.includes(conditions.from.toLowerCase())) return false;
  return true;
}

async function applyRuleToMessage(user, rule, message) {
  try {
    // Apply label
    if (rule.actions.label) {
      const labelId = await getLabelId(user, rule.actions.label);
      // ensure label exists: for demo we assume label id is label name (in prod create via API)
      await gmailService.modifyMessage(user, message.id, { addLabelIds: [labelId] });
    }
    if (rule.actions.archive) {
      await gmailService.modifyMessage(user, message.id, { removeLabelIds: ['INBOX'] });
    }
    if (rule.actions.autoReply && rule.actions.autoReplyTemplate) {
      await gmailService.sendReply(user, message, rule.actions.autoReplyTemplate);
    }
    if (rule.actions.forwardTo) {
      // forwarding via sendMessage with forward markers - simplified
      const body = `Forwarding original message\n\n`;
      await gmailService.sendReply(user, message, `${body}\nForward to: ${rule.actions.forwardTo}`);
    }
    await EmailLog.create({
      userId: user._id,
      messageId: message.id,
      subject: (message.payload.headers.find(h => h.name === 'Subject') || {}).value || '',
      actionTaken: `Applied rule ${rule.name}`,
      success: true
    });
  } catch (err) {
    await EmailLog.create({
      userId: user._id,
      messageId: message.id,
      subject: (message.payload.headers.find(h => h.name === 'Subject') || {}).value || '',
      actionTaken: `Error ${err.message}`,
      success: false,
      detail: err.stack
    });
  }
}

async function processForUser(user) {
  if (!user || !user.tokensEncrypted) return;
  const rules = await Rule.find({ userId: user._id, active: true });
  if (!rules.length) return;
  const messages = await gmailService.listUnreadMessages(user);
  for (const m of messages) {
    const full = await gmailService.getMessage(user, m.id);
    for (const r of rules) {
      if (matchesConditions(full, r.conditions)) {
        await applyRuleToMessage(user, r, full);
      }
    }
  }
}

function startScheduler() {
  const schedule = process.env.CRON_SCHEDULE || '*/1 * * * *';
  cron.schedule(schedule, async () => {
    try {
      const users = await User.find({ 'settings.enabled': true });
      for (const user of users) {
        await processForUser(user);
      }
    } catch (err) {
      console.error('Scheduler error', err);
    }
  }, { timezone: process.env.TZ || 'Europe/Warsaw' });
}

module.exports = { startScheduler, processForUser };
