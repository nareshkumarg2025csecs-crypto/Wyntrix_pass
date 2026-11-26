import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const u = searchParams.get('u');

  if (!u || u.trim().length < 3) {
    return NextResponse.json({ available: false, reason: 'Too short' }, { status: 400 });
  }

  const normalized = u.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: normalized },
    select: { id: true },
  });

  return NextResponse.json({
    available: !user,
    username: normalized,
  });
}
