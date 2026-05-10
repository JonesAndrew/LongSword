import { SpriteSheet } from './spriteSheet';

export interface Collidable {
  sheet: SpriteSheet;
  srcX: number;
  srcY: number;
  w: number;
  h: number;
  drawX: number;
  drawY: number;
  flipX?: boolean;
}

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

export function pixelCollide(a: Collidable, b: Collidable): boolean {
  // Broad-phase AABB
  if (a.drawX + a.w <= b.drawX || b.drawX + b.w <= a.drawX) return false;
  if (a.drawY + a.h <= b.drawY || b.drawY + b.h <= a.drawY) return false;

  const aPixels = getPixels(a.sheet, a.srcX, a.srcY, a.w, a.h);
  const bPixels = getPixels(b.sheet, b.srcX, b.srcY, b.w, b.h);
  if (!aPixels || !bPixels) return false;

  // Narrow-phase: check alpha of every pixel in the overlap rect.
  // flipX mirrors the x lookup into the source data without needing a separate cache entry.
  const ox  = Math.max(a.drawX, b.drawX);
  const oy  = Math.max(a.drawY, b.drawY);
  const ox2 = Math.min(a.drawX + a.w, b.drawX + b.w);
  const oy2 = Math.min(a.drawY + a.h, b.drawY + b.h);

  for (let y = oy; y < oy2; y++) {
    for (let x = ox; x < ox2; x++) {
      const aLocalX = a.flipX ? (a.w - 1 - (x - a.drawX)) : (x - a.drawX);
      const aAlpha = aPixels[((y - a.drawY) * a.w + aLocalX) * 4 + 3];
      if (aAlpha === 0) continue;
      const bAlpha = bPixels[((y - b.drawY) * b.w + (x - b.drawX)) * 4 + 3];
      if (bAlpha > 0) return true;
    }
  }

  return false;
}
