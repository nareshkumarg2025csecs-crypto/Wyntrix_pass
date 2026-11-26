'use client';

import React, { useState, useEffect } from 'react';

interface LedCountdownProps {
  initialSeconds: number;
  onFinish?: () => void;
}

// 5x7 Pixel LED Matrix representations for digits 0-9
const LED_DIGITS: Record<string, string[]> = {
  '0': [
    '#####',
    '#...#',
    '#...#',
    '#...#',
    '#...#',
    '#...#',
    '#####',
  ],
  '1': [
    '..#..',
    '.##..',
    '..#..',
    '..#..',
    '..#..',
    '..#..',
    '.###.',
  ],
  '2': [
    '#####',
    '....#',
    '....#',
    '#####',
    '#....',
    '#....',
    '#####',
  ],
  '3': [
    '#####',
    '....#',
    '....#',
    '#####',
    '....#',
    '....#',
    '#####',
  ],
  '4': [
    '#...#',
    '#...#',
    '#...#',
    '#####',
    '....#',
    '....#',
    '....#',
  ],
  '5': [
    '#####',
    '#....',
    '#....',
    '#####',
    '....#',
    '....#',
    '#####',
  ],
  '6': [
    '#####',
    '#....',
    '#....',
    '#####',
    '#...#',
    '#...#',
    '#####',
  ],
  '7': [
    '#####',
    '....#',
    '....#',
    '...#.',
    '..#..',
    '.#...',
    '.#...',
  ],
  '8': [
    '#####',
    '#...#',
    '#...#',
    '#####',
    '#...#',
    '#...#',
    '#####',
  ],
  '9': [
    '#####',
    '#...#',
    '#...#',
    '#####',
    '....#',
    '....#',
    '#####',
  ],
  ':': [
    '.....',
    '..#..',
    '..#..',
    '.....',
    '..#..',
    '..#..',
    '.....',
  ],
};

function LedChar({ char }: { char: string }) {
  const pattern = LED_DIGITS[char] || LED_DIGITS['0'];
  return (
    <div className="flex flex-col gap-[2px]">
      {pattern.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-[2px]">
          {row.split('').map((dot, cIdx) => (
            <div
              key={cIdx}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${
                dot === '#'
                  ? 'bg-[#7FD1A0] shadow-[0_0_6px_#7FD1A0]'
                  : 'bg-[#162B21] opacity-40'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LedCountdown({ initialSeconds, onFinish }: LedCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [sandFrame, setSandFrame] = useState(0);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onFinish?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish?.();
          return 0;
        }
        return prev - 1;
      });
      setSandFrame((f) => (f + 1) % 4);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onFinish]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="pixel-card p-6 bg-[#08120D] text-white border-2 border-[#5B9A73] shadow-pixel-md flex flex-col items-center select-none animate-pulse">
      {/* Header Warning */}
      <div className="flex items-center gap-2 mb-4 text-[#F2A65A]">
        <span className="font-pixel text-sm uppercase tracking-wider">
          ⚠ SECURITY LOCKOUT ACTIVE
        </span>
      </div>

      {/* Retro Pixel Hourglass + Big LED Digits */}
      <div className="flex items-center gap-6 my-2">
        {/* Animated Pixel Hourglass */}
        <div className="flex flex-col items-center">
          <svg width="32" height="40" viewBox="0 0 16 20" shapeRendering="crispEdges">
            {/* Hourglass top & bottom wooden rim */}
            <rect x="1" y="1" width="14" height="2" fill="#E8C547" />
            <rect x="1" y="17" width="14" height="2" fill="#E8C547" />

            {/* Glass walls */}
            <rect x="2" y="3" width="2" height="4" fill="#A0E8FF" />
            <rect x="12" y="3" width="2" height="4" fill="#A0E8FF" />
            <rect x="4" y="7" width="2" height="3" fill="#A0E8FF" />
            <rect x="10" y="7" width="2" height="3" fill="#A0E8FF" />
            <rect x="6" y="9" width="4" height="2" fill="#A0E8FF" />
            <rect x="4" y="11" width="2" height="3" fill="#A0E8FF" />
            <rect x="10" y="11" width="2" height="3" fill="#A0E8FF" />
            <rect x="2" y="14" width="2" height="3" fill="#A0E8FF" />
            <rect x="12" y="14" width="2" height="3" fill="#A0E8FF" />

            {/* Sand grains in upper bulb */}
            {secondsLeft > 10 && <rect x="5" y="4" width="6" height="3" fill="#F2A65A" />}
            {secondsLeft > 0 && <rect x="6" y="7" width="4" height="2" fill="#F2A65A" />}

            {/* Falling sand grain */}
            {secondsLeft > 0 && (
              <rect
                x="7.5"
                y={sandFrame % 2 === 0 ? 10 : 12}
                width="1.5"
                height="1.5"
                fill="#F2A65A"
              />
            )}

            {/* Accumulated sand in bottom bulb */}
            <rect x="4" y="15" width="8" height="2" fill="#F2A65A" />
          </svg>
        </div>

        {/* Big Blocky LED Matrix Display */}
        <div className="flex gap-2 sm:gap-3 bg-[#0B1A13] p-3 border-2 border-[#1B3627] shadow-inner">
          {timeString.split('').map((char, idx) => (
            <LedChar key={idx} char={char} />
          ))}
        </div>
      </div>

      <p className="font-mono text-xs text-[#7FD1A0] mt-4 text-center">
        Account locked due to consecutive failed attempts.
        <br />
        <span className="text-[#F4B6B0] text-[11px]">
          Countdown automatically unlocks in {secondsLeft}s.
        </span>
      </p>
    </div>
  );
}
