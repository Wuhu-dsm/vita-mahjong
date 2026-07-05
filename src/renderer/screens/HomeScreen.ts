import { Container, Graphics, Text, type Ticker } from 'pixi.js';
import { config } from '../../app/config';
import { Button } from '../components/Button';
import { addScreenGlow, addSubtleBorder, makeGoldText, makeRoundIconButton, makeVerticalGradient } from '../components/VisualPrimitives';

interface FallingLeaf {
  node: Container;
  baseX: number;
  y: number;
  speed: number;
  sway: number;
  phase: number;
  spin: number;
}

export interface HomeScreenOptions {
  ticker?: Ticker;
}

export class HomeScreen extends Container {
  static readonly START_LEVEL = 'start-level';
  static readonly OPEN_SETTINGS = 'open-settings';

  private readonly levelButton: Button;
  private readonly doorLeft = new Container();
  private readonly doorRight = new Container();
  private readonly doorSeal = new Container();
  private readonly fallingLeaves: FallingLeaf[] = [];
  private currentLevel = 1;
  private isOpeningDoor = false;
  private readonly ticker?: Ticker;
  private readonly tick = (ticker: Ticker): void => {
    this.updateFallingLeaves(ticker.deltaMS);
  };

  constructor(options: HomeScreenOptions = {}) {
    super();
    this.ticker = options.ticker;

    this.drawBackground();
    this.drawTopChrome();
    this.drawLogo();
    this.drawDoorMedallion();

    this.levelButton = new Button({
      textureKey: 'btn_wooden_capsule',
      label: '关卡 1',
      width: 700,
      height: 154,
      fontSize: 72,
      textColor: 0xfffff0,
      onTap: () => {
        if (!this.isOpeningDoor) {
          this.emit(HomeScreen.START_LEVEL);
        }
      },
    });
    this.levelButton.position.set(config.designWidth / 2, 2116);
    this.addChild(this.levelButton);

    this.ticker?.add(this.tick);
  }

  setLevel(n: number): void {
    this.currentLevel = n;
    this.levelButton.setLabel(`关卡 ${n}`);
  }

  async playDoorOpen(): Promise<void> {
    if (this.isOpeningDoor) return;
    this.isOpeningDoor = true;
    this.levelButton.eventMode = 'none';
    this.levelButton.alpha = 0.78;

    if (!this.ticker) {
      this.setDoorProgress(1);
      return;
    }

    await new Promise<void>((resolve) => {
      let elapsedMs = 0;
      const durationMs = this.currentLevel === 3 ? 760 : 520;
      const animate = (ticker: Ticker): void => {
        elapsedMs += ticker.deltaMS;
        const progress = Math.min(elapsedMs / durationMs, 1);
        this.setDoorProgress(progress);
        if (progress >= 1) {
          this.ticker?.remove(animate);
          resolve();
        }
      };
      this.ticker?.add(animate);
    });
  }

  resetDoor(): void {
    this.isOpeningDoor = false;
    this.levelButton.eventMode = 'static';
    this.levelButton.alpha = 1;
    this.setDoorProgress(0);
  }

  private drawBackground(): void {
    this.addChild(
      makeVerticalGradient(config.designWidth, config.designHeight, [
        { y: 0, color: 0x7a3a16 },
        { y: 0.22, color: 0xb36b2d },
        { y: 0.56, color: 0x9a4e1a },
        { y: 1, color: 0x441706 },
      ]),
    );

    const blinds = new Graphics();
    for (let y = 0; y < 620; y += 10) {
      blinds.rect(0, y, config.designWidth, 3).fill({ color: y % 30 === 0 ? 0x5b210b : 0xe7a45b, alpha: y % 30 === 0 ? 0.42 : 0.26 });
    }
    this.addChild(blinds);

    const screen = new Graphics();
    screen.roundRect(-80, 610, config.designWidth + 160, 1320, 500).fill({ color: 0xf3d792, alpha: 0.78 });
    screen.roundRect(-60, 610, config.designWidth + 120, 1320, 500).stroke({ color: 0x6b2508, width: 28, alpha: 0.78 });
    this.addChild(screen);

    this.drawDoorPanels();

    this.drawBambooShadows();
    this.drawFallingLeaves();
    addScreenGlow(this, 0xffe29a, config.designWidth / 2, 1220, 330, 0.7);
    addSubtleBorder(this);
  }

