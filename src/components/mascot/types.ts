// Mascot Type Definitions & Finite State Machine Types
// Beginner-friendly explanations for state transitions

export type MascotState =
  | 'IDLE'            // Normal breathing, blinking, tail wagging
  | 'SLEEP'           // Asleep with Zzz particles after 30s inactivity
  | 'FOCUS_USER'      // Username field focused, curious head tilt
  | 'THINKING'        // Typing username: question marks float, eyes follow input
  | 'PROCESSING'      // Typing password: gears spin, headphone lights blink
  | 'PEEK'            // Show password toggled: paws covering face with one peeking eye
  | 'EMPTY_SUBMIT'    // Empty form submitted: puzzled tilt ("Hmm? Fill me in!")
  | 'SNIFFING'        // Scanning / submitting: radar sweep effect over pet
  | 'DETECTIVE'       // Failed login #1: deerstalker hat, magnifying glass, narrowed eyes
  | 'ANGRY'           // Failed login #2: red tint, steam puffs, stamping shake
  | 'DIZZY_LOCKED'    // Failed login #3+: spiral eyes, pixel lock, lockout
  | 'HAPPY'           // Login/register success: big smile, heart eyes, sparkles, tail wag
  | 'EXCITED'         // Passphrase generator clicked: happy jump & stars
  | 'USER_AVAILABLE'  // Username check passed: thumbs up + happy blink
  | 'USER_TAKEN'      // Username check failed: droopy ears + worried expression
  | 'TIER_0'          // Password Tier 0 (SOOO WEAK): crying/sweating, fast head shake
  | 'TIER_1'          // Password Tier 1 (TRY BETTER): worried, slow head shake
  | 'TIER_2'          // Password Tier 2 (GOOD): content smile, calm nod
  | 'TIER_3'          // Password Tier 3 (WOW): sparkle eyes, jump, floating stars
  | 'TIER_4';         // Password Tier 4 (STRONGEST): heart eyes, party hat, confetti!

export interface MascotFSMState {
  currentState: MascotState;
  frameIndex: number;          // Current frame index for multi-frame animations
  subFrame: number;            // Counter to handle 6fps (idle) vs 12fps (reaction)
  headShakeOffset: number;     // Stepped horizontal pixel offset (0, 1, -1)
  jumpOffset: number;          // Stepped vertical pixel offset for jumps
  isBlinking: boolean;         // True during a blink frame
  earTwitch: boolean;          // True when ears twitch
  tailFrame: number;           // 0: left, 1: center, 2: right
  isYawning: boolean;          // True during occasional yawn
  idleSeconds: number;         // Seconds of inactivity towards 30s sleep
  radarAngle: number;          // Scanning radar sweep angle (0 to 360) for sniffing
}

export type MascotAction =
  | { type: 'TICK' }
  | { type: 'SET_STATE'; state: MascotState }
  | { type: 'USER_INTERACTION' }
  | { type: 'TRIGGER_BLINK' }
  | { type: 'TRIGGER_EAR_TWITCH' }
  | { type: 'TRIGGER_YAWN' };
