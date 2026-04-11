"use strict";

/**
 * Migration: re-encrypt all user tokens.
 *
 * Run this ONCE after deploying the fixed crypto.js:
 *   node scripts/reencrypt-tokens.js
 *
 * What it does:
 *   1. Connects to MongoDB
 *   2. For each user, decrypts tokensEncrypted with the OLD scheme
 *   3. Re-encrypts with the new crypto.js and saves
 *
 * If the old data was encrypted with a DIFFERENT key (e.g. key was undefined
 * because dotenv hadn't loaded yet), users will need to re-authenticate via
 * Google OAuth. Run with --force-reauth to clear tokens and require re-login.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");

// ─── Load models and crypto ───────────────────────────────────────────────────
const User = require("../src/models/User");
const { encrypt, decrypt } = require("../src/utils/crypto");

// ─── Optional: paste your OLD key here if it was different ───────────────────
// If ENCRYPTION_SECRET never changed, leave OLD_KEY_HEX as null.
const OLD_KEY_HEX = null; // e.g. 'aabbcc...' (64 hex chars)

function makeOldDecrypt(keyHex) {
  const crypto = require("crypto");
  const key = Buffer.from(keyHex, "hex");
  return function oldDecrypt(hash) {
    const [ivHex, encrypted] = hash.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  };
}

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase());
    }),
  );
}

async function run() {
  const forceReauth = process.argv.includes("--force-reauth");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  const users = await User.find({
    tokensEncrypted: { $exists: true, $ne: null },
  });
  console.log(`Found ${users.length} user(s) with stored tokens.\n`);

  if (users.length === 0) {
    console.log("Nothing to migrate.");
    process.exit(0);
  }

  if (forceReauth) {
    const ans = await confirm(
      `--force-reauth will CLEAR all tokens, requiring users to log in again. Continue? (yes/no): `,
    );
    if (ans !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }

    for (const user of users) {
      user.tokensEncrypted = null;
      await user.save();
      console.log(`  Cleared tokens for: ${user.email}`);
    }
    console.log("\nDone. All users must re-authenticate via Google OAuth.");
    process.exit(0);
  }

  // Try to re-encrypt
  const oldDecrypt = OLD_KEY_HEX ? makeOldDecrypt(OLD_KEY_HEX) : decrypt;

  let migrated = 0;
  let failed = 0;

  for (const user of users) {
    try {
      // Attempt to decrypt with old scheme
      const tokens = oldDecrypt(user.tokensEncrypted);
      // Re-encrypt with current key
      user.tokensEncrypted = encrypt(tokens);
      await user.save();
      console.log(`  ✅  Migrated: ${user.email}`);
      migrated++;
    } catch (err) {
      console.error(`  ❌  Failed to decrypt tokens for: ${user.email}`);
      console.error(`      ${err.message}`);
      console.error(`      → This user will need to re-authenticate.`);
      failed++;
    }
  }

  console.log(`\nMigration complete. Migrated: ${migrated}, Failed: ${failed}`);

  if (failed > 0) {
    console.log(
      "\nFor users that failed, run with --force-reauth to clear their tokens:",
    );
    console.log("  node scripts/reencrypt-tokens.js --force-reauth");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
