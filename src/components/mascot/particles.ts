// Pixel Particle System for Byte the Shiba Pup (96x96 Virtual Resolution)
// Handles hearts, stars, steam puffs, sweat drops, confetti, question marks, gears, and Zzz.
// Golden Rule: Particles strictly spawn outside the face area (y < 20 or y > 65 or x < 24 or x > 72).
// Rendered on Canvas with integer pixel coordinates for authentic retro appearance.

export type ParticleType =
  | 'heart'
  | 'star'
  | 'steam'
  | 'sweat'
  | 'confetti'
  | 'question'
  | 'gear'
  | 'zzz';

export interface PixelParticle {
  id: number;
  type: ParticleType;
  x: number;          // 0 to 96 virtual pixel grid
  y: number;
  vx: number;         // Velocity in virtual pixels per frame
  vy: number;
  color: string;
  size: number;
  life: number;       // Current life counter
  maxLife: number;    // Total life in frames
  alpha: number;
  rotation?: number;  // For confetti
}

export class ParticleSystem {
  private particles: PixelParticle[] = [];
  private nextId = 0;

  public clear() {
    this.particles = [];
  }

  // Spawn heart particles (Happy / Tier 4) - Spawns at left/right flanks and drifts up
  public spawnHeart(side?: 'left' | 'right') {
    const isLeft = side ? side === 'left' : Math.random() > 0.5;
    const spawnX = isLeft ? 14 + Math.random() * 6 : 76 + Math.random() * 6;
    const spawnY = 40 + Math.random() * 15;

    this.particles.push({
      id: this.nextId++,
      type: 'heart',
      x: spawnX,
      y: spawnY,
      vx: isLeft ? -(0.2 + Math.random() * 0.3) : (0.2 + Math.random() * 0.3),
      vy: -(0.5 + Math.random() * 0.4),
      color: Math.random() > 0.5 ? '#F4B6B0' : '#D95F5F',
      size: 5,
      life: 0,
      maxLife: 42,
      alpha: 1,
    });
  }

