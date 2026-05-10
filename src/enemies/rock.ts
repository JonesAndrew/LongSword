import { SpriteSheet } from '../engine/spriteSheet';
import rockUrl from '../../Enemies/Rock.png';

const SPEED = 80;           // px/sec moving left
const GRAVITY = 180;        // px/sec²
// const INITIAL_VEL = -120;   // px/sec upward — tuned to reach ~64px peak
const BOTTOM_OFFSET = 8;    // px from sprite bottom to visual rock bottom

export class Rock {
  private offsetY = 0;      // px above ground, 0 = on the ground
  public vy = 0;

  static readonly sprite = new SpriteSheet(rockUrl);

  constructor(public x: number, private readonly groundY: number, private readonly INITIAL_VEL: number) {
    this.vy = this.INITIAL_VEL;
  }

  private _dead = false;
  get isDead(): boolean { return this._dead || this.x < -32; }
  markDead(): void { this._dead = true; }

  get drawX(): number { return Math.floor(this.x); }
  get drawY(): number {
    const spriteH = Rock.sprite.naturalHeight;
    return Math.floor(this.groundY - spriteH + BOTTOM_OFFSET + this.offsetY);
  }

  update(dt: number): void {
    this.x -= SPEED * dt;
    this.vy += GRAVITY * dt;
    this.offsetY += this.vy * dt;

    if (this.offsetY >= 0) {
      this.offsetY = 0;
      this.vy = this.INITIAL_VEL;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    Rock.sprite.draw(ctx, this.drawX, this.drawY);
  }
}
