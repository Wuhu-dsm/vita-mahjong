import { Application, Container, type Ticker } from 'pixi.js';
import { config } from '../app/config';

export type ScreenName = 'home' | 'game' | 'result';

export interface ScreenShowOptions {
  immediate?: boolean;
  transitionMs?: number;
  backgroundColor?: number;
}

interface ScreenTransition {
  from?: ScreenName;
  to: ScreenName;
  elapsedMs: number;
  durationMs: number;
  onComplete: () => void;
  tick: (ticker: Ticker) => void;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export class ScreenManager {
  readonly home = new Container();
  readonly game = new Container();
  readonly result = new Container();

  private readonly screens: Record<ScreenName, Container> = {
    home: this.home,
    game: this.game,
    result: this.result,
  };

  private activeScreen: ScreenName | null = null;
  private transition: ScreenTransition | null = null;
  private scaleX = 1;
  private scaleY = 1;
  private readonly transitionScale: Record<ScreenName, number> = {
    home: 1,
    game: 1,
    result: 1,
  };

  constructor(private readonly app: Application) {
    Object.values(this.screens).forEach((screen) => {
      screen.visible = false;
      screen.alpha = 0;
      this.app.stage.addChild(screen);
    });

    this.resizeToRenderer();
    window.addEventListener('resize', this.resizeToRenderer);
  }

  getScreen(name: ScreenName): Container {
    return this.screens[name];
  }

  setContent(name: ScreenName, content: Container): void {
    const screen = this.screens[name];
    screen.removeChildren();
    screen.addChild(content);
  }

  async show(name: ScreenName, options: ScreenShowOptions = {}): Promise<void> {
    const target = this.screens[name];
    const previousName = this.activeScreen ?? undefined;
    const previous = previousName ? this.screens[previousName] : undefined;
    const durationMs = options.transitionMs ?? config.timings.screenTransitionMs;

    if (options.backgroundColor !== undefined) {
      this.app.renderer.background.color = options.backgroundColor;
    }

    this.stopTransition();

    if (!previous || previous === target || options.immediate || durationMs <= 0) {
      Object.entries(this.screens).forEach(([screenName, screen]) => {
        const isTarget = screenName === name;
        screen.visible = isTarget;
        screen.alpha = isTarget ? 1 : 0;
        this.transitionScale[screenName as ScreenName] = 1;
        this.applyScale(screenName as ScreenName);
      });
      this.activeScreen = name;
      return;
    }

    target.visible = true;
    target.alpha = 0;
    this.transitionScale[name] = 0.96;
    this.applyScale(name);

    previous.visible = true;
    previous.alpha = 1;
    this.transitionScale[previousName] = 1;
    this.applyScale(previousName);

    await new Promise<void>((resolve) => {
      const transition: ScreenTransition = {
        from: previousName,
        to: name,
        elapsedMs: 0,
        durationMs,
        onComplete: resolve,
        tick: (ticker) => {
          transition.elapsedMs += ticker.deltaMS;
          const progress = Math.min(transition.elapsedMs / transition.durationMs, 1);
          const eased = easeOutCubic(progress);

          target.alpha = eased;
          previous.alpha = 1 - eased;
          this.transitionScale[name] = 0.96 + 0.04 * eased;
          this.transitionScale[previousName] = 1 + 0.02 * eased;
          this.applyScale(name);
          this.applyScale(previousName);

          if (progress >= 1) {
            this.finishTransition(transition);
          }
        },
      };

      this.transition = transition;
      this.app.ticker.add(transition.tick);
    });
  }

  private finishTransition(transition: ScreenTransition): void {
    this.app.ticker.remove(transition.tick);

    if (transition.from) {
      const from = this.screens[transition.from];
      from.visible = false;
      from.alpha = 0;
      this.transitionScale[transition.from] = 1;
      this.applyScale(transition.from);
    }

    const to = this.screens[transition.to];
    to.visible = true;
    to.alpha = 1;
    this.transitionScale[transition.to] = 1;
    this.applyScale(transition.to);
    this.activeScreen = transition.to;
    this.transition = null;
    transition.onComplete();
  }

  private stopTransition(): void {
    if (!this.transition) return;
    const transition = this.transition;
    this.app.ticker.remove(transition.tick);

    if (transition.from) {
      const from = this.screens[transition.from];
      from.visible = true;
      from.alpha = 1;
      this.transitionScale[transition.from] = 1;
      this.applyScale(transition.from);
    }

    const to = this.screens[transition.to];
    to.visible = false;
    to.alpha = 0;
    this.transitionScale[transition.to] = 1;
    this.applyScale(transition.to);

    this.transition = null;
    transition.onComplete();
  }

  private readonly resizeToRenderer = (): void => {
    this.scaleX = this.app.renderer.width / config.designWidth;
    this.scaleY = this.app.renderer.height / config.designHeight;

    Object.keys(this.screens).forEach((name) => {
      this.applyScale(name as ScreenName);
    });
  };

  private applyScale(name: ScreenName): void {
    const screen = this.screens[name];
    const transitionScale = this.transitionScale[name];
    screen.scale.set(this.scaleX * transitionScale, this.scaleY * transitionScale);
  }
}
