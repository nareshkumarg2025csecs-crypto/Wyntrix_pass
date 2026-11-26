// Byte Canvas Render Engine (96x96 Virtual Resolution)
// Composites 96x96 chibi pixel sprite layers, applies stepped retro animations,
// renders particles, radar scanning effects, and red alerts.
// Golden Rule: Accessories and particles never cover the face area.

import { BYTE_PALETTE } from './palette';
import {
  SpriteLayer,
  getGroundShadowLayer,
  getTailLayer,
  getBodyLayer,
  getCollarLayer,
  getEarsLayer,
  getHeadBaseLayer,
  getHeadphonesLayer,
  getEyesLayer,
  getNoseAndMouthLayer,
  getDetectiveHatLayer,
  getMagnifyingGlassLayer,
  getThoughtBubbleLayer,
  getSteamPuffsLayer,
  getPartyHatLayer,
  getPawsPeekLayer,
  getThumbsUpLayer,
  getPadlockBesideLayer,
  getGearAboveLayer,
} from './sprites';
import { MascotFSMState } from './types';
import { ParticleSystem } from './particles';

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  state: MascotFSMState;
  particles: ParticleSystem;
  pixelScale?: number; // e.g. 4x -> 384px
  squashOffset?: number; // 2-frame squash on state transition
}

// ============================================================================
// LAYER CACHING (Instant 60fps compositing without per-frame re-allocation)
// ============================================================================

const CACHED_GROUND_SHADOW = getGroundShadowLayer();
const CACHED_BODY = getBodyLayer();
const CACHED_COLLAR = getCollarLayer();
const CACHED_HEAD_BASE = getHeadBaseLayer();

const CACHED_TAIL_RIGHT = getTailLayer('curl_right');
const CACHED_TAIL_WAG = getTailLayer('wag');

const CACHED_EARS_NORMAL = getEarsLayer('normal');
const CACHED_EARS_TILT = getEarsLayer('tilt');
const CACHED_EARS_DROOP = getEarsLayer('droop');
const CACHED_EARS_ANGRY = getEarsLayer('angry_pinned');

const CACHED_HEADPHONES_NORMAL = getHeadphonesLayer(false);
const CACHED_HEADPHONES_BLINK = getHeadphonesLayer(true);

const CACHED_DETECTIVE_HAT = getDetectiveHatLayer();
const CACHED_MAGNIFYING_GLASS = getMagnifyingGlassLayer();
const CACHED_THOUGHT_BUBBLE = getThoughtBubbleLayer();
const CACHED_STEAM_PUFFS = getSteamPuffsLayer();
const CACHED_PARTY_HAT = getPartyHatLayer();
const CACHED_PAWS_PEEK = getPawsPeekLayer();
const CACHED_THUMBS_UP = getThumbsUpLayer();
const CACHED_PADLOCK = getPadlockBesideLayer();
const CACHED_GEAR = getGearAboveLayer();

// Eye & Mouth memoization cache
const eyeCache = new Map<string, SpriteLayer>();
function getCachedEyes(
  eyeType:
    | 'open'
    | 'blink'
    | 'half_closed'
    | 'happy_arc'
    | 'sparkle_star'
    | 'heart'
    | 'narrow_suspicious'
    | 'angry_slanted'
    | 'worried_wet'
    | 'crying'
    | 'spiral'
    | 'peek_one_eye'
    | 'look_up_right',
  browType: 'neutral' | 'curious_raised' | 'angry_v' | 'worried_slanted'
): SpriteLayer {
  const key = `${eyeType}_${browType}`;
  let layer = eyeCache.get(key);
  if (!layer) {
    layer = getEyesLayer(eyeType, browType);
    eyeCache.set(key, layer);
  }
  return layer;
}

