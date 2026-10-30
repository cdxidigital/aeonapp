/**
 * AEON encrypted export, v1. Passphrases and keys never leave the browser.
 * The application's existing localStorage itself is NOT encrypted.
 */
export const BACKUP_FORMAT = "aeon.encrypted-backup.v1";
export const BACKUP_ITERATIONS = 600000;
const MAX_BYTES = 16 * 1024 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function cryptoApi() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) throw Error("Encrypted backups need a secure browser connection.");
  return globalThis.crypto;
}
function phraseBytes(phrase) {
  if (typeof phrase !== "string" || [...phrase].length < 12 || phrase.length > 1024) throw Error("Use a backup passphrase of at least 12 characters.");
  return encoder.encode(phrase);
}
function base64url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode64(value, max) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1 ||
      value.length > Math.ceil(max * 4 / 3) + 4) throw Error("Encrypted backup contains invalid or oversized data.");
  let binary;
  try { binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)); }
  catch { throw Error("Encrypted backup contains invalid or oversized data."); }
  if (binary.length > max) throw Error("Encrypted backup is too large.");
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
async function keyFrom(phrase, salt, usage) {
  const c = cryptoApi();
  const base = await c.subtle.importKey("raw", phraseBytes(phrase), "PBKDF2", false, ["deriveKey"]);
  return c.subtle.deriveKey({ name: "PBKDF2", salt, iterations: BACKUP_ITERATIONS, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, [usage]);
}
export function isEncryptedBackup(value) {
  return Boolean(value && typeof value === "object" && value.format === BACKUP_FORMAT);
}
export async function encryptBackup(plaintext, phrase) {
  if (typeof plaintext !== "string" || !plaintext.trim()) throw Error("No backup data to encrypt.");
  const raw = encoder.encode(plaintext);
  if (raw.length > MAX_BYTES) throw Error("Backup exceeds the 16 MB encryption limit.");
  const c = cryptoApi(), salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
  const createdAt = new Date().toISOString(), key = await keyFrom(phrase, salt, "encrypt");
  const cipher = await c.subtle.encrypt({ name: "AES-GCM", iv,
    additionalData: encoder.encode(BACKUP_FORMAT + "|" + createdAt), tagLength: 128 }, key, raw);
  return { format: BACKUP_FORMAT, createdAt, cipher: "AES-256-GCM", kdf: "PBKDF2-SHA-256",
    iterations: BACKUP_ITERATIONS, salt: base64url(salt), iv: base64url(iv),
    ciphertext: base64url(new Uint8Array(cipher)) };
}
export async function decryptBackup(envelope, phrase) {
  if (!isEncryptedBackup(envelope) || envelope.cipher !== "AES-256-GCM" ||
      envelope.kdf !== "PBKDF2-SHA-256" || envelope.iterations !== BACKUP_ITERATIONS ||
      typeof envelope.createdAt !== "string" ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(envelope.createdAt))
    throw Error("Unsupported or invalid AEON encrypted backup.");
  const salt = decode64(envelope.salt, 16), iv = decode64(envelope.iv, 12);
  const cipher = decode64(envelope.ciphertext, MAX_BYTES + 16);
  if (salt.length !== 16 || iv.length !== 12 || cipher.length < 17) throw Error("Encrypted backup is incomplete.");
  const c = cryptoApi(), key = await keyFrom(phrase, salt, "decrypt");
  try {
    return decoder.decode(await c.subtle.decrypt({ name: "AES-GCM", iv,
      additionalData: encoder.encode(BACKUP_FORMAT + "|" + envelope.createdAt), tagLength: 128 }, key, cipher));
  } catch { throw Error("Could not unlock the backup. Check the passphrase and file integrity."); }
}
