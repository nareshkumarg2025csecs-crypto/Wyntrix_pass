// In-Memory Per-IP Rate Limiter for Authentication Endpoints
// Sliding window limit: 20 requests per 60 seconds per IP address

interface RateLimitRecord {
  timestamps: number[];
}

const ipRecords = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 20;

export function rateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const cleanIp = ip.trim() || '127.0.0.1';

  let record = ipRecords.get(cleanIp);
  if (!record) {
    record = { timestamps: [] };
    ipRecords.set(cleanIp, record);
  }

  // Filter timestamps within current 60s window
  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldestTimestamp = record.timestamps[0];
    const resetInSeconds = Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  // Record this request
  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.timestamps.length,
    resetInSeconds: 60,
  };
}
