// Crack Time Estimator
// Compares online throttled rate (100/hr) vs offline GPU cluster rate (10 billion/sec)

import { CRACK_SPEEDS } from './constants';
import { CrackTimeScenario } from './types';

export function formatDuration(seconds: number): string {
  if (seconds <= 0.05) return 'Instant';
  if (seconds < 1) return '< 1 second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;

  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} days`;

  const years = days / 365.25;
  if (years < 100) return `${Math.round(years)} years`;
  if (years < 10000) return `${Math.round(years).toLocaleString()} years`;
  if (years < 1_000_000) return 'Centuries';
  return 'Eons';
}

export function estimateCrackTime(effectiveEntropy: number): CrackTimeScenario {
  // If effective entropy is 0 or less, cracking is immediate
  if (effectiveEntropy <= 0) {
    return {
      onlineThrottled: 'Instant',
      offlineFastHash: 'Instant',
      onlineSeconds: 0,
      offlineSeconds: 0,
    };
  }

  // Average guesses needed to crack is 2^(entropy - 1)
  // Clamp exponent to prevent Infinity in JS numbers
  const clampedEntropy = Math.min(effectiveEntropy, 120);
  const guesses = Math.pow(2, clampedEntropy - 1);

  const onlineSeconds = guesses / CRACK_SPEEDS.ONLINE_GUESSES_PER_SEC;
  const offlineSeconds = guesses / CRACK_SPEEDS.OFFLINE_FAST_HASH_PER_SEC;

  return {
    onlineThrottled: formatDuration(onlineSeconds),
    offlineFastHash: formatDuration(offlineSeconds),
    onlineSeconds,
    offlineSeconds,
  };
}