const mouthCache = new Map<string, SpriteLayer>();
function getCachedMouth(
  mouthType: 'w' | 'smile' | 'big_smile' | 'wavy_worried' | 'gritted' | 'small_o' | 'yawn' | 'tongue_out'
): SpriteLayer {
  let layer = mouthCache.get(mouthType);
  if (!layer) {
    layer = getNoseAndMouthLayer(mouthType);
    mouthCache.set(mouthType, layer);
  }
  return layer;
}

/**
 * Draws a single 96x96 sprite layer onto the canvas with an optional (dx, dy) integer offset.
 * Batches horizontal runs of identical color for maximum rendering performance.
 */
export function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: SpriteLayer,
  pixelScale: number,
  offsetX = 0,
  offsetY = 0
) {
  const rows = layer.length;
  for (let r = 0; r < rows; r++) {
    const row = layer[r];
    if (!row) continue;
    const len = row.length;
    let startC = -1;
    let currentColor = '';

    for (let c = 0; c < len; c++) {
      const char = row[c];
      const color = (char && char !== '.') ? BYTE_PALETTE[char] : null;

      if (color && color !== 'transparent') {
        if (currentColor === color) {
          continue;
        } else {
          if (startC !== -1 && currentColor) {
            ctx.fillStyle = currentColor;
            ctx.fillRect(
              (startC + offsetX) * pixelScale,
              (r + offsetY) * pixelScale,
              (c - startC) * pixelScale,
              pixelScale
            );
          }
          startC = c;
          currentColor = color;
        }
      } else {
        if (startC !== -1 && currentColor) {
          ctx.fillStyle = currentColor;
          ctx.fillRect(
            (startC + offsetX) * pixelScale,
            (r + offsetY) * pixelScale,
            (c - startC) * pixelScale,
            pixelScale
          );
          startC = -1;
          currentColor = '';
        }
      }
    }

    if (startC !== -1 && currentColor) {
      ctx.fillStyle = currentColor;
      ctx.fillRect(
        (startC + offsetX) * pixelScale,
        (r + offsetY) * pixelScale,
        (len - startC) * pixelScale,
        pixelScale
      );
    }
  }
}

/**
 * Main render function for Byte (96x96 Native Grid)
 */
