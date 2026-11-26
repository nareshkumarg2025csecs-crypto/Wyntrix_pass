'use client';

import React from 'react';

/**
 * Pixel Hill Scene with drifting clouds and grass tufts
 * Wraps Byte the Shiba pup mascot in an authentic 8-bit environment
 * Sized to hero-scale (up to ~400px) for the 96x96 pixel engine.
 */
export function PixelScene({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full aspect-square max-w-[360px] sm:max-w-[390px] mx-auto overflow-hidden border-2 border-garden-ink dark:border-terminal-border shadow-pixel-sm bg-[#E9F3EB] dark:bg-[#121E19] select-none">
      {/* Drifting Pixel Clouds in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Cloud 1 (slow drift) */}
        <div className="absolute top-4 left-0 animate-cloud-drift-slow opacity-80">
          <svg width="56" height="18" viewBox="0 0 24 8" shapeRendering="crispEdges" fill="white">
            <rect x="4" y="2" width="16" height="4" />
            <rect x="8" y="0" width="8" height="2" />
            <rect x="2" y="4" width="20" height="3" />
          </svg>
        </div>

        {/* Cloud 2 (medium drift) */}
        <div
          className="absolute top-12 left-0 animate-cloud-drift-fast opacity-65"
          style={{ animationDelay: '-12s' }}
        >
          <svg width="42" height="14" viewBox="0 0 24 8" shapeRendering="crispEdges" fill="white">
            <rect x="6" y="2" width="12" height="4" />
            <rect x="9" y="0" width="6" height="2" />
            <rect x="4" y="4" width="16" height="3" />
          </svg>
        </div>
      </div>

      {/* Background Distant Hill */}
      <div
        className="absolute bottom-10 left-0 right-0 h-24 bg-[#88B896] dark:bg-[#254234] border-t-2 border-garden-ink/40 dark:border-terminal-border/40 pointer-events-none"
        style={{
          clipPath: 'polygon(0% 40%, 30% 15%, 70% 30%, 100% 10%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Foreground Rolling Pixel Grass Hill */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-garden-green dark:bg-terminal-deep-mint border-t-2 border-garden-ink dark:border-terminal-border pointer-events-none"
        style={{
          clipPath: 'polygon(0% 25%, 35% 10%, 65% 20%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        {/* Decorative Pixel Grass Tufts & Little Flowers */}
        <div className="absolute bottom-2 left-6 w-2 h-3.5 bg-garden-deep-green dark:bg-terminal-mint" />
        <div className="absolute bottom-3 left-9 w-1.5 h-2.5 bg-garden-deep-green dark:bg-terminal-mint" />
        <div className="absolute bottom-2 right-10 w-2 h-3.5 bg-garden-deep-green dark:bg-terminal-mint" />
        <div className="absolute bottom-5 right-14 w-2 h-2 bg-garden-blush" />
        <div className="absolute bottom-3 left-24 w-2 h-2 bg-garden-gold" />
      </div>

      {/* Mascot Positioned on the Hill */}
      <div className="relative z-10 w-full h-full flex items-end justify-center pb-2">
        {children}
      </div>
    </div>
  );
}
