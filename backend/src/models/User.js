const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number
}, { _id: false });

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  tokensEncrypted: String, // encrypted JSON string of tokens
  createdAt: { type: Date, default: Date.now },
  settings: {
    timezone: { type: String, default: 'Europe/Warsaw' },
    enabled: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model('User', UserSchema);
