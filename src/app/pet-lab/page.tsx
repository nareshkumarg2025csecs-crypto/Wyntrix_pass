'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WyntrixLogo } from '@/components/ui/WyntrixLogo';
import { ByteMascot } from '@/components/mascot/ByteMascot';
import { MascotState } from '@/components/mascot/types';
import { SpeechBubble } from '@/components/mascot/SpeechBubble';
import { PixelScene } from '@/components/mascot/PixelScene';
import { sound } from '@/lib/audio/sound';

interface StateMeta {
  state: MascotState;
  label: string;
  category: 'IDLE' | 'LOGIN' | 'REGISTER' | 'TIERS';
  speech: string;
  description: string;
}

const ALL_STATES: StateMeta[] = [
  // IDLE & SLEEP
  {
    state: 'IDLE',
    label: 'Idle Life',
    category: 'IDLE',
    speech: 'Byte is alert and on duty! Blinks, ear twitches, and tail wags.',
    description: 'Blinks every 3-5s, occasional ear twitches, tail wag, yawns.',
  },
  {
    state: 'SLEEP',
    label: 'Sleep (Zzz)',
    category: 'IDLE',
    speech: 'Zzz... Byte dozes off after 30s of inactivity. Click to wake!',
    description: 'Sleeping eyes, breathing rhythm, floating Zzz particles.',
  },

  // LOGIN FLOW
  {
    state: 'FOCUS_USER',
    label: 'Focus Username',
    category: 'LOGIN',
    speech: 'Who goes there? Curious head tilt when username field is focused.',
    description: 'Curious 1px head tilt.',
  },
  {
    state: 'THINKING',
    label: 'Thinking (Typing)',
    category: 'LOGIN',
    speech: 'Processing identity... Eyes track characters, question marks float!',
    description: 'Question mark particles, attentive gaze.',
  },
  {
    state: 'PROCESSING',
    label: 'Typing Password',
    category: 'LOGIN',
    speech: 'Shh! Typing hidden password. Headphone LEDs blinking, eyes focused.',
    description: 'Narrow eyes, blinking headphone LEDs, gears/dots.',
  },
  {
    state: 'PEEK',
    label: 'Show Password (Peek)',
    category: 'LOGIN',
    speech: 'No peeking! Paws half-covering eyes with one sneaky eye checking.',
    description: 'Paws over face, one cute peeking eye.',
  },
  {
    state: 'EMPTY_SUBMIT',
    label: 'Empty Submit',
    category: 'LOGIN',
    speech: 'Hmm? Fill me in! Head tilted in mild confusion.',
    description: 'Puzzled head tilt, worried mouth.',
  },
  {
    state: 'SNIFFING',
    label: 'Sniffing (Submitting)',
    category: 'LOGIN',
    speech: 'Scanning credentials... Radar sweep beam analyzing security packets.',
    description: 'Rotating radar beam, scanning eyes.',
  },
  {
    state: 'DETECTIVE',
    label: 'Wrong PW #1 (Detective)',
    category: 'LOGIN',
    speech: 'Hmm... something smells fishy! Sherlock deerstalker hat & magnifying glass.',
    description: 'Deerstalker hat, magnifying glass, narrowed detective eyes.',
  },
  {
    state: 'ANGRY',
    label: 'Wrong PW #2 (Angry)',
    category: 'LOGIN',
    speech: 'Grrr! That is NOT it! Red danger tint, steam puffs, stamping shake.',
    description: 'Danger red tint overlay, steam puffs blowing from head, head shake.',
  },
  {
    state: 'DIZZY_LOCKED',
    label: 'Wrong PW #3+ (Locked)',
    category: 'LOGIN',
    speech: 'Whoa dizzy! Spiral eyes and security padlock lockout engaged.',
    description: 'Swirling spiral eyes, golden security padlock.',
  },
  {
    state: 'HAPPY',
    label: 'Login / Auth Success',
    category: 'LOGIN',
    speech: 'Welcome back! Heart eyes, big joyful smile, tail wagging, sparkles!',
    description: 'Heart eyes, open smile with pink tongue, hearts & sparkle particles.',
  },

  // REGISTER & USERNAME CHECK
  {
    state: 'USER_AVAILABLE',
    label: 'Username Available',
    category: 'REGISTER',
    speech: 'Awesome username! Little paw thumbs up with happy smile.',
    description: 'Thumbs up paw raised, cheerful expression.',
  },
  {
    state: 'USER_TAKEN',
    label: 'Username Taken',
    category: 'REGISTER',
    speech: 'Oops, that username is already claimed! Sad droopy ears.',
    description: 'Droopy flattened ears, worried frown.',
  },
  {
    state: 'EXCITED',
    label: 'Passphrase Generate',
    category: 'REGISTER',
    speech: 'Yay! High-entropy passphrase incoming! Bouncing with excitement.',
    description: 'Jumping bounce, sparkle eyes, party hat.',
  },

  // PASSWORD STRENGTH TIERS
  {
    state: 'TIER_0',
    label: 'Tier 0: SOOO WEAK',
    category: 'TIERS',
    speech: 'Even my chew toy cracks this! Crying, sweating, fast head shake.',
    description: 'Fast head shake, crying tears, splashing sweat drops, red alert.',
  },
  {
    state: 'TIER_1',
    label: 'Tier 1: TRY BETTER',
    category: 'TIERS',
    speech: 'Try better, mix it up! Worried eyes, slow head shake, sweat.',
    description: 'Slow head shake, worried eyes & mouth, sweat drops.',
  },
  {
    state: 'TIER_2',
    label: 'Tier 2: GOOD',
    category: 'TIERS',
    speech: 'Good! Now push it a little more. Content smile, calm posture.',
    description: 'Cheery smile, calm posture, gentle nod.',
  },
  {
    state: 'TIER_3',
    label: 'Tier 3: WOW',
    category: 'TIERS',
    speech: "WOW! That's tough to crack! Sparkle star eyes, jumping, stars floating!",
    description: 'Sparkling star eyes, vertical jumps, floating golden stars.',
  },
  {
    state: 'TIER_4',
    label: 'Tier 4: STRONGEST',
    category: 'TIERS',
    speech: 'STRONGEST! Fort Knox called! Heart eyes, party hat, confetti explosion!',
    description: 'Heart eyes, festive party hat, confetti explosion, super tail wag.',
  },
];

