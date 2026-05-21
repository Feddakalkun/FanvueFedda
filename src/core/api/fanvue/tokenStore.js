const crypto = require("crypto");

const TOKEN_DB = new Map();

function getSecret() {
  return process.env.FANVUE_TOKEN_SECRET || "fanvuefedda-dev-secret-change-me";
}

function encrypt(value) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(getSecret()).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(value) {
  const [ivHex, dataHex] = String(value || "").split(":");
  const iv = Buffer.from(ivHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const key = crypto.createHash("sha256").update(getSecret()).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

class TokenStore {
  async save(accountId, tokens) {
    TOKEN_DB.set(accountId, {
      updatedAt: new Date().toISOString(),
      tokens: encrypt(JSON.stringify(tokens)),
    });
  }

  async get(accountId) {
    const row = TOKEN_DB.get(accountId);
    if (!row) return null;
    return JSON.parse(decrypt(row.tokens));
  }
}

module.exports = { TokenStore };
