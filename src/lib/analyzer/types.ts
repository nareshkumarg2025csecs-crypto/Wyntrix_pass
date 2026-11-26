// Analysis Engine Types
// Beginner-friendly definitions for all password security metrics

export type Severity = 'critical' | 'warning' | 'info';

export interface AnalysisCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: Severity;
  detail?: string;
}

export interface AnalysisFinding {
  id: string;
  label: string;
  penalty: number; // Entropy penalty in bits
  description: string;
}

export interface CrackTimeScenario {
  onlineThrottled: string;  // e.g. "400 years" at 100 guesses/hour
  offlineFastHash: string;  // e.g. "3 seconds" at 10 billion guesses/sec
  onlineSeconds: number;
  offlineSeconds: number;
}

export interface SecurityTip {
  id: string;
  topic: string;
  title: string;
  content: string;
}

export interface AnalysisResult {
  score: number;            // 0 - 100
  tier: number;             // 0 - 4
  tierLabel: 'SOOO WEAK' | 'TRY BETTER' | 'GOOD' | 'WOW' | 'STRONGEST';
  entropyBits: {
    raw: number;            // Length * log2(pool)
    effective: number;      // Raw minus pattern penalties
  };
  crackTime: CrackTimeScenario;
  checks: AnalysisCheck[];  // Complexity policy checklist
  findings: AnalysisFinding[]; // Detected vulnerabilities & patterns
  recommendations: string[]; // Ordered list of fix suggestions (max 4 in UI)
  tips: SecurityTip[];      // Contextually relevant awareness tips
  isCommon: boolean;
  isBreached?: boolean;
}
