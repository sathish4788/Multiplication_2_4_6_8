import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, getPixel) {
  // getPixel(x, y) returns [r, g, b, a]
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcTarget = buf.subarray(4, 8 + len);
  const crc = crc32(crcTarget);
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// CRC32 implementation for PNG
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

// Render icon design: Pixar style magical paintbrush with rainbow pattern splashes and number 2,4,6,5
function drawIcon(width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.46;
  const safeRadius = isMaskable ? width * 0.38 : radius;

  return (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);

    // If maskable, fill whole square with gradient; if standard, circular badge with subtle border
    let bgR = 79, bgG = 70, bgB = 229, bgA = 255; // Indigo
    const t = (y / height);
    // Gradient from Violet/Indigo #4F46E5 to Fuchsia/Purple #7C3AED
    bgR = Math.round(79 + (124 - 79) * t);
    bgG = Math.round(70 + (58 - 70) * t);
    bgB = Math.round(229 + (237 - 229) * t);

    if (!isMaskable) {
      if (dist > radius) {
        return [0, 0, 0, 0]; // Transparent outside
      }
      if (dist > radius - 3) {
        // Crisp golden border
        return [254, 240, 138, 255];
      }
    }

    // Paint splatter dots representing the table colors around the brush
    // Splatters at various angles:
    // Berry Pink (#EC4899), Amber (#F97316), Emerald (#10B981), Cyan (#06B6D4), Marigold (#F59E0B)
    const splatters = [
      { x: cx - width * 0.28, y: cy - height * 0.22, r: width * 0.08, col: [236, 72, 153] },
      { x: cx + width * 0.28, y: cy - height * 0.24, r: width * 0.09, col: [249, 115, 22] },
      { x: cx + width * 0.32, y: cy + height * 0.16, r: width * 0.085, col: [16, 185, 129] },
      { x: cx - width * 0.26, y: cy + height * 0.22, r: width * 0.095, col: [6, 182, 212] },
      { x: cx, y: cy + height * 0.35, r: width * 0.075, col: [245, 158, 11] }
    ];

    for (const splat of splatters) {
      const sDist = Math.hypot(x - splat.x, y - splat.y);
      if (sDist <= splat.r) {
        // Soft white ring
        if (sDist > splat.r - 2) return [255, 255, 255, 240];
        return [...splat.col, 255];
      }
    }

    // Central Pixar Brush
    // Handle: angled rectangle from top-right towards center
    // Let's project point into brush coordinate system rotated by -45 degrees
    const cosA = Math.cos(-Math.PI / 4);
    const sinA = Math.sin(-Math.PI / 4);
    const bx = cosA * dx - sinA * dy;
    const by = sinA * dx + cosA * dy;

    // In brush coords: handle is along +Y, brush tip is along -Y
    // Handle: Y from 0 to width*0.35, X from -width*0.045 to +width*0.045
    if (by >= 0 && by <= width * 0.35 && Math.abs(bx) <= width * 0.045) {
      // Wood gradient
      const wG = Math.round(217 - (Math.abs(bx) / (width * 0.045)) * 40);
      return [wG, Math.round(wG * 0.65), Math.round(wG * 0.35), 255];
    }
    // Handle round end
    if (by > width * 0.35 && Math.hypot(bx, by - width * 0.35) <= width * 0.045) {
      return [200, 130, 70, 255];
    }

    // Ferrule (metal silver ring)
    if (by >= -width * 0.06 && by < 0 && Math.abs(bx) <= width * 0.055) {
      // Shiny chrome silver
      const shine = Math.round(230 + Math.sin(bx * 0.3) * 25);
      return [shine, shine, shine + 10, 255];
    }

    // Bristles: Y from -width*0.22 to -width*0.06, tapering
    if (by >= -width * 0.22 && by < -width * 0.06) {
      const bristleWidth = width * 0.055 + (by - (-width * 0.06)) * -0.05;
      if (Math.abs(bx) <= bristleWidth) {
        // Bristles with magical glowing paint tip at the tip
        if (by < -width * 0.16) {
          // Rainbow paint tip (Gold / Amber / Pink)
          return [255, 215, 0, 255];
        }
        return [254, 243, 199, 255];
      }
    }

    // Magic sparkle stars around tip
    const sparkleTipDist = Math.hypot(bx, by - (-width * 0.24));
    if (sparkleTipDist <= width * 0.035) {
      return [255, 255, 255, 255];
    }

    return [bgR, bgG, bgB, bgA];
  };
}

// Ensure public/icons directory exists
const publicIconsDir = path.resolve('/public/icons');
fs.mkdirSync(publicIconsDir, { recursive: true });

// 1. icon-192.png
const png192 = createPNG(192, 192, drawIcon(192, 192, false));
fs.writeFileSync(path.join(publicIconsDir, 'icon-192.png'), png192);

