import { Container, Graphics, Text } from 'pixi.js';
import { config } from '../../app/config';
import { AudioManager } from '../../audio/AudioManager';
import { Button } from '../components/Button';
import { Slider } from '../components/Slider';

export class SettingsScreen extends Container {
  private readonly sfxSlider: Slider;
  private readonly bgmSlider: Slider;
  private readonly sfxValueText: Text;
  private readonly bgmValueText: Text;
  private readonly sfxMuteIndicator: Graphics;
  private readonly bgmMuteIndicator: Graphics;
  private readonly sfxMuteLabel: Text;
  private readonly bgmMuteLabel: Text;

  constructor(onBack: () => void) {
    super();

    const audio = AudioManager.getInstance();

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, config.designWidth, config.designHeight);
    bg.fill({ color: config.colors.gameBg, alpha: 1 });
    this.addChild(bg);

    // Title
    const title = new Text({
      text: '设置',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 42,
        fontWeight: '800',
        fill: config.colors.accent,
        stroke: { color: 0x29170b, width: 4 },
        align: 'center',
      },
    });
    title.anchor.set(0.5);
    title.position.set(config.designWidth / 2, config.safeAreaTop + 48);
    this.addChild(title);

    // Back button
    const backButton = new Button({
      textureKey: 'btn_circle_brown',
      label: '',
      width: 76,
      height: 76,
      onTap: onBack,
    });
    backButton.position.set(config.designWidth * 0.07, config.safeAreaTop + 24);
    this.addChild(backButton);

    // ─── Row 1: SFX Volume ─────────────────────────────
    const row1Y = config.designHeight * 0.25;
    this.addChild(this.createRowCard(row1Y));

    const sfxIcon = this.createIcon('♪', row1Y, -430);
    this.addChild(sfxIcon);

    const sfxLabel = this.createLabel('音效', row1Y, -380);
    this.addChild(sfxLabel);

    this.sfxSlider = new Slider({
      width: 560,
      initialValue: audio.getSfxVolume(),
      onChange: (v) => {
        audio.setSfxVolume(v);
        this.sfxValueText.text = String(Math.round(v * 100));
      },
    });
    this.sfxSlider.position.set(config.designWidth / 2 + 20, row1Y);
    this.addChild(this.sfxSlider);

    this.sfxValueText = new Text({
      text: String(Math.round(audio.getSfxVolume() * 100)),
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '400',
        fill: 0xfff5dc,
      },
    });
    this.sfxValueText.anchor.set(0.5, 0.5);
    this.sfxValueText.position.set(config.designWidth / 2 + 350, row1Y);
    this.addChild(this.sfxValueText);

    // ─── Row 2: SFX Mute ───────────────────────────────
    const row2Y = config.designHeight * 0.36;
    this.addChild(this.createRowCard(row2Y));

    const sfxMuteIcon = this.createIcon('♪', row2Y, -430);
    this.addChild(sfxMuteIcon);

    const sfxMuteTitle = this.createLabel('音效', row2Y, -380);
    this.addChild(sfxMuteTitle);

    // Mute indicator — tap area
    const muteContainer1 = new Container();
    muteContainer1.eventMode = 'static';
    muteContainer1.cursor = 'pointer';
    muteContainer1.position.set(config.designWidth / 2 + 250, row2Y);

    this.sfxMuteIndicator = new Graphics();
    this.drawMuteIndicator(this.sfxMuteIndicator, audio.isSfxMuted());
    muteContainer1.addChild(this.sfxMuteIndicator);

    const muteHitArea = new Graphics();
    muteHitArea.rect(-60, -48, 120, 96);
    muteHitArea.alpha = 0;
    muteHitArea.eventMode = 'static';
    muteContainer1.addChild(muteHitArea);

    muteContainer1.on('pointertap', () => {
      audio.setSfxMuted(!audio.isSfxMuted());
      this.drawMuteIndicator(this.sfxMuteIndicator, audio.isSfxMuted());
      this.sfxMuteLabel.text = audio.isSfxMuted() ? '关' : '开';
    });
    this.addChild(muteContainer1);

    this.sfxMuteLabel = new Text({
      text: audio.isSfxMuted() ? '关' : '开',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '400',
        fill: 0xfff5dc,
      },
    });
    this.sfxMuteLabel.anchor.set(0.5, 0.5);
    this.sfxMuteLabel.position.set(config.designWidth / 2 + 350, row2Y);
    this.addChild(this.sfxMuteLabel);

    // ─── Row 3: BGM Volume ─────────────────────────────
    const row3Y = config.designHeight * 0.51;
    this.addChild(this.createRowCard(row3Y));

    const bgmIcon = this.createIcon('♫', row3Y, -430);
    this.addChild(bgmIcon);

    const bgmLabel = this.createLabel('音乐', row3Y, -380);
    this.addChild(bgmLabel);

    this.bgmSlider = new Slider({
      width: 560,
      initialValue: audio.getBgmVolume(),
      onChange: (v) => {
        audio.setBgmVolume(v);
        this.bgmValueText.text = String(Math.round(v * 100));
      },
    });
    this.bgmSlider.position.set(config.designWidth / 2 + 20, row3Y);
    this.addChild(this.bgmSlider);

    this.bgmValueText = new Text({
      text: String(Math.round(audio.getBgmVolume() * 100)),
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '400',
        fill: 0xfff5dc,
      },
    });
    this.bgmValueText.anchor.set(0.5, 0.5);
    this.bgmValueText.position.set(config.designWidth / 2 + 350, row3Y);
    this.addChild(this.bgmValueText);

    // ─── Row 4: BGM Mute ───────────────────────────────
    const row4Y = config.designHeight * 0.62;
    this.addChild(this.createRowCard(row4Y));

    const bgmMuteIcon = this.createIcon('♫', row4Y, -430);
    this.addChild(bgmMuteIcon);

    const bgmMuteTitle = this.createLabel('音乐', row4Y, -380);
    this.addChild(bgmMuteTitle);

    const muteContainer2 = new Container();
    muteContainer2.eventMode = 'static';
    muteContainer2.cursor = 'pointer';
    muteContainer2.position.set(config.designWidth / 2 + 250, row4Y);

    this.bgmMuteIndicator = new Graphics();
    this.drawMuteIndicator(this.bgmMuteIndicator, audio.isBgmMuted());
    muteContainer2.addChild(this.bgmMuteIndicator);

    const muteHitArea2 = new Graphics();
    muteHitArea2.rect(-60, -48, 120, 96);
    muteHitArea2.alpha = 0;
    muteHitArea2.eventMode = 'static';
    muteContainer2.addChild(muteHitArea2);

    muteContainer2.on('pointertap', () => {
      audio.setBgmMuted(!audio.isBgmMuted());
      this.drawMuteIndicator(this.bgmMuteIndicator, audio.isBgmMuted());
      this.bgmMuteLabel.text = audio.isBgmMuted() ? '关' : '开';
    });
    this.addChild(muteContainer2);

    this.bgmMuteLabel = new Text({
      text: audio.isBgmMuted() ? '关' : '开',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '400',
        fill: 0xfff5dc,
      },
    });
    this.bgmMuteLabel.anchor.set(0.5, 0.5);
    this.bgmMuteLabel.position.set(config.designWidth / 2 + 350, row4Y);
    this.addChild(this.bgmMuteLabel);

    // Footer
    const footer = new Text({
      text: 'Vita Mahjong v1.0',
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 26,
        fontWeight: '400',
        fill: config.colors.secondary,
      },
    });
    footer.anchor.set(0.5);
    footer.position.set(config.designWidth / 2, config.designHeight * 0.78);
    this.addChild(footer);
  }

  updateFromAudioManager(): void {
    const audio = AudioManager.getInstance();
    this.sfxSlider.setValue(audio.getSfxVolume());
    this.bgmSlider.setValue(audio.getBgmVolume());
    this.sfxValueText.text = String(Math.round(audio.getSfxVolume() * 100));
    this.bgmValueText.text = String(Math.round(audio.getBgmVolume() * 100));
    this.drawMuteIndicator(this.sfxMuteIndicator, audio.isSfxMuted());
    this.drawMuteIndicator(this.bgmMuteIndicator, audio.isBgmMuted());
    this.sfxMuteLabel.text = audio.isSfxMuted() ? '关' : '开';
    this.bgmMuteLabel.text = audio.isBgmMuted() ? '关' : '开';
  }

  // ── Helpers ──────────────────────────────────────────

  private createRowCard(y: number): Graphics {
    const card = new Graphics();
    card.roundRect(config.designWidth / 2 - 450, y - 48, 900, 96, 12);
    card.fill({ color: 0x3E2723, alpha: 0.6 });
    return card;
  }

  private createIcon(char: string, y: number, offsetX: number): Text {
    const icon = new Text({
      text: char,
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 32,
        fontWeight: '400',
        fill: config.colors.secondary,
      },
    });
    icon.anchor.set(0.5);
    icon.position.set(config.designWidth / 2 + offsetX, y);
    return icon;
  }

  private createLabel(text: string, y: number, offsetX: number): Text {
    const label = new Text({
      text,
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '400',
        fill: config.colors.secondary,
      },
    });
    label.anchor.set(0, 0.5);
    label.position.set(config.designWidth / 2 + offsetX, y);
    return label;
  }

  private drawMuteIndicator(g: Graphics, muted: boolean): void {
    g.clear();
    g.circle(0, 0, 16);
    g.fill({ color: muted ? config.colors.destructive : config.colors.accent, alpha: 1 });
    if (muted) {
      // Draw an "X" across the circle
      g.moveTo(-8, -8);
      g.lineTo(8, 8);
      g.moveTo(8, -8);
      g.lineTo(-8, 8);
      g.stroke({ color: 0xffffff, width: 2 });
    }
  }
}
