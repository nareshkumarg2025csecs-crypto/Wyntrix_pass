// Client-side k-Anonymity SHA-1 Breach Checker
// Raw password and full hash NEVER leave the browser!

export async function checkPasswordBreach(password: string): Promise<{
  isBreached: boolean;
  breachCount: number;
  available: boolean;
}> {
  if (!password || password.length === 0 || typeof window === 'undefined') {
    return { isBreached: false, breachCount: 0, available: true };
  }

  try {
    // 1. Compute SHA-1 hash locally using standard Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);

    // Convert hash buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fullHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // 2. Extract first 5 characters as k-anonymity prefix
    const prefix = fullHash.slice(0, 5);
    const suffix = fullHash.slice(5);

    // 3. Query our secure proxy API
    const response = await fetch('/api/breach-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix }),
    });

    if (!response.ok) {
      return { isBreached: false, breachCount: 0, available: false };
    }

    const json = await response.json();
    if (!json.success || !json.data) {
      return { isBreached: false, breachCount: 0, available: false };
    }

    // 4. Search returned suffixes locally
    const lines: string[] = json.data.split('\n');
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
        const count = parseInt(countStr || '0', 10);
        return { isBreached: true, breachCount: count, available: true };
      }
    }

    return { isBreached: false, breachCount: 0, available: true };
  } catch {
    // Fail open if offline or browser lacks crypto.subtle
    return { isBreached: false, breachCount: 0, available: false };
  }
}
