import { Container, Graphics, Rectangle, type FederatedPointerEvent } from 'pixi.js';
import { config } from '../../app/config';

export interface SliderOptions {
  width: number;
  initialValue: number;
  onChange: (value: number) => void;
}

export class Slider extends Container {
  private readonly trackWidth: number;
  private readonly fillBar: Graphics;
  private readonly thumb: Container;
  private readonly onChange: (value: number) => void;
  private value: number;
  private dragging: boolean = false;
  private dragStartX: number = 0;
  private thumbStartX: number = 0;
  private stageBound: boolean = false;

  constructor(options: SliderOptions) {
    super();
    this.trackWidth = options.width;
    this.value = Math.max(0, Math.min(1, options.initialValue));
    this.onChange = options.onChange;

    // Track background
    const track = new Graphics();
    track.roundRect(-this.trackWidth / 2, -4, this.trackWidth, 8, 4);
    track.fill({ color: config.colors.secondary, alpha: 1 });
    this.addChild(track);

    // Fill bar
    this.fillBar = new Graphics();
    this.addChild(this.fillBar);
    this.updateFillBar();

    // Thumb
    this.thumb = new Container();
    this.thumb.eventMode = 'static';
    this.thumb.cursor = 'pointer';
    // generous hit area: 30px padding on each side
    this.thumb.hitArea = new Rectangle(-44, -44, 88, 88);
    const thumbCircle = new Graphics();
    thumbCircle.circle(0, 0, 14);
    thumbCircle.fill({ color: config.colors.accent, alpha: 1 });
    thumbCircle.stroke({ color: 0x29170b, width: 2 });
    this.thumb.addChild(thumbCircle);
    this.addChild(this.thumb);

    this.updateThumbPosition();

    // Drag handlers
    this.thumb.on('pointerdown', this.onPointerDown.bind(this));

    // We'll add global listeners once the component is on stage
    this.once('added', () => {
      const stage = this.getStage();
      if (!stage) return;

      stage.eventMode = 'static';
      stage.on('pointermove', this.onPointerMove);
      stage.on('pointerup', this.onPointerUp);
      stage.on('pointerupoutside', this.onPointerUp);
      this.stageBound = true;
    });

    this.on('removed', () => {
      const stage = this.getStage();
      if (stage && this.stageBound) {
        stage.off('pointermove', this.onPointerMove);
        stage.off('pointerup', this.onPointerUp);
        stage.off('pointerupoutside', this.onPointerUp);
        this.stageBound = false;
      }
    });
  }

  private updateFillBar(): void {
    this.fillBar.clear();
    const filledWidth = this.trackWidth * this.value;
    if (filledWidth > 0) {
      this.fillBar.roundRect(-this.trackWidth / 2, -3, filledWidth, 6, 3);
      this.fillBar.fill({ color: config.colors.accent, alpha: 1 });
    }
  }

  private updateThumbPosition(): void {
    this.thumb.position.set(
      -this.trackWidth / 2 + this.trackWidth * this.value,
      0,
    );
  }

  private onPointerDown(event: FederatedPointerEvent): void {
    this.dragging = true;
    const local = event.global;
    this.dragStartX = local.x;
    this.thumbStartX = this.thumb.position.x;
  }

  private readonly onPointerMove = (event: FederatedPointerEvent): void => {
    if (!this.dragging) return;
    const parent = this.parent;
    if (!parent) return;
    const local = parent.toLocal(event.global);
    const localX = local.x - this.position.x;
    const clamped = Math.max(-this.trackWidth / 2, Math.min(this.trackWidth / 2, localX));
    this.value = (clamped + this.trackWidth / 2) / this.trackWidth;
    this.thumb.position.set(clamped, 0);
    this.updateFillBar();
    this.onChange(this.value);
  };

  private readonly onPointerUp = (): void => {
    this.dragging = false;
  };

  setValue(v: number): void {
    this.value = Math.max(0, Math.min(1, v));
    this.updateFillBar();
    this.updateThumbPosition();
  }

  private getStage(): Container | undefined {
    let current: Container = this;
    while (current.parent) {
      current = current.parent;
    }
    return current;
  }
}
