import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pixel Garden (Light theme tokens)
        garden: {
          cream: '#FBF6EA',
          panel: '#FFFDF6',
          ink: '#1B1F1A',
          green: '#5B9A73',
          'deep-green': '#2F6B4F',
          orange: '#F2A65A',
          blush: '#F4B6B0',
          danger: '#D95F5F',
          gold: '#E8C547',
          border: '#1B1F1A',
        },
        // Night Terminal (Dark theme tokens)
        terminal: {
          bg: '#0F1714',
          panel: '#16221D',
          ink: '#E7F2EB',
          mint: '#7FD1A0',
          'deep-mint': '#4C8A67',
          orange: '#F2A65A',
          blush: '#F4B6B0',
          danger: '#D95F5F',
          gold: '#E8C547',
          border: '#7FD1A0',
        },
      },
      fontFamily: {
        pixel: ['var(--font-pixelify)', 'monospace'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      boxShadow: {
        'pixel-sm': '2px 2px 0px 0px currentColor',
        'pixel-md': '4px 4px 0px 0px currentColor',
        'pixel-lg': '6px 6px 0px 0px currentColor',
        'pixel-press': '1px 1px 0px 0px currentColor',
        'pixel-pop': '3px 3px 0px 0px rgba(0, 0, 0, 0.85)',
        'pixel-dark': '3px 3px 0px 0px rgba(0, 0, 0, 0.95)',
      },
      animation: {
        'stepped-pulse': 'steppedPulse 2s steps(2, jump-none) infinite',
        'cloud-drift-slow': 'cloudDrift 45s linear infinite',
        'cloud-drift-fast': 'cloudDrift 25s linear infinite',
      },
      keyframes: {
        steppedPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        cloudDrift: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
