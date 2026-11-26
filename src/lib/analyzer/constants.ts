// Analysis Engine Constants & Tuning Parameters
// Documented for transparency and educational clarity

export const LENGTH_POLICY = {
  MIN_LENGTH: 8,       // Hard minimum required by NIST & OWASP
  RECOMMENDED: 12,    // Recommended length for standard complexity
  MAX_LENGTH: 128,    // Max length to prevent denial-of-service hashing attacks
} as const;

export const POOL_SIZES = {
  LOWERCASE: 26,      // a-z
  UPPERCASE: 26,      // A-Z
  DIGITS: 10,         // 0-9
  SYMBOLS: 33,        // !@#$%^&*()_+-=[]{}|;':",./<>?`~ etc.
  SPACE: 1,           // Space character in passphrases
  UNICODE: 100,       // Emojis or extended unicode characters
} as const;

export const ENTROPY_PENALTIES = {
  REPEATED_CHARS: 8,     // Consecutive identical characters e.g. "aaaa"
  REPEATED_CHUNKS: 12,   // Substring repetition e.g. "abcabc" or "passpass"
  SEQUENCES: 10,         // Alphabetical or numeric sequences e.g. "1234", "abcd"
  KEYBOARD_WALK: 14,     // Keyboard paths e.g. "qwerty", "asdfgh", "1qaz2wsx"
  YEAR_OR_DATE: 8,       // 4-digit years e.g. "1994", "2024" or dates
  USERNAME_INCLUDED: 18, // Password contains current username or "wyntrix"
  REVERSED_COMMON: 10,   // Reversed dictionary word e.g. "drowssap"
  LEETSPEAK_USED: 6,     // Leetspeak substitution e.g. "p@ssw0rd"
} as const;

export const TIER_THRESHOLDS = {
  TIER_0: { min: 0, max: 19, label: 'SOOO WEAK' as const },
  TIER_1: { min: 20, max: 44, label: 'TRY BETTER' as const },
  TIER_2: { min: 45, max: 64, label: 'GOOD' as const },
  TIER_3: { min: 65, max: 84, label: 'WOW' as const },
  TIER_4: { min: 85, max: 100, label: 'STRONGEST' as const },
} as const;

export const CRACK_SPEEDS = {
  ONLINE_GUESSES_PER_SEC: 100 / 3600, // 100 attempts / hour (~0.0277 / sec)
  OFFLINE_FAST_HASH_PER_SEC: 10_000_000_000, // 10 Billion guesses / sec (GPU cluster on MD5/NTLM)
} as const;
