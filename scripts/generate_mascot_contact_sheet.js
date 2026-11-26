// Standalone Node.js script to generate and preview Byte the Shiba Pup (96x96)
// Iteration 5: Headband cleanly over crown (leaving forehead 100% clear), auto-validator for stray pixels

const fs = require('fs');
const zlib = require('zlib');

// ============================================================================
// 1. PALETTE MAP (24 colors, 1px dark outline #3A2418, 3-tone shading)
// ============================================================================
const PALETTE_HEX = {
  '.': null,                  // Transparent
  'X': [58, 36, 24, 255],     // Dark Outline #3A2418 (Soft brown-black)
  'O': [232, 146, 60, 255],   // Shiba Coat Base #E8923C
  'o': [201, 112, 42, 255],   // Shiba Coat Shadow #C9702A
  'H': [246, 179, 104, 255],  // Shiba Coat Highlight #F6B368
  'C': [255, 243, 220, 255],  // Cream Urajiro Base #FFF3DC
  'c': [227, 212, 184, 255],  // Cream Shadow #E3D4B8
  'W': [255, 255, 255, 255],  // Pure White Highlights
  'w': [234, 226, 213, 255],  // Soft White
  'P': [244, 166, 160, 255],  // Inner Ear Pink #F4A6A0
  'p': [216, 130, 124, 255],  // Inner Ear Shadow #D8827C
  'R': [255, 170, 166, 255],  // Rosy Cheek Blush #FFAAA6
  'r': [247, 136, 130, 255],  // Deep Blush #F78882
  'E': [40, 22, 14, 255],     // Eye Pupil Deep Espresso #28160E
  'e': [78, 42, 24, 255],     // Eye Iris Warm Brown #4E2A18
  'N': [34, 20, 12, 255],     // Nose #22140C
  'n': [106, 74, 56, 255],    // Nose Highlight #6A4A38
  'T': [255, 126, 141, 255],  // Tongue Pink #FF7E8D
  't': [216, 88, 104, 255],   // Tongue Shadow #D85868
  'G': [30, 58, 43, 255],     // Headphones Dark Green Band #1E3A2B
  'g': [47, 107, 79, 255],    // Headphones Cup Green #2F6B4F
  'M': [127, 209, 160, 255],  // Headphones Mint LED #7FD1A0
  'Y': [232, 197, 71, 255],   // Gold Tag Base #E8C547
  'y': [184, 147, 32, 255],   // Gold Tag Shadow #B89320
  'S': [180, 172, 160, 160],  // Ground Shadow
  'B': [130, 87, 54, 255],    // Detective Hat Base #825736
  'b': [92, 56, 30, 255],     // Detective Hat Shadow #5C381E
  'L': [110, 168, 194, 255],  // Magnifying Lens Aqua #6EA8C2
  'A': [200, 212, 220, 255],  // Silver Rim #C8D4DC
  'D': [94, 156, 255, 255],   // Tear Drop Blue #5E9CFF
  'Q': [242, 166, 90, 255],   // Thought Question Orange #F2A65A
};

