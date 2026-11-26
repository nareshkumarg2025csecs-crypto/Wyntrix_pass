// Pattern & Vulnerability Detector
// Identifies structural weaknesses that automated crackers exploit

import { AnalysisFinding } from './types';
import { ENTROPY_PENALTIES } from './constants';

const KEYBOARD_ROWS = [
  '1234567890-=',
  'qwertyuiop[]\\',
  'asdfghjkl;\'',
  'zxcvbnm,./',
];

const KEYBOARD_COLS = [
  '1qaz', '2wsx', '3edc', '4rfv', '5tgb', '6yhn', '7ujm', '8ik,', '9ol.', '0p;/'
];

export function detectPatterns(
  password: string,
  ctx?: { username?: string }
): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const lower = password.toLowerCase();

  // 1. REPEATED CHARACTERS (e.g. "aaaa", "1111")
  if (/(.)\1{2,}/.test(password)) {
    findings.push({
      id: 'repeated_chars',
      label: 'Repeated Characters',
      penalty: ENTROPY_PENALTIES.REPEATED_CHARS,
      description: 'Contains 3 or more identical characters in a row (e.g. "aaa").',
    });
  }

  // 2. REPEATED CHUNKS (e.g. "abcabc", "passpass")
  const chunkMatch = /(.{2,})\1+/.test(lower);
  if (chunkMatch) {
    findings.push({
      id: 'repeated_chunks',
      label: 'Repeated Chunks',
      penalty: ENTROPY_PENALTIES.REPEATED_CHUNKS,
      description: 'Contains repeating syllable or word chunks (e.g. "abcabc").',
    });
  }

  // 3. ASCENDING / DESCENDING SEQUENCES (e.g. "1234", "abcd", "4321")
  let hasSequence = false;
  for (let i = 0; i <= lower.length - 4; i++) {
    const sub = lower.slice(i, i + 4);
    const codes = [sub.charCodeAt(0), sub.charCodeAt(1), sub.charCodeAt(2), sub.charCodeAt(3)];
    // Ascending sequence
    if (codes[1] === codes[0] + 1 && codes[2] === codes[1] + 1 && codes[3] === codes[2] + 1) {
      hasSequence = true;
      break;
    }
    // Descending sequence
    if (codes[1] === codes[0] - 1 && codes[2] === codes[1] - 1 && codes[3] === codes[2] - 1) {
      hasSequence = true;
      break;
    }
  }
  if (hasSequence) {
    findings.push({
      id: 'sequences',
      label: 'Sequential Characters',
      penalty: ENTROPY_PENALTIES.SEQUENCES,
      description: 'Contains sequential letters or numbers (e.g. "1234" or "abcd").',
    });
  }

  // 4. KEYBOARD WALKS (e.g. "qwerty", "asdfgh", "1qaz2wsx")
  let hasWalk = false;
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - 4; i++) {
      const slice = row.slice(i, i + 4);
      const rev = slice.split('').reverse().join('');
      if (lower.includes(slice) || lower.includes(rev)) {
        hasWalk = true;
        break;
      }
    }
    if (hasWalk) break;
  }

  if (!hasWalk) {
    for (const col of KEYBOARD_COLS) {
      const rev = col.split('').reverse().join('');
      if (lower.includes(col) || lower.includes(rev)) {
        hasWalk = true;
        break;
      }
    }
  }

  if (hasWalk) {
    findings.push({
      id: 'keyboard_walk',
      label: 'Keyboard Walk Pattern',
      penalty: ENTROPY_PENALTIES.KEYBOARD_WALK,
      description: 'Follows physical keyboard paths (e.g. "qwerty" or "asdf").',
    });
  }

  // 5. YEARS OR DATES (1900-2099)
  if (/(19\d\d|20\d\d)/.test(password)) {
    findings.push({
      id: 'year_date',
      label: 'Year / Date Pattern',
      penalty: ENTROPY_PENALTIES.YEAR_OR_DATE,
      description: 'Contains a 4-digit calendar year (e.g. 1998, 2024).',
    });
  }

  // 6. REVERSED COMMON WORDS (e.g. "drowssap")
  if (lower.includes('drowssap') || lower.includes('nimda') || lower.includes('ytrewq')) {
    findings.push({
      id: 'reversed_common',
      label: 'Reversed Common Word',
      penalty: ENTROPY_PENALTIES.REVERSED_COMMON,
      description: 'Contains a reversed dictionary word.',
    });
  }

  // 7. USERNAME OR "WYNTRIX" CONTAINED IN PASSWORD
  const username = ctx?.username?.trim().toLowerCase();
  if (username && username.length >= 3 && lower.includes(username)) {
    findings.push({
      id: 'username_included',
      label: 'Contains Username',
      penalty: ENTROPY_PENALTIES.USERNAME_INCLUDED,
      description: 'Your password contains your username, making it trivial to guess.',
    });
  } else if (lower.includes('wyntrix')) {
    findings.push({
      id: 'username_included',
      label: 'Contains Brand Name ("wyntrix")',
      penalty: ENTROPY_PENALTIES.USERNAME_INCLUDED,
      description: 'Contains the company or portal name.',
    });
  }

  return findings;
}