export function renderByte({
  ctx,
  state,
  particles,
  pixelScale = 4,
  squashOffset = 0,
}: RenderOptions) {
  const canvasWidth = 96 * pixelScale;
  const canvasHeight = 96 * pixelScale;

  // Clear previous frame
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = false;

  const {
    currentState,
    headShakeOffset,
    jumpOffset,
    isBlinking,
    earTwitch,
    tailFrame,
    isYawning,
    radarAngle,
  } = state;

  // 1. SELECT TAIL LAYER
  let tailLayer = CACHED_TAIL_RIGHT;
  if (
    tailFrame === 2 ||
    currentState === 'HAPPY' ||
    currentState === 'EXCITED' ||
    currentState === 'TIER_4' ||
    currentState === 'USER_AVAILABLE'
  ) {
    tailLayer = CACHED_TAIL_WAG;
  }

  // 2. SELECT EARS LAYER
  let earsLayer = CACHED_EARS_NORMAL;
  if (
    currentState === 'USER_TAKEN' ||
    currentState === 'SLEEP' ||
    currentState === 'TIER_0' ||
    currentState === 'TIER_1' ||
    currentState === 'DIZZY_LOCKED'
  ) {
    earsLayer = CACHED_EARS_DROOP;
  } else if (currentState === 'ANGRY') {
    earsLayer = CACHED_EARS_ANGRY;
  } else if (
    earTwitch ||
    currentState === 'FOCUS_USER' ||
    currentState === 'THINKING' ||
    currentState === 'EMPTY_SUBMIT' ||
    currentState === 'SNIFFING' ||
    currentState === 'DETECTIVE' ||
    currentState === 'PEEK' ||
    currentState === 'HAPPY' ||
    currentState === 'EXCITED' ||
    currentState === 'TIER_3' ||
    currentState === 'TIER_4'
  ) {
    earsLayer = CACHED_EARS_TILT;
  }

  // 3. SELECT EYES & BROWS
  type EyeType = Parameters<typeof getCachedEyes>[0];
  type BrowType = Parameters<typeof getCachedEyes>[1];

  let eyeType: EyeType = 'open';
  let browType: BrowType = 'neutral';

  if (isBlinking) {
    eyeType = 'blink';
    browType = 'neutral';
  } else {
    switch (currentState) {
      case 'SLEEP':
        eyeType = 'half_closed';
        browType = 'neutral';
        break;
      case 'FOCUS_USER':
        eyeType = 'open';
        browType = 'curious_raised';
        break;
      case 'THINKING':
        eyeType = 'look_up_right';
        browType = 'curious_raised';
        break;
      case 'PROCESSING':
      case 'SNIFFING':
        eyeType = 'narrow_suspicious';
        browType = 'neutral';
        break;
      case 'PEEK':
        eyeType = 'peek_one_eye';
        browType = 'neutral';
        break;
      case 'EMPTY_SUBMIT':
        eyeType = 'open';
        browType = 'curious_raised';
        break;
      case 'DETECTIVE':
        eyeType = 'narrow_suspicious';
        browType = 'curious_raised';
        break;
      case 'ANGRY':
        eyeType = 'angry_slanted';
        browType = 'angry_v';
        break;
      case 'DIZZY_LOCKED':
        eyeType = 'spiral';
        browType = 'worried_slanted';
        break;
      case 'HAPPY':
      case 'TIER_4':
        eyeType = 'heart';
        browType = 'neutral';
        break;
      case 'USER_AVAILABLE':
      case 'EXCITED':
      case 'TIER_3':
        eyeType = 'sparkle_star';
        browType = 'curious_raised';
        break;
      case 'USER_TAKEN':
      case 'TIER_1':
        eyeType = 'worried_wet';
        browType = 'worried_slanted';
        break;
      case 'TIER_0':
        eyeType = 'crying';
        browType = 'worried_slanted';
        break;
      case 'TIER_2':
        eyeType = 'open';
        browType = 'neutral';
        break;
      default:
        eyeType = 'open';
        browType = 'neutral';
    }
  }

  const eyesLayer = getCachedEyes(eyeType, browType);

  // 4. SELECT MOUTH
  type MouthType = Parameters<typeof getCachedMouth>[0];
  let mouthType: MouthType = 'w';

  if (isYawning) {
    mouthType = 'yawn';
  } else {
    switch (currentState) {
      case 'SLEEP':
      case 'EMPTY_SUBMIT':
      case 'THINKING':
      case 'DETECTIVE':
        mouthType = 'small_o';
        break;
      case 'PROCESSING':
        mouthType = 'tongue_out';
        break;
      case 'ANGRY':
        mouthType = 'gritted';
        break;
      case 'DIZZY_LOCKED':
      case 'USER_TAKEN':
      case 'TIER_1':
      case 'TIER_0':
        mouthType = 'wavy_worried';
        break;
      case 'HAPPY':
      case 'EXCITED':
      case 'TIER_4':
      case 'TIER_3':
        mouthType = 'big_smile';
        break;
      case 'USER_AVAILABLE':
      case 'TIER_2':
        mouthType = 'smile';
        break;
      default:
        mouthType = 'w';
    }
  }

  const mouthLayer = getCachedMouth(mouthType);

  // 5. SELECT HEADPHONES
  const isHeadphoneBlink = currentState === 'PROCESSING' && state.frameIndex % 2 === 0;
  const headphonesLayer = isHeadphoneBlink ? CACHED_HEADPHONES_BLINK : CACHED_HEADPHONES_NORMAL;

  // Offsets: Head shake + vertical Jump + squash
  const headX = headShakeOffset;
  const headY = jumpOffset + squashOffset;

  const bodyX = 0;
  const bodyY = jumpOffset + Math.floor(squashOffset * 0.5);

  // --- DRAWING PIPELINE (Back to Front) ---

  // 0. Soft Ground Shadow (Anchors dog to the ground)
  drawLayer(ctx, CACHED_GROUND_SHADOW, pixelScale, 0, 0);

  // 1. Tail (Behind body)
  drawLayer(ctx, tailLayer, pixelScale, bodyX, bodyY);

  // 2. Body base, haunches, tummy & stubby front paws
  drawLayer(ctx, CACHED_BODY, pixelScale, bodyX, bodyY);

  // 3. Collar & Golden Shield Tag
  drawLayer(ctx, CACHED_COLLAR, pixelScale, bodyX, bodyY);

  // 4. Ears (attached to head offset)
  drawLayer(ctx, earsLayer, pixelScale, headX, headY);

  // 5. Head base (Chubby round head with cream mask, blush, maro spots)
  drawLayer(ctx, CACHED_HEAD_BASE, pixelScale, headX, headY);

  // 6. Eyes & Eyebrows
  drawLayer(ctx, eyesLayer, pixelScale, headX, headY);

  // 7. Nose & Mouth
  drawLayer(ctx, mouthLayer, pixelScale, headX, headY);

  // 8. Headphones (Over crown between ears, never covering eyes)
  drawLayer(ctx, headphonesLayer, pixelScale, headX, headY);

  // 9. Accessories & Overlays (Strictly outside face area)
  if (currentState === 'DETECTIVE') {
    drawLayer(ctx, CACHED_DETECTIVE_HAT, pixelScale, headX, headY);
    drawLayer(ctx, CACHED_MAGNIFYING_GLASS, pixelScale, bodyX, bodyY);
  }

  if (currentState === 'THINKING') {
    drawLayer(ctx, CACHED_THOUGHT_BUBBLE, pixelScale, headX, headY);
  }

  if (currentState === 'PROCESSING') {
    drawLayer(ctx, CACHED_GEAR, pixelScale, headX, headY);
  }

  if (currentState === 'ANGRY') {
    drawLayer(ctx, CACHED_STEAM_PUFFS, pixelScale, headX, headY);
  }

  if (currentState === 'PEEK') {
    drawLayer(ctx, CACHED_PAWS_PEEK, pixelScale, headX, headY);
  }

  if (currentState === 'USER_AVAILABLE') {
    drawLayer(ctx, CACHED_THUMBS_UP, pixelScale, bodyX, bodyY);
  }

  if (currentState === 'DIZZY_LOCKED') {
    drawLayer(ctx, CACHED_PADLOCK, pixelScale, bodyX, bodyY);
  }

  if (currentState === 'TIER_4' || currentState === 'EXCITED') {
    drawLayer(ctx, CACHED_PARTY_HAT, pixelScale, headX, headY);
  }

  // 10. ANGRY RED ALERT VIGNETTE
  if (currentState === 'ANGRY') {
    ctx.save();
    ctx.fillStyle = 'rgba(217, 95, 95, 0.22)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 11. SNIFFING RADAR SWEEP OVERLAY (Beside the dog, scanning packets)
  if (currentState === 'SNIFFING') {
    ctx.save();
    const centerX = canvasWidth * 0.5;
    const centerY = canvasHeight * 0.5;
    const radius = canvasWidth * 0.44;

    ctx.strokeStyle = '#5B9A73';
    ctx.lineWidth = 2 * pixelScale * 0.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Radar rotating beam
    const rad = (radarAngle * Math.PI) / 180;
    ctx.strokeStyle = '#7FD1A0';
    ctx.lineWidth = 2.5 * pixelScale * 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(rad) * radius, centerY + Math.sin(rad) * radius);
    ctx.stroke();
    ctx.restore();
  }

  // 12. PARTICLES (Hearts, stars, steam, confetti, sweat, etc.)
  particles.render(ctx, pixelScale);
}
