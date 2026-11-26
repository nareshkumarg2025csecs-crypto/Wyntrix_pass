# Wyntrix Pixel Guard - System Architecture & Data Flow

This document details the complete end-to-end architecture of **WYNTRIX PIXEL GUARD**, an enterprise-grade Password Strength Analyzer and Cyber Security Awareness Portal built for **Wyntrix Innovation OPC Pvt Ltd**.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Client Browser (Next.js 14 / React 18)"]
        UI["UI Layer: /login, /register, /lab"]
        Mascot["Mascot Engine (Byte the Shiba Pup)<br/>HTML Canvas (32x32 Layered Sprites)"]
        ClientAnalyzer["Pure TypeScript Analyzer Engine<br/>(Debounced 120ms / Memoized)"]
        Audio["WebAudio 8-Bit Synthesizer (SoundSystem)"]
        SHA1["Web Crypto API: SHA-1 Prefix (5 Hex chars)"]
        Reports["Report Generator (jsPDF, TXT, JSON)"]
    end

    subgraph Server["Next.js Backend (Node.js API Route Handlers)"]
        MW["Middleware (JWT Session Validation)"]
        RateLimit["In-Memory Rate Limiter (20 req/min/IP)"]
        AuthRoutes["Auth Endpoints:<br/>/api/auth/register<br/>/api/auth/login<br/>/api/auth/logout<br/>/api/auth/me<br/>/api/auth/username-available"]
        ServerAnalyzer["Authoritative Server-Side Analyzer Engine"]
        BreachProxy["HIBP k-Anonymity Proxy<br/>(/api/breach-check)"]
        LockoutEngine["Exponential Backoff Lockout Controller"]
        CryptoService["Password Hashing: Argon2id (bcrypt fallback)"]
    end

    subgraph Storage["Persistent Database"]
        DB[(SQLite Local File DB: dev.db)]
        PrismaClient["Prisma ORM Client"]
    end

    subgraph External["External Services (Zero-Exposure)"]
        HIBP["Have I Been Pwned Range API<br/>(k-Anonymity Range Search)"]
    end

    %% Client Internal Connections
    UI -->|User Keystrokes| ClientAnalyzer
    ClientAnalyzer -->|Strength Tier 0-4| Mascot
    ClientAnalyzer -->|Meter & Findings| UI
    UI -->|SFX Triggers| Audio
    UI -->|Generate PDF/TXT/JSON| Reports
    UI -->|Compute Hash Prefix| SHA1

    %% Client-Server Connections
    UI -->|HTTP Requests| MW
    MW --> AuthRoutes
    SHA1 -->|Send 5-char Prefix only| BreachProxy
    BreachProxy -->|Range Query + Padding| HIBP

    %% Server Internal Connections
    AuthRoutes --> RateLimit
    AuthRoutes --> ServerAnalyzer
    AuthRoutes --> LockoutEngine
    AuthRoutes --> CryptoService
    CryptoService --> PrismaClient
    LockoutEngine --> PrismaClient
    PrismaClient --> DB
```

---

## 2. Dual-Engine Analysis Pipeline

To achieve instant keystroke feedback while guaranteeing authoritative security compliance, the Password Analysis Engine is written as a pure, dependency-free TypeScript module located at `src/lib/analyzer/index.ts`.

### Browser Flow (Live Feedback):
1. **Debounce (120ms)**: User keystrokes are debounced to prevent excessive rendering.
2. **Synchronous Analysis**: Complexity checks, character pool entropy, pattern checks, and SecLists dictionary matches execute in <1ms.
3. **Mascot Reactivity**: The resulting score and tier immediately drive Byte's finite state machine (`TIER_0` to `TIER_4`).
4. **k-Anonymity Breach Check**: In parallel, the browser hashes the password with `crypto.subtle.digest('SHA-1')`, extracts the first 5 hexadecimal characters, and queries `/api/breach-check`. The full password never leaves the machine.

### Server Flow (Authoritative Registration):
1. When a user submits `/api/auth/register`, the backend executes the **identical** `analyze()` function.
2. If client-side code was tampered with or bypassed, the server independently rejects passwords with `tier < 2`, dictionary entries, or username inclusion.
3. Once validated, credentials are encrypted using **Argon2id** (`m=19456, t=2, p=1`) and saved into SQLite.

---

## 3. Threat Model & Countermeasures

| Attack Vector | Threat Scenario | Implemented Mitigation |
| :--- | :--- | :--- |
| **Brute Force / Credential Stuffing** | Rapid automated password guessing | • In-memory sliding-window IP rate limiting (20 req/min).<br/>• Progressive exponential lockout (30s, 60s, 120s...) recorded in SQLite.<br/>• Retro blocky LED countdown view. |
| **Timing Attacks / User Enumeration** | Measuring execution time differences to discover registered usernames | Precomputed **Argon2id dummy verification** equalizes CPU execution time when a non-existent username is submitted. |
| **Dictionary & Leetspeak Attacks** | Using common wordlists with substitutions (e.g. `P@ssw0rd123!`) | 10,000 SecLists corpus Set lookup with automated leetspeak reverser and trailing symbol stripper. |
| **Hash Cracking (GPU Clusters)** | High-speed offline cracking of leaked database hashes | Industry-standard **Argon2id** with memory-hard parameters (19 MiB memory cost) resisting GPU/ASIC parallelization. |
| **Data Exposure in Audit Reports** | Plaintext credentials leaking via exported files | Strict NIST zero-exposure principle: PDF, TXT, and JSON reports display character length only, never the plaintext password. |

---

## 4. Database Schema

The database is managed with **Prisma** on **SQLite** (`prisma/schema.prisma`):

```prisma
model User {
  id             String    @id @default(cuid())
  username       String    @unique
  passwordHash   String
  createdAt      DateTime  @default(now())
  lastLoginAt    DateTime?
  failedAttempts Int       @default(0)
  lockedUntil    DateTime?
}
```
