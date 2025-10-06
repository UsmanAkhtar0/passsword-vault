# Password Generator + Secure Vault (MVP)

Next.js (App Router) + TypeScript + MongoDB. Client-side encryption via Web Crypto (AES-GCM + PBKDF2).

## Quickstart

1. Create `.env.local`:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=vault_mvp
JWT_SECRET=change_me_long_random
```

2. Install & run:

```bash
npm install
npm run dev
```

3. Flow
- Sign up with email/password. A random *keySalt* is generated client-side and stored with your user document.
- Login returns a JWT (used as a bearer token) and the `keySalt`. The client derives an **encryption key** from `password + keySalt` using PBKDF2(210k, SHA-256) and keeps it in memory.
- Vault items are encrypted **entirely on the client** (AES-GCM 256) and only ciphertext + IV are sent/stored. The server never sees plaintext.
- Search runs client-side on decrypted items.
- Copy to clipboard overwrites the clipboard after ~15 seconds.

> **Crypto choice:** Web Crypto API (PBKDF2 + AES-GCM) — built-in, battle-tested primitives, no native add-ons, works in modern browsers. PBKDF2 210k is a reasonable default; you can swap to Argon2 later for stronger resistance.

## API (Route Handlers)
- `POST /api/auth/signup` — { email, password, keySaltB64 }
- `POST /api/auth/login` — { email, password } -> { token, keySaltB64 }
- `GET /api/vault` — list user's items (encrypted blobs)
- `POST /api/vault` — create item { ivB64, ciphertextB64, version }
- `PUT /api/vault/:id` — update blobs
- `DELETE /api/vault/:id` — delete

Authentication is via `Authorization: Bearer <token>` using HS256 JWT (`JWT_SECRET`).

## UI
- `/signup`, `/login`, `/vault`
- Generator: length slider, toggles, exclude look-alikes
- Vault: add/edit/delete, copy-to-clipboard with auto-clear, search

## Notes
- For a stricter UX, don't keep the password in `sessionStorage` like the demo; instead ask for the master password to "unlock" on each session and derive the key again.
- Titles/usernames/URL/notes/password are all inside the encrypted blob. The database/network only show ciphertext/IV.

## Optional Enhancements
- 2FA (TOTP): store TOTP secret encrypted inside a separate blob; require OTP at login.
- Tags/folders: keep tags inside item payload; render filters in UI.
- Export/Import: serialize the encrypted items to a file and re-import (no plaintext ever leaves the client).
- Dark mode: already supported via `prefers-color-scheme`, extend with a toggle.

## Acceptance Checklist
- [x] Sign up, login
- [x] Add item -> server stores encrypted blob only
- [x] Generator instant
- [x] Copy clears after ~15s
- [x] Search works

