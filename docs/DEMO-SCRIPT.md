# Wyntrix Pixel Guard - 3-Minute Live Demo Script

This script is designed for your **Cyber Security Internship Project Presentation** for **Wyntrix Innovation OPC Pvt Ltd**. Follow this exact step-by-step walkthrough to showcase all required features in under 3 minutes.

---

## 🎬 Pre-Flight Checklist (30 seconds before presentation)
1. Start the application:
   ```bash
   npm run dev
   ```
2. Open your browser to:
   👉 **`http://localhost:3000/login`** (or `http://localhost:3001/login` if port 3000 is occupied).
3. Ensure audio is toggled ON (click the **SFX: ON** toggle in the top-right corner to hear the 8-bit sound blips).

---

## ⏱️ Minute 1: The Wyntrix Portal & Mascot Engine ("Byte")

### [0:00 - 0:45] Theme, Branding & Mascot Living Reactions
1. **Introduction**:
   > *"Good morning/afternoon. This is my cyber security internship project for Wyntrix: Pixel Guard — an enterprise password strength analyzer and security awareness portal disguised as a retro pixel-art portal."*
2. **Showcase Visual Identity & Theme Toggle**:
   - Point out the official **WYN Hexagon Logo** and tagline: *"Secure today, safer tomorrow."*
   - Click the **NIGHT / DAY** toggle in the top-right corner.
   - Explain: *"We built two handcrafted pixel themes: Pixel Garden (Light) and Night Terminal (Dark), featuring stepped shadows, hard pixel borders, and authentic dither textures."*
3. **Showcase Byte the Shiba Pup**:
   - Point to the Left 25% Mascot Panel. Notice Byte blinking, ears twitching, tail wagging, and drifting clouds.
   - Click on the Username field: Byte performs a **curious 1px head tilt**.
   - Type a few characters in the Username: Byte shifts into **THINKING** mode (question marks float as eyes track).
   - Click the Password field and type hidden characters: Byte switches to **PROCESSING** mode (blinking green headphone LEDs and spinning gears).
   - Click the **Eye Icon** to show password: Byte becomes shy and covers his face with **paws peeking**!

---

## ⏱️ Minute 2: Authentication Security & Lockout Countdown

### [0:46 - 1:30] Progressive Failure & The LED Lockout
1. **Showcase Failed Login Reactions**:
   - Submit an intentionally wrong password:
     - **Attempt 1**: Byte puts on a **Sherlock Holmes deerstalker hat and magnifying glass** (`DETECTIVE` mode). Speech bubble: *"Hmm... something smells fishy."*
     - **Attempt 2**: Byte turns **danger red with steam puffing from his ears** (`ANGRY` mode). Speech bubble: *"Grrr! That is NOT it!"*
     - **Attempt 3**: Byte becomes **DIZZY with spiral eyes and padlock** (`DIZZY_LOCKED` mode).
2. **Showcase the LED Matrix Countdown**:
   - Highlight the glowing blocky LED matrix countdown displaying the remaining lockout seconds alongside the animated pixel hourglass.
   - Explain: *"This implements an exponential backoff lockout policy stored in SQLite. Notice how the form is completely frozen and prevents automated brute-force scripts."*

---

## ⏱️ Minute 2.5: Real-Time Analyzer & Passphrase Engine (/register)

### [1:31 - 2:15] Registration & Live Password Strength
1. Navigate to `/register`:
   - Click **CREATE NEW ACCOUNT**.
2. **Live Username Availability**:
   - Type `sentinel_01`: Live green badge appears: `✓ Available` and Byte gives a **little thumbs-up paw**!
3. **Live Password Strength Meter & Reaction Map**:
   - Type `password`: Byte cries with tears and fast head shake (`SOOO WEAK` Tier 0). Explain: *"Even with 8 characters, our SecLists 10,000 corpus detects this common password instantly."*
   - Type `P@ssw0rd123!`: Still Tier 0! Explain: *"Our engine normalizes leetspeak and strips trailing digits, preventing bypass attempts."*
   - Click **⚡ Generate Passphrase**:
     - A 4-word high-entropy passphrase appears (e.g. `anchor crystal breeze forest`).
     - Byte jumps with excitement and wears a **party hat with floating stars and confetti** (`STRONGEST` Tier 4).
     - The 5-segment strength meter turns deep green: **100/100 (100+ bits of entropy)**.
     - Offline crack time displays **"Eons"** ($> 10^{15}$ years).
4. **Create the Account**:
   - Click **CREATE ACCOUNT**. Confetti bursts, Byte celebrates, and you are smoothly redirected to `/login`!

---

## ⏱️ Minute 3: The Security Lab & Report Generation (/lab)

### [2:16 - 3:00] Deep Audit & PDF/TXT/JSON Downloads
1. Log in with your new credentials:
   - Enter your username and passphrase, then click **LOGIN**.
   - Byte smiles with heart eyes (`HAPPY` mode), and the portal pixel-dissolves into `/lab`.
2. **The Security Lab**:
   - Highlight that `/lab` is protected by Next.js JWT middleware.
   - Type different credentials in the sandbox:
     - Notice the detailed metrics: **Effective Shannon Entropy**, **Character Pool Size**, **Online vs Offline GPU Crack Times**.
     - Point out the **Security Policy Checklist** and **Detected Pattern Penalties**.
3. **Security Awareness Tip Carousel**:
   - Filter by topic: click `PASSPHRASES`, `MFA`, or `PHISHING`.
   - Cycle through tips with the `◀` and `▶` retro buttons.
4. **Download Audit Reports**:
   - Click **📄 PDF REPORT**: Open the downloaded PDF in your viewer.
   - Point out:
     - Professional Wyntrix-branded layout with report ID and timestamp.
     - Full breakdown of strength tier, entropy, and recommendations.
     - **Strict Privacy Compliance**: Point out that the plaintext password is completely redacted—only the length is recorded.
   - Click **📝 TXT REPORT** and **💾 JSON DATA** to demonstrate automated security pipeline export capabilities.
5. **Conclude**:
   > *"Thank you! Wyntrix Pixel Guard demonstrates that enterprise-grade security and engaging user experience can go hand-in-hand. I am now open to any questions."*
