'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PixelUserIcon, PixelLockIcon, PixelEyeIcon } from '@/components/ui/PixelIcons';
import { MascotState } from '@/components/mascot/types';
import { LedCountdown } from '@/components/ui/LedCountdown';
import { sound } from '@/lib/audio/sound';

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Mascot dynamic states
  const [mascotState, setMascotState] = useState<MascotState>('IDLE');
  const [speech, setSpeech] = useState('Welcome back! Byte is standing guard.');
  const [statusChip, setStatusChip] = useState('Ready to protect your world!');

  // Submission & Lockout states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [failedCount, setFailedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Focus handlers
  const handleFocusUsername = () => {
    if (isLocked) return;
    setMascotState('FOCUS_USER');
    setSpeech('Who goes there? Enter your username.');
  };

  const handleFocusPassword = () => {
    if (isLocked) return;
    if (showPassword) {
      setMascotState('PEEK');
      setSpeech('No peeking! Shielding eyes.');
    } else {
      setMascotState('PROCESSING');
      setSpeech('Typing secret credentials. Keep them safe!');
    }
  };

  const handleBlur = () => {
    if (isLocked || isSubmitting) return;
    // Delay returning to idle
    setTimeout(() => {
      setMascotState('IDLE');
      setSpeech('Byte is vigilant. Enter your credentials.');
    }, 400);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    sound.playKeypress();
    if (!isLocked) {
      setMascotState('THINKING');
      setSpeech(`Verifying agent handle: "${val || '...'}"`);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    sound.playKeypress();
    if (!isLocked) {
      if (showPassword) {
        setMascotState('PEEK');
        setSpeech('Peeking... remember to hide in public!');
      } else {
        setMascotState('PROCESSING');
        setSpeech('Processing hidden characters. Encrypted!');
      }
    }
  };

  const toggleShowPassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    sound.playButton();
    if (next) {
      setMascotState('PEEK');
      setSpeech('Eep! Password visible on screen! No peeking!');
    } else {
      setMascotState('PROCESSING');
      setSpeech('Much better. Kept in the dark!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    // Check empty submit
    if (!username.trim() || !password) {
      setMascotState('EMPTY_SUBMIT');
      setSpeech('Hmm? Fill me in! Both fields are required.');
      setErrorMsg('Please enter both username and password.');
      sound.playError();
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    setMascotState('SNIFFING');
    setStatusChip('Scanning credentials...');
    setSpeech('Sniffing out authentication packets...');
    sound.playButton();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          remember: rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        sound.playError();
        const failures = data.failedAttempts || failedCount + 1;
        setFailedCount(failures);

        if (data.isLocked || failures >= 3) {
          // Lockout state: DIZZY_LOCKED
          setIsLocked(true);
          setLockoutSeconds(data.remainingSeconds || 30);
          setMascotState('DIZZY_LOCKED');
          setStatusChip('SECURITY LOCKOUT ACTIVE');
          setSpeech('Whoa dizzy! Too many failed attempts! Padlock engaged.');
          setErrorMsg(data.error || 'Account temporarily locked.');
        } else if (failures === 2) {
          // Wrong password #2: ANGRY
          setMascotState('ANGRY');
          setStatusChip('Warning: 2nd failed attempt!');
          setSpeech('Grrr! That is NOT it! Watch your step!');
          setErrorMsg('Invalid username or password. 1 attempt left before lockout!');
        } else {
          // Wrong password #1: DETECTIVE
          setMascotState('DETECTIVE');
          setStatusChip('Investigating credentials...');
          setSpeech('Hmm... something smells fishy. Double check your keys.');
          setErrorMsg('Invalid username or password.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success!
      sound.playSuccess();
      setMascotState('HAPPY');
      setStatusChip('Authentication Successful!');
      setSpeech(`Welcome back, ${data.username}! Access granted.`);

      // Hold 900ms then transition to /lab
      setTimeout(() => {
        router.push('/lab');
      }, 950);
    } catch {
      sound.playError();
      setErrorMsg('Network or server connection failed. Please try again.');
      setMascotState('IDLE');
      setIsSubmitting(false);
    }
  };

  const handleLockoutFinished = () => {
    setIsLocked(false);
    setLockoutSeconds(0);
    setMascotState('IDLE');
    setStatusChip('System ready. Try again.');
    setSpeech('Lockout lifted. Take a deep breath and try again.');
    setErrorMsg('');
  };

  return (
    <AppShell
      speech={speech}
      statusChip={statusChip}
      quote="A strong password is your first line of defense."
      mascotState={mascotState}
    >
      <div className="pixel-card p-6 sm:p-8 w-full relative">
        {/* Card Header */}
        <div className="text-center mb-6">
          <h1 className="font-pixel text-2xl sm:text-3xl text-garden-ink dark:text-terminal-ink mb-1.5">
            WELCOME BACK
          </h1>
          <p className="font-mono text-xs text-garden-deep-green dark:text-terminal-mint">
            Sign in to access your Wyntrix Security Lab
          </p>
        </div>

        {/* Error / Alert Message Banner */}
        {errorMsg && (
          <div
            className="mb-4 p-3 border-2 border-garden-danger bg-garden-danger/10 text-garden-danger dark:text-red-400 font-mono text-xs font-semibold flex items-center gap-2"
            role="alert"
          >
            <span>❌</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Big Retro LED Matrix Lockout View */}
        {isLocked ? (
          <LedCountdown
            initialSeconds={lockoutSeconds}
            onFinish={handleLockoutFinished}
          />
        ) : (
          /* Normal Login Form */
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block font-mono text-xs font-bold uppercase mb-1.5 text-garden-ink dark:text-terminal-ink"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-garden-deep-green dark:text-terminal-mint">
                  <PixelUserIcon className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  disabled={isSubmitting}
                  value={username}
                  onChange={handleUsernameChange}
                  onFocus={handleFocusUsername}
                  onBlur={handleBlur}
                  placeholder="cyber_guardian"
                  className="w-full pl-9 pr-3 py-2.5 font-mono text-sm bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border text-garden-ink dark:text-terminal-ink placeholder:text-garden-ink/40 dark:placeholder:text-terminal-ink/40 focus:bg-white dark:focus:bg-[#1C2C24] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="password"
                  className="block font-mono text-xs font-bold uppercase text-garden-ink dark:text-terminal-ink"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-mono text-[11px] text-garden-deep-green dark:text-terminal-mint underline hover:text-garden-orange"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-garden-deep-green dark:text-terminal-mint">
                  <PixelLockIcon className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={handleFocusPassword}
                  onBlur={handleBlur}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 font-mono text-sm bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border text-garden-ink dark:text-terminal-ink placeholder:text-garden-ink/40 dark:placeholder:text-terminal-ink/40 focus:bg-white dark:focus:bg-[#1C2C24] transition-colors"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-garden-ink/70 dark:text-terminal-ink/70 hover:text-garden-ink dark:hover:text-terminal-ink"
                >
                  <PixelEyeIcon open={showPassword} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-none accent-garden-deep-green border-2 border-garden-ink dark:border-terminal-border cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="font-mono text-xs text-garden-ink/80 dark:text-terminal-ink/80 cursor-pointer select-none"
              >
                Remember me for 7 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="pixel-btn w-full py-3 bg-garden-green dark:bg-terminal-deep-mint text-garden-panel font-pixel text-lg font-bold tracking-wider hover:bg-garden-deep-green dark:hover:bg-terminal-mint dark:hover:text-terminal-bg mt-2"
            >
              {isSubmitting ? 'VERIFYING...' : 'LOGIN'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-garden-ink/20 dark:border-terminal-border/20" />
          </div>
          <span className="relative px-3 bg-garden-panel dark:bg-terminal-panel font-mono text-xs font-bold text-garden-ink/60 dark:text-terminal-ink/60">
            OR
          </span>
        </div>

        {/* Create Account Link */}
        <Link
          href="/register"
          className="pixel-btn block w-full text-center py-2.5 bg-garden-cream dark:bg-terminal-bg text-garden-ink dark:text-terminal-ink font-mono text-xs font-bold uppercase tracking-wider hover:bg-white dark:hover:bg-[#1E3027]"
        >
          CREATE NEW ACCOUNT
        </Link>

        {/* Card Footer Tagline */}
        <div className="mt-6 pt-4 text-center border-t border-garden-ink/10 dark:border-terminal-border/10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-garden-deep-green dark:text-terminal-mint font-semibold">
            🛡️ Your security is our priority
          </p>
        </div>
      </div>

      {/* Forgot Password Educational Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="pixel-card p-6 max-w-md w-full bg-garden-panel dark:bg-terminal-panel animate-in fade-in">
            <h3 className="font-pixel text-xl text-garden-ink dark:text-terminal-ink mb-2">
              PASSWORD RESET NOTICE
            </h3>
            <p className="font-mono text-xs text-garden-ink/80 dark:text-terminal-ink/80 leading-relaxed mb-4">
              Self-service password resets are intentionally disabled in this internship demo to prevent unauthorized account takeover vulnerabilities.
              <br /><br />
              💡 <em>Tip: You can quickly register a fresh account via the &quot;Create New Account&quot; portal with any strong password!</em>
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="pixel-btn w-full py-2 bg-garden-green dark:bg-terminal-mint text-white dark:text-terminal-bg font-mono text-xs font-bold"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
