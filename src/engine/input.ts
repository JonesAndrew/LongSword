const BUFFER_FRAMES = 2;

export class Input {
  private readonly keys = new Set<string>();
  private readonly mouseButtons = new Set<number>();
  private mouse = { x: 0, y: 0 };
  // Tracks frames since each key was last pressed (fresh press only, not held).
  private readonly recentKeys = new Map<string, number>();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gameWidth: number,
    private readonly gameHeight: number,
  ) {
    window.addEventListener('keydown', e => {
      if (!this.keys.has(e.code)) this.recentKeys.set(e.code, 0);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); });
    canvas.addEventListener('mousemove', e => { this.onMouseMove(e); });
    canvas.addEventListener('mousedown', e => { this.mouseButtons.add(e.button); });
    canvas.addEventListener('mouseup', e => { this.mouseButtons.delete(e.button); });
    canvas.addEventListener('contextmenu', e => { e.preventDefault(); });
  }

  // Advance the buffer by one frame. Call once per fixed-step update.
  tick(): void {
    for (const [key, age] of this.recentKeys) {
      if (age >= BUFFER_FRAMES) this.recentKeys.delete(key);
      else this.recentKeys.set(key, age + 1);
    }
  }

  // True if the key was pressed within the buffer window (ignores held state).
  isBuffered(code: string): boolean {
    return this.recentKeys.has(code);
  }

  isDown(code: string): boolean { return this.keys.has(code); }
  isMouseDown(button = 0): boolean { return this.mouseButtons.has(button); }
  get mousePos(): Readonly<{ x: number; y: number }> { return this.mouse; }

  private onMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.gameWidth / rect.width;
    const scaleY = this.gameHeight / rect.height;
    this.mouse = {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  }
}