  private drawDoorPanels(): void {
    this.doorLeft.addChild(this.makeDoorPanel('left'));
    this.doorRight.addChild(this.makeDoorPanel('right'));
    this.addChild(this.doorLeft, this.doorRight);
  }

  private makeDoorPanel(side: 'left' | 'right'): Graphics {
    const g = new Graphics();
    const x = side === 'left' ? -80 : config.designWidth / 2;
    const width = config.designWidth / 2 + 80;
    g.roundRect(x, 610, width, 1320, 0).fill({ color: 0xc56b25, alpha: 0.22 });
    g.roundRect(x + 18, 640, width - 36, 1240, 22).stroke({ color: 0x74300d, width: 14, alpha: 0.7 });

    const start = side === 'left' ? 0 : config.designWidth / 2;
    const end = side === 'left' ? config.designWidth / 2 : config.designWidth;
    for (let gx = start + 42; gx <= end; gx += 132) {
      g.rect(gx - 5, 642, 10, 1200).fill({ color: 0x8d3b0c, alpha: 0.78 });
    }
    for (const y of [760, 1034, 1308, 1582, 1818]) {
      g.rect(start, y - 7, config.designWidth / 2, 14).fill({ color: 0x8d3b0c, alpha: 0.8 });
    }

    if (side === 'left') {
      g.rect(512, 0, 12, config.designHeight).fill({ color: 0xad5d21, alpha: 0.72 });
      g.rect(530, 0, 10, config.designHeight).fill({ color: 0x3a1204, alpha: 0.42 });
    } else {
      g.rect(540, 0, 10, config.designHeight).fill({ color: 0x3a1204, alpha: 0.42 });
      g.rect(556, 0, 12, config.designHeight).fill({ color: 0xad5d21, alpha: 0.72 });
    }
    return g;
  }

  private drawBambooShadows(): void {
    const bamboo = new Graphics();
    bamboo.alpha = 0.36;
    for (const side of [-1, 1]) {
      const baseX = side < 0 ? 110 : 930;
      for (let i = 0; i < 7; i += 1) {
        const x = baseX + side * i * 24;
        bamboo.moveTo(x, 1160 + i * 70).lineTo(x + side * 92, 1660 + i * 46).stroke({ color: 0x4a361e, width: 8, alpha: 0.38 });
        bamboo.ellipse(x + side * 48, 1280 + i * 58, 52, 10).fill({ color: 0x4a361e, alpha: 0.28 });
      }
    }
    this.addChild(bamboo);
  }

  private drawFallingLeaves(): void {
    const leafLayer = new Container();
    const specs = [
      [455, 150, -0.4, 36, 0.7],
      [875, 820, 0.65, 30, 1.9],
      [180, 1030, -1.2, 44, 2.8],
      [350, 1240, 0.65, 34, 4.1],
      [820, 280, 0.9, 41, 5.4],
      [118, -80, -0.9, 38, 6.1],
      [976, 520, 0.35, 32, 7.2],
      [610, -190, 0.7, 45, 8.0],
      [266, 420, -0.25, 39, 9.1],
      [744, 1480, -0.72, 35, 10.3],
    ] as const;
    for (const [x, y, rotation, speed, phase] of specs) {
      const node = this.makeLeaf(rotation);
      node.position.set(x, y);
      leafLayer.addChild(node);
      this.fallingLeaves.push({
        node,
        baseX: x,
        y,
        speed,
        sway: 34 + (phase % 3) * 16,
        phase,
        spin: 0.35 + (phase % 2) * 0.18,
      });
    }
    this.addChild(leafLayer);
  }

  private makeLeaf(rotation: number): Container {
    const node = new Container();
    const leaf = new Graphics();
    leaf.ellipse(0, 0, 15, 58).fill({ color: 0x30bd70, alpha: 0.82 });
    leaf.ellipse(-4, -8, 7, 42).fill({ color: 0x74df91, alpha: 0.24 });
    leaf.moveTo(0, -44).lineTo(0, 46).stroke({ color: 0x176332, width: 3, alpha: 0.55 });
    node.addChild(leaf);
    node.rotation = rotation;
    node.scale.set(0.82);
    return node;
  }

