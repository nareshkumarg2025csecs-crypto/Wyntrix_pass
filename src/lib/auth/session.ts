// Signed JWT Session Management using 'jose'
// Stored in HttpOnly, SameSite=Lax cookie

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'wyntrix-pixel-guard-jwt-super-secret-key-2026-min-32-chars!'
);

export const COOKIE_NAME = 'wyntrix_session';

export interface SessionPayload {
  userId: string;
  username: string;
}

/**
 * Creates a signed JWT and sets the HTTP-only cookie
 */
export async function createSession(
  payload: SessionPayload,
  rememberMe: boolean = false
): Promise<string> {
  // 7 days if rememberMe, otherwise 24 hours
  const expirationSeconds = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

  const jwt = await new SignJWT({
    userId: payload.userId,
    username: payload.username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expirationSeconds}s`)
    .sign(JWT_SECRET);

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expirationSeconds,
  });

  return jwt;
}

/**
 * Verifies the JWT session from cookie or header
 */
export async function verifySession(token?: string): Promise<SessionPayload | null> {
  try {
    const jwtToken = token || cookies().get(COOKIE_NAME)?.value;
    if (!jwtToken) return null;

    const { payload } = await jwtVerify(jwtToken, JWT_SECRET);
    if (!payload.userId || !payload.username) return null;

    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

/**
 * Clears the session cookie on logout
 */
export function destroySession(): void {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
