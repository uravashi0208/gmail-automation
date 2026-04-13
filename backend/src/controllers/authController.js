"use strict";

const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { encrypt } = require("../utils/crypto");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URI,
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
];

exports.getAuthUrl = (_req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // FORCE new consent every time — get fresh tokens with all scopes
    include_granted_scopes: false, // do NOT merge old scopes — fresh grant only
  });
  res.json({ url });
};

exports.googleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Missing OAuth code" });

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Log token scopes so we can verify Gmail scope was granted
    console.log("OAuth tokens received. Scopes:", tokens.scope);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data: userinfo } = await oauth2.userinfo.get();
    const { id: googleId, email, name } = userinfo;

    // Verify Gmail scope is present before saving
    const hasGmailScope =
      tokens.scope &&
      (tokens.scope.includes("gmail.modify") ||
        tokens.scope.includes("gmail.readonly") ||
        tokens.scope.includes("mail.google.com"));

    if (!hasGmailScope) {
      console.error("Gmail scope NOT granted! Scopes received:", tokens.scope);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=gmail_scope_missing`,
      );
    }

    const tokensEncrypted = encrypt(tokens);

    const user = await User.findOneAndUpdate(
      { googleId },
      { googleId, email, name, tokensEncrypted },
      { upsert: true, new: true },
    );

    console.log(`User ${email} logged in successfully with Gmail scopes.`);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};

exports.getCurrentUser = async (req, res) => {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ error: "Missing Authorization header" });

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-tokensEncrypted");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
