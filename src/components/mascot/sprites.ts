// Byte the Shiba Pup: 96x96 Layered Pixel Art Sprites
// Chibi Proportions, 1px Dark Outline #3A2418, 3-Tone Shading, Golden Rule: Face is never covered

export type SpriteLayer = string[];

export class LayerCanvas {
  public width = 96;
  public height = 96;
  public grid: string[][];

  constructor() {
    this.grid = Array.from({ length: 96 }, () => Array(96).fill('.'));
  }

  public set(x: number, y: number, char: string) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < 96 && y >= 0 && y < 96 && char !== '.') {
      this.grid[y][x] = char;
    }
  }

  public fillRect(x: number, y: number, w: number, h: number, char: string) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.set(x + dx, y + dy, char);
      }
    }
  }

  public fillOval(cx: number, cy: number, rx: number, ry: number, char: string) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) {
          this.set(x, y, char);
        }
      }
    }
  }

  public fillPolygon(points: [number, number][], char: string) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [px, py] of points) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const xi = points[i][0], yi = points[i][1];
          const xj = points[j][0], yj = points[j][1];
          const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        if (inside) this.set(x, y, char);
      }
    }
  }

  public outline(outlineChar = 'X') {
    const copy = this.grid.map((row) => [...row]);
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1],
    ];
    for (let y = 0; y < 96; y++) {
      for (let x = 0; x < 96; x++) {
        if (copy[y][x] === '.') {
          let hasNeighbor = false;
          for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < 96 && ny >= 0 && ny < 96) {
              if (copy[ny][nx] !== '.' && copy[ny][nx] !== outlineChar) {
                hasNeighbor = true;
                break;
              }
            }
          }
          if (hasNeighbor) {
            this.set(x, y, outlineChar);
          }
        }
      }
    }
  }

  public toStringArray(): SpriteLayer {
    return this.grid.map((row) => row.join(''));
  }
}

// ============================================================================
// BASE ANATOMY LAYERS
// ============================================================================

export function getGroundShadowLayer(): SpriteLayer {
  const c = new LayerCanvas();
  c.fillOval(47.5, 90, 27, 3.5, 'S');
  return c.toStringArray();
}

export function getTailLayer(variant: 'curl_right' | 'wag' = 'curl_right'): SpriteLayer {
  const c = new LayerCanvas();
  if (variant === 'curl_right') {
    c.fillOval(72, 69, 7.5, 7, 'o');
    c.fillOval(76, 61, 8.5, 8, 'O');
    c.fillOval(78, 51, 9, 8.5, 'H');
    c.fillOval(74, 43, 8, 7.5, 'O');
    c.fillOval(68, 39, 7, 6.5, 'C'); // Cream tail tip
    c.fillOval(63, 42, 5, 4.5, 'C');
  } else {
    // Excited wagged higher
    c.fillOval(73, 67, 7.5, 7, 'o');
    c.fillOval(79, 58, 9, 8.5, 'O');
    c.fillOval(81, 47, 9.5, 9, 'H');
    c.fillOval(77, 38, 8.5, 8, 'O');
    c.fillOval(70, 33, 7.5, 7, 'C');
    c.fillOval(64, 37, 5.5, 5, 'C');
  }
  c.outline('X');
  return c.toStringArray();
}

