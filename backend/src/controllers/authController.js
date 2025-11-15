require('dotenv').config();
const { google } = require('googleapis');
const User = require('../models/User');
const { encrypt } = require('../utils/crypto');
const jwt = require('jsonwebtoken');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URI
);



const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid'
];

exports.getAuthUrl = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.json({ url });
};

exports.googleCallback = async (req, res) => {
  const code = req.query.code;
  
  if (!code) return res.status(400).send('Missing code');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // fetch basic profile
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userinfo = await oauth2.userinfo.get();
    const { id: googleId, email, name } = userinfo.data;

    // persist user (encrypt tokens)
    const tokenEnc = encrypt(tokens);

    let user = await User.findOneAndUpdate(
      { googleId },
      { googleId, email, name, tokensEncrypted: tokenEnc },
      { upsert: true, new: true }
    );

    // create JWT for frontend
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/?token=${token}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google callback error', err);
    res.status(500).send('Auth failed');
  }
};

exports.getCurrentUser = async (req, res) => {
  // token in Authorization: Bearer <jwt>
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Missing auth');
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-tokensEncrypted');
    res.json({ user });
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};
