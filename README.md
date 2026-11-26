# 🛡️ WYNTRIX "PIXEL GUARD"
### Password Strength Analyzer & Security Awareness Portal
**Cyber Security Internship Project for Wyntrix Innovation OPC Pvt Ltd**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Pixel_Art-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Argon2id](https://img.shields.io/badge/Crypto-Argon2id-green)](https://github.com/P-H-C/phc-winner-argon2)
[![Vitest](https://img.shields.io/badge/Tests-45_Passed-brightgreen)](https://vitest.dev/)

---

## 📌 Executive Summary

**WYNTRIX PIXEL GUARD** is an interactive, gamified Cyber Security Portal combining an authentic 1980s 8-bit aesthetic with an enterprise-grade password evaluation engine. 

Designed for **Wyntrix Innovation OPC Pvt Ltd**, the portal features **Byte**, an adorable Shiba pup mascot rendered in real time on an HTML Canvas (zero external image assets) who reacts dynamically to password entropy, common dictionary matches, credential exposure, and authentication attempts.

---

## ✨ Key Features

- **🎮 Reactive Mascot Engine ("Byte the Shiba Pup")**:
  - Custom HTML Canvas pixel renderer (32x32 layered sprites, integer scale 8x-10x).
  - 20 distinct emotional and operational states (thinking, processing, peeking paws, detective hat, angry steam puffs, dizzy lockout, party hat confetti).
  - Living idle behaviors: blinks every 3-5s, ear twitches, tail wags, yawns, and falls asleep after 30s of inactivity.
- **⚡ Dual Analysis Engine**:
  - Pure framework-free TypeScript engine (`src/lib/analyzer/index.ts`) running both in browser (instant 120ms debounced feedback) and server-side (authoritative registration check).
  - **10-Stage Pipeline**: Shannon entropy, character pool evaluation, SecLists 10,000 common passwords lookup, leetspeak undo normalizer, trailing symbol stripping, pattern penalties (keyboard walks, repeats, sequences, years, username/brand inclusion), and crack time estimation.
- **🏰 Enterprise Authentication Security**:
  - Password hashing via memory-hard **Argon2id** (`@node-rs/argon2`, fallback to bcryptjs).
  - Constant-time dummy verification defense against user enumeration timing attacks.
  - Progressive exponential lockout (30s, 60s, 120s...) with big blocky **LED Matrix Countdown** & animated pixel hourglass.
  - Signed JWT session cookie (`jose`) with `HttpOnly`, `SameSite=Lax`, and `Secure` flags.
  - In-memory sliding-window IP rate limiting (20 req/min).
  - Client-side **k-Anonymity SHA-1 Breach Check** (Have I Been Pwned proxy with zero credential exposure).
- **📊 Comprehensive Audit Reports**:
  - One-click export in **PDF** (via `jsPDF`), **TXT**, and **JSON** with executive metrics, policy checks, detected vulnerabilities, and security advice.
  - Plaintext password is **never stored or exported** (length only).
- **🎨 Retro Design System**:
  - **Pixel Garden** (Light theme default) & **Night Terminal** (Dark theme).
  - 8-bit sound effects synthesized programmatically with WebAudio API (no audio files).
  - Full keyboard accessibility and reduced-motion compliance.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Server components, API routes, middleware |
| **Language** | TypeScript (Strict) | End-to-end type safety |
| **Styling** | Tailwind CSS | Pixelated borders, stepped shadows, retro layout |
| **Canvas Engine** | Pure HTML5 Canvas | 32x32 layered sprite compositing & particles |
| **Database** | SQLite + Prisma ORM | User accounts, failed attempts, lockout tracking |
| **Hashing** | `@node-rs/argon2` | Argon2id memory-hard password encryption |
| **Sessions** | `jose` | Signed JWT session tokens in HttpOnly cookies |
| **Validation** | Zod | Strict schema validation |
| **Reports** | `jsPDF` | Client-side branded security assessment PDFs |
| **Testing** | Vitest | 45 unit tests covering analyzer & policy rules |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24 supported)
- **npm** or **pnpm**

### 2. Installation & Setup
```bash
# Clone or navigate to the repository
cd Wyntrix_pass

# Install dependencies (automatically runs prisma generate)
npm install

# Initialize local SQLite database schema
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Available Application Routes
- `/login` - Welcome portal with reactive Byte mascot and lockout countdown.
- `/register` - Account registration with real-time strength meter, policy checklist, and passphrase generator.
- `/lab` - Authenticated Password Lab for testing arbitrary credentials and downloading audit reports.
- `/pet-lab` - Interactive dev preview suite for testing all 20 mascot states and particle effects.

---

## 🧪 Running Unit Tests

Run the full Vitest suite covering 45 test scenarios:
```bash
npm test
```

To run in watch mode:
```bash
npm run test:watch
```

---

## 📁 Project Structure

```
Wyntrix_pass/
├── prisma/
│   ├── dev.db                      # Local SQLite database
│   └── schema.prisma               # Prisma User schema
├── public/
│   ├── icon.svg                    # Pixel-crisp Wyntrix favicon
│   └── reference/                  # Design reference assets & official logo
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Login portal with reaction map & LED lockout
│   │   │   └── register/page.tsx   # Register portal with live meter & passphrase gen
│   │   ├── api/
│   │   │   ├── auth/               # register, login, logout, me, username-available
│   │   │   └── breach-check/       # HIBP k-anonymity range API proxy
│   │   ├── lab/page.tsx            # Authenticated Password Lab & report downloader
│   │   ├── pet-lab/page.tsx        # Dev mascot test bench for all 20 states
│   │   ├── globals.css             # Retro pixel tokens, dither backgrounds
│   │   └── layout.tsx              # Root layout with Pixelify Sans & Space Mono
│   ├── components/
│   │   ├── layout/AppShell.tsx     # 25/75 Split layout shell
│   │   ├── mascot/                 # Canvas engine, sprites, palette, particles, FSM
│   │   ├── theme/ThemeProvider.tsx # Pixel Garden & Night Terminal theme context
│   │   └── ui/                     # PixelIcons, WyntrixLogo, StrengthMeter, LedCountdown
│   ├── data/
│   │   ├── awareness-tips.json     # 32 Cyber security tips tagged by topic
│   │   ├── common-passwords.txt    # SecLists 10,000 common passwords corpus
│   │   └── wordlist.json           # 2,048 friendly words for passphrase generator
│   ├── lib/
│   │   ├── analyzer/               # 10-stage password strength analysis engine
│   │   ├── audio/sound.ts          # Pure WebAudio 8-bit sound effects synthesizer
│   │   ├── auth/                   # Argon2id hashing, JWT sessions, lockout, rate limiting
│   │   └── report/generateReport.ts# PDF, TXT, and JSON security assessment generator
│   └── middleware.ts               # Next.js JWT route protection for /lab
├── tests/
│   └── analyzer.test.ts            # 45 Vitest unit tests
└── docs/
    ├── ARCHITECTURE.md             # Data flow diagram and threat model
    ├── SCORING.md                  # Scoring formulas, penalties, 5 worked examples
    ├── SECURITY.md                 # Security whitepaper, Argon2id, NIST/OWASP alignment
    └── DEMO-SCRIPT.md              # 3-minute live presentation walkthrough
```

---

## 📜 Documentation & References

- [System Architecture & Data Flow](file:///d:/internship%202.0/Wyntrix_pass/docs/ARCHITECTURE.md)
- [Scoring, Penalties & Worked Examples](file:///d:/internship%202.0/Wyntrix_pass/docs/SCORING.md)
- [Security Whitepaper & Compliance](file:///d:/internship%202.0/Wyntrix_pass/docs/SECURITY.md)
- [3-Minute Live Demo Script](file:///d:/internship%202.0/Wyntrix_pass/docs/DEMO-SCRIPT.md)

---

## 🏢 Organization & License

Developed for **Wyntrix Innovation OPC Pvt Ltd**  
*Brief: "Password Strength Analyzer & Security Awareness Tool"*  
*Tagline: "Secure today, safer tomorrow."*
