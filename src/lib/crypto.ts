/**
 * CovenantERP Encryption Layer
 * Implements Client-Side E2EE using Web Crypto API.
 */

export interface EncryptedData {
  ciphertext: string;
  iv: string;
}

/**
 * Derives a key from a passphrase using PBKDF2.
 */
export async function deriveKeyFromPassphrase(passphrase: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a message using a CryptoKey.
 */
export async function encryptMessage(message: string, key: CryptoKey): Promise<EncryptedData> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(message)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypts a message using a CryptoKey.
 */
export async function decryptMessage(data: EncryptedData, key: CryptoKey): Promise<string> {
  const dec = new TextDecoder();
  const iv = new Uint8Array(atob(data.iv).split("").map((c) => c.charCodeAt(0)));
  const ciphertext = new Uint8Array(atob(data.ciphertext).split("").map((c) => c.charCodeAt(0)));

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  return dec.decode(decrypted);
}