  private updateFallingLeaves(deltaMs: number): void {
    const seconds = deltaMs / 1000;
    for (const leaf of this.fallingLeaves) {
      leaf.phase += seconds;
      leaf.y += leaf.speed * seconds;
      if (leaf.y > config.designHeight + 120) {
        leaf.y = -120;
        leaf.baseX = (leaf.baseX + 297) % config.designWidth;
      }
      leaf.node.position.set(leaf.baseX + Math.sin(leaf.phase * 1.7) * leaf.sway, leaf.y);
      leaf.node.rotation += leaf.spin * seconds;
      leaf.node.alpha = leaf.y < -40 ? 0.35 : 0.82;
    }
  }

  private drawTopChrome(): void {
    const avatar = new Container();
    avatar.position.set(108, 208);
    const frame = new Graphics();
    frame.roundRect(-72, -72, 144, 144, 18).fill({ color: 0xc58a65 });
    frame.roundRect(-62, -62, 124, 124, 18).fill({ color: 0xf58b8f });
    frame.roundRect(-72, -72, 144, 144, 18).stroke({ color: 0x6b341e, width: 7 });
    const face = new Graphics();
    face.circle(0, 2, 42).fill({ color: 0xffdfc9 });
    face.ellipse(-22, -32, 26, 34).fill({ color: 0xbfd0d5 });
    face.ellipse(24, -30, 28, 36).fill({ color: 0xbfd0d5 });
    face.circle(-15, 2, 5).fill({ color: 0x3a2116 });
    face.circle(15, 2, 5).fill({ color: 0x3a2116 });
    face.moveTo(-16, 24).quadraticCurveTo(0, 38, 18, 24).stroke({ color: 0xb94942, width: 4 });
    avatar.addChild(frame, face);
    this.addChild(avatar);

    this.addChild(makeRoundIconButton('⚙', 970, 196, () => this.emit(HomeScreen.OPEN_SETTINGS)));
  }

  private drawLogo(): void {
    const vita = makeGoldText('Vita', 160, 14);
    vita.style.fill = 0xfff4d6;
    vita.position.set(config.designWidth / 2, 522);
    vita.rotation = -0.02;
    this.addChild(vita);

    const mahjong = makeGoldText('MAHJONG', 104, 12);
    mahjong.style.fill = 0xfff4d6;
    mahjong.position.set(config.designWidth / 2, 664);
    this.addChild(mahjong);

    const faTile = new Container();
    faTile.position.set(678, 526);
    faTile.rotation = 0.18;
    const tile = new Graphics();
    tile.roundRect(-35, -42, 70, 84, 12).fill({ color: 0xf8f6e9 });
    tile.roundRect(-35, -42, 70, 84, 12).stroke({ color: 0x5d2a12, width: 5 });
    faTile.addChild(tile);
    const fa = new Text({
      text: '發',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 44,
        fontWeight: '900',
        fill: 0x168a3e,
      },
    });
    fa.anchor.set(0.5);
    fa.position.set(0, 1);
    faTile.addChild(fa);
    this.addChild(faTile);
  }

  private drawDoorMedallion(): void {
    const seal = new Graphics();
    seal.circle(config.designWidth / 2, 1255, 250).fill({ color: 0x592006, alpha: 0.42 });
    seal.circle(config.designWidth / 2, 1228, 214).fill({ color: 0x8d3e10, alpha: 0.88 });
    seal.circle(config.designWidth / 2, 1228, 174).fill({ color: 0xd99d4d, alpha: 0.86 });
    seal.circle(config.designWidth / 2, 1228, 134).stroke({ color: 0x4f1d08, width: 8, alpha: 0.85 });
    seal.circle(config.designWidth / 2, 1228, 70).fill({ color: 0x652506, alpha: 0.88 });
    seal.roundRect(506, 1172, 28, 108, 14).stroke({ color: 0xb46e35, width: 8 });
    seal.roundRect(546, 1172, 28, 108, 14).stroke({ color: 0xb46e35, width: 8 });
    this.doorSeal.addChild(seal);
    this.addChild(this.doorSeal);
  }

  private setDoorProgress(progress: number): void {
    const eased = 1 - Math.pow(1 - progress, 3);
    this.doorLeft.x = -520 * eased;
    this.doorRight.x = 520 * eased;
    this.doorLeft.alpha = 1 - eased * 0.22;
    this.doorRight.alpha = 1 - eased * 0.22;
    this.doorSeal.alpha = 1 - eased;
    this.doorSeal.scale.set(1 + eased * 0.12);
    this.doorSeal.position.set(-config.designWidth * 0.06 * eased, -28 * eased);
  }
}