export function getBodyLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Chubby body core
  c.fillOval(47.5, 74, 22, 14, 'O');
  c.fillOval(43, 70, 15, 10, 'H');
  c.fillOval(53, 78, 17, 11, 'o');

  // Left & right haunches
  c.fillOval(27, 80, 8.5, 7.5, 'o');
  c.fillOval(26, 79, 7.5, 6.5, 'O');
  c.fillOval(68, 80, 8.5, 7.5, 'o');

  // Cream chest & tummy (Urajiro) flowing down between paws
  c.fillOval(47.5, 73, 14, 12, 'C');
  c.fillOval(47.5, 79, 11, 7, 'c');

  // Front Left Stubby Leg & Round Cream Paw
  c.fillOval(39, 79, 5.5, 6, 'O');
  c.fillOval(39, 84, 5, 4, 'C');
  c.fillRect(37, 85, 1, 2, 'c');
  c.fillRect(40, 85, 1, 2, 'c');

  // Front Right Stubby Leg & Round Cream Paw
  c.fillOval(56, 79, 5.5, 6, 'O');
  c.fillOval(56, 84, 5, 4, 'C');
  c.fillRect(55, 85, 1, 2, 'c');
  c.fillRect(58, 85, 1, 2, 'c');

  // Center cream tummy visible between front paws
  c.fillRect(44, 76, 7, 9, 'C');
  c.fillRect(45, 82, 5, 3, 'c');

  c.outline('X');
  return c.toStringArray();
}

export function getCollarLayer(): SpriteLayer {
  const c = new LayerCanvas();
  c.fillRect(36, 61, 23, 4, 'g');
  c.fillRect(38, 60, 19, 1, 'G');
  c.fillRect(37, 65, 21, 1, 'X');

  // Hanging Wyntrix Gold Shield Tag
  c.fillOval(47.5, 68, 4, 4.5, 'Y');
  c.set(46, 66, 'W');
  c.set(47, 66, 'W');
  c.set(48, 70, 'y');
  c.set(47, 71, 'y');

  c.outline('X');
  return c.toStringArray();
}

export function getEarsLayer(type: 'normal' | 'tilt' | 'droop' | 'angry_pinned' = 'normal'): SpriteLayer {
  const c = new LayerCanvas();
  if (type === 'normal') {
    // Left Triangular Pointed Shiba Ear
    const leftPoints: [number, number][] = [[25, 28], [32, 9], [41, 25]];
    c.fillPolygon(leftPoints, 'O');
    c.fillPolygon([[27, 26], [32, 11], [39, 23]], 'H');
    c.fillPolygon([[28, 25], [32, 13], [37, 23]], 'P');
    c.fillPolygon([[33, 20], [32, 14], [37, 23]], 'p');

    // Right Triangular Pointed Shiba Ear
    const rightPoints: [number, number][] = [[54, 25], [63, 9], [70, 28]];
    c.fillPolygon(rightPoints, 'O');
    c.fillPolygon([[58, 23], [63, 12], [68, 26]], 'P');
    c.fillPolygon([[63, 18], [63, 13], [67, 25]], 'p');
  } else if (type === 'tilt') {
    const leftPoints: [number, number][] = [[25, 28], [32, 9], [41, 25]];
    c.fillPolygon(leftPoints, 'O');
    c.fillPolygon([[28, 25], [32, 13], [37, 23]], 'P');

    const rightPoints: [number, number][] = [[55, 24], [68, 12], [73, 29]];
    c.fillPolygon(rightPoints, 'O');
    c.fillPolygon([[58, 23], [67, 15], [70, 26]], 'P');
  } else if (type === 'droop') {
    c.fillOval(24, 34, 7, 9, 'o');
    c.fillOval(23, 33, 6, 8, 'O');
    c.fillOval(24, 35, 3.5, 5.5, 'P');

    c.fillOval(71, 34, 7, 9, 'o');
    c.fillOval(72, 33, 6, 8, 'O');
    c.fillOval(71, 35, 3.5, 5.5, 'P');
  } else if (type === 'angry_pinned') {
    c.fillOval(22, 28, 9, 5.5, 'o');
    c.fillOval(23, 27, 8, 4.5, 'O');
    c.fillOval(24, 28, 4, 3, 'P');

    c.fillOval(73, 28, 9, 5.5, 'o');
    c.fillOval(72, 27, 8, 4.5, 'O');
    c.fillOval(71, 28, 4, 3, 'P');
  }

  c.outline('X');
  return c.toStringArray();
}

