// Password Security Recommendations Generator
// Generates friendly, high-impact fix suggestions ordered by entropy gain

import { AnalysisCheck, AnalysisFinding } from './types';

interface RecommendationCandidate {
  message: string;
  impactWeight: number; // Higher number = higher priority
}

export function generateRecommendations(
  checks: AnalysisCheck[],
  findings: AnalysisFinding[],
  isCommon: boolean,
  length: number
): string[] {
  const candidates: RecommendationCandidate[] = [];

  // Common password fix
  if (isCommon) {
    candidates.push({
      message: 'Choose an original passphrase; this password appears in common breach lists.',
      impactWeight: 100,
    });
  }

  // Length fixes
  if (length < 8) {
    const diff = 8 - length;
    candidates.push({
      message: `Add at least ${diff} more character${diff > 1 ? 's' : ''} to meet the 8-character baseline.`,
      impactWeight: 90,
    });
  } else if (length < 12) {
    const diff = 12 - length;
    candidates.push({
      message: `Add ${diff} more character${diff > 1 ? 's' : ''} to reach the 12-character recommended standard.`,
      impactWeight: 75,
    });
  }

  // Missing character classes
  checks.forEach((chk) => {
    if (!chk.passed) {
      if (chk.id === 'has_upper') {
        candidates.push({
          message: 'Include at least one UPPERCASE letter (A-Z).',
          impactWeight: 60,
        });
      }
      if (chk.id === 'has_digit') {
        candidates.push({
          message: 'Include at least one number (0-9).',
          impactWeight: 55,
        });
      }
      if (chk.id === 'has_symbol') {
        candidates.push({
          message: 'Add special symbols (!@#$%) or spaces to expand your character pool.',
          impactWeight: 50,
        });
      }
    }
  });

  // Pattern fixes
  findings.forEach((f) => {
    if (f.id === 'keyboard_walk') {
      candidates.push({
        message: 'Avoid keyboard walks like "qwerty" or "asdf"; crackers test keyboard layouts first.',
        impactWeight: 70,
      });
    }
    if (f.id === 'sequences') {
      candidates.push({
        message: 'Replace sequential series like "1234" or "abcd" with random characters.',
        impactWeight: 65,
      });
    }
    if (f.id === 'repeated_chars' || f.id === 'repeated_chunks') {
      candidates.push({
        message: 'Eliminate repeated characters or syllables (e.g. "aaa", "passpass").',
        impactWeight: 60,
      });
    }
    if (f.id === 'year_date') {
      candidates.push({
        message: 'Avoid birth years or calendar dates (e.g. 1999, 2024).',
        impactWeight: 55,
      });
    }
    if (f.id === 'username_included') {
      candidates.push({
        message: 'Remove your username or company name from the password.',
        impactWeight: 85,
      });
    }
  });

  // If already strong, suggest passphrase best practice
  if (candidates.length === 0) {
    candidates.push({
      message: 'Great password! Consider using a 4-word passphrase for maximum memorability.',
      impactWeight: 10,
    });
  }

  // Sort by impact weight descending
  candidates.sort((a, b) => b.impactWeight - a.impactWeight);

  // Return unique messages
  const seen = new Set<string>();
  const results: string[] = [];
  for (const c of candidates) {
    if (!seen.has(c.message)) {
      seen.add(c.message);
      results.push(c.message);
    }
  }

  return results;
}
