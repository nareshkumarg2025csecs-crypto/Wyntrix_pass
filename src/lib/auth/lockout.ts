// Exponential Lockout Policy
// Prevents brute-force attacks by introducing progressive exponential delays

export function calculateLockoutDuration(failedAttempts: number): number {
  if (failedAttempts < 3) return 0;
  // Fail 3: 30s, Fail 4: 60s, Fail 5: 120s, Fail 6: 240s...
  const exponent = failedAttempts - 3;
  const seconds = 30 * Math.pow(2, exponent);
  return Math.min(seconds, 3600); // Max 1 hour lock
}

export function checkLockoutStatus(
  failedAttempts: number,
  lockedUntil: Date | null
): { isLocked: boolean; remainingSeconds: number } {
  if (!lockedUntil) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  const lockTime = new Date(lockedUntil).getTime();

  if (lockTime > now) {
    const remainingSeconds = Math.ceil((lockTime - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  return { isLocked: false, remainingSeconds: 0 };
}
