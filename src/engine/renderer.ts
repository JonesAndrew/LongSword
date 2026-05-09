export class Renderer {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  get raw(): CanvasRenderingContext2D { return this.ctx; }

  clear(color = '#000000'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  text(str: string, x: number, y: number, color: string, font = '8px monospace'): void {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(str, Math.floor(x), Math.floor(y));
  }
}
