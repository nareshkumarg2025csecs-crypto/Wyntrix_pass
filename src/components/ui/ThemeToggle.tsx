'use client';

import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { PixelSunIcon, PixelMoonIcon } from './PixelIcons';

/**
 * Pixel Theme Toggle
 * Toggles between 'Pixel Garden' (light) and 'Night Terminal' (dark)
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="pixel-btn px-2.5 py-1.5 bg-garden-panel dark:bg-terminal-panel text-garden-ink dark:text-terminal-ink flex items-center gap-2 text-xs font-mono font-bold"
      aria-label={`Switch to ${theme === 'light' ? 'Night Terminal (dark)' : 'Pixel Garden (light)'} mode`}
      title={`Switch to ${theme === 'light' ? 'Night Terminal' : 'Pixel Garden'} theme`}
    >
      {theme === 'light' ? (
        <>
          <PixelMoonIcon className="w-4 h-4 text-garden-deep-green" />
          <span className="hidden sm:inline">NIGHT</span>
        </>
      ) : (
        <>
          <PixelSunIcon className="w-4 h-4 text-terminal-mint" />
          <span className="hidden sm:inline">DAY</span>
        </>
      )}
    </button>
  );
}
