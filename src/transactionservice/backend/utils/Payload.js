const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = Buffer.from("12345678901234567890123456789012"); // 32 bytes
const iv = Buffer.from("1234567890123456"); // 16 bytes

const encryptPayload = (data) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

const decryptPayload = (encryptedData) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};

module.exports = { encryptPayload, decryptPayload };