export default function PetLabPage() {
  const [selectedState, setSelectedState] = useState<MascotState>('IDLE');
  const [scale, setScale] = useState<number>(4);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const currentMeta =
    ALL_STATES.find((s) => s.state === selectedState) || ALL_STATES[0];

  const handleSelectState = (state: MascotState) => {
    setSelectedState(state);
    sound.playButton();
  };

  const filteredStates =
    activeCategory === 'ALL'
      ? ALL_STATES
      : ALL_STATES.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-2 border-garden-ink dark:border-terminal-border pb-4">
        <div>
          <WyntrixLogo size={36} />
          <h1 className="font-pixel text-2xl sm:text-3xl mt-2 text-garden-ink dark:text-terminal-ink">
            BYTE MASCOT LAB (96x96 CHIBI ENGINE)
          </h1>
          <p className="font-mono text-xs text-garden-deep-green dark:text-terminal-mint">
            Interactive canvas pixel-art testing suite for Byte the Shiba Pup (96x96 Layered Chibi Architecture)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="pixel-btn px-3 py-2 bg-garden-panel dark:bg-terminal-panel font-mono text-xs font-bold"
          >
            ← Login Portal
          </Link>
          <Link
            href="/register"
            className="pixel-btn px-3 py-2 bg-garden-green dark:bg-terminal-deep-mint text-garden-panel font-mono text-xs font-bold"
          >
            Register Portal →
          </Link>
        </div>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Live Stage (Byte Canvas + Speech Bubble) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="pixel-card p-6 w-full flex flex-col items-center">
            {/* Speech Bubble */}
            <div className="w-full mb-2 flex justify-center">
              <SpeechBubble message={currentMeta.speech} />
            </div>

            {/* Hill Scene with Byte */}
            <div className="my-2">
              <PixelScene>
                <ByteMascot state={selectedState} pixelScale={scale} />
              </PixelScene>
            </div>

            {/* State Title & Description */}
            <div className="w-full text-center mt-3 pt-3 border-t-2 border-garden-ink/20 dark:border-terminal-border/20">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-garden-deep-green dark:text-terminal-mint">
                CURRENT STATE [{currentMeta.category}]
              </span>
              <h2 className="font-pixel text-2xl text-garden-ink dark:text-terminal-ink">
                {currentMeta.label}
              </h2>
              <p className="font-mono text-xs text-garden-ink/75 dark:text-terminal-ink/75 mt-1">
                {currentMeta.description}
              </p>
            </div>

            {/* Scale Selector */}
            <div className="mt-4 flex items-center gap-2 font-mono text-xs">
              <span className="font-bold">CANVAS SCALE:</span>
              {[3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`pixel-btn px-2.5 py-1 text-xs font-bold ${
                    scale === s
                      ? 'bg-garden-deep-green dark:bg-terminal-mint text-white dark:text-terminal-bg'
                      : 'bg-garden-panel dark:bg-terminal-panel'
                  }`}
                >
                  {s}x ({s * 96}px)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: State Selector Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All States (20)' },
              { id: 'TIERS', label: 'Password Tiers (0-4)' },
              { id: 'LOGIN', label: 'Login Reactions' },
              { id: 'REGISTER', label: 'Register & Username' },
              { id: 'IDLE', label: 'Idle & Sleep' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`pixel-btn px-3 py-1.5 font-mono text-xs font-bold ${
                  activeCategory === cat.id
                    ? 'bg-garden-orange text-garden-ink shadow-pixel-press'
                    : 'bg-garden-panel dark:bg-terminal-panel text-garden-ink dark:text-terminal-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* State Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredStates.map((item) => {
              const isSelected = selectedState === item.state;
              return (
                <button
                  key={item.state}
                  onClick={() => handleSelectState(item.state)}
                  className={`pixel-card-sm p-3 text-left transition-all hover:translate-x-1 ${
                    isSelected
                      ? 'border-garden-deep-green dark:border-terminal-mint bg-garden-cream dark:bg-[#1B2C24] shadow-pixel-sm'
                      : 'hover:bg-garden-cream/50 dark:hover:bg-terminal-panel/80'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-pixel text-base font-bold text-garden-ink dark:text-terminal-ink">
                      {item.label}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 border border-garden-ink/30 dark:border-terminal-border/30 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-garden-ink/70 dark:text-terminal-ink/70 line-clamp-1">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Sprite Anatomy Guide Card */}
          <div className="pixel-card p-5 bg-garden-cream/60 dark:bg-terminal-bg/80">
            <h3 className="font-pixel text-lg text-garden-ink dark:text-terminal-ink mb-2">
              🎨 BYTE SPRITE COMPOSITION ARCHITECTURE
            </h3>
            <ul className="font-mono text-xs space-y-1.5 text-garden-ink/80 dark:text-terminal-ink/80">
              <li>
                • <strong>Base &amp; Fur:</strong> Chubby 96x96 Shiba Inu with warm golden coat (`#E8923C`), cream Urajiro cheeks/chest (`#FFF3DC`), soft ground shadow, and rosy blush (`#FFAAA6`).
              </li>
              <li>
                • <strong>Headphones &amp; Collar:</strong> Wyntrix Deep Green headband over crown with pulsing Mint LEDs (`#7FD1A0`) and golden shield security tag (`#E8C547`).
              </li>
              <li>
                • <strong>Kawaii Proportions:</strong> Head is 55% of total height, 10x12 glossy eyes with double specular glints and signature Shiba eyebrow dots (maro spots).
              </li>
              <li>
                • <strong>Layered Expressions:</strong> Head, ears, eyes, brows, mouth, tail, and accessories are independent 96x96 layers. Accessories strictly never cover the face area.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
