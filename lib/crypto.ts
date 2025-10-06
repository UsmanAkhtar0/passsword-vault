// Client-side crypto utilities using Web Crypto API (AES-GCM + PBKDF2)
export type VaultItem = {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
};

export async function deriveKey(password: string, keySaltB64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const salt = Uint8Array.from(atob(keySaltB64), c => c.charCodeAt(0));
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}

export function randBytes(len: number): Uint8Array {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return b;
}

export async function encryptItem(key: CryptoKey, item: VaultItem): Promise<{ ivB64: string; ciphertextB64: string; }> {
  const iv = randBytes(12);
  const data = new TextEncoder().encode(JSON.stringify(item));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ct)));
  return { ivB64, ciphertextB64: ctB64 };
}

export async function decryptItem<T = VaultItem>(key: CryptoKey, ivB64: string, ciphertextB64: string): Promise<T> {
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  const json = new TextDecoder().decode(plain);
  return JSON.parse(json) as T;
}

// Password generator with options
export type GenOptions = {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  excludeLookalikes: boolean; // exclude 0/O, 1/l/I, etc.
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "0123456789";
const SYM = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const LOOKALIKE = new Set(["0","O","o","1","l","I"]);

export function generatePassword(opts: GenOptions): string {
  let pool = "";
  if (opts.useLower) pool += LOWER;
  if (opts.useUpper) pool += UPPER;
  if (opts.useNumbers) pool += NUM;
  if (opts.useSymbols) pool += SYM;
  if (!pool) pool = LOWER + UPPER + NUM;

  const buf = randBytes(opts.length);
  const chars: string[] = [];
  for (let i = 0; i < opts.length; i++) {
    let ch = pool[buf[i] % pool.length];
    if (opts.excludeLookalikes) {
      // re-pick until not lookalike (bounded)
      let guard = 0;
      while (LOOKALIKE.has(ch) && guard++ < 5) {
        ch = pool[randBytes(1)[0] % pool.length];
      }
      if (LOOKALIKE.has(ch)) {
        // fallthrough if we couldn't fix after retries
      }
    }
    chars.push(ch);
  }
  return chars.join("");
}
