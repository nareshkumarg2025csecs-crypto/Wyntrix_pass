// 8-bit Retro WebAudio Sound Generator
// All sounds are synthesized programmatically using the WebAudio API without external audio files.
// Audio is OFF by default to respect user experience and browser autoplay policies.

class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wyntrix-sound-enabled');
      this.enabled = saved === 'true'; // Defaults to false
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wyntrix-sound-enabled', String(this.enabled));
    }
    if (this.enabled) {
      this.initCtx();
      this.playBlip(600, 0.05);
    }
    return this.enabled;
  }

  // Play simple square-wave frequency pulse
  private playBlip(freq: number, duration: number, type: OscillatorType = 'square', gainLevel: number = 0.08) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy or device audio unavailable; fail gracefully
    }
  }

  public playKeypress() {
    if (!this.enabled) return;
    // Tiny subtle mechanical key click
    this.playBlip(280 + Math.random() * 60, 0.025, 'triangle', 0.04);
  }

  public playButton() {
    if (!this.enabled) return;
    this.playBlip(520, 0.04, 'square', 0.06);
  }

  public playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 fanfare
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBlip(freq, 0.1, 'square', 0.09);
        }, idx * 75);
      });
    } catch {
      // Ignore
    }
  }

  public playError() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.playBlip(160, 0.15, 'sawtooth', 0.1);
      setTimeout(() => {
        this.playBlip(120, 0.22, 'sawtooth', 0.1);
      }, 120);
    } catch {
      // Ignore
    }
  }

  public playTierUp() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.playBlip(440, 0.06, 'triangle', 0.07);
      setTimeout(() => {
        this.playBlip(880, 0.09, 'triangle', 0.07);
      }, 60);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundSystem();
