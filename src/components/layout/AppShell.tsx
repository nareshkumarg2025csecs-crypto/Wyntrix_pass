'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotPanel } from '@/components/mascot/MascotPanel';
import { MascotState } from '@/components/mascot/types';

interface AppShellProps {
  children: React.ReactNode;
  speech?: string;
  statusChip?: string;
  quote?: string;
  tier?: number | null;
  mascotState?: MascotState;
  twoColumn?: boolean;
  mascotElement?: React.ReactNode;
}

/**
 * 25/75 Split Layout Shell
 * Desktop: Left 25% (min 340px) = Mascot Panel, Right 75% = Interactive Form / Lab Area
 * Mobile: Mascot Banner on top, Form / Lab below
 */
export function AppShell({
  children,
  speech,
  statusChip,
  quote,
  tier,
  mascotState,
  twoColumn = false,
  mascotElement,
}: AppShellProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row w-full min-h-screen">
      {/* LEFT 25% Mascot Panel */}
      <MascotPanel
        speech={speech}
        statusChip={statusChip}
        quote={quote}
        tier={tier}
        mascotState={mascotState}
      >
        {mascotElement}
      </MascotPanel>

      {/* RIGHT 75% Interactive Content Area */}
      <section className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`w-full ${
              twoColumn
                ? 'max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start'
                : 'max-w-[520px] mx-auto'
            }`}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
