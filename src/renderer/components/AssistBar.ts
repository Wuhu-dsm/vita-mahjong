import { Container } from 'pixi.js';
import { Button } from './Button';

export class AssistBar extends Container {
  private readonly undoButton: Button;
  private readonly hintButton: Button;
  private readonly shuffleButton: Button;

  constructor(onUndo: () => void, onHint: () => void, onShuffle: () => void) {
    super();

    this.undoButton = new Button({
      textureKey: 'btn_circle_brown',
      label: '撤销 3',
      width: 160,
      height: 160,
      fontSize: 26,
      textColor: 0xfff7d2,
      onTap: onUndo,
    });
    this.undoButton.position.set(-200, 0);

    this.hintButton = new Button({
      textureKey: 'btn_circle_brown',
      label: '提示 3',
      width: 160,
      height: 160,
      fontSize: 26,
      textColor: 0xfff7d2,
      onTap: onHint,
    });
    this.hintButton.position.set(0, 0);

    this.shuffleButton = new Button({
      textureKey: 'btn_circle_brown',
      label: '洗牌 1',
      width: 160,
      height: 160,
      fontSize: 26,
      textColor: 0xfff7d2,
      onTap: onShuffle,
    });
    this.shuffleButton.position.set(200, 0);

    this.addChild(this.undoButton, this.hintButton, this.shuffleButton);
  }

  updateCounts(undo: number, hint: number, shuffle: number): void {
    this.undoButton.setLabel(`撤销 ${undo}`);
    this.hintButton.setLabel(`提示 ${hint}`);
    this.shuffleButton.setLabel(`洗牌 ${shuffle}`);

    const buttons: Array<{ btn: Container; count: number }> = [
      { btn: this.undoButton, count: undo },
      { btn: this.hintButton, count: hint },
      { btn: this.shuffleButton, count: shuffle },
    ];

    for (const { btn, count } of buttons) {
      if (count === 0) {
        btn.alpha = 0.35;
        btn.eventMode = 'none';
      } else {
        btn.alpha = 1.0;
        btn.eventMode = 'static';
      }
    }
  }
}
