# Wyntrix Pixel Guard - Password Scoring & Entropy Guide

This document explains the mathematical models, character pool calculations, pattern penalty deductions, and hard policy caps utilized by the **Wyntrix Pixel Guard Analysis Engine**.

---

## 1. Core Mathematical Foundation

### 1.1 Shannon Information Entropy
Password entropy represents the measure of unpredictability or uncertainty in bits:

$$\text{Entropy (bits)} = L \times \log_2(R)$$

Where:
- $L$ is the total length of the password.
- $R$ is the size of the character pool derived from the unique character classes present in the password.

### 1.2 Character Pool Sizes ($R$)

| Character Class | Set Size | Description |
| :--- | :---: | :--- |
| **Lowercase Letters** | 26 | `a` through `z` |
| **Uppercase Letters** | 26 | `A` through `Z` |
| **Numeric Digits** | 10 | `0` through `9` |
| **Symbols & Punctuation** | 33 | `!@#$%^&*()_+-=[]{}|;':",./<>?`~` |
| **Whitespace** | 1 | Space character (encouraged for passphrases) |
| **Extended Unicode / Emoji** | 100 | Emojis and international scripts |

If a password uses lowercase, numbers, and symbols, its total pool size is:
$$R = 26 + 10 + 33 = 69$$

---

## 2. Pattern Penalties (Entropy Deductions)

Predictable patterns severely reduce real-world cracking difficulty. The engine detects these patterns and deducts explicit bit penalties from the raw entropy to compute **Effective Entropy**:

$$\text{Effective Entropy} = \max(0, \text{Raw Entropy} - \sum \text{Penalties})$$

| Pattern ID | Penalty | Description & Examples |
| :--- | :---: | :--- |
| `REPEATED_CHARS` | **-8 bits** | 3 or more consecutive identical characters (e.g. `aaaa`, `1111`). |
| `REPEATED_CHUNKS` | **-12 bits** | Repeating syllables or word chunks (e.g. `abcabc`, `passpass`). |
| `SEQUENCES` | **-10 bits** | 4 or more sequential characters, ascending or descending (e.g. `1234`, `abcd`, `4321`). |
| `KEYBOARD_WALK` | **-14 bits** | Physical keyboard paths across rows or diagonals (e.g. `qwerty`, `asdfgh`, `1qaz2wsx`). |
| `YEAR_OR_DATE` | **-8 bits** | 4-digit calendar years between 1900 and 2099 (e.g. `1998`, `2024`). |
| `USERNAME_INCLUDED` | **-18 bits** | Password contains the active username or the brand name `"wyntrix"`. |
| `REVERSED_COMMON` | **-10 bits** | Reversed common dictionary words (e.g. `drowssap` for `password`). |
| `LEETSPEAK_USED` | **-6 bits** | Common leetspeak substitutions (e.g. `P@ssw0rd`). |

---

## 3. Score & Strength Tier Mapping

Effective entropy is normalized to a 0–100 scale:

$$\text{Score} = \min\left(100, \left\lfloor \frac{\text{Effective Entropy}}{75} \times 100 \right\rfloor\right)$$

| Score Range | Tier | Label | Mascot Behavior ("Byte") | Security Status |
| :---: | :---: | :--- | :--- | :--- |
| **0 – 19** | **0** | **SOOO WEAK** | Crying tears, sweat drops, fast head shake, red alert | ❌ Trivially crackable (< 1 sec) |
| **20 – 44** | **1** | **TRY BETTER** | Worried eyes, slow head shake, sweat drops | ⚠️ Vulnerable to basic attacks |
| **45 – 64** | **2** | **GOOD** | Content smile, calm posture, gentle nod | ✅ Acceptable minimum for registration |
| **65 – 84** | **3** | **WOW** | Sparkle star eyes, vertical jumps, floating stars | 🛡️ High resistance against GPU clusters |
| **85 – 100** | **4** | **STRONGEST** | Heart eyes, party hat, confetti explosion, super tail wag | 🏰 Military / Enterprise resilient |

---

## 4. Mandatory Hard Policy Caps

Regardless of raw mathematical entropy, the engine enforces 4 strict security caps:

1. **Common Password Cap**: Any match in the SecLists 10,000 corpus (including leetspeak and stripped variations) is clamped to **Tier 0** (Max Score: 15).
2. **Breached Credential Cap**: Any match in the HIBP database via k-anonymity is clamped to **Tier 0** (Max Score: 10).
3. **Sub-8 Character Cap**: Any password shorter than 8 characters is clamped to **Tier 1 or lower** (Max Score: 30).
4. **Username Inclusion Cap**: Any password containing the account handle is clamped to **Tier 1 or lower** (Max Score: 35).

---

## 5. Five Worked Examples

### Example 1: `password`
- **Length**: 8 characters
- **Pool**: Lowercase ($R = 26$)
- **Raw Entropy**: $8 \times \log_2(26) = 37.6\text{ bits}$
- **Detection**: Exact match in SecLists 10K common passwords.
- **Hard Cap Applied**: Common Password Cap triggered.
- **Result**: **Tier 0 (SOOO WEAK)** | **Score**: 10/100 | **Offline Crack**: Instant.

---

### Example 2: `P@ssw0rd123!`
- **Length**: 12 characters
- **Classes**: Lowercase, Uppercase, Numbers, Symbols ($R = 26 + 26 + 10 + 33 = 95$)
- **Raw Entropy**: $12 \times \log_2(95) = 78.8\text{ bits}$
- **Detection**:
  - `unleet("P@ssw0rd123!")` $\rightarrow$ `"password123!"`
  - `stripTrailingGarbage("password123!")` $\rightarrow$ `"password"` (SecLists match)
  - Numeric sequence: `"123"`
- **Hard Cap Applied**: Common Password Cap triggered.
- **Result**: **Tier 0 (SOOO WEAK)** | **Score**: 15/100 | **Offline Crack**: Instant.
- *Educational Note: Looks complex to humans, but dictionary rules crack it in milliseconds.*

---

### Example 3: `qwerty2024`
- **Length**: 10 characters
- **Classes**: Lowercase + Digits ($R = 36$)
- **Raw Entropy**: $10 \times \log_2(36) = 51.7\text{ bits}$
- **Penalties**:
  - Keyboard walk: `"qwerty"` (-14 bits)
  - Calendar year: `"2024"` (-8 bits)
- **Effective Entropy**: $51.7 - 22 = 29.7\text{ bits}$
- **Score**: $\approx 39/100$
- **Result**: **Tier 1 (TRY BETTER)** | **Offline Crack**: < 1 second.

---

### Example 4: `Wyntrix_Admin#99` (Assessed for user `alex`)
- **Length**: 16 characters
- **Classes**: Lowercase, Uppercase, Digits, Symbols ($R = 95$)
- **Raw Entropy**: $16 \times \log_2(95) = 105.1\text{ bits}$
- **Penalties**:
  - Contains brand name `"wyntrix"` (-18 bits)
- **Hard Cap Applied**: Username / Brand Inclusion Cap triggered (Max Tier 1, Max Score 35).
- **Result**: **Tier 1 (TRY BETTER)** | **Score**: 35/100.
- *Fix*: Remove company/username identifiers.

---

### Example 5: `correct horse battery staple` (Passphrase)
- **Length**: 28 characters
- **Classes**: Lowercase letters + Whitespace ($R = 26 + 1 = 27$)
- **Raw Entropy**: $28 \times \log_2(27) = 28 \times 4.755 = 133.1\text{ bits}$
- **Penalties**: 0 (No keyboard walks, no sequences, no repeats).
- **Effective Entropy**: $133.1\text{ bits}$
- **Score**: 100/100 (Capped at 100).
- **Crack Time**:
  - **Online**: Eons ($> 10^{20}$ years)
  - **Offline (10B/sec GPU)**: Eons ($> 10^{15}$ years)
- **Result**: **Tier 4 (STRONGEST)** | **Mascot**: Party hat, confetti, heart eyes!
