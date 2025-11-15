import crypto from 'crypto';

const keyHex = process.env.ENCRYPTION_SECRET;
if (!keyHex) throw new Error('ENCRYPTION_SECRET is missing in .env');

const key = Buffer.from(keyHex, 'hex');
if (key.length !== 32) throw new Error('ENCRYPTION_SECRET must be 32 bytes long');

const algorithm = 'aes-256-cbc';
const ivLength = 16;

export function encrypt(obj) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(obj), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(hash) {
  const [ivHex, encrypted] = hash.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}
