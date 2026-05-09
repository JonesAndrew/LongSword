export class Input {
  private readonly keys = new Set<string>();
  private readonly mouseButtons = new Set<number>();
  private mouse = { x: 0, y: 0 };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gameWidth: number,
    private readonly gameHeight: number,
  ) {
    window.addEventListener('keydown', e => { this.keys.add(e.code); });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); });
    canvas.addEventListener('mousemove', e => { this.onMouseMove(e); });
    canvas.addEventListener('mousedown', e => { this.mouseButtons.add(e.button); });
    canvas.addEventListener('mouseup', e => { this.mouseButtons.delete(e.button); });
    canvas.addEventListener('contextmenu', e => { e.preventDefault(); });
  }

  private onMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    // Map from CSS pixels → game pixels using the current CSS scale.
    const scaleX = this.gameWidth / rect.width;
    const scaleY = this.gameHeight / rect.height;
    this.mouse = {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  }

  isDown(code: string): boolean { return this.keys.has(code); }
  isMouseDown(button = 0): boolean { return this.mouseButtons.has(button); }
  get mousePos(): Readonly<{ x: number; y: number }> { return this.mouse; }
}