// ============================================================================
// 2. PIXEL CANVAS HELPER WITH AUTO-VALIDATOR
// ============================================================================
class PixelCanvas {
  constructor(width = 96, height = 96) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => Array(width).fill('.'));
  }

  set(x, y, char) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < this.width && y >= 0 && y < this.height && char !== '.') {
      this.grid[y][x] = char;
    }
  }

  fillRect(x, y, w, h, char) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.set(x + dx, y + dy, char);
      }
    }
  }

  fillOval(cx, cy, rx, ry, char) {
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

  fillPolygon(points, char) {
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
          const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        if (inside) this.set(x, y, char);
      }
    }
  }

  outline(outlineChar = 'X') {
    const copy = this.grid.map((row) => [...row]);
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (copy[y][x] === '.') {
          let hasNeighbor = false;
          for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
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

  overlay(otherCanvas, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < otherCanvas.height; y++) {
      for (let x = 0; x < otherCanvas.width; x++) {
        const char = otherCanvas.grid[y][x];
        if (char !== '.') {
          this.set(x + offsetX, y + offsetY, char);
        }
      }
    }
  }

  // Auto-checks for stray pixels (orphaned pixels with 0 neighbors) and invalid chars
  validate(name = 'Layer') {
    let strayCount = 0;
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const char = this.grid[y][x];
        if (char !== '.') {
          if (!PALETTE_HEX[char]) {
            throw new Error(`[${name}] Invalid palette key "${char}" at (${x}, ${y})`);
          }

          let neighborCount = 0;
          for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
              if (this.grid[ny][nx] !== '.') neighborCount++;
            }
          }
          if (neighborCount === 0) {
            strayCount++;
            this.grid[y][x] = '.'; // Clean stray pixel automatically
          }
        }
      }
    }
    return { strayCount, valid: true };
  }
}

// ============================================================================
// 3. ANATOMY BUILDERS
// ============================================================================

// --- GROUND SHADOW ---
function buildGroundShadow() {
  const c = new PixelCanvas(96, 96);
  c.fillOval(47.5, 90, 27, 3.5, 'S');
  c.validate('GroundShadow');
  return c;
}

// --- FLUFFY CURLED TAIL (Behind Body) ---
function buildTail(variant = 'curl_right') {
  const c = new PixelCanvas(96, 96);

  if (variant === 'curl_right' || variant === 'curl_a') {
    c.fillOval(72, 69, 7.5, 7, 'o');
    c.fillOval(76, 61, 8.5, 8, 'O');
    c.fillOval(78, 51, 9, 8.5, 'H');
    c.fillOval(74, 43, 8, 7.5, 'O');
    c.fillOval(68, 39, 7, 6.5, 'C'); // Cream tail tip
    c.fillOval(63, 42, 5, 4.5, 'C');
  } else if (variant === 'wag' || variant === 'curl_b') {
    c.fillOval(73, 67, 7.5, 7, 'o');
    c.fillOval(79, 58, 9, 8.5, 'O');
    c.fillOval(81, 47, 9.5, 9, 'H');
    c.fillOval(77, 38, 8.5, 8, 'O');
    c.fillOval(70, 33, 7.5, 7, 'C');
    c.fillOval(64, 37, 5.5, 5, 'C');
  }

  c.outline('X');
  c.validate('Tail');
  return c;
}

// --- BODY & PAWS (Chubby Sitting Puppy with Round Front Paws) ---
function buildBody() {
  const c = new PixelCanvas(96, 96);

  // Chubby body oval
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
  c.validate('Body');
  return c;
}

// --- COLLAR & SHIELD TAG ---
function buildCollar() {
  const c = new PixelCanvas(96, 96);
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
  c.validate('Collar');
  return c;
}

