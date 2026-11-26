'use client';

import React, { useState, useEffect } from 'react';

interface SpeechBubbleProps {
  message: string;
  speedMs?: number; // default ~33ms (30 chars/sec)
  className?: string;
}

/**
 * Pixel Speech Bubble with typewriter effect and authentic pixelated tail pointing down to the pet.
 */
export function SpeechBubble({
  message,
  speedMs = 33,
  className = '',
}: {
  message: string;
  speedMs?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedText(message);
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex <= message.length) {
        setDisplayedText(message.slice(0, currentIndex));
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [message, speedMs]);

  return (
    <div className={`relative flex flex-col items-center w-full max-w-[320px] ${className}`}>
      {/* Bubble body with 2px pixel border and stepped shadow */}
      <div className="relative w-full bg-garden-panel dark:bg-terminal-panel border-2 border-garden-ink dark:border-terminal-border p-3.5 shadow-pixel-sm rounded-none">
        <p className="font-mono text-xs sm:text-sm text-garden-ink dark:text-terminal-ink leading-relaxed font-semibold min-h-[2.5rem]">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-2 h-3.5 ml-1 bg-garden-deep-green dark:bg-terminal-mint animate-pulse" />
          )}
        </p>
      </div>

      {/* Downward pointing pixel tail */}
      <div className="flex flex-col items-center -mt-[2px] z-10" aria-hidden="true">
        <div className="w-4 h-1 bg-garden-panel dark:bg-terminal-panel border-x-2 border-garden-ink dark:border-terminal-border" />
        <div className="w-3 h-1 bg-garden-panel dark:bg-terminal-panel border-x-2 border-garden-ink dark:border-terminal-border" />
        <div className="w-2 h-1 bg-garden-panel dark:bg-terminal-panel border-x-2 border-garden-ink dark:border-terminal-border" />
        <div className="w-1 h-1 bg-garden-ink dark:bg-terminal-border" />
      </div>
    </div>
  );
}