// 2. icon-512.png
const png512 = createPNG(512, 512, drawIcon(512, 512, false));
fs.writeFileSync(path.join(publicIconsDir, 'icon-512.png'), png512);

// 3. icon-maskable-512.png
const pngMaskable512 = createPNG(512, 512, drawIcon(512, 512, true));
fs.writeFileSync(path.join(publicIconsDir, 'icon-maskable-512.png'), pngMaskable512);

// 4. apple-touch-icon.png (180x180)
const png180 = createPNG(180, 180, drawIcon(180, 180, false));
fs.writeFileSync(path.join(publicIconsDir, 'apple-touch-icon.png'), png180);

// 5. SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="50%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#DB2777" />
    </linearGradient>
    <linearGradient id="brushWood" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="50%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94A3B8" />
      <stop offset="50%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#64748B" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Outer Rounded Square / Circle Badge -->
  <rect width="512" height="512" rx="120" fill="url(#bg)" />
  <rect x="12" y="12" width="488" height="488" rx="112" fill="none" stroke="#FDE047" stroke-width="8" stroke-dasharray="16 8" opacity="0.6"/>

  <!-- Paint Palette Splatters with Tables 2, 4, 6, 5 -->
  <!-- 2: Pink -->
  <circle cx="120" cy="130" r="46" fill="#EC4899" filter="url(#glow)"/>
  <text x="120" y="142" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" text-anchor="middle">2</text>

  <!-- 4: Orange -->
  <circle cx="390" cy="120" r="48" fill="#F97316" filter="url(#glow)"/>
  <text x="390" y="133" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" text-anchor="middle">4</text>

  <!-- 6: Green -->
  <circle cx="410" cy="370" r="46" fill="#10B981" filter="url(#glow)"/>
  <text x="410" y="382" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" text-anchor="middle">6</text>

  <!-- 5: Yellow Gold -->
  <circle cx="110" cy="380" r="48" fill="#F59E0B" filter="url(#glow)"/>
  <text x="110" y="393" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" text-anchor="middle">5</text>

  <!-- Magical Paint Splash in Center -->
  <path d="M256,160 C320,170 340,240 310,290 C290,320 230,320 200,290 C170,260 190,180 256,160 Z" fill="#38BDF8" opacity="0.9" filter="url(#glow)" />

  <!-- Animated Pixar Style Character Paintbrush Barnaby -->
  <g transform="translate(256, 256) rotate(-35)">
    <!-- Wooden Handle -->
    <path d="M -16,40 L 16,40 L 12,170 C 12,185 -12,185 -12,170 Z" fill="url(#brushWood)" stroke="#78350F" stroke-width="4"/>
    <!-- Silver Ferrule -->
    <rect x="-20" y="0" width="40" height="42" rx="4" fill="url(#silver)" stroke="#334155" stroke-width="3"/>
    <!-- Ferrule ridges -->
    <line x1="-20" y1="14" x2="20" y2="14" stroke="#475569" stroke-width="2"/>
    <line x1="-20" y1="28" x2="20" y2="28" stroke="#475569" stroke-width="2"/>
    <!-- Bristles -->
    <path d="M -20,0 C -22,-30 -26,-65 0,-90 C 26,-65 22,-30 20,0 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="3"/>
    <!-- Glowing Paint Dipped Tip -->
    <path d="M -15,-50 C -18,-70 0,-90 0,-90 C 0,-90 18,-70 15,-50 C 8,-42 -8,-42 -15,-50 Z" fill="#EC4899"/>
    <circle cx="0" cy="-90" r="8" fill="#FFFFFF" filter="url(#glow)"/>

    <!-- Mascot Face on Ferrule -->
    <ellipse cx="-8" cy="20" rx="3.5" ry="5" fill="#0F172A"/>
    <ellipse cx="8" cy="20" rx="3.5" ry="5" fill="#0F172A"/>
    <circle cx="-9" cy="18" r="1.5" fill="#FFFFFF"/>
    <circle cx="7" cy="18" r="1.5" fill="#FFFFFF"/>
    <!-- Smile -->
    <path d="M -5,28 Q 0,33 5,28" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Rosy cheeks -->
    <circle cx="-13" cy="24" r="3" fill="#F43F5E" opacity="0.6"/>
    <circle cx="13" cy="24" r="3" fill="#F43F5E" opacity="0.6"/>
  </g>

  <!-- Sparkles -->
  <polygon points="256,70 262,85 278,85 265,95 270,110 256,100 242,110 247,95 234,85 250,85" fill="#FEF08A" filter="url(#glow)"/>
  <polygon points="340,200 344,210 354,210 346,216 349,226 340,220 331,226 334,216 326,210 336,210" fill="#FFFFFF"/>
</svg>`;

fs.writeFileSync(path.join(publicIconsDir, 'icon.svg'), svgContent);
console.log('Successfully generated all PWA icons (192, 512, maskable 512, apple 180, svg)!');
