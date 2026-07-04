const KEY_LEVEL = 'vita-mahjong:currentLevel';
const KEY_AUDIO = 'vita-mahjong:audio';

export interface AudioSettings {
  sfxVolume: number;
  bgmVolume: number;
  sfxMuted: boolean;
  bgmMuted: boolean;
}

const DEFAULT_AUDIO: AudioSettings = {
  sfxVolume: 0.7,
  bgmVolume: 0.4,
  sfxMuted: false,
  bgmMuted: false,
};

export function loadLevel(): number {
  const raw = localStorage.getItem(KEY_LEVEL);
  return raw ? parseInt(raw, 10) || 1 : 1;
}

export function saveLevel(level: number): void {
  localStorage.setItem(KEY_LEVEL, String(level));
}

export function loadAudio(): AudioSettings {
  const raw = localStorage.getItem(KEY_AUDIO);
  if (!raw) return { ...DEFAULT_AUDIO };
  try {
    const parsed = JSON.parse(raw);
    return {
      sfxVolume: typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : DEFAULT_AUDIO.sfxVolume,
      bgmVolume: typeof parsed.bgmVolume === 'number' ? parsed.bgmVolume : DEFAULT_AUDIO.bgmVolume,
      sfxMuted: typeof parsed.sfxMuted === 'boolean' ? parsed.sfxMuted : DEFAULT_AUDIO.sfxMuted,
      bgmMuted: typeof parsed.bgmMuted === 'boolean' ? parsed.bgmMuted : DEFAULT_AUDIO.bgmMuted,
    };
  } catch {
    return { ...DEFAULT_AUDIO };
  }
}

export function saveAudio(settings: AudioSettings): void {
  localStorage.setItem(KEY_AUDIO, JSON.stringify(settings));
}

export function resetLevel(): void {
  localStorage.removeItem(KEY_LEVEL);
}
