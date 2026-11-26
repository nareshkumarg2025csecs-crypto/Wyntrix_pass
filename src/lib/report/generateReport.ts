// Comprehensive Security Report Generator (PDF, TXT, JSON)
// Complies with strict privacy requirement: NEVER includes the plaintext password (only its length).

import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../analyzer/types';

function createReportId(): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WYN-SEC-${rand}`;
}

export function downloadJsonReport(
  analysis: AnalysisResult,
  passwordLength: number,
  username = 'agent'
) {
  const report = {
    reportId: createReportId(),
    generatedAt: new Date().toISOString(),
    assessedBy: username,
    credentialMetadata: {
      length: passwordLength,
      note: 'Plaintext password intentionally redacted in accordance with NIST zero-exposure policy.',
    },
    assessment: {
      tier: analysis.tier,
      tierLabel: analysis.tierLabel,
      score: analysis.score,
      entropy: analysis.entropyBits,
      crackTime: analysis.crackTime,
      checks: analysis.checks,
      findings: analysis.findings,
      recommendations: analysis.recommendations,
      securityTips: analysis.tips,
    },
    organization: 'Wyntrix Innovation OPC Pvt Ltd',
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Wyntrix_Security_Report_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTxtReport(
  analysis: AnalysisResult,
  passwordLength: number,
  username = 'agent'
) {
  const reportId = createReportId();
  const dateStr = new Date().toLocaleString();

  const lines: string[] = [
    '========================================================================',
    '       WYNTRIX PIXEL GUARD - PASSWORD SECURITY ASSESSMENT REPORT       ',
    '              Wyntrix Innovation OPC Pvt Ltd - Cyber Security          ',
    '========================================================================',
    `Report ID   : ${reportId}`,
    `Assessed By : ${username}`,
    `Timestamp   : ${dateStr}`,
    `Password Len: ${passwordLength} characters [PLAINTEXT REDACTED FOR PRIVACY]`,
    '------------------------------------------------------------------------',
    'EXECUTIVE METRICS:',
    `  • Strength Tier   : Tier ${analysis.tier} [${analysis.tierLabel}]`,
    `  • Security Score  : ${analysis.score} / 100`,
    `  • Raw Entropy     : ${analysis.entropyBits.raw} bits`,
    `  • Effective Bits  : ${analysis.entropyBits.effective} bits`,
    `  • Online Crack    : ${analysis.crackTime.onlineThrottled} (100 attempts/hr)`,
    `  • Offline Crack   : ${analysis.crackTime.offlineFastHash} (10B guesses/sec GPU)`,
    '------------------------------------------------------------------------',
    'POLICY COMPLEXITY CHECKS:',
    ...analysis.checks.map(
      (c) => `  [${c.passed ? 'PASS' : 'FAIL'}] ${c.label}`
    ),
    '------------------------------------------------------------------------',
    'DETECTED VULNERABILITIES & PATTERNS:',
    analysis.findings.length > 0
      ? analysis.findings
          .map((f) => `  - ${f.label} (-${f.penalty} bits): ${f.description}`)
          .join('\n')
      : '  None detected. Credential exhibits high structural randomness.',
    '------------------------------------------------------------------------',
    'PRIORITY RECOMMENDATIONS:',
    ...analysis.recommendations.map((r, i) => `  ${i + 1}. ${r}`),
    '------------------------------------------------------------------------',
    'SECURITY AWARENESS ADVICE:',
    ...analysis.tips.map((t) => `  * ${t.title}: ${t.content}`),
    '========================================================================',
    '      Wyntrix Innovation OPC Pvt Ltd - Confidential Security Audit      ',
    '========================================================================',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Wyntrix_Security_Report_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPdfReport(
  analysis: AnalysisResult,
  passwordLength: number,
  username = 'agent'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const reportId = createReportId();
  const dateStr = new Date().toLocaleString();

  // Top header banner (Dark green #16221D)
  doc.setFillColor(22, 34, 29);
  doc.rect(0, 0, 210, 28, 'F');

  // Wyntrix Title
  doc.setTextColor(255, 253, 246);
  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.text('WYNTRIX PIXEL GUARD', 14, 12);

  doc.setFontSize(9);
  doc.setTextColor(127, 209, 160);
  doc.text('PASSWORD AUDIT & SECURITY ASSESSMENT REPORT', 14, 18);
  doc.text('Wyntrix Innovation OPC Pvt Ltd', 14, 23);

  // Metadata block
  doc.setTextColor(27, 31, 26);
  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.text(`Report ID   : ${reportId}`, 14, 36);
  doc.text(`Audited By  : ${username}`, 14, 41);
  doc.text(`Timestamp   : ${dateStr}`, 14, 46);
  doc.text(`Target Cred : ${passwordLength} characters (Plaintext securely redacted)`, 14, 51);

  // Horizontal divider
  doc.setDrawColor(91, 154, 115);
  doc.setLineWidth(0.5);
  doc.line(14, 55, 196, 55);

  // Executive Score Box
  doc.setFillColor(251, 246, 234);
  doc.rect(14, 58, 182, 30, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(47, 107, 79);
  doc.text('SECURITY SCORE & ENTROPY SUMMARY', 18, 65);

  doc.setFontSize(10);
  doc.setTextColor(27, 31, 26);
  doc.text(`Strength Tier : Tier ${analysis.tier} [${analysis.tierLabel}]`, 18, 72);
  doc.text(`Audit Score   : ${analysis.score} / 100`, 18, 78);
  doc.text(`Effective Ent : ${analysis.entropyBits.effective} bits (Raw: ${analysis.entropyBits.raw})`, 18, 84);

  doc.text(`Online Crack  : ${analysis.crackTime.onlineThrottled}`, 110, 72);
  doc.text(`Offline GPU   : ${analysis.crackTime.offlineFastHash}`, 110, 78);

  // Policy Verification
  let y = 96;
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(47, 107, 79);
  doc.text('POLICY COMPLEXITY VERIFICATION', 14, y);
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  analysis.checks.forEach((chk) => {
    if (chk.passed) {
      doc.setTextColor(47, 107, 79);
      doc.text(`[PASS] ${chk.label}`, 16, y);
    } else {
      doc.setTextColor(217, 95, 95);
      doc.text(`[FAIL] ${chk.label}`, 16, y);
    }
    y += 4.5;
  });

  // Detected Patterns
  y += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(47, 107, 79);
  doc.text('DETECTED PATTERNS & VULNERABILITIES', 14, y);
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(27, 31, 26);
  if (analysis.findings.length === 0) {
    doc.text('• No predictable patterns detected (No keyboard walks, repeats, or dates).', 16, y);
    y += 5;
  } else {
    analysis.findings.forEach((f) => {
      doc.text(`• ${f.label} (-${f.penalty} bits): ${f.description}`, 16, y);
      y += 5;
    });
  }

  // Priority Recommendations
  y += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(47, 107, 79);
  doc.text('PRIORITY RECOMMENDATIONS', 14, y);
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(27, 31, 26);
  analysis.recommendations.slice(0, 4).forEach((rec, i) => {
    doc.text(`${i + 1}. ${rec}`, 16, y);
    y += 5;
  });

  // Awareness Tips
  y += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(47, 107, 79);
  doc.text('SECURITY AWARENESS TIPS', 14, y);
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(27, 31, 26);
  analysis.tips.slice(0, 2).forEach((tip) => {
    doc.setFont('courier', 'bold');
    doc.text(`* ${tip.title}:`, 16, y);
    y += 4;
    doc.setFont('courier', 'normal');
    const splitContent = doc.splitTextToSize(tip.content, 175);
    doc.text(splitContent, 18, y);
    y += splitContent.length * 3.8 + 2;
  });

  // Footer
  doc.setFillColor(22, 34, 29);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setTextColor(255, 253, 246);
  doc.setFontSize(7.5);
  doc.text(
    'CONFIDENTIAL - Wyntrix Innovation OPC Pvt Ltd - Password Strength Analyzer & Security Awareness Portal',
    14,
    292
  );

  doc.save(`Wyntrix_Security_Report_${Date.now()}.pdf`);
}
