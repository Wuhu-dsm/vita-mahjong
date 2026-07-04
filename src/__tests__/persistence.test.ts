import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadLevel,
  saveLevel,
  loadAudio,
  saveAudio,
  resetLevel,
  type AudioSettings,
} from '../app/persistence';

// Minimal localStorage mock — vitest node environment does not provide localStorage
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (key: string): string | null => store.get(key) ?? null,
  setItem: (key: string, value: string): void => { store.set(key, value); },
  removeItem: (key: string): void => { store.delete(key); },
  clear: (): void => { store.clear(); },
  get length(): number { return store.size; },
  key: (index: number): string | null => {
    const keys = [...store.keys()];
    return keys[index] ?? null;
  },
};

beforeEach(() => {
  store.clear();
});

describe('persistence', () => {
  describe('loadLevel', () => {
    it('returns 1 when no data saved', () => {
      expect(loadLevel()).toBe(1);
    });

    it('returns 1 when stored value is non-numeric', () => {
      localStorage.setItem('vita-mahjong:currentLevel', 'abc');
      expect(loadLevel()).toBe(1);
    });
  });

  describe('saveLevel + loadLevel', () => {
    it('round-trips correctly', () => {
      saveLevel(5);
      expect(loadLevel()).toBe(5);
    });

    it('round-trips level 20', () => {
      saveLevel(20);
      expect(loadLevel()).toBe(20);
    });
  });

  describe('loadAudio', () => {
    it('returns defaults when no data saved', () => {
      const settings = loadAudio();
      expect(settings.sfxVolume).toBe(0.7);
      expect(settings.bgmVolume).toBe(0.4);
      expect(settings.sfxMuted).toBe(false);
      expect(settings.bgmMuted).toBe(false);
    });

    it('returns defaults when stored data is corrupt', () => {
      localStorage.setItem('vita-mahjong:audio', '{corrupt');
      const settings = loadAudio();
      expect(settings.sfxVolume).toBe(0.7);
      expect(settings.bgmMuted).toBe(false);
    });
  });

  describe('saveAudio + loadAudio', () => {
    it('round-trips correctly', () => {
      const input: AudioSettings = {
        sfxVolume: 0.3,
        bgmVolume: 0.8,
        sfxMuted: true,
        bgmMuted: false,
      };
      saveAudio(input);
      const output = loadAudio();
      expect(output.sfxVolume).toBe(0.3);
      expect(output.bgmVolume).toBe(0.8);
      expect(output.sfxMuted).toBe(true);
      expect(output.bgmMuted).toBe(false);
    });
  });

  describe('resetLevel', () => {
    it('removes the key so loadLevel returns 1', () => {
      saveLevel(7);
      expect(loadLevel()).toBe(7);
      resetLevel();
      expect(loadLevel()).toBe(1);
    });
  });
});
