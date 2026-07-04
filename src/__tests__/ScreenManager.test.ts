import { Container } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScreenManager } from '../renderer/ScreenManager';

interface FakeTicker {
  add: (callback: unknown) => void;
  remove: (callback: unknown) => void;
}

function createManager(): ScreenManager {
  const app = {
    stage: new Container(),
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
    } satisfies FakeTicker,
    renderer: {
      width: 1080,
      height: 2400,
      background: { color: 0 },
    },
  };

  return new ScreenManager(app as never);
}

describe('ScreenManager', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { addEventListener: vi.fn() });
  });

  it('settles an interrupted transition promise', async () => {
    const manager = createManager();
    await manager.show('home', { immediate: true });

    const interrupted = manager.show('game');
    await manager.show('result', { immediate: true });

    const status = await Promise.race([
      interrupted.then(() => 'resolved'),
      new Promise((resolve) => setTimeout(() => resolve('pending'), 0)),
    ]);

    expect(status).toBe('resolved');
  });
});
