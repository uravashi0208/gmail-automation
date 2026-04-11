"use strict";

const crypto = require("crypto");

const keyHex = process.env.ENCRYPTION_SECRET;
if (!keyHex) throw new Error("ENCRYPTION_SECRET is missing in .env");

const key = Buffer.from(keyHex, "hex");
if (key.length !== 32)
  throw new Error("ENCRYPTION_SECRET must be exactly 32 bytes (64 hex chars)");

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

/**
 * Encrypts an object to a hex string: "<iv_hex>:<ciphertext_hex>"
 * @param {object} obj
 * @returns {string}
 */
function encrypt(obj) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(obj), "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a "<iv_hex>:<ciphertext_hex>" string back to an object.
 * @param {string} hash
 * @returns {object}
 */
function decrypt(hash) {
  const [ivHex, encrypted] = hash.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

module.exports = { encrypt, decrypt };
