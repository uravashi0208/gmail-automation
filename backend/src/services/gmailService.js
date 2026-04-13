'use strict';

const { google } = require('googleapis');
const User = require('../models/User');
const { decrypt, encrypt } = require('../utils/crypto');

async function getOAuthClientForUser(user) {
  if (!user.tokensEncrypted) {
    throw new Error(`No tokens found for user ${user.email}. Please re-login.`);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH_REDIRECT_URI
  );

  const tokens = decrypt(user.tokensEncrypted);

  // Verify Gmail scope is present in stored tokens
  const hasGmailScope = tokens.scope && (
    tokens.scope.includes('gmail.modify') ||
    tokens.scope.includes('gmail.readonly') ||
    tokens.scope.includes('mail.google.com')
  );

  if (!hasGmailScope) {
    throw new Error(`User ${user.email} has insufficient Gmail permissions. Scope: ${tokens.scope}. Please re-login.`);
  }

  oauth2Client.setCredentials(tokens);

  // Auto-save refreshed tokens back to DB
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      const merged = { ...tokens, ...newTokens };
      const freshUser = await User.findById(user._id);
      if (freshUser) {
        freshUser.tokensEncrypted = encrypt(merged);
        await freshUser.save();
        console.log(`Tokens refreshed and saved for ${user.email}`);
      }
    } catch (err) {
      console.error('Failed to save refreshed tokens:', err.message);
    }
  });

  return oauth2Client;
}

async function listUnreadMessages(user) {
  const auth = await getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });
  return res.data.messages || [];
}

async function getMessage(user, messageId) {
  const auth = await getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
  return res.data;
}

async function modifyMessage(user, messageId, { addLabelIds = [], removeLabelIds = [] }) {
  const auth = await getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth });
  return gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    resource: { addLabelIds, removeLabelIds }
  });
}

async function sendReply(user, originalMessage, replyBody) {
  const auth = await getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth });

  const threadId = originalMessage.threadId;
  const headers = originalMessage.payload.headers;
  const from = headers.find(h => h.name === 'From')?.value || '';
  const subjectHeader = headers.find(h => h.name === 'Subject');
  const subject = subjectHeader
    ? (subjectHeader.value.startsWith('Re:') ? subjectHeader.value : `Re: ${subjectHeader.value}`)
    : 'Re:';

  const raw = [
    `From: ${user.email}`,
    `To: ${from}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${originalMessage.id}`,
    `References: ${originalMessage.id}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    replyBody
  ].join('\r\n');

  const encoded = Buffer.from(raw).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded, threadId } });
}

module.exports = {
  getOAuthClientForUser,
  listUnreadMessages,
  getMessage,
  modifyMessage,
  sendReply
};
