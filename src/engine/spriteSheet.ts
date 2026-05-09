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
