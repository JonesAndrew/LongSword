import { SpriteSheet } from './spriteSheet';

// WeakMap so cached data is released when the SpriteSheet is GC'd.
const cache = new WeakMap<SpriteSheet, Map<string, Uint8ClampedArray>>();

function getPixels(sheet: SpriteSheet, sx: number, sy: number, sw: number, sh: number): Uint8ClampedArray | null {
  if (!sheet.isLoaded) return null;

  let frames = cache.get(sheet);
  if (!frames) { frames = new Map(); cache.set(sheet, frames); }

  const key = `${sx},${sy}`;
  if (!frames.has(key)) {
    const data = sheet.extractPixels(sx, sy, sw, sh);
    if (!data) return null;
    frames.set(key, data);
  }
  return frames.get(key)!;
}

export function pixelCollide(
  aSheet: SpriteSheet, aSrcX: number, aSrcY: number, aW: number, aH: number, aDrawX: number, aDrawY: number,
  bSheet: SpriteSheet, bSrcX: number, bSrcY: number, bW: number, bH: number, bDrawX: number, bDrawY: number,
): boolean {
  // Broad-phase AABB
  if (aDrawX + aW <= bDrawX || bDrawX + bW <= aDrawX) return false;
  if (aDrawY + aH <= bDrawY || bDrawY + bH <= aDrawY) return false;

  const aPixels = getPixels(aSheet, aSrcX, aSrcY, aW, aH);
  const bPixels = getPixels(bSheet, bSrcX, bSrcY, bW, bH);
  if (!aPixels || !bPixels) return false;

  // Narrow-phase: check alpha of every pixel in the overlap rect
  const ox  = Math.max(aDrawX, bDrawX);
  const oy  = Math.max(aDrawY, bDrawY);
  const ox2 = Math.min(aDrawX + aW, bDrawX + bW);
  const oy2 = Math.min(aDrawY + aH, bDrawY + bH);

  for (let y = oy; y < oy2; y++) {
    for (let x = ox; x < ox2; x++) {
      const aAlpha = aPixels[((y - aDrawY) * aW + (x - aDrawX)) * 4 + 3];
      if (aAlpha === 0) continue;
      const bAlpha = bPixels[((y - bDrawY) * bW + (x - bDrawX)) * 4 + 3];
      if (bAlpha > 0) return true;
    }
  }

  return false;
}
