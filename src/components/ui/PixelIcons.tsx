'use client';

import React from 'react';

// Pixel-crisp SVGs using shape-rendering="crispEdges"
// Every icon is mathematically drawn on a grid of solid blocks

export function PixelSunIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Sun center 6x6 */}
      <rect x="5" y="5" width="6" height="6" />
      {/* Sun rays */}
      <rect x="7" y="1" width="2" height="2" />
      <rect x="7" y="13" width="2" height="2" />
      <rect x="1" y="7" width="2" height="2" />
      <rect x="13" y="7" width="2" height="2" />
      {/* Diagonal rays */}
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
    </svg>
  );
}

export function PixelMoonIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Crescent moon shape */}
      <rect x="5" y="2" width="5" height="2" />
      <rect x="3" y="4" width="4" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="2" y="6" width="3" height="4" />
      <rect x="11" y="6" width="2" height="3" />
      <rect x="3" y="10" width="4" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="5" y="12" width="5" height="2" />
    </svg>
  );
}

export function PixelVolumeOnIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Speaker body */}
      <rect x="2" y="6" width="2" height="4" />
      <rect x="4" y="5" width="2" height="6" />
      <rect x="6" y="3" width="2" height="10" />
      {/* Sound waves */}
      <rect x="10" y="5" width="1" height="6" />
      <rect x="12" y="3" width="1" height="10" />
      <rect x="14" y="2" width="1" height="12" />
    </svg>
  );
}

export function PixelVolumeOffIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Speaker body */}
      <rect x="2" y="6" width="2" height="4" />
      <rect x="4" y="5" width="2" height="6" />
      <rect x="6" y="3" width="2" height="10" />
      {/* Mute X */}
      <rect x="10" y="5" width="2" height="2" />
      <rect x="13" y="5" width="2" height="2" />
      <rect x="11.5" y="7" width="2" height="2" />
      <rect x="10" y="9" width="2" height="2" />
      <rect x="13" y="9" width="2" height="2" />
    </svg>
  );
}

export function PixelUserIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Head */}
      <rect x="6" y="2" width="4" height="4" />
      {/* Shoulders & torso */}
      <rect x="4" y="7" width="8" height="2" />
      <rect x="3" y="9" width="10" height="4" />
    </svg>
  );
}

export function PixelLockIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Shackle */}
      <rect x="5" y="2" width="6" height="2" />
      <rect x="4" y="4" width="2" height="3" />
      <rect x="10" y="4" width="2" height="3" />
      {/* Body */}
      <rect x="3" y="7" width="10" height="7" />
      {/* Keyhole */}
      <rect x="7" y="9" width="2" height="2" fill="var(--bg-panel)" />
      <rect x="7.5" y="11" width="1" height="2" fill="var(--bg-panel)" />
    </svg>
  );
}

export function PixelEyeIcon({
  open = true,
  className = 'w-5 h-5',
}: {
  open?: boolean;
  className?: string;
}) {
  if (open) {
    return (
      <svg
        viewBox="0 0 16 16"
        className={className}
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="8" height="2" />
        <rect x="2" y="6" width="12" height="4" />
        <rect x="4" y="10" width="8" height="2" />
        {/* Pupil */}
        <rect x="7" y="7" width="2" height="2" fill="var(--bg-panel)" />
      </svg>
    );
  }

  // Eye closed / slash
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="10" height="2" />
      <rect x="5" y="9" width="2" height="2" />
      <rect x="9" y="9" width="2" height="2" />
      {/* Lash lines */}
      <rect x="2" y="5" width="2" height="2" />
      <rect x="12" y="5" width="2" height="2" />
    </svg>
  );
}

export function PixelCheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="2" y="8" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="6" y="12" width="2" height="2" />
      <rect x="8" y="10" width="2" height="2" />
      <rect x="10" y="8" width="2" height="2" />
      <rect x="12" y="6" width="2" height="2" />
      <rect x="14" y="4" width="2" height="2" />
    </svg>
  );
}

export function PixelCrossIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="2" height="2" />
      <rect x="5" y="5" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="9" y="9" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />

      <rect x="11" y="3" width="2" height="2" />
      <rect x="9" y="5" width="2" height="2" />
      <rect x="5" y="9" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
    </svg>
  );
}
