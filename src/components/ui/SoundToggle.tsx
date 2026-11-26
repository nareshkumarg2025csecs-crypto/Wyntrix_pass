'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/lib/audio/sound';
import { PixelVolumeOnIcon, PixelVolumeOffIcon } from './PixelIcons';

/**
 * 8-bit Sound effects toggle component.
 * Defaults to OFF (muted).
 */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(sound.isEnabled());
  }, []);

  const handleToggle = () => {
    const next = sound.toggle();
    setEnabled(next);
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      className="pixel-btn px-2.5 py-1.5 bg-garden-panel dark:bg-terminal-panel text-garden-ink dark:text-terminal-ink flex items-center gap-2 text-xs font-mono font-bold"
      aria-label={enabled ? 'Mute 8-bit sound effects' : 'Enable 8-bit sound effects'}
      title={enabled ? 'Sound FX: ON (Click to mute)' : 'Sound FX: OFF (Click to unmute)'}
    >
      {enabled ? (
        <>
          <PixelVolumeOnIcon className="w-4 h-4 text-garden-green dark:text-terminal-mint" />
          <span className="hidden sm:inline">SFX: ON</span>
        </>
      ) : (
        <>
          <PixelVolumeOffIcon className="w-4 h-4 text-garden-ink/60 dark:text-terminal-ink/60" />
          <span className="hidden sm:inline">SFX: OFF</span>
        </>
      )}
    </button>
  );
}
