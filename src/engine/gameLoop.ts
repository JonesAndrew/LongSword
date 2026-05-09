export type UpdateFn = (dt: number) => void;
export type RenderFn = (ctx: CanvasRenderingContext2D) => void;

// Cap delta time so a tab coming back from sleep doesn't cause a huge jump.
const MAX_DT = 1 / 15;

export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
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

    const dt = Math.min((now - this.lastTime) / 1000, MAX_DT);
    this.lastTime = now;

    this.update(dt);
    this.render(this.ctx);

    // drawImage can silently re-enable smoothing in some browser versions.
    this.ctx.imageSmoothingEnabled = false;

    this.rafId = requestAnimationFrame(this.tick);
  };
}
