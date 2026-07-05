export type SfxType = 'tap' | 'match' | 'combo' | 'win' | 'fail' | 'click';

import { loadAudio, saveAudio } from '../app/persistence';

export class AudioManager {
  private static instance: AudioManager;

  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private sfxMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private initialized: boolean = false;
  private saveAudioTimer: ReturnType<typeof setTimeout> | null = null;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private scheduleSaveAudio(): void {
    if (this.saveAudioTimer) clearTimeout(this.saveAudioTimer);
    this.saveAudioTimer = setTimeout(() => {
      saveAudio({
        sfxVolume: this.sfxVolume,
        bgmVolume: 0,
        sfxMuted: this.sfxMuted,
        bgmMuted: true,
      });
    }, 200);
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    this.ctx = new AudioContext();

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.ctx.destination);

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.initialized = true;

    // Restore saved audio settings from localStorage
    const saved = loadAudio();
    this.setSfxVolume(saved.sfxVolume);
    this.setSfxMuted(saved.sfxMuted);
  }

  playSfx(type: SfxType): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfxGain || this.sfxMuted) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => { /* ignore — will retry on next gesture */ });
      return;
    }

    switch (type) {
      case 'tap':
        this.playFilteredSfx(ctx, 'triangle', 360, 0.08, (gain) => {
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        }, 800);
        break;
      case 'match':
        this.playCollisionSfx(ctx);
        break;
      case 'combo':
        this.playFilteredSfx(ctx, 'triangle', 720, 0.18, (gain) => {
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        }, 1200);
        break;
      case 'win':
        this.playWinChord(ctx);
        break;
      case 'fail':
        this.playFailSweep(ctx);
        break;
      case 'click':
        this.playFilteredSfx(ctx, 'triangle', 600, 0.07, (gain) => {
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        }, 1000);
        break;
    }
  }

  private playSingleSfx(
    ctx: AudioContext,
    oscType: OscillatorType,
    frequency: number,
    duration: number,
    envelopeSetup: (gainNode: GainNode) => void,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = oscType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    envelopeSetup(gain);
    osc.connect(gain).connect(this.sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playFilteredSfx(
    ctx: AudioContext,
    oscType: OscillatorType,
    frequency: number,
    duration: number,
    envelopeSetup: (gainNode: GainNode) => void,
    filterFrequency: number = 2000,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFrequency, ctx.currentTime);
    osc.type = oscType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    envelopeSetup(gain);
    osc.connect(filter).connect(gain).connect(this.sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Short, percussive collision sound for successful matches.
   * Combines a fast downward sawtooth sweep with a brief noise burst.
   */
  private playCollisionSfx(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const toneDuration = 0.10;
    const noiseDuration = 0.06;

    // Tone body — woody impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + toneDuration);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + toneDuration);
    osc.connect(gain).connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + toneDuration);

    // Noise click — sharp attack
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * noiseDuration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 0.8;
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);
    noise.connect(filter).connect(noiseGain).connect(this.sfxGain!);
    noise.start(now);
  }

  private playWinChord(ctx: AudioContext): void {
    const frequencies = [523, 659, 784]; // C-E-G
    const staggeredStart = [0, 0.08, 0.16];
    const duration = 0.6;

    for (let i = 0; i < frequencies.length; i += 1) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequencies[i], ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + staggeredStart[i] + 0.02);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + staggeredStart[i] + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + staggeredStart[i] + duration);
      osc.connect(gain).connect(this.sfxGain!);
      osc.start(ctx.currentTime + staggeredStart[i]);
      osc.stop(ctx.currentTime + staggeredStart[i] + duration);
    }
  }

  private playFailSweep(ctx: AudioContext): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(this.sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  // ─── Volume / Mute Controls ────────────────────────────

  setSfxVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    this.sfxVolume = clamped;
    if (this.sfxGain && !this.sfxMuted) {
      this.sfxGain.gain.value = clamped;
    }
    this.scheduleSaveAudio();
  }

  setSfxMuted(m: boolean): void {
    this.sfxMuted = m;
    if (!this.sfxGain) return;
    this.sfxGain.gain.value = m ? 0 : this.sfxVolume;
    this.scheduleSaveAudio();
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  isSfxMuted(): boolean {
    return this.sfxMuted;
  }
}
