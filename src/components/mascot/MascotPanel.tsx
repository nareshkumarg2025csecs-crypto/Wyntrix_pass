'use client';

import React, { useState, useEffect } from 'react';
import { WyntrixLogo } from '@/components/ui/WyntrixLogo';
import { SpeechBubble } from '@/components/mascot/SpeechBubble';
import { PixelScene } from '@/components/mascot/PixelScene';
import { ByteMascot } from '@/components/mascot/ByteMascot';
import { MascotState } from '@/components/mascot/types';

interface MascotPanelProps {
  speech?: string;
  statusChip?: string;
  quote?: string;
  tier?: number | null;
  mascotState?: MascotState;
  children?: React.ReactNode;
}

// Default security awareness quotes per tier
const TIER_QUOTES: Record<number, string[]> = {
  0: [
    'Even my chew toy cracks this!',
    'Hackers say thanks for the free pass...',
    'Sooo weak... I could guess that asleep!',
    "Yikes! That's a snack for bots.",
  ],
  1: [
    'Try better, mix it up!',
    'Getting there. Add some spice!',
    'Longer is stronger. Keep typing!',
    'Almost a lock, but not quite.',
  ],
  2: [
    'Good! Now push it a little more.',
    'Solid start. A few more characters?',
    'Decent! Hackers are mildly annoyed.',
  ],
  3: [
    "WOW! That's tough to crack!",
    'Hackers hate this one!',
    'Wow wow wow! Tail wagging!',
  ],
  4: [
    'STRONGEST! Fort Knox called.',
    'Legendary! The bots are crying.',
    'Unbreakable vibes. Treat for you!',
  ],
};

const GENERAL_QUOTES = [
  'A strong password is your first line of defense.',
  'Passphrases beat complex short words every time.',
  'Never reuse passwords across multiple sites!',
  'Multi-factor authentication gives Byte extra armor.',
  'Byte is always standing guard over your secrets.',
];

export function MascotPanel({
  speech = 'Welcome to Wyntrix! Ready to secure your world?',
  statusChip = 'Byte is on security patrol',
  quote,
  tier = null,
  mascotState = 'IDLE',
  children,
}: MascotPanelProps) {
  const [currentQuote, setCurrentQuote] = useState(quote || GENERAL_QUOTES[0]);

  useEffect(() => {
    if (quote) {
      setCurrentQuote(quote);
      return;
    }

    if (tier !== null && TIER_QUOTES[tier]) {
      const quotes = TIER_QUOTES[tier];
      const randomIdx = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIdx]);
    } else {
      const randomIdx = Math.floor(Math.random() * GENERAL_QUOTES.length);
      setCurrentQuote(GENERAL_QUOTES[randomIdx]);
    }
  }, [tier, quote]);

  return (
    <aside
      className="w-full md:w-[32%] md:min-w-[360px] md:max-w-[420px] bg-garden-panel dark:bg-terminal-panel border-b-2 md:border-b-0 md:border-r-2 border-garden-ink dark:border-terminal-border flex flex-col justify-between p-4 sm:p-6 select-none flex-shrink-0 transition-colors"
      aria-label="Wyntrix Mascot Panel"
    >
      {/* Top Header: Logo + Tagline */}
      <div className="flex flex-col items-center md:items-start space-y-1 mb-3">
        <WyntrixLogo size={36} showText={true} />
        <p className="font-mono text-[11px] text-garden-deep-green dark:text-terminal-mint font-semibold tracking-wide">
          Secure today, safer tomorrow.
        </p>
      </div>

      {/* Center Section: Speech Bubble + Pet on Hill */}
      <div className="flex flex-col items-center justify-center my-auto space-y-3 w-full py-2">
        {/* Pixel Speech Bubble */}
        <SpeechBubble message={speech} />

        {/* Pixel Grass / Hill Scene */}
        <PixelScene>
          {children || <ByteMascot state={mascotState} pixelScale={4} />}
        </PixelScene>

        {/* Status Chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border shadow-pixel-sm">
          <span className="w-2 h-2 rounded-none bg-garden-green dark:bg-terminal-mint animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-garden-ink dark:text-terminal-ink uppercase tracking-wider">
            {statusChip}
          </span>
        </div>
      </div>

      {/* Bottom Section: Rotating Security Quote Card */}
      <div className="mt-4 pt-3 border-t-2 border-garden-ink/20 dark:border-terminal-border/20">
        <div className="bg-garden-cream/60 dark:bg-terminal-bg/60 border border-garden-ink/30 dark:border-terminal-border/30 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-pixel text-xs text-garden-orange dark:text-terminal-orange">
              ★ BYTE&apos;S TIP:
            </span>
          </div>
          <p className="font-mono text-[11px] italic text-garden-ink/80 dark:text-terminal-ink/80 leading-normal">
            &ldquo;{currentQuote}&rdquo;
          </p>
        </div>
      </div>
    </aside>
  );
}
