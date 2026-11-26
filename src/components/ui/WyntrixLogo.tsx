'use client';

import React from 'react';

/**
 * Pixel-crisp Wyntrix Hexagon Logo
 * Hexagonal black border with white WYN monogram in pixel-block style.
 */
export function WyntrixLogo({
  size = 40,
  showText = true,
  className = '',
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Pixel Hexagon Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        shapeRendering="crispEdges"
        className="flex-shrink-0"
        aria-label="Wyntrix Hexagon Logo"
      >
        {/* Hexagon Dark Body */}
        <polygon
          points="8,3 24,3 30,16 24,29 8,29 2,16"
          className="fill-garden-ink dark:fill-terminal-panel"
          stroke="var(--border-main)"
          strokeWidth="2"
        />

        {/* WYN stylized monogram inside the hexagon (white / mint on dark) */}
        {/* 'W' left */}
        <rect x="7" y="10" width="2" height="10" fill="#FFFDF6" />
        <rect x="9" y="16" width="2" height="4" fill="#FFFDF6" />
        <rect x="11" y="14" width="2" height="4" fill="#FFFDF6" />
        <rect x="13" y="16" width="2" height="4" fill="#FFFDF6" />
        <rect x="15" y="10" width="2" height="10" fill="#FFFDF6" />

        {/* 'Y' center-right */}
        <rect x="18" y="10" width="2" height="4" fill="#5B9A73" />
        <rect x="22" y="10" width="2" height="4" fill="#5B9A73" />
        <rect x="20" y="13" width="2" height="3" fill="#5B9A73" />
        <rect x="20" y="16" width="2" height="4" fill="#5B9A73" />

        {/* 'N' right accent line */}
        <rect x="24" y="10" width="2" height="10" fill="#F2A65A" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-pixel text-lg font-bold tracking-wider leading-none text-garden-ink dark:text-terminal-ink">
            WYNTRIX
          </span>
          <span className="font-mono text-[9px] tracking-widest text-garden-deep-green dark:text-terminal-mint uppercase leading-tight font-semibold">
            PIXEL GUARD
          </span>
        </div>
      )}
    </div>
  );
}
