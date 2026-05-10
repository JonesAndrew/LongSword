import { PixelCanvas } from './engine/canvas';
import { GameLoop } from './engine/gameLoop';
import { Input } from './engine/input';
import { Renderer } from './engine/renderer';
import { StanceMachine } from './player/stanceMachine';
import { SpriteSheet } from './engine/spriteSheet';
import { Rock } from './enemies/rock';
import { pixelCollide } from './engine/pixelCollision';
import knightUrl from '../PlayerAnimations/knight.png';

export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

const PLAYER_X = 16;
const PLAYER_Y = GAME_HEIGHT - 96 - 8;
// Visual ground line: bottom of knight sprite minus its 32px bottom padding.
const GROUND_Y = PLAYER_Y + 96 - 32;

const SPAWN_INTERVAL = 2.5; // seconds between rocks

export class Game {
  private readonly canvas: PixelCanvas;
  private readonly loop: GameLoop;
  private readonly input: Input;
  private readonly renderer: Renderer;
  private readonly stances: StanceMachine;
  private readonly knight: SpriteSheet;
  private readonly rocks: Rock[] = [];
  private spawnTimer = SPAWN_INTERVAL;
  private rockLow = true;
  private hitTimer = 0;

  private static readonly HIT_DURATION = 0.6;
  private static readonly FLASH_INTERVAL = 0.08;

  constructor() {
    this.canvas = new PixelCanvas({ width: GAME_WIDTH, height: GAME_HEIGHT });
    this.input = new Input(this.canvas.element, GAME_WIDTH, GAME_HEIGHT);
    this.renderer = new Renderer(this.canvas.ctx);
    this.stances = new StanceMachine('A');
    this.knight = new SpriteSheet(knightUrl);
    this.loop = new GameLoop(this.canvas.ctx, this.update, this.render);
  }

  start(): void {
    this.loop.start();
  }

  private update = (dt: number): void => {
    if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) this.stances.request('A');
    if (this.input.isDown('ArrowLeft')  || this.input.isDown('KeyA')) this.stances.request('B');
    if (this.input.isDown('ArrowUp')    || this.input.isDown('KeyW')) this.stances.request('C');
    this.stances.update(dt);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      if (!this.rockLow) {
        this.rocks.push(new Rock(GAME_WIDTH + 56, GROUND_Y, -120));
      } else {
        this.rocks.push(new Rock(GAME_WIDTH + 32, GROUND_Y, -60));
      }
      this.spawnTimer = SPAWN_INTERVAL;
      this.rockLow = !this.rockLow;
    }

    if (this.hitTimer > 0) this.hitTimer -= dt;
    for (const rock of this.rocks) rock.update(dt);
    this.checkRockCollisions();
    this.rocks.splice(0, this.rocks.length, ...this.rocks.filter(r => !r.isDead));
  };

  private checkRockCollisions(): void {
    const rockW = Rock.sprite.naturalWidth;
    const rockH = Rock.sprite.naturalHeight;
    const knightW = this.knight.naturalWidth;
    const knightH = this.knight.naturalHeight;
    const anim = this.stances.animFrameInfo;

    for (const rock of this.rocks) {
      // Stance animation destroys rocks it hits.
      if (anim) {
        const slashHit = pixelCollide(
          anim.sheet, anim.frameIndex * anim.frameW, 0, anim.frameW, anim.frameH, PLAYER_X, PLAYER_Y,
          Rock.sprite, 0, 0, rockW, rockH, rock.drawX, rock.drawY,
        );
        if (slashHit) { rock.markDead(); continue; }
      }

      // Rock hitting the player body triggers a flash (with invincibility frames).
      if (this.hitTimer <= 0) {
        const bodyHit = pixelCollide(
          this.knight, 0, 0, knightW, knightH, PLAYER_X, PLAYER_Y,
          Rock.sprite, 0, 0, rockW, rockH, rock.drawX, rock.drawY,
        );
        if (bodyHit) {
          this.hitTimer = Game.HIT_DURATION;
          rock.markDead();
        }
      }
    }
  }

  private render = (ctx: CanvasRenderingContext2D): void => {
    this.renderer.clear('#FFFFFF');

    this.stances.draw(ctx, PLAYER_X, PLAYER_Y);
    const flashWhite = this.hitTimer > 0 && Math.floor(this.hitTimer / Game.FLASH_INTERVAL) % 2 === 0;
    if (flashWhite) {
      this.knight.drawAsWhite(ctx, PLAYER_X, PLAYER_Y);
    } else {
      this.knight.draw(ctx, PLAYER_X, PLAYER_Y);
    }

    for (const rock of this.rocks) rock.draw(ctx);

    this.renderer.text(
      `stance: ${this.stances.stance}`,
      4,
      GAME_HEIGHT - 4,
      'rgba(0,0,0,0.4)',
    );
  };
}
