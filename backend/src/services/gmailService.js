const { google } = require('googleapis');
const User = require('../models/User');
const { decrypt } = require('../utils/crypto');

async function getOAuthClientForUser(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  const tokens = decrypt(user.tokensEncrypted);
  oauth2Client.setCredentials(tokens);

  // attach refresh logic: google client will handle refresh if refresh_token available
  oauth2Client.on('tokens', async (newTokens) => {
    // merge and persist updated tokens
    const merged = { ...tokens, ...newTokens };
    user.tokensEncrypted = require('../utils/crypto').encrypt(merged);
    await user.save();
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
  // build RFC2822 reply
  const threadId = originalMessage.threadId;
  const headers = originalMessage.payload.headers;
  const from = headers.find(h => h.name === 'From').value;
  const to = headers.find(h => h.name === 'From').value;
  const subjectHeader = headers.find(h => h.name === 'Subject');
  const subject = subjectHeader ? (subjectHeader.value.startsWith('Re:') ? subjectHeader.value : `Re: ${subjectHeader.value}`) : 'Re:';
  const raw = [
    `From: ${user.email}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${originalMessage.id}`,
    '',
    replyBody
  ].join('\r\n');

  const encoded = Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded, threadId } });
}

module.exports = {
  getOAuthClientForUser,
  listUnreadMessages,
  getMessage,
  modifyMessage,
  sendReply
};
