import { Animation } from '../engine/animation';
import { SpriteSheet } from '../engine/spriteSheet';

export type Stance = 'A' | 'B' | 'C';
type TransitionKey = 'AtoB' | 'AtoC' | 'BtoA' | 'BtoC' | 'CtoA' | 'CtoB';

const FRAME_W = 112;
const FRAME_H = 96;
const FPS = 10;

function makeAnim(src: string): Animation {
  return new Animation(new SpriteSheet(src), FRAME_W, FRAME_H, FPS);
}

import AtoBUrl from '../../PlayerAnimations/AtoB.png';
import AtoCUrl from '../../PlayerAnimations/AtoC.png';
import BtoAUrl from '../../PlayerAnimations/BtoA.png';
import BtoCUrl from '../../PlayerAnimations/BtoC.png';
import CtoAUrl from '../../PlayerAnimations/CtoA.png';
import CtoBUrl from '../../PlayerAnimations/CtoB.png';
import StanceAUrl from '../../PlayerAnimations/Stance_A.png';
import StanceBUrl from '../../PlayerAnimations/Stance_B.png';
import StanceCUrl from '../../PlayerAnimations/Stance_C.png';

export class StanceMachine {
  private _stance: Stance;
  private _target: Stance | null = null;
  private _activeAnim: Animation | null = null;

  private readonly transitions: Record<TransitionKey, Animation> = {
    AtoB: makeAnim(AtoBUrl),
    AtoC: makeAnim(AtoCUrl),
    BtoA: makeAnim(BtoAUrl),
    BtoC: makeAnim(BtoCUrl),
    CtoA: makeAnim(CtoAUrl),
    CtoB: makeAnim(CtoBUrl),
  };

  private readonly idleSprites: Record<Stance, SpriteSheet> = {
    A: new SpriteSheet(StanceAUrl),
    B: new SpriteSheet(StanceBUrl),
    C: new SpriteSheet(StanceCUrl),
  };

  constructor(initial: Stance = 'A') {
    this._stance = initial;
  }

  get stance(): Stance { return this._stance; }
  get isTransitioning(): boolean { return this._target !== null; }

  get animFrameInfo(): { sheet: SpriteSheet; frameIndex: number; frameW: number; frameH: number } | null {
    if (!this._activeAnim) return null;
    return { sheet: this._activeAnim.sheet, frameIndex: this._activeAnim.currentFrame, frameW: FRAME_W, frameH: FRAME_H };
  }

  request(target: Stance): void {
    if (target === this._stance || this.isTransitioning) return;
    const anim = this.transitions[`${this._stance}to${target}` as TransitionKey];
    anim.reset();
    this._activeAnim = anim;
    this._target = target;
  }

  update(dt: number): void {
    if (!this._activeAnim || !this._target) return;
    this._activeAnim.update(dt);
    if (this._activeAnim.isDone) {
      this._stance = this._target;
      this._target = null;
      this._activeAnim = null;
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (this._activeAnim) {
      this._activeAnim.draw(ctx, x, y);
    } else {
      this.idleSprites[this._stance].draw(ctx, x, y);
    }
  }
}
