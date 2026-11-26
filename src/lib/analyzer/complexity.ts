// Password Complexity Policy Verification
// Checks compliance with NIST SP 800-63B and OWASP guidelines

import { AnalysisCheck } from './types';
import { LENGTH_POLICY } from './constants';

export function checkComplexity(password: string): {
  checks: AnalysisCheck[];
  classesCount: number;
} {
  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  // Match symbols including ASCII punctuation and unicode symbols
  const hasSymbol = /[^a-zA-Z0-9\s]/.test(password);
  const hasSpace = /\s/.test(password);

  let classesCount = 0;
  if (hasLower) classesCount++;
  if (hasUpper) classesCount++;
  if (hasDigit) classesCount++;
  if (hasSymbol || hasSpace) classesCount++;

  const checks: AnalysisCheck[] = [
    {
      id: 'length_min',
      label: `At least ${LENGTH_POLICY.MIN_LENGTH} characters`,
      passed: len >= LENGTH_POLICY.MIN_LENGTH,
      severity: 'critical',
      detail: len < LENGTH_POLICY.MIN_LENGTH ? `Current length: ${len}` : undefined,
    },
    {
      id: 'length_recommended',
      label: `At least ${LENGTH_POLICY.RECOMMENDED} characters (recommended)`,
      passed: len >= LENGTH_POLICY.RECOMMENDED,
      severity: 'warning',
      detail: len < LENGTH_POLICY.RECOMMENDED ? `Current length: ${len}` : undefined,
    },
    {
      id: 'length_max',
      label: `Under ${LENGTH_POLICY.MAX_LENGTH} characters`,
      passed: len <= LENGTH_POLICY.MAX_LENGTH,
      severity: 'critical',
    },
    {
      id: 'has_lower',
      label: 'Contains lowercase letters (a-z)',
      passed: hasLower,
      severity: 'warning',
    },
    {
      id: 'has_upper',
      label: 'Contains uppercase letters (A-Z)',
      passed: hasUpper,
      severity: 'warning',
    },
    {
      id: 'has_digit',
      label: 'Contains numbers (0-9)',
      passed: hasDigit,
      severity: 'warning',
    },
    {
      id: 'has_symbol',
      label: 'Contains symbols or spaces (!@#$ or space)',
      passed: hasSymbol || hasSpace,
      severity: 'warning',
    },
  ];

  return { checks, classesCount };
}
