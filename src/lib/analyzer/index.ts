// Master Password Analysis Engine
// Pure TypeScript, framework-free module used by both Browser (client) and Next.js (server).

import { AnalysisResult, SecurityTip } from './types';
import { checkComplexity } from './complexity';
import { calculateEntropy } from './entropy';
import { isCommonPassword } from './common';
import { detectPatterns } from './patterns';
import { estimateCrackTime } from './crackTime';
import { generateRecommendations } from './recommendations';
import tipsData from '@/data/awareness-tips.json';

// In-memory memoization cache for rapid keystroke evaluation
const analysisCache = new Map<string, AnalysisResult>();
const MAX_CACHE_SIZE = 250;

export function analyze(
  password: string,
  ctx?: { username?: string; isBreached?: boolean }
): AnalysisResult {
  const cacheKey = `${password}:::${ctx?.username || ''}:::${ctx?.isBreached || false}`;
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  // 1. Policy & Complexity Verification
  const { checks } = checkComplexity(password);

  // 2. Character Pool & Shannon Entropy
  const { poolSize, rawEntropy } = calculateEntropy(password);

  // 3. Common Password & Substring Detection
  const { isCommon, matchedReason } = isCommonPassword(password);

  // 4. Pattern & Vulnerability Detection
  const findings = detectPatterns(password, ctx);

  // If common, add to findings
  if (isCommon) {
    findings.unshift({
      id: 'common_password',
      label: 'Commonly Breached Password',
      penalty: 40,
      description: matchedReason || 'Matches high-risk dictionary breach lists.',
    });
  }

  // 5. Effective Entropy Calculation (Subtract penalties)
  let totalPenalty = 0;
  findings.forEach((f) => {
    totalPenalty += f.penalty;
  });

  const effectiveEntropy = Math.max(0, Math.round((rawEntropy - totalPenalty) * 10) / 10);

  // 6. Score Mapping (0 to 100)
  // 75+ bits of effective entropy yields score of 100
  let score = Math.min(100, Math.max(0, Math.round((effectiveEntropy / 75) * 100)));

  // Initial Tier assignment based on score
  let tier = 0;
  if (score >= 85) tier = 4;
  else if (score >= 65) tier = 3;
  else if (score >= 45) tier = 2;
  else if (score >= 20) tier = 1;
  else tier = 0;

  // --- HARD CAPS (Mandatory Security Policies) ---
  // A. Breached password hard cap -> Tier 0
  if (ctx?.isBreached) {
    tier = 0;
    score = Math.min(score, 10);
  }

  // B. Common password hard cap -> Tier 0
  if (isCommon) {
    tier = 0;
    score = Math.min(score, 15);
  }

  // C. Length under 8 hard cap -> Tier <= 1
  if (password.length < 8) {
    tier = Math.min(tier, 1);
    score = Math.min(score, 30);
  }

  // D. Contains username -> Tier <= 1
  const hasUsername = findings.some((f) => f.id === 'username_included');
  if (hasUsername) {
    tier = Math.min(tier, 1);
    score = Math.min(score, 35);
  }

  // Tier Label Mapping
  const tierLabels: Array<'SOOO WEAK' | 'TRY BETTER' | 'GOOD' | 'WOW' | 'STRONGEST'> = [
    'SOOO WEAK',
    'TRY BETTER',
    'GOOD',
    'WOW',
    'STRONGEST',
  ];
  const tierLabel = tierLabels[tier];

  // 7. Crack Time Estimation
  const crackTime = estimateCrackTime(effectiveEntropy);

  // 8. Friendly, prioritized fix recommendations
  const recommendations = generateRecommendations(
    checks,
    findings,
    isCommon,
    password.length
  );

  // 9. Contextual Security Tips Selection
  const allTips = tipsData as SecurityTip[];
  const selectedTips: SecurityTip[] = [];

  // Match tip to weakness
  if (isCommon) {
    const breachTip = allTips.find((t) => t.topic === 'breaches');
    if (breachTip) selectedTips.push(breachTip);
  } else if (findings.some((f) => f.id === 'keyboard_walk' || f.id === 'sequences')) {
    const complexTip = allTips.find((t) => t.topic === 'complexity');
    if (complexTip) selectedTips.push(complexTip);
  } else if (hasUsername) {
    const socialTip = allTips.find((t) => t.topic === 'social_engineering');
    if (socialTip) selectedTips.push(socialTip);
  }

  // Add passphrase and MFA tips
  const passphraseTip = allTips.find((t) => t.topic === 'passphrases');
  if (passphraseTip && !selectedTips.includes(passphraseTip)) {
    selectedTips.push(passphraseTip);
  }
  const mfaTip = allTips.find((t) => t.topic === 'mfa');
  if (mfaTip && !selectedTips.includes(mfaTip)) {
    selectedTips.push(mfaTip);
  }

  // Fill up to 3 tips with other tips
  for (const t of allTips) {
    if (selectedTips.length >= 3) break;
    if (!selectedTips.includes(t)) selectedTips.push(t);
  }

  const result: AnalysisResult = {
    score,
    tier,
    tierLabel,
    entropyBits: {
      raw: rawEntropy,
      effective: effectiveEntropy,
    },
    crackTime,
    checks,
    findings,
    recommendations,
    tips: selectedTips,
    isCommon,
    isBreached: ctx?.isBreached,
  };

  // Cache result
  if (analysisCache.size >= MAX_CACHE_SIZE) {
    const firstKey = analysisCache.keys().next().value;
    if (firstKey) analysisCache.delete(firstKey);
  }
  analysisCache.set(cacheKey, result);

  return result;
}