// --- POINTED SHIBA EARS ---
function buildEars(type = 'normal') {
  const c = new PixelCanvas(96, 96);

  if (type === 'normal') {
    // Left Triangular Pointed Shiba Ear
    const leftPoints = [[25, 28], [32, 9], [41, 25]];
    c.fillPolygon(leftPoints, 'O');
    c.fillPolygon([[27, 26], [32, 11], [39, 23]], 'H');
    c.fillPolygon([[28, 25], [32, 13], [37, 23]], 'P'); // pink inner ear
    c.fillPolygon([[33, 20], [32, 14], [37, 23]], 'p'); // inner shadow

    // Right Triangular Pointed Shiba Ear
    const rightPoints = [[54, 25], [63, 9], [70, 28]];
    c.fillPolygon(rightPoints, 'O');
    c.fillPolygon([[58, 23], [63, 12], [68, 26]], 'P');
    c.fillPolygon([[63, 18], [63, 13], [67, 25]], 'p');
  } else if (type === 'tilt') {
    const leftPoints = [[25, 28], [32, 9], [41, 25]];
    c.fillPolygon(leftPoints, 'O');
    c.fillPolygon([[28, 25], [32, 13], [37, 23]], 'P');

    const rightPoints = [[55, 24], [68, 12], [73, 29]];
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
  c.validate('Ears');
  return c;
}

// --- HEAD BASE & URAJIRO CREAM MASK ---
function buildHeadBase() {
  const c = new PixelCanvas(96, 96);

  // Big round chubby head
  c.fillOval(47.5, 41, 27, 20, 'O');
  c.fillOval(42, 34, 19, 13, 'H'); // Forehead highlight
  c.fillOval(54, 45, 20, 15, 'o'); // Shadow bottom-right

  // Lower half: Cream Urajiro Mask (Snout, cheeks, chin)
  c.fillOval(47.5, 50, 24, 11, 'C');
  c.fillOval(33, 49, 10.5, 8.5, 'C'); // Chubby left cheek
  c.fillOval(62, 49, 10.5, 8.5, 'C'); // Chubby right cheek
  c.fillOval(47.5, 53, 16, 8.5, 'C'); // Muzzle snout

  // Cream shadow under chin
  c.fillOval(47.5, 59, 13, 3, 'c');

  // 1px Dark Outline
  c.outline('X');

  // Rosy Cheek Blush Ovals
  c.fillOval(30, 48.5, 4.5, 2.8, 'R');
  c.fillOval(65, 48.5, 4.5, 2.8, 'R');

  // ⭐ SIGNATURE SHIBA INU FEATURE: Two White/Cream Eyebrow Dots (Maro spots)!
  c.fillOval(34, 31, 2.5, 2, 'C');
  c.fillOval(61, 31, 2.5, 2, 'C');

  c.validate('HeadBase');
  return c;
}

// --- WYNTRIX OVER-EAR HEADPHONES (Sits cleanly ON TOP of the head between the ears) ---
function buildHeadphones(ledBlink = false) {
  const c = new PixelCanvas(96, 96);

  // Clean headband arching ON TOP of the head crown between the ears (y = 15 to 19, x = 32 to 63)
  // Forehead is completely unblocked and clean!
  for (let x = 33; x <= 62; x++) {
    const archY = Math.round(16 + Math.pow((x - 47.5) / 15, 2) * 2.5);
    c.set(x, archY - 1, 'X');
    c.set(x, archY, 'g');
    c.set(x, archY + 1, 'G');
    c.set(x, archY + 2, 'X');
  }

  // Left Earcup at side of head (x = 18 to 25, y = 32 to 43)
  c.fillOval(20.5, 37, 4.5, 6, 'g');
  c.fillOval(20, 36, 3, 4, 'G');
  c.fillOval(20, 37, 2, 2.5, ledBlink ? 'W' : 'M'); // Mint LED indicator

  // Connecting band strut down behind ear to left cup
  c.fillRect(23, 27, 3, 8, 'g');
  c.fillRect(22, 27, 1, 8, 'X');
  c.fillRect(26, 27, 1, 8, 'X');

  // Right Earcup at side of head (x = 70 to 77, y = 32 to 43)
  c.fillOval(74.5, 37, 4.5, 6, 'g');
  c.fillOval(75, 36, 3, 4, 'G');
  c.fillOval(75, 37, 2, 2.5, ledBlink ? 'W' : 'M'); // Mint LED indicator

  // Connecting band strut down behind ear to right cup
  c.fillRect(69, 27, 3, 8, 'g');
  c.fillRect(68, 27, 1, 8, 'X');
  c.fillRect(72, 27, 1, 8, 'X');

  c.outline('X');
  c.validate('Headphones');
  return c;
}

// --- NOSE & MOUTH ---
function buildNoseAndMouth(mouthType = 'w') {
  const c = new PixelCanvas(96, 96);

  // Small black rounded nose at center (x = 46 to 49, y = 46 to 48)
  c.fillRect(46, 46, 4, 2.5, 'N');
  c.fillRect(47, 48, 2, 1, 'N');
  c.set(46, 46, 'n'); // 1px specular nose glint

  // Mouth Variants
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
    c.fillOval(47.5, 53.5, 4, 3, 't'); // tongue shadow
    c.fillOval(47.5, 54, 3, 2, 'T');   // tongue pink
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
    c.fillRect(44, 52, 8, 1, 'W'); // white teeth line
  } else if (mouthType === 'small_o') {
    c.fillOval(47.5, 52, 2.5, 2.5, 'X');
    c.set(47, 52, 't');
  }

  c.validate('NoseAndMouth');
  return c;
}