export function getHeadBaseLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Big round chubby head
  c.fillOval(47.5, 41, 27, 20, 'O');
  c.fillOval(42, 34, 19, 13, 'H');
  c.fillOval(54, 45, 20, 15, 'o');

  // Lower half: Cream Urajiro Mask (Snout, cheeks, chin)
  c.fillOval(47.5, 50, 24, 11, 'C');
  c.fillOval(33, 49, 10.5, 8.5, 'C'); // Chubby left cheek
  c.fillOval(62, 49, 10.5, 8.5, 'C'); // Chubby right cheek
  c.fillOval(47.5, 53, 16, 8.5, 'C'); // Muzzle snout

  c.fillOval(47.5, 59, 13, 3, 'c');
  c.outline('X');

  // Rosy Cheek Blush Ovals
  c.fillOval(30, 48.5, 4.5, 2.8, 'R');
  c.fillOval(65, 48.5, 4.5, 2.8, 'R');

  // Signature White Eyebrow Dots (Maro spots)
  c.fillOval(34, 31, 2.5, 2, 'C');
  c.fillOval(61, 31, 2.5, 2, 'C');

  return c.toStringArray();
}

export function getHeadphonesLayer(blink = false): SpriteLayer {
  const c = new LayerCanvas();
  // Headband arching cleanly over the crown of head (leaving forehead clear)
  for (let x = 33; x <= 62; x++) {
    const archY = Math.round(16 + Math.pow((x - 47.5) / 15, 2) * 2.5);
    c.set(x, archY - 1, 'X');
    c.set(x, archY, 'g');
    c.set(x, archY + 1, 'G');
    c.set(x, archY + 2, 'X');
  }

  // Left Earcup at side of head
  c.fillOval(20.5, 37, 4.5, 6, 'g');
  c.fillOval(20, 36, 3, 4, 'G');
  c.fillOval(20, 37, 2, 2.5, blink ? 'W' : 'M'); // Mint LED
  c.fillRect(23, 27, 3, 8, 'g');
  c.fillRect(22, 27, 1, 8, 'X');
  c.fillRect(26, 27, 1, 8, 'X');

  // Right Earcup at side of head
  c.fillOval(74.5, 37, 4.5, 6, 'g');
  c.fillOval(75, 36, 3, 4, 'G');
  c.fillOval(75, 37, 2, 2.5, blink ? 'W' : 'M');
  c.fillRect(69, 27, 3, 8, 'g');
  c.fillRect(68, 27, 1, 8, 'X');
  c.fillRect(72, 27, 1, 8, 'X');

  c.outline('X');
  return c.toStringArray();
}

// ============================================================================
// NOSE & MOUTH VARIANTS
// ============================================================================

export function getNoseAndMouthLayer(
  mouthType: 'w' | 'smile' | 'big_smile' | 'wavy_worried' | 'gritted' | 'small_o' | 'yawn' | 'tongue_out' = 'w'
): SpriteLayer {
  const c = new LayerCanvas();
  // Small black rounded nose at center
  c.fillRect(46, 46, 4, 2.5, 'N');
  c.fillRect(47, 48, 2, 1, 'N');
  c.set(46, 46, 'n'); // 1px glint

  if (mouthType === 'w') {
    c.set(45, 50, 'X');
    c.set(46, 51, 'X');
    c.set(47, 50, 'X');
    c.set(48, 51, 'X');
    c.set(49, 50, 'X');
  } else if (mouthType === 'smile') {
    c.set(44, 50, 'X');
    c.set(45, 51, 'X');
    c.fillRect(46, 52, 4, 1, 'X');
    c.set(50, 51, 'X');
    c.set(51, 50, 'X');
  } else if (mouthType === 'big_smile') {
    c.fillOval(47.5, 53, 5, 4, 'X');
    c.fillOval(47.5, 53.5, 4, 3, 't');
    c.fillOval(47.5, 54, 3, 2, 'T');
  } else if (mouthType === 'wavy_worried') {
    c.set(43, 52, 'X');
    c.set(44, 51, 'X');
    c.set(45, 51, 'X');
    c.set(46, 52, 'X');
    c.set(47, 52, 'X');
    c.set(48, 51, 'X');
    c.set(49, 52, 'X');
    c.set(50, 52, 'X');
    c.set(51, 51, 'X');
  } else if (mouthType === 'gritted') {
    c.fillRect(43, 51, 10, 3, 'X');
    c.fillRect(44, 52, 8, 1, 'W');
  } else if (mouthType === 'small_o') {
    c.fillOval(47.5, 52, 2.5, 2.5, 'X');
    c.set(47, 52, 't');
  } else if (mouthType === 'yawn') {
    c.fillOval(47.5, 53, 6, 5, 'X');
    c.fillOval(47.5, 53.5, 5, 4, 't');
    c.fillOval(47.5, 54, 4, 3, 'T');
  } else if (mouthType === 'tongue_out') {
    c.set(45, 50, 'X');
    c.set(46, 51, 'X');
    c.set(47, 50, 'X');
    c.set(48, 51, 'X');
    c.set(49, 50, 'X');
    c.fillOval(47.5, 53, 2.5, 3, 'T');
  }

  return c.toStringArray();
}

