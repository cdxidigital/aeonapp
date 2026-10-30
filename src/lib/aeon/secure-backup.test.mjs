import test from "node:test";
import assert from "node:assert/strict";
import { encryptBackup, decryptBackup, isEncryptedBackup, BACKUP_FORMAT, BACKUP_ITERATIONS } from "./secure-backup.js";

const password = "a long unique passphrase with spaces";
const sample = JSON.stringify({ application: "AEON", schema: 1, profile: { name: "Zoë 🌙", birthDate: "1990-02-19" }, entries: [{ text: "Private thoughts, こんにちは" }] });

test("encrypted AEON backup round-trips Unicode and protects its plaintext", async () => {
  const backup = await encryptBackup(sample, password);
  assert.ok(isEncryptedBackup(backup));
  assert.equal(backup.format, BACKUP_FORMAT);
  assert.equal(backup.iterations, BACKUP_ITERATIONS);
  assert.equal(backup.cipher, "AES-256-GCM");
  assert.equal(backup.kdf, "PBKDF2-SHA-256");
  assert.equal(typeof backup.salt, "string");
  assert.equal(typeof backup.iv, "string");
  assert.equal(typeof backup.ciphertext, "string");
  assert.doesNotMatch(JSON.stringify(backup), /Private thoughts|1990-02-19|Zoë/);
  assert.equal(await decryptBackup(JSON.parse(JSON.stringify(backup)), password), sample);
});

test("wrong passphrase fails closed", async () => {
  const backup = await encryptBackup(sample, password);
  await assert.rejects(decryptBackup(backup, "a completely different phrase"), /Could not unlock/);
});

test("ciphertext and authenticated metadata cannot be tampered with", async () => {
  const backup = await encryptBackup(sample, password);
  const different = { ...backup, ciphertext: (backup.ciphertext[0] === "A" ? "B" : "A") + backup.ciphertext.slice(1) };
  await assert.rejects(decryptBackup(different, password), /Could not unlock/);
  const tamperedDate = { ...backup, createdAt: "2000-01-01T00:00:00.000Z" };
  await assert.rejects(decryptBackup(tamperedDate, password), /Could not unlock/);
});

test("rejects unknown formats, altered work factors and corrupt headers before decryption", async () => {
  const backup = await encryptBackup(sample, password);
  assert.equal(isEncryptedBackup({ schema: 1 }), false);
  await assert.rejects(decryptBackup({ ...backup, format: "another-app" }, password), /Unsupported/);
  await assert.rejects(decryptBackup({ ...backup, iterations: 1 }, password), /Unsupported/);
  await assert.rejects(decryptBackup({ ...backup, iv: "AA" }, password), /incomplete/);
  await assert.rejects(decryptBackup({ ...backup, ciphertext: "!!!!" }, password), /invalid/);
});

test("rejects weak passphrases, empty backups, and oversized payloads", async () => {
  await assert.rejects(encryptBackup(sample, "short"), /at least 12/);
  await assert.rejects(encryptBackup("", password), /No backup data/);
  await assert.rejects(encryptBackup("x".repeat(16 * 1024 * 1024 + 1), password), /16 MB/);
});

test("salt and nonce are fresh on each export", async () => {
  const first = await encryptBackup(sample, password);
  const second = await encryptBackup(sample, password);
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.iv, second.iv);
  assert.notEqual(first.ciphertext, second.ciphertext);
});
