// Shannon Entropy Calculator
// Formula: Entropy = L * log2(R), where L = length and R = character pool size

import { POOL_SIZES } from './constants';

export function calculateEntropy(password: string): {
  poolSize: number;
  rawEntropy: number;
} {
  if (!password || password.length === 0) {
    return { poolSize: 0, rawEntropy: 0 };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += POOL_SIZES.LOWERCASE;
  if (/[A-Z]/.test(password)) poolSize += POOL_SIZES.UPPERCASE;
  if (/[0-9]/.test(password)) poolSize += POOL_SIZES.DIGITS;
  if (/[^a-zA-Z0-9\s]/.test(password)) poolSize += POOL_SIZES.SYMBOLS;
  if (/\s/.test(password)) poolSize += POOL_SIZES.SPACE;
  // Unicode characters
  if (/[\u0080-\uFFFF]/.test(password)) poolSize += POOL_SIZES.UNICODE;

  if (poolSize === 0) poolSize = 1;

  const rawEntropy = password.length * Math.log2(poolSize);
  return {
    poolSize,
    rawEntropy: Math.round(rawEntropy * 10) / 10,
  };
}