// ============================================================================
// EYES & BROWS VARIANTS (10x12 glossy kawaii eyes)
// ============================================================================

export function getEyesLayer(
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
  browType: 'neutral' | 'curious_raised' | 'angry_v' | 'worried_slanted' = 'neutral'
): SpriteLayer {
  const c = new LayerCanvas();

  if (eyeType === 'open') {
    // Left Glossy Eye (10x12)
    c.fillOval(34.5, 41.5, 5, 6, 'E');
    c.fillOval(34.5, 44, 4.5, 3.5, 'e');
    c.fillRect(32, 38, 3, 3, 'W');
    c.set(36, 44, 'W');

    // Right Glossy Eye (10x12)
    c.fillOval(60.5, 41.5, 5, 6, 'E');
    c.fillOval(60.5, 44, 4.5, 3.5, 'e');
    c.fillRect(58, 38, 3, 3, 'W');
    c.set(62, 44, 'W');
    c.outline('X');
  } else if (eyeType === 'blink') {
    // Closed horizontal eye slits
    c.fillRect(30, 42, 9, 2, 'X');
    c.fillRect(56, 42, 9, 2, 'X');
  } else if (eyeType === 'half_closed') {
    // Sleepy half-closed eyes
    c.fillRect(30, 41, 9, 2, 'X');
    c.fillRect(56, 41, 9, 2, 'X');
    c.fillOval(34.5, 44, 4, 2, 'E');
    c.fillOval(60.5, 44, 4, 2, 'E');
  } else if (eyeType === 'happy_arc') {
    for (let t = -4; t <= 4; t++) {
      const ly = Math.round(42 - (4 - Math.abs(t)) * 0.8);
      c.set(34.5 + t, ly, 'X');
      c.set(34.5 + t, ly + 1, 'X');

      const ry = Math.round(42 - (4 - Math.abs(t)) * 0.8);
      c.set(60.5 + t, ry, 'X');
      c.set(60.5 + t, ry + 1, 'X');
    }
  } else if (eyeType === 'sparkle_star') {
    c.fillOval(34.5, 41.5, 5, 6, 'E');
    c.fillOval(60.5, 41.5, 5, 6, 'E');
    for (const cx of [34.5, 60.5]) {
      c.fillRect(cx - 1, 38, 2, 7, 'Y');
      c.fillRect(cx - 3, 40, 7, 2, 'Y');
      c.fillRect(cx - 1, 40, 2, 2, 'W');
    }
    c.outline('X');
  } else if (eyeType === 'heart') {
    // Adorable heart eyes (Tier 4 / Happy)
    for (const cx of [34.5, 60.5]) {
      c.fillOval(cx - 2, 40, 3, 3, 'K');
      c.fillOval(cx + 2, 40, 3, 3, 'K');
      c.fillPolygon([[cx - 4.5, 41], [cx + 4.5, 41], [cx, 47]], 'K');
      c.set(cx - 2, 39, 'W'); // cute glint
    }
    c.outline('X');
  } else if (eyeType === 'angry_slanted') {
    c.fillPolygon([[29, 44], [33, 39], [39, 42], [37, 46]], 'E');
    c.fillPolygon([[66, 44], [62, 39], [56, 42], [58, 46]], 'E');
    c.set(34, 42, 'W');
    c.set(61, 42, 'W');
    c.outline('X');
  } else if (eyeType === 'worried_wet' || eyeType === 'crying') {
    c.fillOval(34.5, 41.5, 5.5, 6.5, 'E');
    c.fillOval(60.5, 41.5, 5.5, 6.5, 'E');
    c.fillRect(32, 38, 4, 3, 'W');
    c.fillRect(58, 38, 4, 3, 'W');
    c.fillRect(35, 43, 2, 2, 'W');
    c.fillRect(61, 43, 2, 2, 'W');
    c.outline('X');

    if (eyeType === 'crying') {
      // Tears streaming down
      c.fillOval(33, 52, 1.5, 4, 'D');
      c.fillOval(62, 52, 1.5, 4, 'D');
    }
  } else if (eyeType === 'spiral') {
    // Hypnotic / dizzy spirals
    for (const cx of [34.5, 60.5]) {
      c.fillOval(cx, 41.5, 5, 5, 'E');
      c.fillRect(cx - 3, 39, 6, 1, 'W');
      c.fillRect(cx + 2, 40, 1, 3, 'W');
      c.fillRect(cx - 2, 43, 4, 1, 'W');
      c.fillRect(cx - 2, 41, 1, 2, 'W');
    }
    c.outline('X');
  } else if (eyeType === 'peek_one_eye') {
    // One closed squint, one wide eye peeking
    c.fillRect(30, 42, 9, 2, 'X');
    c.fillOval(60.5, 41.5, 5, 6, 'E');
    c.fillRect(58, 38, 3, 3, 'W');
    c.set(62, 44, 'W');
    c.outline('X');
  } else if (eyeType === 'look_up_right') {
    c.fillOval(34.5, 41.5, 5, 6, 'E');
    c.fillOval(60.5, 41.5, 5, 6, 'E');
    c.fillOval(36.5, 39.5, 3.5, 4, 'e');
    c.fillOval(62.5, 39.5, 3.5, 4, 'e');
    c.fillRect(35, 37, 2, 2, 'W');
    c.fillRect(61, 37, 2, 2, 'W');
    c.outline('X');
  } else if (eyeType === 'narrow_suspicious') {
    c.fillOval(34.5, 42.5, 5, 3.5, 'E');
    c.fillOval(60.5, 42.5, 5, 3.5, 'E');
    c.set(33, 42, 'W');
    c.set(59, 42, 'W');
    c.outline('X');
  }

  // Eyebrows
  if (browType === 'neutral') {
    c.fillRect(32, 28, 5, 1.5, 'o');
    c.fillRect(58, 28, 5, 1.5, 'o');
  } else if (browType === 'curious_raised') {
    c.fillRect(31, 28, 5, 1.5, 'o');
    c.fillRect(58, 25, 6, 2, 'o');
  } else if (browType === 'angry_v') {
    for (let i = 0; i < 6; i++) {
      c.set(30 + i, 27 + i * 0.7, 'X');
      c.set(30 + i, 28 + i * 0.7, 'X');
      c.set(65 - i, 27 + i * 0.7, 'X');
      c.set(65 - i, 28 + i * 0.7, 'X');
    }
  } else if (browType === 'worried_slanted') {
    for (let i = 0; i < 5; i++) {
      c.set(35 - i, 27 + i * 0.7, 'o');
      c.set(60 + i, 27 + i * 0.7, 'o');
    }
  }

  return c.toStringArray();
}

