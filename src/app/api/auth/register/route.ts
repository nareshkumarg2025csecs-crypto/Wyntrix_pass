import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/hash';
import { rateLimit } from '@/lib/auth/rateLimit';
import { analyze } from '@/lib/analyzer';

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP-based rate limiting (20 req / min)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = rateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${limit.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    // 2. Validate input schema with Zod
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const normalizedUsername = parsed.data.username.trim().toLowerCase();
    const rawPassword = parsed.data.password;

    // 3. Server-side authoritative security analysis
    const analysis = analyze(rawPassword, { username: normalizedUsername });

    // Reject weak passwords (policy requires Tier >= 2 and not common)
    if (analysis.tier < 2) {
      return NextResponse.json(
        {
          error:
            'Password does not meet the minimum security threshold (Tier 2: GOOD required). ' +
            (analysis.recommendations[0] || 'Please create a stronger password.'),
        },
        { status: 400 }
      );
    }

    if (analysis.isCommon) {
      return NextResponse.json(
        { error: 'This password appears in common breach lists and cannot be used.' },
        { status: 400 }
      );
    }

    // 4. Check if username is already taken
    const existing = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username is already taken. Please choose another.' },
        { status: 409 }
      );
    }

    // 5. Hash password with Argon2id
    const passwordHash = await hashPassword(rawPassword);

    // 6. Create user in database
    const newUser = await prisma.user.create({
      data: {
        username: normalizedUsername,
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully! You may now login.',
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
