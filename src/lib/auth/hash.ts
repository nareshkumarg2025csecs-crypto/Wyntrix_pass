// Password Hashing Module: Argon2id with bcrypt fallback
// Hardened against side-channel timing attacks using dummy hash verification

import * as argon2 from '@node-rs/argon2';
import bcrypt from 'bcryptjs';

// Precomputed valid hash used to equalize response timing when a non-existent username is entered
let DUMMY_HASH = '$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXlzYWx0MTIzNDU2Nw$4B7m2hY8PqX7iE8xJ9yZ0w';

/**
 * Hashes a plaintext password using Argon2id (OWASP recommended standard)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      algorithm: 2, // 2 = Argon2id (OWASP recommended standard)
      memoryCost: 19456, // 19 MiB
      timeCost: 2,       // 2 iterations
      outputLen: 32,
      parallelism: 1,
    });
  } catch {
    // Graceful fallback to bcryptjs with salt rounds 12
    return bcrypt.hash(password, 12);
  }
}

/**
 * Verifies a plaintext password against a stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('$argon2')) {
      return await argon2.verify(hash, password);
    }
    // Bcrypt hash verification
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/**
 * Runs a dummy verification against an invalid hash to equalize CPU timing
 * Prevents attackers from measuring response time to determine if a username exists
 */
export async function timingEqualizer(password: string): Promise<void> {
  try {
    await argon2.verify(DUMMY_HASH, password);
  } catch {
    // Expected to fail silently
  }
}
