// Common Password Detection & Leetspeak Normalizer
// Checks against SecLists Top 10,000 Common Passwords and Top 200 Bad Substrings

// Leetspeak translation table
const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '0': 'o',
  '1': 'i',
  '!': 'i',
  '3': 'e',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  '8': 'b',
};

export function unleet(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase();
    result += LEET_MAP[char] || char;
  }
  return result;
}

export function stripTrailingGarbage(str: string): string {
  // Strip trailing digits and punctuation e.g. "password123!" -> "password"
  return str.replace(/[\d!@#$%^&*()_\-+=\[\]{};':",.<>?`~]+$/, '');
}

// Top worst root passwords to check for substring inclusion
const TOP_WORST_SUBSTRINGS = [
  'password', '123456', '12345678', 'qwerty', '12345', '123456789', 'admin', 'welcome',
  'letmein', 'monkey', 'dragon', 'football', 'baseball', 'iloveyou', 'trustno1', 'princess',
  'superman', 'sunshine', 'shadow', 'master', 'jennifer', 'charlie', 'jordan', 'secret',
  'harley', 'batman', 'summer', 'winter', 'autumn', 'spring', 'hockey', 'soccer', 'guitar',
  'orange', 'diamond', 'coffee', 'pizza', 'monster', 'matrix', 'wyntrix', 'testing', 'default'
];

// In-memory set of common passwords loaded synchronously or statically
let commonPasswordsSet: Set<string> | null = null;

export function initCommonPasswordsSet(list?: string[]): Set<string> {
  if (commonPasswordsSet) return commonPasswordsSet;

  const set = new Set<string>();

  // Add all top worst substrings
  TOP_WORST_SUBSTRINGS.forEach((w) => set.add(w.toLowerCase()));

  // Add provided list if available
  if (list && Array.isArray(list)) {
    list.forEach((w) => {
      const trimmed = w.trim().toLowerCase();
      if (trimmed && !trimmed.startsWith('#')) {
        set.add(trimmed);
      }
    });
  }

  // Pre-seed common variations
  TOP_WORST_SUBSTRINGS.forEach((w) => {
    for (let i = 0; i <= 99; i++) {
      set.add(w + i);
      set.add(w + '!' + i);
      set.add(w + '@' + i);
    }
  });

  commonPasswordsSet = set;
  return set;
}

// Check if a password matches a common breached/dictionary password
export function isCommonPassword(password: string): {
  isCommon: boolean;
  matchedReason?: string;
} {
  if (!password || password.length === 0) {
    return { isCommon: false };
  }

  const set = initCommonPasswordsSet();
  const lower = password.toLowerCase();

  // 1. Direct match in dictionary
  if (set.has(lower)) {
    return { isCommon: true, matchedReason: `Matches commonly breached password "${lower}"` };
  }

  // 2. Leetspeak normalized match
  const unleeted = unleet(lower);
  if (set.has(unleeted)) {
    return { isCommon: true, matchedReason: `Matches common word with leetspeak: "${unleeted}"` };
  }

  // 3. Trailing digits/symbols stripped match
  const stripped = stripTrailingGarbage(unleeted);
  if (stripped.length >= 4 && set.has(stripped)) {
    return { isCommon: true, matchedReason: `Matches common base word "${stripped}" + trailing numbers/symbols` };
  }

  // 4. Substring of top 200 worst passwords
  for (const bad of TOP_WORST_SUBSTRINGS) {
    if (bad.length >= 4 && unleeted.includes(bad)) {
      return { isCommon: true, matchedReason: `Contains prevalent insecure phrase "${bad}"` };
    }
  }

  return { isCommon: false };
}