// ============================================================================
// ACCESSORY LAYERS (Positioned strictly outside the face area)
// ============================================================================

export function getDetectiveHatLayer(): SpriteLayer {
  const c = new LayerCanvas();
  c.fillOval(47.5, 14, 18, 5, 'B');
  c.fillOval(47.5, 11, 14, 6, 'B');
  c.fillOval(44, 9, 10, 4, 'H');
  c.fillRect(28, 17, 39, 2, 'b');
  c.fillRect(46, 7, 3, 2, 'X');
  c.outline('X');
  return c.toStringArray();
}

export function getMagnifyingGlassLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Held in paw at lower right (never covers face!)
  c.fillOval(74, 66, 6, 6, 'A');
  c.fillOval(74, 66, 4.5, 4.5, 'L');
  c.set(73, 64, 'W');
  c.fillRect(78, 72, 2, 7, 'X');
  c.fillRect(79, 73, 2, 7, 'B');
  c.outline('X');
  return c.toStringArray();
}

export function getThoughtBubbleLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Floating safely top-right of head
  c.fillOval(81, 13, 8, 7, 'W');
  c.fillOval(87, 17, 4, 4, 'W');
  c.fillOval(76, 23, 2, 2, 'W');
  c.fillRect(79, 10, 4, 1.5, 'Q');
  c.fillRect(82, 11, 1.5, 3, 'Q');
  c.fillRect(80, 13, 2.5, 1.5, 'Q');
  c.fillRect(80, 16, 2, 2, 'Q');
  c.outline('X');
  return c.toStringArray();
}

