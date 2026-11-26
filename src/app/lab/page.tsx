'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PixelLockIcon, PixelEyeIcon, PixelCheckIcon, PixelCrossIcon } from '@/components/ui/PixelIcons';
import { StrengthMeter } from '@/components/ui/StrengthMeter';
import { analyze } from '@/lib/analyzer';
import { AnalysisResult, SecurityTip } from '@/lib/analyzer/types';
import { MascotState } from '@/components/mascot/types';
import { downloadPdfReport, downloadTxtReport, downloadJsonReport } from '@/lib/report/generateReport';
import { sound } from '@/lib/audio/sound';
import tipsData from '@/data/awareness-tips.json';
import wordlistData from '@/data/wordlist.json';

export default function LabPage() {
  const router = useRouter();

  // User session state
  const [currentUser, setCurrentUser] = useState<string>('Sentinel');
  const [password, setPassword] = useState<string>('CyberShield2026!#');
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Mascot dynamic states
  const [mascotState, setMascotState] = useState<MascotState>('TIER_3');
  const [speech, setSpeech] = useState<string>(
    'Welcome to the Security Lab! Test any password or generate audit reports.'
  );
  const [statusChip, setStatusChip] = useState<string>('Security Lab Online');

  // Tip Carousel state
  const allTips = tipsData as SecurityTip[];
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  // Fetch logged in user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.username) {
          setCurrentUser(data.user.username);
        }
      })
      .catch(() => {});
  }, []);

  // Real-time analysis for the lab input
  useEffect(() => {
    if (!password) {
      setAnalysis(null);
      setMascotState('IDLE');
      setSpeech('Type or paste any password to audit its cryptographic strength.');
      setStatusChip('Lab Ready');
      return;
    }

    const res = analyze(password, { username: currentUser });
    setAnalysis(res);

    // Map tier to mascot state
    const tierStates: MascotState[] = ['TIER_0', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_4'];
    setMascotState(tierStates[res.tier] || 'IDLE');

    const tierSpeeches = [
      'Warning: This password is easily cracked by dictionary tools!',
      'Try better: Add variety and avoid common patterns.',
      'Good! Decent complexity. Push it further for maximum armor.',
      'WOW! High entropy detected. Bots are struggling!',
      'STRONGEST! Exceptional cryptographic resilience!',
    ];
    setSpeech(tierSpeeches[res.tier] || tierSpeeches[0]);
    setStatusChip(`AUDIT: TIER ${res.tier} [${res.tierLabel}]`);
  }, [password, currentUser]);

  const handleLogout = async () => {
    sound.playButton();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

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

    const gen = chosen.join(' ');
    setPassword(gen);
    setShowPassword(true);
    setMascotState('EXCITED');
    setSpeech('Passphrase generated! Notice how the 4 random words maximize entropy.');
  };

  // Filtered tips for carousel
  const filteredTips =
    selectedTopic === 'ALL'
      ? allTips
      : allTips.filter((t) => t.topic.toLowerCase() === selectedTopic.toLowerCase());

  const currentTip = filteredTips[tipIndex % filteredTips.length] || allTips[0];

  const handleNextTip = () => {
    sound.playButton();
    setTipIndex((prev) => (prev + 1) % filteredTips.length);
  };

  const handlePrevTip = () => {
    sound.playButton();
    setTipIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
  };

  return (
    <AppShell
      twoColumn={true}
      speech={speech}
      statusChip={statusChip}
      tier={analysis?.tier ?? 2}
      mascotState={mascotState}
    >
      {/* COLUMN 1: Live Interactive Analyzer & Reports */}
      <div className="pixel-card p-6 sm:p-8 space-y-6">
        {/* Lab Top Bar */}
        <div className="flex justify-between items-center border-b-2 border-garden-ink/15 dark:border-terminal-border/15 pb-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-garden-deep-green dark:text-terminal-mint">
              WYNTRIX SECURITY AUDITOR
            </span>
            <h1 className="font-pixel text-2xl sm:text-3xl text-garden-ink dark:text-terminal-ink">
              PASSWORD LAB
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 bg-garden-cream dark:bg-terminal-bg border border-garden-ink dark:border-terminal-border font-bold">
              👤 {currentUser}
            </span>
            <button
              onClick={handleLogout}
              className="pixel-btn px-2.5 py-1 bg-garden-danger/10 hover:bg-garden-danger text-garden-danger hover:text-white dark:hover:text-white font-mono text-xs font-bold"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Input Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="labPassword"
              className="block font-mono text-xs font-bold uppercase text-garden-ink dark:text-terminal-ink"
            >
              Test Password / Credential
            </label>
            <button
              type="button"
              onClick={handleGeneratePassphrase}
              className="font-mono text-[11px] text-garden-orange hover:underline font-bold"
            >
              ⚡ Passphrase Gen
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-garden-deep-green dark:text-terminal-mint">
              <PixelLockIcon className="w-4 h-4" />
            </div>
            <input
              id="labPassword"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                sound.playKeypress();
              }}
              placeholder="Enter password to audit..."
              className="w-full pl-9 pr-12 py-3 font-mono text-sm bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border text-garden-ink dark:text-terminal-ink focus:bg-white dark:focus:bg-[#1C2C24] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-garden-ink/70 dark:text-terminal-ink/70 hover:text-garden-ink dark:hover:text-terminal-ink"
            >
              <PixelEyeIcon open={showPassword} className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-[10px] text-garden-ink/60 dark:text-terminal-ink/60 mt-1">
            🔒 Zero-exposure sandbox: Tested entirely on your machine; never transmitted.
          </p>
        </div>

        {/* Visual Strength Meter */}
        <StrengthMeter analysis={analysis} />

        {/* Deep Entropy & Physics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="pixel-card-sm p-3 bg-garden-cream/60 dark:bg-terminal-bg/60">
            <span className="font-mono text-[10px] uppercase text-garden-ink/60 dark:text-terminal-ink/60 block">
              Shannon Entropy
            </span>
            <span className="font-mono text-sm font-bold text-garden-deep-green dark:text-terminal-mint">
              {analysis?.entropyBits.effective ?? 0} bits
            </span>
            <span className="font-mono text-[10px] text-garden-ink/50 dark:text-terminal-ink/50 block">
              Raw: {analysis?.entropyBits.raw ?? 0} bits
            </span>
          </div>

          <div className="pixel-card-sm p-3 bg-garden-cream/60 dark:bg-terminal-bg/60">
            <span className="font-mono text-[10px] uppercase text-garden-ink/60 dark:text-terminal-ink/60 block">
              Online Guessing
            </span>
            <span className="font-mono text-sm font-bold text-garden-ink dark:text-terminal-ink">
              {analysis?.crackTime.onlineThrottled ?? 'Instant'}
            </span>
            <span className="font-mono text-[10px] text-garden-ink/50 dark:text-terminal-ink/50 block">
              At 100 attempts / hour
            </span>
          </div>
        </div>

        {/* Report Download Action Bar */}
        <div className="pt-4 border-t-2 border-garden-ink/15 dark:border-terminal-border/15">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-garden-ink/70 dark:text-terminal-ink/70 block mb-2">
            EXPORT AUDIT ASSESSMENT:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                sound.playButton();
                if (analysis) downloadPdfReport(analysis, password.length, currentUser);
              }}
              className="pixel-btn py-2 px-2 bg-garden-green dark:bg-terminal-deep-mint text-white dark:text-terminal-bg font-pixel text-xs font-bold text-center"
            >
              📄 PDF REPORT
            </button>
            <button
              onClick={() => {
                sound.playButton();
                if (analysis) downloadTxtReport(analysis, password.length, currentUser);
              }}
              className="pixel-btn py-2 px-2 bg-garden-panel dark:bg-terminal-panel text-garden-ink dark:text-terminal-ink font-mono text-xs font-bold text-center"
            >
              📝 TXT REPORT
            </button>
            <button
              onClick={() => {
                sound.playButton();
                if (analysis) downloadJsonReport(analysis, password.length, currentUser);
              }}
              className="pixel-btn py-2 px-2 bg-garden-cream dark:bg-terminal-bg text-garden-ink dark:text-terminal-ink font-mono text-xs font-bold text-center"
            >
              💾 JSON DATA
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Policy, Findings & Security Awareness Carousel */}
      <div className="space-y-6">
        {/* Policy Verification & Detected Patterns */}
        <div className="pixel-card p-6 sm:p-8 space-y-4">
          <h2 className="font-pixel text-xl text-garden-ink dark:text-terminal-ink">
            INSPECTOR FINDINGS
          </h2>

          {/* Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {analysis?.checks.map((chk) => (
              <div
                key={chk.id}
                className="flex items-center justify-between p-2 bg-garden-cream/60 dark:bg-terminal-bg/60 border border-garden-ink/20 dark:border-terminal-border/20"
              >
                <span className="line-clamp-1">{chk.label}</span>
                {chk.passed ? (
                  <span className="text-garden-deep-green dark:text-terminal-mint font-bold flex items-center gap-0.5">
                    <PixelCheckIcon className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="text-garden-danger dark:text-red-400 font-bold flex items-center gap-0.5">
                    <PixelCrossIcon className="w-3 h-3" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Detected Patterns */}
          {analysis && analysis.findings.length > 0 ? (
            <div className="pt-2">
              <span className="font-mono text-[10px] font-bold uppercase text-garden-danger dark:text-red-400 block mb-1">
                Detected Pattern Penalties:
              </span>
              <div className="space-y-1.5">
                {analysis.findings.map((f) => (
                  <div
                    key={f.id}
                    className="p-2 border border-garden-danger/30 bg-garden-danger/5 text-garden-ink dark:text-terminal-ink font-mono text-[11px]"
                  >
                    <strong>{f.label} (-{f.penalty} bits):</strong> {f.description}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-garden-green/10 border border-garden-green text-garden-deep-green dark:text-terminal-mint font-mono text-xs">
              ✓ No predictable dictionary or keyboard walk patterns detected.
            </div>
          )}
        </div>

        {/* Security Awareness Tips Carousel */}
        <div className="pixel-card p-6 sm:p-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-pixel text-lg text-garden-ink dark:text-terminal-ink">
              🛡️ SECURITY AWARENESS TIPS
            </h3>
            <div className="flex items-center gap-1 font-mono text-xs">
              <button
                onClick={handlePrevTip}
                className="pixel-btn px-2 py-0.5 bg-garden-cream dark:bg-terminal-bg"
                aria-label="Previous security tip"
              >
                ◀
              </button>
              <span className="px-1 text-[11px]">
                {(tipIndex % filteredTips.length) + 1}/{filteredTips.length}
              </span>
              <button
                onClick={handleNextTip}
                className="pixel-btn px-2 py-0.5 bg-garden-cream dark:bg-terminal-bg"
                aria-label="Next security tip"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Topic Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            {['ALL', 'passphrases', 'mfa', 'password_reuse', 'phishing', 'breaches'].map((top) => (
              <button
                key={top}
                onClick={() => {
                  setSelectedTopic(top);
                  setTipIndex(0);
                  sound.playButton();
                }}
                className={`px-2 py-0.5 border ${
                  selectedTopic === top
                    ? 'bg-garden-orange text-garden-ink font-bold border-garden-ink'
                    : 'bg-garden-cream/60 dark:bg-terminal-bg/60 border-garden-ink/20 dark:border-terminal-border/20'
                }`}
              >
                {top.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active Tip Card */}
          <div className="p-4 bg-garden-cream dark:bg-terminal-bg border-2 border-garden-ink dark:border-terminal-border shadow-pixel-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="font-pixel text-xs text-garden-deep-green dark:text-terminal-mint font-bold uppercase">
                [{currentTip.topic}]
              </span>
              <span className="font-mono text-xs font-bold text-garden-ink dark:text-terminal-ink">
                {currentTip.title}
              </span>
            </div>
            <p className="font-mono text-xs text-garden-ink/80 dark:text-terminal-ink/80 leading-relaxed">
              {currentTip.content}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