  // Spawn star sparkles (Tier 3 / Excited) - Outside flanks or high above
  public spawnStar() {
    const isLeft = Math.random() > 0.5;
    const spawnX = isLeft ? 12 + Math.random() * 10 : 74 + Math.random() * 10;
    const spawnY = 22 + Math.random() * 25;

    this.particles.push({
      id: this.nextId++,
      type: 'star',
      x: spawnX,
      y: spawnY,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.3 + Math.random() * 0.3),
      color: Math.random() > 0.4 ? '#E8C547' : '#F6B368',
      size: 5,
      life: 0,
      maxLife: 35,
      alpha: 1,
    });
  }

  // Spawn steam puffs (Angry failed login #2) - Above headphones/ears (y < 16)
  public spawnSteam(x?: number, y?: number) {
    const defaultX = Math.random() > 0.5 ? 26 : 70;
    this.particles.push({
      id: this.nextId++,
      type: 'steam',
      x: x !== undefined ? x : defaultX + (Math.random() * 4 - 2),
      y: y !== undefined ? y : 12 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.6 + Math.random() * 0.4),
      color: '#FFFFFF',
      size: 4,
      life: 0,
      maxLife: 32,
      alpha: 0.9,
    });
  }

  // Spawn sweat drops (Tier 0 & Tier 1) - Outside right temple (x > 75)
  public spawnSweat(x = 78, y = 32) {
    this.particles.push({
      id: this.nextId++,
      type: 'sweat',
      x: x + (Math.random() * 4 - 2),
      y: y + (Math.random() * 4 - 2),
      vx: 0.3 + Math.random() * 0.3,
      vy: 0.8 + Math.random() * 0.5,
      color: '#5E9CFF',
      size: 3,
      life: 0,
      maxLife: 28,
      alpha: 1,
    });
  }

  // Spawn colorful confetti bits (Tier 4 / Success) - Falling from top sky (y < 10)
  public spawnConfetti() {
    const colors = ['#E8C547', '#D95F5F', '#5B9A73', '#7FD1A0', '#F2A65A', '#A277FF', '#FFF3DC'];
    // Spawn across outer regions or top sky
    const spawnX = Math.random() * 96;
    this.particles.push({
      id: this.nextId++,
      type: 'confetti',
      x: spawnX,
      y: Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.7 + Math.random() * 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3,
      life: 0,
      maxLife: 55,
      alpha: 1,
      rotation: Math.random() * Math.PI,
    });
  }

  // Spawn question mark (Thinking / Empty submit) - Above right ear (x=78, y=14)
  public spawnQuestion(x = 78, y = 14) {
    this.particles.push({
      id: this.nextId++,
      type: 'question',
      x: x + (Math.random() * 4 - 2),
      y: y + (Math.random() * 3 - 1.5),
      vx: 0.15,
      vy: -0.35,
      color: '#F2A65A',
      size: 6,
      life: 0,
      maxLife: 45,
      alpha: 1,
    });
  }

  // Spawn gear / processing dots - Floating above head (y < 16)
  public spawnGear(x = 48, y = 10) {
    this.particles.push({
      id: this.nextId++,
      type: 'gear',
      x: x + (Math.random() * 16 - 8),
      y: y + (Math.random() * 4 - 2),
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.3,
      color: '#7FD1A0',
      size: 4,
      life: 0,
      maxLife: 35,
      alpha: 1,
    });
  }

  // Spawn Zzz for sleeping state - Floating safely top-right of head (x > 75, y < 20)
  public spawnZzz(x = 78, y = 16) {
    this.particles.push({
      id: this.nextId++,
      type: 'zzz',
      x: x + (Math.random() * 4 - 2),
      y: y + (Math.random() * 3 - 1.5),
      vx: 0.2,
      vy: -0.4,
      color: '#7FD1A0',
      size: 5,
      life: 0,
      maxLife: 50,
      alpha: 1,
    });
  }

  // Update particle positions and advance life
  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Render particles directly onto the 96x96 scaled canvas
  public render(ctx: CanvasRenderingContext2D, pixelScale: number) {
    ctx.save();
    for (const p of this.particles) {
      const px = Math.floor(p.x) * pixelScale;
      const py = Math.floor(p.y) * pixelScale;

      ctx.fillStyle = p.color;

      switch (p.type) {
        case 'heart': {
          // Pixel heart shape (5x5 grid)
          ctx.fillRect(px + pixelScale, py, pixelScale, pixelScale);
          ctx.fillRect(px + 3 * pixelScale, py, pixelScale, pixelScale);
          ctx.fillRect(px, py + pixelScale, 5 * pixelScale, pixelScale);
          ctx.fillRect(px, py + 2 * pixelScale, 5 * pixelScale, pixelScale);
          ctx.fillRect(px + pixelScale, py + 3 * pixelScale, 3 * pixelScale, pixelScale);
          ctx.fillRect(px + 2 * pixelScale, py + 4 * pixelScale, pixelScale, pixelScale);
          break;
        }

        case 'star': {
          // 4-point sparkle star (5x5 grid)
          ctx.fillRect(px + 2 * pixelScale, py, pixelScale, 5 * pixelScale);
          ctx.fillRect(px, py + 2 * pixelScale, 5 * pixelScale, pixelScale);
          ctx.fillRect(px + pixelScale, py + pixelScale, 3 * pixelScale, 3 * pixelScale);
          break;
        }

        case 'steam': {
          // Rounded steam puff (4x4)
          ctx.fillRect(px + pixelScale, py, 2 * pixelScale, 4 * pixelScale);
          ctx.fillRect(px, py + pixelScale, 4 * pixelScale, 2 * pixelScale);
          break;
        }

        case 'sweat': {
          // Teardrop (2x4)
          ctx.fillRect(px + pixelScale, py, pixelScale, pixelScale);
          ctx.fillRect(px, py + pixelScale, 2 * pixelScale, 2 * pixelScale);
          ctx.fillRect(px, py + 3 * pixelScale, pixelScale, pixelScale);
          break;
        }

        case 'confetti': {
          // 3x3 rotating pixel square
          ctx.fillRect(px, py, 3 * pixelScale, 3 * pixelScale);
          break;
        }

        case 'gear': {
          // 4x4 mini gear
          ctx.fillRect(px, py, 4 * pixelScale, 4 * pixelScale);
          ctx.clearRect(px + pixelScale, py + pixelScale, 2 * pixelScale, 2 * pixelScale);
          break;
        }

        case 'question': {
          // Pixel question mark '?' (4x6)
          ctx.fillRect(px + pixelScale, py, 3 * pixelScale, pixelScale);
          ctx.fillRect(px + 3 * pixelScale, py + pixelScale, pixelScale, 2 * pixelScale);
          ctx.fillRect(px + 2 * pixelScale, py + 3 * pixelScale, pixelScale, pixelScale);
          ctx.fillRect(px + 2 * pixelScale, py + 5 * pixelScale, pixelScale, pixelScale);
          break;
        }

        case 'zzz': {
          // Pixel letter 'Z' (5x5)
          ctx.fillRect(px, py, 5 * pixelScale, pixelScale);
          ctx.fillRect(px + 3 * pixelScale, py + pixelScale, pixelScale, pixelScale);
          ctx.fillRect(px + 2 * pixelScale, py + 2 * pixelScale, pixelScale, pixelScale);
          ctx.fillRect(px + pixelScale, py + 3 * pixelScale, pixelScale, pixelScale);
          ctx.fillRect(px, py + 4 * pixelScale, 5 * pixelScale, pixelScale);
          break;
        }
      }
    }
    ctx.restore();
  }
}
