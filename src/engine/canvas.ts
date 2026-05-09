export interface CanvasConfig {
  width: number;
  height: number;
  canvasId?: string;
}

export class PixelCanvas {
  readonly element: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;

  constructor({ width, height, canvasId = 'game' }: CanvasConfig) {
    this.width = width;
    this.height = height;

    const el = document.getElementById(canvasId);
    if (!(el instanceof HTMLCanvasElement)) throw new Error(`#${canvasId} not found`);
    this.element = el;

    // Internal buffer is exactly game resolution — no DPR multiplication.
    // Scaling is handled entirely by CSS with image-rendering: pixelated,
    // which forces nearest-neighbor at every scale step including the final
    // DPR upscale the browser does for HiDPI displays.
    this.element.width = width;
    this.element.height = height;

    const ctx = this.element.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Disable bilinear interpolation for drawImage calls.
    // Combined with CSS image-rendering: pixelated this gives two layers
    // of nearest-neighbor enforcement — belt and suspenders.
    this.ctx.imageSmoothingEnabled = false;

    this.applyScale();
    window.addEventListener('resize', () => this.applyScale());
  }

  private applyScale(): void {
    // Largest integer multiplier that fits the viewport without cropping.
    const scale = Math.max(
      1,
      Math.min(
        Math.floor(window.innerWidth / this.width),
        Math.floor(window.innerHeight / this.height),
      ),
    );
    this.element.style.width = `${this.width * scale}px`;
    this.element.style.height = `${this.height * scale}px`;

    // Changing canvas CSS dimensions does not reset the 2D state,
    // but some browsers silently re-enable smoothing on style changes —
    // re-assert to be safe.
    this.ctx.imageSmoothingEnabled = false;
  }
}
