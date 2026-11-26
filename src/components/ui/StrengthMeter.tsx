'use client';

import React from 'react';
import { AnalysisResult } from '@/lib/analyzer/types';

interface StrengthMeterProps {
  analysis: AnalysisResult | null;
  className?: string;
}

const TIER_COLORS = [
  'bg-garden-danger dark:bg-terminal-danger', // Tier 0 (Red)
  'bg-garden-orange dark:bg-terminal-orange', // Tier 1 (Orange)
  'bg-garden-gold dark:bg-terminal-gold',     // Tier 2 (Yellow/Gold)
  'bg-garden-green dark:bg-terminal-mint',    // Tier 3 (Green)
  'bg-garden-deep-green dark:bg-terminal-mint', // Tier 4 (Strongest)
];

export function StrengthMeter({ analysis, className = '' }: StrengthMeterProps) {
  const tier = analysis?.tier ?? 0;
  const score = analysis?.score ?? 0;
  const tierLabel = analysis?.tierLabel ?? 'SOOO WEAK';
  const effectiveEntropy = analysis?.entropyBits.effective ?? 0;
  const crackTime = analysis?.crackTime.offlineFastHash ?? 'Instant';

  return (
    <div className={`space-y-2 w-full select-none ${className}`}>
      {/* Header: Label + Score */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase text-garden-ink dark:text-terminal-ink">
            STRENGTH:
          </span>
          <span
            className={`font-pixel text-sm font-bold uppercase px-2 py-0.5 border border-garden-ink dark:border-terminal-border ${
              tier === 0
                ? 'bg-garden-danger/20 text-garden-danger dark:text-red-400'
                : tier === 1
                ? 'bg-garden-orange/20 text-garden-orange dark:text-orange-400'
                : tier === 2
                ? 'bg-garden-gold/20 text-garden-deep-green dark:text-yellow-300'
                : tier === 3
                ? 'bg-garden-green/20 text-garden-deep-green dark:text-terminal-mint'
                : 'bg-garden-deep-green text-white dark:bg-terminal-mint dark:text-terminal-bg'
            }`}
          >
            {tierLabel}
          </span>
        </div>

        <div className="font-mono text-xs font-bold text-garden-deep-green dark:text-terminal-mint">
          {score}/100 <span className="text-[10px] opacity-75">({effectiveEntropy} bits)</span>
        </div>
      </div>

      {/* 5 Pixel Segmented Bar */}
      <div
        className="grid grid-cols-5 gap-1.5 p-1 bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border shadow-pixel-sm"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Password strength: ${tierLabel}, score ${score} out of 100`}
      >
        {[0, 1, 2, 3, 4].map((segIndex) => {
          const isActive = segIndex <= tier && (score > 0 || segIndex === 0);
          return (
            <div
              key={segIndex}
              className={`h-3 transition-colors duration-100 ${
                isActive
                  ? TIER_COLORS[tier]
                  : 'bg-garden-ink/10 dark:bg-terminal-border/20'
              }`}
            />
          );
        })}
      </div>

      {/* Crack Time Scenario Line */}
      <div className="flex items-center justify-between font-mono text-[11px] text-garden-ink/75 dark:text-terminal-ink/75 pt-0.5">
        <span>⏱️ Offline Crack Time:</span>
        <span className="font-bold text-garden-ink dark:text-terminal-ink">
          {crackTime}
        </span>
      </div>
    </div>
  );
}
