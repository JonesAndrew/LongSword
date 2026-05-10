export type UpdateFn = (dt: number) => void;
export type RenderFn = (ctx: CanvasRenderingContext2D) => void;

const FIXED_DT = 1 / 60;
// Cap accumulated time to avoid a spiral of death after tab sleep.
const MAX_ACCUMULATOR = FIXED_DT * 8;

export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly update: UpdateFn,
    private readonly render: RenderFn,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (now: number): void => {
    if (!this.running) return;

    this.accumulator += Math.min((now - this.lastTime) / 1000, MAX_ACCUMULATOR);
    this.lastTime = now;

    while (this.accumulator >= FIXED_DT) {
      this.update(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    this.render(this.ctx);
    this.ctx.imageSmoothingEnabled = false;

    this.rafId = requestAnimationFrame(this.tick);
  };
}
