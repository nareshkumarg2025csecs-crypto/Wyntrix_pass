import { describe, it, expect } from 'vitest';
import { analyze } from '../src/lib/analyzer';
import { unleet, stripTrailingGarbage, isCommonPassword } from '../src/lib/analyzer/common';
import { detectPatterns } from '../src/lib/analyzer/patterns';
import { checkComplexity } from '../src/lib/analyzer/complexity';
import { calculateEntropy } from '../src/lib/analyzer/entropy';
import { formatDuration } from '../src/lib/analyzer/crackTime';

describe('Password Analyzer Engine Unit Tests', () => {
  // -------------------------------------------------------------
  // Group 1: Empty & Short Passwords
  // -------------------------------------------------------------
  it('1. Handles empty string gracefully', () => {
    const res = analyze('');
    expect(res.score).toBe(0);
    expect(res.tier).toBe(0);
    expect(res.tierLabel).toBe('SOOO WEAK');
    expect(res.entropyBits.raw).toBe(0);
    expect(res.entropyBits.effective).toBe(0);
    expect(res.crackTime.onlineThrottled).toBe('Instant');
  });

  it('2. Evaluates 1-character password as Tier 0', () => {
    const res = analyze('a');
    expect(res.tier).toBe(0);
    expect(res.score).toBeLessThanOrEqual(15);
  });

  it('3. Evaluates 4-character password as Tier 0 or 1', () => {
    const res = analyze('Ab1!');
    expect(res.tier).toBeLessThanOrEqual(1);
  });

  it('4. Hard Cap: Passwords shorter than 8 chars never exceed Tier 1', () => {
    // Even if it has all 4 character classes
    const res = analyze('A1#b7!');
    expect(res.tier).toBeLessThanOrEqual(1);
    expect(res.score).toBeLessThanOrEqual(30);
  });

  // -------------------------------------------------------------
  // Group 2: Common Passwords & SecLists Lookup
  // -------------------------------------------------------------
  it('5. Identifies "password" as common breached password', () => {
    const { isCommon } = isCommonPassword('password');
    expect(isCommon).toBe(true);
  });

  it('6. Identifies "123456" as common breached password', () => {
    const { isCommon } = isCommonPassword('123456');
    expect(isCommon).toBe(true);
  });

  it('7. Identifies "admin" as common breached password', () => {
    const { isCommon } = isCommonPassword('admin');
    expect(isCommon).toBe(true);
  });

  it('8. Hard Cap: Common password is forced to Tier 0', () => {
    const res = analyze('password');
    expect(res.isCommon).toBe(true);
    expect(res.tier).toBe(0);
    expect(res.tierLabel).toBe('SOOO WEAK');
    expect(res.score).toBeLessThanOrEqual(15);
  });

  it('9. Common password with trailing digits is identified', () => {
    const { isCommon } = isCommonPassword('password123');
    expect(isCommon).toBe(true);
  });

  it('10. Common password with trailing exclamation is identified', () => {
    const { isCommon } = isCommonPassword('welcome1!');
    expect(isCommon).toBe(true);
  });

  // -------------------------------------------------------------
  // Group 3: Leetspeak Normalization
  // -------------------------------------------------------------
  it('11. unleet() converts "@" and "4" to "a"', () => {
    expect(unleet('p@ssw0rd')).toBe('password');
    expect(unleet('h4cker')).toBe('hacker');
  });

  it('12. unleet() converts "0" to "o" and "3" to "e"', () => {
    expect(unleet('s3cr3t')).toBe('secret');
    expect(unleet('c00k1e')).toBe('cookie');
  });

  it('13. unleet() converts "$" and "5" to "s"', () => {
    expect(unleet('P@$$w0rd')).toBe('password');
    expect(unleet('5un5hine')).toBe('sunshine');
  });

  it('14. Identifies leetspeak common password "P@ssw0rd123!" as common', () => {
    const { isCommon } = isCommonPassword('P@ssw0rd123!');
    expect(isCommon).toBe(true);
  });

  it('15. stripTrailingGarbage removes numbers and symbols from end', () => {
    expect(stripTrailingGarbage('dragon12345!')).toBe('dragon');
    expect(stripTrailingGarbage('football99')).toBe('football');
  });

  // -------------------------------------------------------------
  // Group 4: Pattern Detection
  // -------------------------------------------------------------
  it('16. Detects repeated characters ("aaaa", "1111")', () => {
    const findings = detectPatterns('Superaaaa123!');
    expect(findings.some((f) => f.id === 'repeated_chars')).toBe(true);
  });

  it('17. Detects repeated chunks ("abcabc", "passpass")', () => {
    const findings = detectPatterns('coolabcabc123');
    expect(findings.some((f) => f.id === 'repeated_chunks')).toBe(true);
  });

  it('18. Detects ascending alphabetical sequences ("abcd")', () => {
    const findings = detectPatterns('myabcdsecret');
    expect(findings.some((f) => f.id === 'sequences')).toBe(true);
  });

  it('19. Detects ascending numeric sequences ("1234")', () => {
    const findings = detectPatterns('secure1234key');
    expect(findings.some((f) => f.id === 'sequences')).toBe(true);
  });

  it('20. Detects descending sequences ("4321", "dcba")', () => {
    const findings = detectPatterns('vault4321lock');
    expect(findings.some((f) => f.id === 'sequences')).toBe(true);
  });

  it('21. Detects QWERTY row keyboard walks ("qwerty")', () => {
    const findings = detectPatterns('Superqwerty!99');
    expect(findings.some((f) => f.id === 'keyboard_walk')).toBe(true);
  });

  it('22. Detects middle row keyboard walk ("asdfgh")', () => {
    const findings = detectPatterns('Keyasdfgh123');
    expect(findings.some((f) => f.id === 'keyboard_walk')).toBe(true);
  });

  it('23. Detects bottom row keyboard walk ("zxcvbn")', () => {
    const findings = detectPatterns('Lockzxcvb88');
    expect(findings.some((f) => f.id === 'keyboard_walk')).toBe(true);
  });

  it('24. Detects diagonal keyboard walks ("1qaz2wsx")', () => {
    const findings = detectPatterns('Pass1qaz2wsx!');
    expect(findings.some((f) => f.id === 'keyboard_walk')).toBe(true);
  });

  it('25. Detects 4-digit calendar years ("1998", "2024")', () => {
    const findings = detectPatterns('Summer1998!');
    expect(findings.some((f) => f.id === 'year_date')).toBe(true);
  });

  it('26. Detects reversed common words ("drowssap")', () => {
    const findings = detectPatterns('drowssap123');
    expect(findings.some((f) => f.id === 'reversed_common')).toBe(true);
  });

  // -------------------------------------------------------------
  // Group 5: Username & Brand Inclusion
  // -------------------------------------------------------------
  it('27. Detects username contained in password', () => {
    const findings = detectPatterns('johnny_rocks123', { username: 'johnny' });
    expect(findings.some((f) => f.id === 'username_included')).toBe(true);
  });

  it('28. Hard Cap: Password containing username capped at Tier 1', () => {
    const res = analyze('alice_secret_password_2026!', { username: 'alice' });
    expect(res.tier).toBeLessThanOrEqual(1);
    expect(res.score).toBeLessThanOrEqual(35);
  });

  it('29. Detects "wyntrix" brand name in password', () => {
    const findings = detectPatterns('ILoveWyntrixSecurity');
    expect(findings.some((f) => f.id === 'username_included')).toBe(true);
  });

  // -------------------------------------------------------------
  // Group 6: Complexity Policy & Character Pool
  // -------------------------------------------------------------
  it('30. Identifies missing lowercase letters', () => {
    const { checks } = checkComplexity('STRONG12345!@#');
    const lowerCheck = checks.find((c) => c.id === 'has_lower');
    expect(lowerCheck?.passed).toBe(false);
  });

  it('31. Identifies missing uppercase letters', () => {
    const { checks } = checkComplexity('strong12345!@#');
    const upperCheck = checks.find((c) => c.id === 'has_upper');
    expect(upperCheck?.passed).toBe(false);
  });

  it('32. Identifies missing numbers', () => {
    const { checks } = checkComplexity('StrongPassword!@#');
    const digitCheck = checks.find((c) => c.id === 'has_digit');
    expect(digitCheck?.passed).toBe(false);
  });

  it('33. Identifies missing symbols', () => {
    const { checks } = checkComplexity('StrongPassword123');
    const symbolCheck = checks.find((c) => c.id === 'has_symbol');
    expect(symbolCheck?.passed).toBe(false);
  });

  it('34. Calculates correct character pool size for alphanumeric', () => {
    const { poolSize } = calculateEntropy('abcABC123');
    expect(poolSize).toBe(26 + 26 + 10); // 62
  });

  it('35. Adds spaces to character pool for passphrases', () => {
    const { poolSize } = calculateEntropy('apple banana orange');
    expect(poolSize).toBe(26 + 1); // 27
  });

  // -------------------------------------------------------------
  // Group 7: Passphrases, Strong Passwords & Unicode
  // -------------------------------------------------------------
  it('36. Multi-word passphrase scores as Tier 3 or Tier 4', () => {
    const res = analyze('correct horse battery staple');
    expect(res.tier).toBeGreaterThanOrEqual(3);
    expect(res.score).toBeGreaterThanOrEqual(65);
    expect(res.entropyBits.effective).toBeGreaterThan(45);
  });

  it('37. Strong random password reaches Tier 4 (STRONGEST)', () => {
    const res = analyze('X8#mK9!vL2$pZ7@wQ1');
    expect(res.tier).toBe(4);
    expect(res.tierLabel).toBe('STRONGEST');
    expect(res.score).toBeGreaterThanOrEqual(85);
  });

  it('38. Passwords with Unicode / Emojis expand pool', () => {
    const res = analyze('SuperShield🛡️2026!🚀');
    expect(res.tier).toBeGreaterThanOrEqual(3);
    expect(res.checks.find((c) => c.id === 'length_recommended')?.passed).toBe(true);
  });

  it('39. Very long password (40+ chars) achieves maximum score', () => {
    const res = analyze('TheQuickBrownFoxJumpsOverTheLazyDogAndByteWatchesOverAll2026!');
    expect(res.score).toBe(100);
    expect(res.tier).toBe(4);
  });

  // -------------------------------------------------------------
  // Group 8: Crack Time, Formatting & Breached Cap
  // -------------------------------------------------------------
  it('40. Formats crack times correctly', () => {
    expect(formatDuration(0)).toBe('Instant');
    expect(formatDuration(30)).toBe('30 seconds');
    expect(formatDuration(3600)).toBe('1 hours');
    expect(formatDuration(86400 * 5)).toBe('5 days');
    expect(formatDuration(31536000 * 20)).toBe('20 years');
  });

  it('41. Crack time shows centuries/eons for strong passwords', () => {
    const res = analyze('N4#xT9!vL2$pZ7@wQ8%bC3^');
    const isUltraLong = ['Centuries', 'Eons', 'years'].some((unit) =>
      res.crackTime.offlineFastHash.includes(unit) || res.crackTime.onlineThrottled.includes(unit)
    );
    expect(isUltraLong).toBe(true);
  });

  it('42. Hard Cap: isBreached flag forces Tier 0 regardless of complexity', () => {
    const res = analyze('StrongPassword123!@#', { isBreached: true });
    expect(res.tier).toBe(0);
    expect(res.score).toBeLessThanOrEqual(10);
  });

  // -------------------------------------------------------------
  // Group 9: Recommendations & Tips
  // -------------------------------------------------------------
  it('43. Generates recommendations for short password', () => {
    const res = analyze('short');
    expect(res.recommendations.some((r) => r.includes('Add at least 3 more character'))).toBe(true);
  });

  it('44. Returns awareness tips matching weaknesses', () => {
    const res = analyze('password123');
    expect(res.tips.length).toBeGreaterThanOrEqual(3);
  });

  it('45. Effective entropy is never negative even with multiple penalties', () => {
    const res = analyze('aaaa1234');
    expect(res.entropyBits.effective).toBeGreaterThanOrEqual(0);
  });
});
