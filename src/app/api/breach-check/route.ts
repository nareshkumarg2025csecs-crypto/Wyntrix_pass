import { NextRequest, NextResponse } from 'next/server';

/**
 * Have I Been Pwned k-Anonymity API Proxy
 * Only receives the 5-character SHA-1 hash prefix.
 * The raw password and full hash NEVER leave the user's browser.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prefix = String(body.prefix || '').trim().toUpperCase();

    // Verify prefix is valid 5-character hexadecimal string
    if (!/^[0-9A-F]{5}$/.test(prefix)) {
      return NextResponse.json(
        { error: 'Prefix must be exactly 5 hexadecimal characters' },
        { status: 400 }
      );
    }

    // Call Have I Been Pwned Range API with Add-Padding to mitigate response size analysis
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'Add-Padding': 'true',
        'User-Agent': 'Wyntrix-Pixel-Guard-Internship-Portal',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: 'HIBP service unreachable', available: false },
        { status: 502 }
      );
    }

    const text = await res.text();
    return NextResponse.json({
      success: true,
      data: text,
    });
  } catch {
    // Fail open if offline or timeout
    return NextResponse.json(
      { error: 'Breach check service unavailable', available: false },
      { status: 503 }
    );
  }
}