// --- EYES & BROWS (10x12 glossy kawaii puppy eyes) ---
function buildEyes(eyeType = 'open', browType = 'neutral') {
  const c = new PixelCanvas(96, 96);

  if (eyeType === 'open') {
    // Left Glossy Eye (10x12)
    c.fillOval(34.5, 41.5, 5, 6, 'E');
    c.fillOval(34.5, 44, 4.5, 3.5, 'e');
    c.fillRect(32, 38, 3, 3, 'W'); // primary highlight
    c.set(36, 44, 'W'); // catchlight

    // Right Glossy Eye (10x12)
    c.fillOval(60.5, 41.5, 5, 6, 'E');
    c.fillOval(60.5, 44, 4.5, 3.5, 'e');
    c.fillRect(58, 38, 3, 3, 'W');
    c.set(62, 44, 'W');

    c.outline('X');
  } else if (eyeType === 'happy_arc') {
    // Adorable smiling curved arcs (^ ^)
    for (let t = -4; t <= 4; t++) {
      const ly = Math.round(42 - (4 - Math.abs(t)) * 0.8);
      c.set(34.5 + t, ly, 'X');
      c.set(34.5 + t, ly + 1, 'X');

      const ry = Math.round(42 - (4 - Math.abs(t)) * 0.8);
      c.set(60.5 + t, ry, 'X');
      c.set(60.5 + t, ry + 1, 'X');
    }
  } else if (eyeType === 'sparkle_star') {
    // 4-point golden star sparkle eyes
    c.fillOval(34.5, 41.5, 5, 6, 'E');
    c.fillOval(60.5, 41.5, 5, 6, 'E');
    for (const cx of [34.5, 60.5]) {
      c.fillRect(cx - 1, 38, 2, 7, 'Y');
      c.fillRect(cx - 3, 40, 7, 2, 'Y');
      c.fillRect(cx - 1, 40, 2, 2, 'W');
    }
    c.outline('X');
  } else if (eyeType === 'angry_slanted') {
    // Slanted sharp almond eyes
    c.fillPolygon([[29, 44], [33, 39], [39, 42], [37, 46]], 'E');
    c.fillPolygon([[66, 44], [62, 39], [56, 42], [58, 46]], 'E');
    c.set(34, 42, 'W');
    c.set(61, 42, 'W');
    c.outline('X');
  } else if (eyeType === 'worried_wet') {
    // Brimming wet eyes
    c.fillOval(34.5, 41.5, 5.5, 6.5, 'E');
    c.fillOval(60.5, 41.5, 5.5, 6.5, 'E');
    c.fillRect(32, 38, 4, 3, 'W');
    c.fillRect(58, 38, 4, 3, 'W');
    c.fillRect(35, 43, 2, 2, 'W');
    c.fillRect(61, 43, 2, 2, 'W');
    c.outline('X');
  } else if (eyeType === 'look_up_right') {
    // Thinking gaze directed up-right
    c.fillOval(34.5, 41.5, 5, 6, 'E');
    c.fillOval(60.5, 41.5, 5, 6, 'E');
    c.fillOval(36.5, 39.5, 3.5, 4, 'e');
    c.fillOval(62.5, 39.5, 3.5, 4, 'e');
    c.fillRect(35, 37, 2, 2, 'W');
    c.fillRect(61, 37, 2, 2, 'W');
    c.outline('X');
  } else if (eyeType === 'detective_narrow') {
    // Narrowed suspicious calculating eyes
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

  c.validate('Eyes');
  return c;
}

// --- ACCESSORIES ---
function buildDetectiveHat() {
  const c = new PixelCanvas(96, 96);
  // Deerstalker hat seated cleanly on top of head crown at y = 10 to 19 (ABOVE eyes!)
  c.fillOval(47.5, 14, 18, 5, 'B');
  c.fillOval(47.5, 11, 14, 6, 'B');
  c.fillOval(44, 9, 10, 4, 'H');
  c.fillRect(28, 17, 39, 2, 'b');
  c.fillRect(46, 7, 3, 2, 'X');
  c.outline('X');
  c.validate('DetectiveHat');
  return c;
}

function buildMagnifyingGlass() {
  const c = new PixelCanvas(96, 96);
  c.fillOval(74, 66, 6, 6, 'A');
  c.fillOval(74, 66, 4.5, 4.5, 'L');
  c.set(73, 64, 'W');
  c.fillRect(78, 72, 2, 7, 'X');
  c.fillRect(79, 73, 2, 7, 'B');
  c.outline('X');
  c.validate('MagnifyingGlass');
  return c;
}

function buildThoughtBubble() {
  const c = new PixelCanvas(96, 96);
  c.fillOval(81, 13, 8, 7, 'W');
  c.fillOval(87, 17, 4, 4, 'W');
  c.fillOval(76, 23, 2, 2, 'W');
  c.fillRect(79, 10, 4, 1.5, 'Q');
  c.fillRect(82, 11, 1.5, 3, 'Q');
  c.fillRect(80, 13, 2.5, 1.5, 'Q');
  c.fillRect(80, 16, 2, 2, 'Q');
  c.outline('X');
  c.validate('ThoughtBubble');
  return c;
}

function buildSteamPuffs() {
  const c = new PixelCanvas(96, 96);
  c.fillOval(30, 7, 4, 3, 'W');
  c.fillOval(28, 4, 3, 2.5, 'W');
  c.fillOval(65, 7, 4, 3, 'W');
  c.fillOval(67, 4, 3, 2.5, 'W');
  c.outline('X');
  c.validate('SteamPuffs');
  return c;
}

function buildTears() {
  const c = new PixelCanvas(96, 96);
  c.fillOval(33, 52, 1.5, 3, 'D');
  c.fillOval(62, 52, 1.5, 3, 'D');
  c.validate('Tears');
  return c;
}

// ============================================================================
// 4. EMOTION COMPOSITORS (The 6 Required Faces + IDLE)
// ============================================================================

function compositeIdle() {
  const full = new PixelCanvas(96, 96);
  full.overlay(buildGroundShadow());
  full.overlay(buildTail('curl_right'));
  full.overlay(buildEars('normal'));
  full.overlay(buildHeadphones()); // headphones behind head crown
  full.overlay(buildBody());
  full.overlay(buildCollar());
  full.overlay(buildHeadBase());
  full.overlay(buildEyes('open', 'neutral'));
  full.overlay(buildNoseAndMouth('w'));
  return full;
}

function compositeHappy() {
  const full = new PixelCanvas(96, 96);
  full.overlay(buildGroundShadow());
  full.overlay(buildTail('wag'));
  full.overlay(buildEars('normal'));
  full.overlay(buildHeadphones());
  full.overlay(buildBody());
  full.overlay(buildCollar());
  full.overlay(buildHeadBase());
  full.overlay(buildEyes('happy_arc', 'neutral'));
  full.overlay(buildNoseAndMouth('big_smile'));
  return full;
}

function compositeAngry() {
  const full = new PixelCanvas(96, 96);
  full.overlay(buildGroundShadow());
  full.overlay(buildTail('curl_right'));
  full.overlay(buildEars('angry_pinned'));
  full.overlay(buildHeadphones());
  full.overlay(buildBody());
  full.overlay(buildCollar());
  full.overlay(buildHeadBase());
  full.overlay(buildSteamPuffs());
  full.overlay(buildEyes('angry_slanted', 'angry_v'));
  full.overlay(buildNoseAndMouth('gritted'));
  return full;
}

function compositeSad() {
  const full = new PixelCanvas(96, 96);
  full.overlay(buildGroundShadow());
  full.overlay(buildTail('curl_right'));
  full.overlay(buildEars('droop'));
  full.overlay(buildHeadphones());
  full.overlay(buildBody());
  full.overlay(buildCollar());
  full.overlay(buildHeadBase());
  full.overlay(buildEyes('worried_wet', 'worried_slanted'));
  full.overlay(buildTears());
  full.overlay(buildNoseAndMouth('wavy_worried'));
  return full;
}

function compositeThinking() {
  const full = new PixelCanvas(96, 96);
  full.overlay(buildGroundShadow());
  full.overlay(buildTail('curl_right'));
  full.overlay(buildEars('tilt'));
  full.overlay(buildHeadphones());
  full.overlay(buildBody());
  full.overlay(buildCollar());
  full.overlay(buildHeadBase());
  full.overlay(buildThoughtBubble());
  full.overlay(buildEyes('look_up_right', 'curious_raised'));
  full.overlay(buildNoseAndMouth('small_o'));
  return full;
}

function compositeDetective() {
  const full = new PixelCanvas(96, 96);
  full.overlay(buildGroundShadow());
  full.overlay(buildTail('curl_right'));
  full.overlay(buildEars('normal'));
  full.overlay(buildHeadphones());
  full.overlay(buildBody());
  full.overlay(buildCollar());
  full.overlay(buildHeadBase());
  full.overlay(buildDetectiveHat());
  full.overlay(buildEyes('detective_narrow', 'neutral'));
  full.overlay(buildNoseAndMouth('w'));
  full.overlay(buildMagnifyingGlass());
  return full;
}

function compositeWow() {
  const full = new PixelCanvas(96, 96);
  full.overlay(buildGroundShadow());
  full.overlay(buildTail('wag'));
  full.overlay(buildEars('normal'));
  full.overlay(buildHeadphones());
  full.overlay(buildBody());
  full.overlay(buildCollar());
  full.overlay(buildHeadBase());
  full.overlay(buildEyes('sparkle_star', 'curious_raised'));
  full.overlay(buildNoseAndMouth('big_smile'));
  return full;
}

// ============================================================================
// 5. PNG ENCODER (Pure Node.js + zlib)
// ============================================================================
function encodePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0;
    rgbaBuffer.copy(rawData, y * rowSize + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', idatData);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function canvasToRgba(canvas, scale = 1, bgRgba = [251, 246, 234, 255]) {
  const w = canvas.width * scale;
  const h = canvas.height * scale;
  const buf = Buffer.alloc(w * h * 4);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const char = canvas.grid[y][x];
      const color = PALETTE_HEX[char] || bgRgba;

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = x * scale + sx;
          const py = y * scale + sy;
          const idx = (py * w + px) * 4;

          if (color[3] === 255) {
            buf[idx] = color[0];
            buf[idx + 1] = color[1];
            buf[idx + 2] = color[2];
            buf[idx + 3] = 255;
          } else if (color[3] > 0) {
            const a = color[3] / 255;
            buf[idx] = Math.round(color[0] * a + bgRgba[0] * (1 - a));
            buf[idx + 1] = Math.round(color[1] * a + bgRgba[1] * (1 - a));
            buf[idx + 2] = Math.round(color[2] * a + bgRgba[2] * (1 - a));
            buf[idx + 3] = 255;
          } else {
            buf[idx] = bgRgba[0];
            buf[idx + 1] = bgRgba[1];
            buf[idx + 2] = bgRgba[2];
            buf[idx + 3] = 255;
          }
        }
      }
    }
  }

  return buf;
}

