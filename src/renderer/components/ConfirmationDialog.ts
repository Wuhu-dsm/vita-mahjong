import { Assets, Container, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import type { AssetKey } from '../../app/assets';
import { config } from '../../app/config';
import { Button } from './Button';

function requireTexture(key: AssetKey): Texture {
  const texture = Assets.get<Texture>(key);
  if (!texture) {
    throw new Error(`Texture "${key}" has not been loaded`);
  }
  return texture;
}

export interface ConfirmationDialogOptions {
  heading: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export class ConfirmationDialog extends Container {
  constructor(options: ConfirmationDialogOptions) {
    super();
    this.visible = false;
    this.alpha = 0;
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, config.designWidth, config.designHeight);

    // Full-screen dark overlay
    const overlay = new Sprite(requireTexture('bg_result'));
    overlay.width = config.designWidth;
    overlay.height = config.designHeight;
    overlay.alpha = 0.62;
    overlay.eventMode = 'static';
    this.addChild(overlay);

    // Centered panel
    const panel = new Sprite(requireTexture('btn_circle_brown'));
    panel.anchor.set(0.5);
    panel.position.set(config.designWidth / 2, config.designHeight * 0.42);
    panel.width = 620;
    panel.height = 350;
    panel.tint = 0x4a2c21;
    this.addChild(panel);

    // Heading
    const heading = new Text({
      text: options.heading,
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 40,
        fontWeight: '800',
        fill: 0xfff4d6,
        stroke: { color: config.colors.destructive, width: 4 },
        align: 'center',
      },
    });
    heading.anchor.set(0.5);
    heading.position.set(config.designWidth / 2, config.designHeight * 0.35);
    this.addChild(heading);

    // Body text
    const body = new Text({
      text: options.body,
      style: {
        fontFamily: 'Vita Noto Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 30,
        fontWeight: '400',
        fill: 0xfff5dc,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 540,
      },
    });
    body.anchor.set(0.5);
    body.position.set(config.designWidth / 2, config.designHeight * 0.42);
    this.addChild(body);

    // Cancel button (left)
    const cancelButton = new Button({
      textureKey: 'btn_wooden_capsule',
      label: options.cancelLabel,
      width: 260,
      height: 90,
      fontSize: 30,
      textColor: 0xd4a574,
      onTap: () => {
        options.onCancel();
        this.hide();
      },
    });
    cancelButton.position.set(config.designWidth / 2 - 150, config.designHeight * 0.50);
    this.addChild(cancelButton);

    // Confirm button (right) — destructive styling
    const confirmButton = new Button({
      textureKey: 'btn_wooden_capsule',
      label: options.confirmLabel,
      width: 260,
      height: 90,
      fontSize: 30,
      textColor: 0xffe0d0,
      onTap: () => {
        options.onConfirm();
        this.hide();
      },
    });
    confirmButton.position.set(config.designWidth / 2 + 150, config.designHeight * 0.50);
    this.addChild(confirmButton);
  }

  show(): void {
    this.visible = true;
    this.alpha = 1;
  }

  hide(): void {
    this.visible = false;
    this.alpha = 0;
  }
}
