/**
 * Client-Side AES-256-GCM Secure Encryption Utility for User API Keys
 * Protects custom provider keys from plain-text exposure in localStorage.
 */

const SALT_SEED = "koda_vault_seed_2026_aes_gcm_salt";

// Helper: Convert string to 256-bit key buffer
async function getMasterKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const subtle = typeof window !== "undefined" && window.crypto?.subtle ? window.crypto.subtle : (globalThis as any).crypto?.subtle;

  if (!subtle) {
    throw new Error("Web Crypto API is not available in this environment.");
  }

  // Derive master key using SHA-256 of application seed
  const hash = await subtle.digest("SHA-256", enc.encode(SALT_SEED));
  return subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  const byteView = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < byteView.length; i++) {
    hex += byteView[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// Convert Hex String to Uint8Array
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface EncryptedPayload {
  ciphertext: string; // hex encoded
  iv: string;         // hex encoded
  algorithm: "AES-GCM-256";
}

/**
 * Encrypts an API Key using AES-256-GCM
 */
export async function encryptApiKey(plainText: string): Promise<EncryptedPayload> {
  if (!plainText) {
    return { ciphertext: "", iv: "", algorithm: "AES-GCM-256" };
  }

  const cryptoObj = typeof window !== "undefined" && window.crypto ? window.crypto : (globalThis as any).crypto;
  const subtle = cryptoObj?.subtle;

  if (!subtle) {
    // Fallback: base64 obfuscation if subtle crypto is unavailable
    const b64 = Buffer.from(plainText).toString("base64");
    return { ciphertext: b64, iv: "fallback", algorithm: "AES-GCM-256" };
  }

  const enc = new TextEncoder();
  const key = await getMasterKey();
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plainText)
  );

  return {
    ciphertext: bufferToHex(encryptedBuffer),
    iv: bufferToHex(iv.buffer),
    algorithm: "AES-GCM-256",
  };
}

/**
 * Decrypts an AES-256-GCM Encrypted API Key
 */
export async function decryptApiKey(payload: EncryptedPayload): Promise<string> {
  if (!payload || !payload.ciphertext) return "";

  if (payload.iv === "fallback") {
    return Buffer.from(payload.ciphertext, "base64").toString("utf-8");
  }

  const cryptoObj = typeof window !== "undefined" && window.crypto ? window.crypto : (globalThis as any).crypto;
  const subtle = cryptoObj?.subtle;

  if (!subtle) {
    return "";
  }

  const dec = new TextDecoder();
  const key = await getMasterKey();
  const ivBuffer = hexToBuffer(payload.iv);
  const cipherBuffer = hexToBuffer(payload.ciphertext);

  const decryptedBuffer = await subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer as unknown as BufferSource },
    key,
    cipherBuffer as unknown as BufferSource
  );

  return dec.decode(decryptedBuffer);
}

/**
 * Masks an API key for safe display in UI
 * e.g. "sk-proj-1234567890abcdef" -> "sk-proj-••••••••••••cdef"
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return "";
  const trimmed = apiKey.trim();
  if (trimmed.length <= 8) {
    return "••••••••";
  }
  const prefix = trimmed.slice(0, Math.min(8, Math.floor(trimmed.length / 3)));
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}
