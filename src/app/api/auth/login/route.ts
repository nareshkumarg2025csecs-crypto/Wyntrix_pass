import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyPassword, timingEqualizer } from '@/lib/auth/hash';
import { createSession } from '@/lib/auth/session';
import { rateLimit } from '@/lib/auth/rateLimit';
import { calculateLockoutDuration, checkLockoutStatus } from '@/lib/auth/lockout';

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP rate limiting (20 req / min)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = rateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${limit.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const normalizedUsername = parsed.data.username.trim().toLowerCase();
    const rawPassword = parsed.data.password;
    const rememberMe = !!parsed.data.remember;

    // 2. Query user from database
    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    // 3. User NOT found: perform timing equalisation to prevent timing enumeration
    if (!user) {
      await timingEqualizer(rawPassword);
      return NextResponse.json(
        {
          error: 'Invalid username or password',
          failedAttempts: 1,
          isLocked: false,
          remainingSeconds: 0,
        },
        { status: 401 }
      );
    }

    // 4. Check if account is currently locked out
    const lockout = checkLockoutStatus(user.failedAttempts, user.lockedUntil);
    if (lockout.isLocked) {
      return NextResponse.json(
        {
          error: `Account is temporarily locked. Please wait ${lockout.remainingSeconds} seconds.`,
          isLocked: true,
          remainingSeconds: lockout.remainingSeconds,
          failedAttempts: user.failedAttempts,
        },
        { status: 423 } // 423 Locked
      );
    }

    // 5. Verify password hash
    const isValid = await verifyPassword(rawPassword, user.passwordHash);

    if (!isValid) {
      // Increment failed attempts
      const nextFailures = user.failedAttempts + 1;
      let newLockedUntil: Date | null = null;
      let remainingSeconds = 0;

      if (nextFailures >= 3) {
        const lockoutSeconds = calculateLockoutDuration(nextFailures);
        newLockedUntil = new Date(Date.now() + lockoutSeconds * 1000);
        remainingSeconds = lockoutSeconds;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: nextFailures,
          lockedUntil: newLockedUntil,
        },
      });

      return NextResponse.json(
        {
          error: 'Invalid username or password',
          failedAttempts: nextFailures,
          isLocked: nextFailures >= 3,
          remainingSeconds,
        },
        { status: 401 }
      );
    }

    // 6. Success: Reset failed attempts & set lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // 7. Create signed JWT session cookie
    await createSession(
      {
        userId: user.id,
        username: user.username,
      },
      rememberMe
    );

    return NextResponse.json({
      success: true,
      username: user.username,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
