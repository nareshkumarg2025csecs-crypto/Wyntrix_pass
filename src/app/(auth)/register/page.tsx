'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PixelUserIcon, PixelLockIcon, PixelEyeIcon, PixelCheckIcon, PixelCrossIcon } from '@/components/ui/PixelIcons';
import { StrengthMeter } from '@/components/ui/StrengthMeter';
import { analyze } from '@/lib/analyzer';
import { AnalysisResult } from '@/lib/analyzer/types';
import { MascotState } from '@/components/mascot/types';
import { checkPasswordBreach } from '@/lib/analyzer/breachClient';
import { sound } from '@/lib/audio/sound';
import wordlistData from '@/data/wordlist.json';

export default function RegisterPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Analysis result
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Username availability check
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Mascot dynamic states
  const [mascotState, setMascotState] = useState<MascotState>('IDLE');
  const [speech, setSpeech] = useState('Create a rock-solid password! I will evaluate every character.');
  const [statusChip, setStatusChip] = useState('Security Sentinel Ready');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedPassphrase, setCopiedPassphrase] = useState(false);

  // Map password tier to mascot state
  const getTierMascotState = useCallback((tier: number): MascotState => {
    switch (tier) {
      case 0:
        return 'TIER_0';
      case 1:
        return 'TIER_1';
      case 2:
        return 'TIER_2';
      case 3:
        return 'TIER_3';
      case 4:
        return 'TIER_4';
      default:
        return 'IDLE';
    }
  }, []);

  // Debounced real-time analysis (120ms)
  useEffect(() => {
    if (!password) {
      setAnalysis(null);
      setMascotState('IDLE');
      setSpeech('Type a password or generate a multi-word passphrase.');
      setStatusChip('Security Sentinel Ready');
      return;
    }

    const timer = setTimeout(async () => {
      // 1. Synchronous pure engine evaluation
      const res = analyze(password, { username });
      setAnalysis(res);

      // Sound tier up effect if good/wow/strongest
      if (res.tier >= 2) {
        sound.playTierUp();
      }

      // Update mascot state according to tier
      const nextState = getTierMascotState(res.tier);
      setMascotState(nextState);

      const speeches = [
        'Sooo weak... I could guess that in my sleep!',
        'Try better! Mix up words, numbers, and symbols.',
        'Good! Solid start. A few more characters?',
        'WOW! That is tough to crack! Tail wagging!',
        'STRONGEST! Unbreakable vibes! Treat for you!',
      ];
      setSpeech(speeches[res.tier] || speeches[0]);
      setStatusChip(`ANALYZING: TIER ${res.tier} [${res.tierLabel}]`);

      // 2. Extra client-side k-anonymity breach check (async)
      if (password.length >= 8) {
        const breach = await checkPasswordBreach(password);
        if (breach.isBreached) {
          const rechecked = analyze(password, { username, isBreached: true });
          setAnalysis(rechecked);
          setMascotState('TIER_0');
          setSpeech(`ALERT: This password appeared in ${breach.breachCount.toLocaleString()} public data breaches!`);
          setStatusChip('BREACH DETECTED!');
        }
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [password, username, getTierMascotState]);

  // Debounced username availability check
  useEffect(() => {
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/username-available?u=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setIsCheckingUsername(false);
        setUsernameAvailable(data.available);

        if (data.available) {
          setMascotState('USER_AVAILABLE');
          setSpeech(`Username "${trimmed}" is available! Thumbs up!`);
          setStatusChip('Handle verified');
        } else {
          setMascotState('USER_TAKEN');
          setSpeech(`Oops! "${trimmed}" is already taken. Try another.`);
          setStatusChip('Handle unavailable');
        }
      } catch {
        setIsCheckingUsername(false);
        setUsernameAvailable(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  // Generate 4-word random passphrase using crypto.getRandomValues
  const handleGeneratePassphrase = () => {
    sound.playButton();
    const words = wordlistData as string[];
    const chosen: string[] = [];
    const randomBuffer = new Uint32Array(4);
    crypto.getRandomValues(randomBuffer);

    for (let i = 0; i < 4; i++) {
      const idx = randomBuffer[i] % words.length;
      chosen.push(words[idx]);
    }

    const generated = chosen.join(' ');
    setPassword(generated);
    setCopiedPassphrase(false);
    setShowPassword(true);

    setMascotState('EXCITED');
    setSpeech('Generated a high-entropy 4-word passphrase! Easy to remember, hard to crack.');
    setStatusChip('Passphrase generated');
  };

  const handleCopyPassphrase = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassphrase(true);
    sound.playButton();
    setTimeout(() => setCopiedPassphrase(false), 2000);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please complete all required fields.');
      sound.playError();
      return;
    }

    if (usernameAvailable === false) {
      setErrorMsg('Please choose an available username.');
      sound.playError();
      return;
    }

    if (!analysis || analysis.tier < 2) {
      setErrorMsg('Password must be at least Tier 2 (GOOD) to register.');
      sound.playError();
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    setMascotState('SNIFFING');
    setStatusChip('Registering agent...');
    setSpeech('Securing your credentials in our Argon2 vault...');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        sound.playError();
        setErrorMsg(data.error || 'Registration failed.');
        setIsSubmitting(false);
        setMascotState('TIER_1');
        return;
      }

      // Success! Celebrate with party hat and confetti
      sound.playSuccess();
      setMascotState('HAPPY');
      setStatusChip('Account Created!');
      setSpeech('Hooray! Registration complete! Party time!');

      setTimeout(() => {
        startTransition(() => {
          router.push('/login?registered=true');
        });
      }, 1200);
    } catch {
      sound.playError();
      setErrorMsg('Connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Can submit check: username available, length >= 8, tier >= 2, not common
  const canSubmit =
    username.trim().length >= 3 &&
    usernameAvailable === true &&
    password.length >= 8 &&
    analysis !== null &&
    analysis.tier >= 2 &&
    !analysis.isCommon &&
    !isSubmitting;

  return (
    <AppShell
      twoColumn={true}
      speech={speech}
      statusChip={statusChip}
      tier={analysis?.tier ?? 0}
      mascotState={mascotState}
    >
      {/* COLUMN 1: Registration Form */}
      <div className="pixel-card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="font-pixel text-2xl sm:text-3xl text-garden-ink dark:text-terminal-ink mb-1">
            CREATE ACCOUNT
          </h1>
          <p className="font-mono text-xs text-garden-deep-green dark:text-terminal-mint">
            Join Wyntrix with a cyber-resilient credential
          </p>
        </div>

        {errorMsg && (
          <div
            className="mb-4 p-3 border-2 border-garden-danger bg-garden-danger/10 text-garden-danger dark:text-red-400 font-mono text-xs font-semibold flex items-center gap-2"
            role="alert"
          >
            <span>❌</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="username"
                className="block font-mono text-xs font-bold uppercase text-garden-ink dark:text-terminal-ink"
              >
                Agent Handle (Username)
              </label>
              {isCheckingUsername ? (
                <span className="font-mono text-[10px] text-garden-deep-green dark:text-terminal-mint animate-pulse">
                  Checking...
                </span>
              ) : usernameAvailable === true ? (
                <span className="font-mono text-[10px] text-garden-green dark:text-terminal-mint font-bold flex items-center gap-1">
                  ✓ Available
                </span>
              ) : usernameAvailable === false ? (
                <span className="font-mono text-[10px] text-garden-danger dark:text-red-400 font-bold flex items-center gap-1">
                  ✗ Taken
                </span>
              ) : null}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-garden-deep-green dark:text-terminal-mint">
                <PixelUserIcon className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                autoComplete="off"
                disabled={isSubmitting}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  sound.playKeypress();
                }}
                placeholder="new_sentinel"
                className="w-full pl-9 pr-3 py-2.5 font-mono text-sm bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border text-garden-ink dark:text-terminal-ink focus:bg-white dark:focus:bg-[#1C2C24] transition-colors"
              />
            </div>
            <p className="font-mono text-[10px] text-garden-ink/60 dark:text-terminal-ink/60 mt-1">
              3-20 characters: letters, numbers, and underscores.
            </p>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="password"
                className="block font-mono text-xs font-bold uppercase text-garden-ink dark:text-terminal-ink"
              >
                Password / Passphrase
              </label>
              <button
                type="button"
                onClick={handleGeneratePassphrase}
                className="font-mono text-[11px] text-garden-orange hover:underline font-bold"
              >
                ⚡ Generate Passphrase
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-garden-deep-green dark:text-terminal-mint">
                <PixelLockIcon className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  sound.playKeypress();
                }}
                placeholder="Type password or passphrase..."
                className="w-full pl-9 pr-16 py-2.5 font-mono text-sm bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border text-garden-ink dark:text-terminal-ink focus:bg-white dark:focus:bg-[#1C2C24] transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopyPassphrase}
                    title="Copy password to clipboard"
                    className="p-1 text-xs text-garden-ink/70 dark:text-terminal-ink/70 hover:text-garden-ink dark:hover:text-terminal-ink font-mono font-bold"
                  >
                    {copiedPassphrase ? 'COPIED!' : 'COPY'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="p-1 text-garden-ink/70 dark:text-terminal-ink/70 hover:text-garden-ink dark:hover:text-terminal-ink"
                >
                  <PixelEyeIcon open={showPassword} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Strength Meter Preview */}
          <div className="pt-2">
            <StrengthMeter analysis={analysis} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="pixel-btn w-full py-3 bg-garden-green dark:bg-terminal-deep-mint text-garden-panel font-pixel text-lg font-bold tracking-wider hover:bg-garden-deep-green dark:hover:bg-terminal-mint dark:hover:text-terminal-bg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 pt-4 text-center border-t border-garden-ink/10 dark:border-terminal-border/10">
          <Link
            href="/login"
            className="font-mono text-xs underline text-garden-deep-green dark:text-terminal-mint font-semibold hover:text-garden-orange"
          >
            ← Already have an account? Login here
          </Link>
        </div>
      </div>

      {/* COLUMN 2: Live Policy Checklist & Actionable Findings */}
      <div className="pixel-card p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
        <div>
          <h2 className="font-pixel text-xl text-garden-ink dark:text-terminal-ink mb-1">
            SECURITY POLICY VALIDATION
          </h2>
          <p className="font-mono text-xs text-garden-deep-green dark:text-terminal-mint mb-4">
            Live NIST SP 800-63B &amp; OWASP verification
          </p>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {[
              {
                id: 'min_len',
                label: 'Minimum 8 characters (Hard requirement)',
                passed: password.length >= 8,
              },
              {
                id: 'rec_len',
                label: 'Recommended 12+ characters or 4 words',
                passed: password.length >= 12,
              },
              {
                id: 'lower',
                label: 'Contains lowercase letters (a-z)',
                passed: /[a-z]/.test(password),
              },
              {
                id: 'upper',
                label: 'Contains uppercase letters (A-Z)',
                passed: /[A-Z]/.test(password),
              },
              {
                id: 'digit',
                label: 'Contains numbers (0-9)',
                passed: /[0-9]/.test(password),
              },
              {
                id: 'symbol',
                label: 'Contains symbols or spaces (!@#$ or space)',
                passed: /[^a-zA-Z0-9]/.test(password),
              },
              {
                id: 'not_common',
                label: 'Not in common breach wordlists (SecLists 10K)',
                passed: analysis ? !analysis.isCommon : true,
              },
              {
                id: 'no_walk',
                label: 'No keyboard walks or sequential series',
                passed: analysis
                  ? !analysis.findings.some(
                      (f) => f.id === 'keyboard_walk' || f.id === 'sequences'
                    )
                  : true,
              },
            ].map((chk) => (
              <div
                key={chk.id}
                className="flex items-center justify-between font-mono text-xs py-1 px-2.5 bg-garden-cream/60 dark:bg-terminal-bg/60 border border-garden-ink/20 dark:border-terminal-border/20"
              >
                <span className="text-garden-ink dark:text-terminal-ink">{chk.label}</span>
                {chk.passed ? (
                  <span className="text-garden-deep-green dark:text-terminal-mint flex items-center gap-1 font-bold">
                    <PixelCheckIcon className="w-3.5 h-3.5" />
                    PASS
                  </span>
                ) : (
                  <span className="text-garden-danger dark:text-red-400 flex items-center gap-1 font-bold">
                    <PixelCrossIcon className="w-3.5 h-3.5" />
                    NEED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Priority Fix Recommendations */}
        {analysis && analysis.recommendations.length > 0 && (
          <div className="pt-3 border-t-2 border-garden-ink/15 dark:border-terminal-border/15">
            <h3 className="font-pixel text-sm text-garden-orange mb-2">
              💡 RECOMMENDATIONS TO IMPROVE:
            </h3>
            <ul className="space-y-1.5 font-mono text-[11px] text-garden-ink/85 dark:text-terminal-ink/85">
              {analysis.recommendations.slice(0, 3).map((rec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-garden-orange font-bold">▸</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