// ============================================================================
// 6. BUILD CONTACT SHEET
// ============================================================================
function generateContactSheet() {
  const sprites = [
    { name: '1. IDLE', canvas: compositeIdle() },
    { name: '2. HAPPY', canvas: compositeHappy() },
    { name: '3. ANGRY', canvas: compositeAngry() },
    { name: '4. SAD / WORRIED', canvas: compositeSad() },
    { name: '5. THINKING', canvas: compositeThinking() },
    { name: '6. DETECTIVE', canvas: compositeDetective() },
    { name: '7. WOW / EXCITED', canvas: compositeWow() },
  ];

  const cols = 4;
  const rows = 2;
  const spriteW = 96;
  const spriteH = 96;
  const scale = 3; // 96 * 3 = 288px per sprite!
  const cellW = spriteW * scale;
  const cellH = spriteH * scale;
  const padding = 16;
  const labelH = 28;

  const sheetW = cols * cellW + (cols + 1) * padding;
  const sheetH = rows * (cellH + labelH) + (rows + 1) * padding;

  const bgRgba = [251, 246, 234, 255]; // Pixel Garden cream
  const sheetBuf = Buffer.alloc(sheetW * sheetH * 4);

  // Fill background
  for (let i = 0; i < sheetW * sheetH; i++) {
    sheetBuf[i * 4] = bgRgba[0];
    sheetBuf[i * 4 + 1] = bgRgba[1];
    sheetBuf[i * 4 + 2] = bgRgba[2];
    sheetBuf[i * 4 + 3] = 255;
  }

  sprites.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const startX = padding + col * (cellW + padding);
    const startY = padding + row * (cellH + labelH + padding);

    const spriteBuf = canvasToRgba(item.canvas, scale, bgRgba);

    // Blit sprite
    for (let y = 0; y < cellH; y++) {
      for (let x = 0; x < cellW; x++) {
        const srcIdx = (y * cellW + x) * 4;
        const dstIdx = ((startY + y) * sheetW + (startX + x)) * 4;

        sheetBuf[dstIdx] = spriteBuf[srcIdx];
        sheetBuf[dstIdx + 1] = spriteBuf[srcIdx + 1];
        sheetBuf[dstIdx + 2] = spriteBuf[srcIdx + 2];
        sheetBuf[dstIdx + 3] = 255;
      }
    }

    // Border around cell
    const borderCol = [58, 36, 24, 255]; // #3A2418
    for (let x = 0; x < cellW; x++) {
      const topIdx = (startY * sheetW + (startX + x)) * 4;
      const botIdx = ((startY + cellH) * sheetW + (startX + x)) * 4;
      sheetBuf.set(borderCol, topIdx);
      sheetBuf.set(borderCol, botIdx);
    }
    for (let y = 0; y < cellH; y++) {
      const leftIdx = ((startY + y) * sheetW + startX) * 4;
      const rightIdx = ((startY + y) * sheetW + (startX + cellW - 1)) * 4;
      sheetBuf.set(borderCol, leftIdx);
      sheetBuf.set(borderCol, rightIdx);
    }
  });

  const pngBuffer = encodePng(sheetW, sheetH, sheetBuf);
  fs.mkdirSync('public/dev', { recursive: true });
  fs.writeFileSync('public/dev/contact-sheet.png', pngBuffer);
  console.log(`Generated contact-sheet.png: ${sheetW}x${sheetH} px (${(pngBuffer.length / 1024).toFixed(1)} KB)`);

  const idleBuf = canvasToRgba(sprites[0].canvas, 4, [0, 0, 0, 0]); // 4x scale = 384x384
  const idlePng = encodePng(384, 384, idleBuf);
  fs.writeFileSync('public/dev/byte-idle.png', idlePng);
  console.log(`Generated byte-idle.png: 384x384 px (${(idlePng.length / 1024).toFixed(1)} KB)`);
}

generateContactSheet();
