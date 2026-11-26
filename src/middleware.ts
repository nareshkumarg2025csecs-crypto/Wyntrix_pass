import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'wyntrix-pixel-guard-jwt-super-secret-key-2026-min-32-chars!'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('wyntrix_session')?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.userId) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Protected route: /lab requires active authentication
  if (pathname.startsWith('/lab')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Auth routes: redirect already-logged-in users from /login or /register to /lab
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/lab', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lab/:path*', '/login', '/register'],
};
