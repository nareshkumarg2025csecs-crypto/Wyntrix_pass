import type { Metadata } from 'next';
import { Pixelify_Sans, Space_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SoundToggle } from '@/components/ui/SoundToggle';

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-pixelify',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wyntrix Pixel Guard - Password Strength Analyzer',
  description:
    'Cyber Security Password Strength Analyzer & Awareness Portal for Wyntrix Innovation OPC Pvt Ltd',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pixelifySans.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <body className="font-mono bg-garden-cream text-garden-ink dark:bg-terminal-bg dark:text-terminal-ink min-h-screen antialiased pixel-dither-bg selection:bg-garden-orange selection:text-garden-ink transition-colors duration-200">
        <ThemeProvider>
          {/* Universal Top Bar for Quick Actions (Theme & SFX) */}
          <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-2">
            <SoundToggle />
            <ThemeToggle />
          </div>

          {/* Main App Container */}
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