export function getSteamPuffsLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Floating safely above head
  c.fillOval(30, 7, 4, 3, 'W');
  c.fillOval(28, 4, 3, 2.5, 'W');
  c.fillOval(65, 7, 4, 3, 'W');
  c.fillOval(67, 4, 3, 2.5, 'W');
  c.outline('X');
  return c.toStringArray();
}

export function getPartyHatLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Small party hat perched tilted over right ear (never covering face!)
  const hatPoints: [number, number][] = [[61, 16], [68, 3], [72, 18]];
  c.fillPolygon(hatPoints, 'Y');
  c.fillPolygon([[64, 13], [68, 3], [70, 15]], 'K');
  c.fillOval(68, 2, 2.5, 2.5, 'Z'); // pompom
  c.outline('X');
  return c.toStringArray();
}

export function getPawsPeekLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Both front paws raised over the lower face/chin for peek
  c.fillOval(38, 56, 7, 5, 'C');
  c.fillOval(57, 56, 7, 5, 'C');
  c.fillRect(36, 57, 1, 3, 'c');
  c.fillRect(59, 57, 1, 3, 'c');
  c.outline('X');
  return c.toStringArray();
}

export function getThumbsUpLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Right paw raised with a cute thumbs-up!
  c.fillOval(72, 65, 6, 6, 'C');
  c.fillRect(72, 59, 3, 5, 'C'); // thumb pointing up
  c.set(73, 58, 'c');
  c.outline('X');
  return c.toStringArray();
}

export function getPadlockBesideLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Small pixel padlock resting beside the dog on the left (x=12 to 24, y=70 to 86)
  c.fillOval(18, 72, 4, 5, 'A'); // shackle
  c.fillOval(18, 73, 2.5, 3.5, '.');
  c.fillRect(14, 76, 8, 8, 'Y'); // gold body
  c.fillRect(17, 79, 2, 3, 'X'); // keyhole
  c.outline('X');
  return c.toStringArray();
}

export function getGearAboveLayer(): SpriteLayer {
  const c = new LayerCanvas();
  // Small gear icon floating above head (x=43 to 52, y=6 to 15)
  c.fillOval(47.5, 10.5, 4.5, 4.5, 'M');
  c.fillOval(47.5, 10.5, 2, 2, '.');
  // Gear teeth
  c.fillRect(46, 5, 3, 2, 'M');
  c.fillRect(46, 14, 3, 2, 'M');
  c.fillRect(41, 9, 2, 3, 'M');
  c.fillRect(51, 9, 2, 3, 'M');
  c.outline('X');
  return c.toStringArray();
}
