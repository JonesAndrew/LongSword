import { SpriteSheet } from './spriteSheet';

export class Animation {
  private frame = 0;
  private timer = 0;

  constructor(
    readonly sheet: SpriteSheet,
    readonly frameW: number,
    readonly frameH: number,
    readonly fps: number,
  ) {}

  get frameCount(): number {
    return this.sheet.isLoaded ? Math.round(this.sheet.naturalWidth / this.frameW) : 0;
  }

  get currentFrame(): number { return this.frame; }

  get isDone(): boolean {
    return this.sheet.isLoaded && this.frame >= this.frameCount - 1;
  }

  reset(): void {
    this.frame = 0;
    this.timer = 0;
  }

  update(dt: number): void {
    if (this.isDone) return;
    this.timer += dt;
    const frameDuration = 1 / this.fps;
    while (this.timer >= frameDuration && !this.isDone) {
      this.timer -= frameDuration;
      this.frame++;
    }
  }

  draw(ctx: CanvasRenderingContext2D, dx: number, dy: number): void {
    this.sheet.drawFrame(
      ctx,
      { x: this.frame * this.frameW, y: 0, w: this.frameW, h: this.frameH },
      dx, dy,
    );
  }

  drawStill(ctx: CanvasRenderingContext2D, dx: number, dy: number, frameIndex = 0): void {
    this.sheet.drawFrame(
      ctx,
      { x: frameIndex * this.frameW, y: 0, w: this.frameW, h: this.frameH },
      dx, dy,
    );
  }
}
