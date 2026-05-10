export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class SpriteSheet {
  private image: HTMLImageElement | null = null;
  private _loaded = false;

  constructor(src: string) {
    const img = new Image();
    img.onload = () => {
      this.image = img;
      this._loaded = true;
    };
    img.onerror = () => { console.error(`SpriteSheet failed to load: ${src}`); };
    img.src = src;
  }

  get isLoaded(): boolean { return this._loaded; }
  get naturalWidth(): number { return this.image?.naturalWidth ?? 0; }
  get naturalHeight(): number { return this.image?.naturalHeight ?? 0; }

  // Draw a sub-region of the sheet at pixel-aligned coordinates.
  drawFrame(
    ctx: CanvasRenderingContext2D,
    frame: FrameRect,
    dx: number,
    dy: number,
    dw = frame.w,
    dh = frame.h,
  ): void {
    if (!this.image) return;
    ctx.drawImage(
      this.image,
      frame.x, frame.y, frame.w, frame.h,
      Math.floor(dx), Math.floor(dy), dw, dh,
    );
  }

  // Draw the entire image at pixel-aligned coordinates.
  draw(ctx: CanvasRenderingContext2D, dx: number, dy: number): void {
    if (!this.image) return;
    ctx.drawImage(this.image, Math.floor(dx), Math.floor(dy));
  }

  // Draw the sprite as a solid white silhouette, preserving transparency.
  // The white version is cached after the first call.
  private whiteCache: OffscreenCanvas | null = null;
  drawAsWhite(ctx: CanvasRenderingContext2D, dx: number, dy: number): void {
    if (!this.image) return;
    if (!this.whiteCache) {
      const w = this.naturalWidth;
      const h = this.naturalHeight;
      const offscreen = new OffscreenCanvas(w, h);
      const offCtx = offscreen.getContext('2d')!;
      offCtx.drawImage(this.image, 0, 0);
      offCtx.globalCompositeOperation = 'source-in';
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(0, 0, w, h);
      this.whiteCache = offscreen;
    }
    ctx.drawImage(this.whiteCache, Math.floor(dx), Math.floor(dy));
  }

  // Extract raw RGBA pixel data for a region. Result is cached by the caller.
  extractPixels(sx: number, sy: number, sw: number, sh: number): Uint8ClampedArray | null {
    if (!this.image) return null;
    const canvas = new OffscreenCanvas(sw, sh);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(this.image, sx, sy, sw, sh, 0, 0, sw, sh);
    return ctx.getImageData(0, 0, sw, sh).data;
  }

  // Build an evenly-spaced grid of frame rects (rows × cols).
  static grid(
    sheetW: number,
    sheetH: number,
    cols: number,
    rows: number,
  ): FrameRect[] {
    const fw = sheetW / cols;
    const fh = sheetH / rows;
    const frames: FrameRect[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        frames.push({ x: c * fw, y: r * fh, w: fw, h: fh });
      }
    }
    return frames;
  }
}
