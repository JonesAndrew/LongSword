import { PixelCanvas } from './engine/canvas';
import { GameLoop } from './engine/gameLoop';
import { Input } from './engine/input';
import { Renderer } from './engine/renderer';
import { StanceMachine } from './player/stanceMachine';
import { SpriteSheet } from './engine/spriteSheet';
import knightUrl from '../PlayerAnimations/knight.png';

export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

export class Game {
  private readonly canvas: PixelCanvas;
  private readonly loop: GameLoop;
  private readonly input: Input;
  private readonly renderer: Renderer;
  private readonly stances: StanceMachine;
  private readonly knight: SpriteSheet;

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
  };

  private render = (ctx: CanvasRenderingContext2D): void => {
    this.renderer.clear('#FFFFFF');

    const x = Math.floor((GAME_WIDTH - 112) / 2);
    const y = Math.floor((GAME_HEIGHT - 96) / 2);
    this.stances.draw(ctx, x, y);
    this.knight.draw(ctx, x, y);

    this.renderer.text(
      `stance: ${this.stances.stance}`,
      4,
      GAME_HEIGHT - 4,
      'rgba(0,0,0,0.4)',
    );
  };
}
