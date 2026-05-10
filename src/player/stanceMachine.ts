import { Animation } from '../engine/animation';
import { SpriteSheet } from '../engine/spriteSheet';

export type Stance = 1 | 2 | 3 | 4 | 5;
type TransitionKey = '3to1' | '4to1' | '4to2' | '5to1' | '5to2' | '5to3';

export const FRAME_W = 112;
export const FRAME_H = 96;
const FPS = 10;

function makeAnim(src: string): Animation {
  return new Animation(new SpriteSheet(src), FRAME_W, FRAME_H, FPS);
}

import url3to1 from '../../PlayerAnimations/3to1.png';
import url4to1 from '../../PlayerAnimations/4to1.png';
import url4to2 from '../../PlayerAnimations/4to2.png';
import url5to1 from '../../PlayerAnimations/5to1.png';
import url5to2 from '../../PlayerAnimations/5to2.png';
import url5to3 from '../../PlayerAnimations/5to3.png';
import urlIdle1 from '../../PlayerAnimations/stance_1.png';
import urlIdle2 from '../../PlayerAnimations/stance_2.png';
import urlIdle3 from '../../PlayerAnimations/stance_3.png';
import urlIdle4 from '../../PlayerAnimations/stance_4.png';
import urlIdle5 from '../../PlayerAnimations/stance_5.png';

export class StanceMachine {
  private _stance: Stance;
  private _target: Stance | null = null;
  private _activeAnim: Animation | null = null;
  private _animFlipped = false;

  // All canonical transitions go from higher number → lower number.
  private readonly transitions: Record<TransitionKey, Animation> = {
    '3to1': makeAnim(url3to1),
    '4to1': makeAnim(url4to1),
    '4to2': makeAnim(url4to2),
    '5to1': makeAnim(url5to1),
    '5to2': makeAnim(url5to2),
    '5to3': makeAnim(url5to3),
  };

  private readonly idleSprites: Record<Stance, SpriteSheet> = {
    1: new SpriteSheet(urlIdle1),
    2: new SpriteSheet(urlIdle2),
    3: new SpriteSheet(urlIdle3),
    4: new SpriteSheet(urlIdle4),
    5: new SpriteSheet(urlIdle5),
  };

  constructor(initial: Stance = 1) {
    this._stance = initial;
  }

  get stance(): Stance { return this._stance; }
  get isTransitioning(): boolean { return this._target !== null; }

  get animFrameInfo(): { sheet: SpriteSheet; frameIndex: number; frameW: number; frameH: number; flipped: boolean } | null {
    if (!this._activeAnim) return null;
    return {
      sheet: this._activeAnim.sheet,
      frameIndex: this._activeAnim.currentFrame,
      frameW: FRAME_W,
      frameH: FRAME_H,
      flipped: this._animFlipped,
    };
  }

  request(target: Stance): void {
    if (target === this._stance || this.isTransitioning) return;

    const diff = Math.abs(this._stance - target);
    if (diff === 1) {
      // Adjacent stances snap directly — no animation exists for these.
      this._stance = target;
      return;
    }

    let anim: Animation;
    let flipped: boolean;

    if (target === 3 && this._stance === 5) {
      anim = this.transitions['5to3']; flipped = false;
    } else if (target === 3 && this._stance === 1) {
      anim = this.transitions['5to3']; flipped = true;
    } else if (target === 5 && this._stance === 3) {
        anim = this.transitions['3to1']; flipped = true;
    } else {
      // All other transitions: canonical animation goes higher → lower.
      const high = Math.max(this._stance, target) as Stance;
      const low  = Math.min(this._stance, target) as Stance;
      anim = this.transitions[`${high}to${low}` as TransitionKey];
      flipped = this._stance < target;
    }

    anim.reset();
    this._activeAnim = anim;
    this._target = target;
    this._animFlipped = flipped;
  }

  update(dt: number): void {
    if (!this._activeAnim || !this._target) return;
    this._activeAnim.update(dt);
    if (this._activeAnim.isDone) {
      this._stance = this._target;
      this._target = null;
      this._activeAnim = null;
      this._animFlipped = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (this._activeAnim) {
      if (this._animFlipped) {
        ctx.save();
        ctx.translate(x + FRAME_W, 0);
        ctx.scale(-1, 1);
        this._activeAnim.draw(ctx, 0, y);
        ctx.restore();
      } else {
        this._activeAnim.draw(ctx, x, y);
      }
    } else {
      this.idleSprites[this._stance].draw(ctx, x, y);
    }
  }
}
