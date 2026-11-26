# Wyntrix Pixel Guard - Security Whitepaper & Compliance

This document provides a comprehensive security overview of **Wyntrix Pixel Guard**, covering the threat model, cryptographic implementations, defensive controls, and alignment with modern industry standards (**NIST SP 800-63B** and **OWASP ASVS v4.0**).

---

## 1. Cryptographic Implementations

### 1.1 Password Hashing: Argon2id
In accordance with OWASP and Password Hashing Competition (PHC) guidelines, passwords are never stored in plaintext. They are hashed using **Argon2id** via `@node-rs/argon2`:
- **Algorithm**: `Argon2id` (hybrid version resisting both side-channel and GPU cracking attacks)
- **Memory Cost ($m$)**: 19,456 KiB (19 MiB)
- **Time Cost ($t$)**: 2 iterations
- **Parallelism ($p$)**: 1 thread
- **Output Length**: 32 bytes
- **Fallback**: Graceful fallback to `bcryptjs` (cost factor 12) if hardware constraints prevent native SIMD instructions.

### 1.2 Timing Attack Defense (Constant-Time Verification)
When an attacker attempts to log in with a non-existent username, databases typically respond faster than when verifying a real password hash. To prevent **username enumeration via timing attacks**:
- If `user` is null, the system immediately runs `timingEqualizer(password)`:
```ts
export async function timingEqualizer(password: string): Promise<void> {
  try {
    await argon2.verify(DUMMY_HASH, password);
  } catch {
    // Fails silently; equalizes CPU execution time
  }
}
```
This ensures the request processing time is virtually indistinguishable between valid and invalid usernames.

---

## 2. Authentication Controls & Lockout Defense

### 2.1 Exponential Lockout Policy
To defend against brute-force attacks, the portal enforces an automated exponential lockout policy tracked in SQLite:
- **Attempts 1 & 2**: Informational warning; Byte changes expression to Detective (`DETECTIVE`) and Angry (`ANGRY`).
- **Attempt 3**: Account locked for **30 seconds**; Byte transitions to Dizzy Lockout (`DIZZY_LOCKED`).
- **Attempt 4**: Account locked for **60 seconds**.
- **Attempt 5**: Account locked for **120 seconds**.
- **Subsequent attempts**: $30 \times 2^{(attempts - 3)}$ seconds (up to 1 hour max).
- During lockout, the UI renders the retro **LED matrix countdown** with animated pixel hourglass, disabling form submission until the timer expires.

### 2.2 Per-IP Rate Limiting
- Applied on all `/api/auth/*` endpoints.
- In-memory sliding-window bucket: **20 requests per minute per IP address**.
- Returns HTTP status `429 Too Many Requests` with `Retry-After` reset seconds.

### 2.3 Session Management: Signed JWT via `jose`
- Signed using **HMAC-SHA256 (`HS256`)**.
- Transported exclusively inside an **`HttpOnly`**, **`SameSite=Lax`** cookie (`wyntrix_session`).
- Cookie flags:
  - `HttpOnly`: Prevents client-side JavaScript (XSS) from reading the token.
  - `SameSite=Lax`: Defends against Cross-Site Request Forgery (CSRF).
  - `Secure`: Enforced in production environments.
  - Expiration: 7 days if "Remember Me" is selected; otherwise 24 hours.

---

## 3. k-Anonymity Breach Check Privacy Model

The optional breach check enables users to test credentials against billions of compromised passwords from data breaches without compromising privacy:

1. **Local SHA-1 Computation**: The browser executes `crypto.subtle.digest('SHA-1')` locally on the client.
2. **5-Character Prefix Truncation**: Only the first 5 hexadecimal characters of the 40-character hash (e.g. `21BD1`) are transmitted to the `/api/breach-check` proxy.
3. **Range API Query**: The server proxies the request to `https://api.pwnedpasswords.com/range/{prefix}` with the `Add-Padding: true` header to prevent network traffic size fingerprinting.
4. **Local Suffix Comparison**: The remote API returns a list of hundreds of hash suffixes sharing that prefix. The user's browser performs the match locally.
5. **Zero-Knowledge Guarantee**: Neither Wyntrix nor Have I Been Pwned ever receives the user's plaintext password or full hash.
6. **Fail-Open Policy**: If network or API connectivity is lost, the check fails open gracefully without blocking user workflow.

---

## 4. Compliance & Industry Standards Alignment

### NIST Special Publication 800-63B (Digital Identity Guidelines)
- ✅ **Encourages Long Passphrases**: Explicit character pool calculation supports whitespace and unicode without arbitrary truncation.
- ✅ **Checks Against Compromised Passwords**: SecLists 10,000 corpus and k-anonymity breach check verify credentials against known breach dictionaries.
- ✅ **Eliminates Forced Periodic Rotation**: Adopts NIST guidance recommending password changes only upon suspected compromise.
- ✅ **No Composition Rules Enforced Blindly**: While checklist provides guidance, passphrase length is rewarded over forced punctuation.

### OWASP Application Security Verification Standard (ASVS v4.0)
- ✅ **V2.1.1 (Minimum Length)**: Minimum 8 characters enforced server-side.
- ✅ **V2.1.2 (Maximum Length)**: 128 characters allowed to prevent DoS without truncating passphrases.
- ✅ **V2.1.7 (Common Wordlist Lookup)**: Checks against top breached passwords.
- ✅ **V2.1.9 (Rate Limiting & Lockout)**: Progressive delay and IP rate limiting implemented.
- ✅ **V2.4.1 (Password Storage)**: Argon2id memory-hard password hashing.
- ✅ **V3.2.1 (HttpOnly & SameSite Cookies)**: Session cookies configured with HttpOnly and SameSite.

---

## 5. Security Headers Reference

Configured in `next.config.mjs`:
- `X-Frame-Options: DENY` (Clickjacking prevention)
- `X-Content-Type-Options: nosniff` (MIME-sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self' ...`
