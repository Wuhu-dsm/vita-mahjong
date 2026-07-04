export type SfxType = 'tap' | 'match' | 'combo' | 'win' | 'fail' | 'click';

interface BgmNote {
  frequency: number;
  duration: number;
}

import { loadAudio, saveAudio } from '../app/persistence';

export class AudioManager {
  private static instance: AudioManager;

  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxMuted: boolean = false;
  private bgmMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private bgmVolume: number = 0.4;
  private initialized: boolean = false;
  private saveAudioTimer: ReturnType<typeof setTimeout> | null = null;
  private bgmPlaying: boolean = false;
  private bgmTimer: ReturnType<typeof setInterval> | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private nextBgmIndex: number = 0;

  /**
   * Chinese pentatonic scale: C-D-E-G-A
   * Base octave + one octave above for melodic variety
   */
  private static readonly PENTATONIC: number[] = [
    262, 294, 330, 392, 440,
    524, 588, 660, 784, 880,
  ];

  /**
   * 16-bar melody pattern using indices into PENTATONIC.
   * A bar is ~750ms at 80 BPM. Each entry is [index, beats].
   * The pattern creates a gentle, meandering pentatonic line.
   */
  private static readonly MELODY: BgmNote[] = [
    // Bar 1-2: gentle rise
    { frequency: 262, duration: 1.5 },
    { frequency: 330, duration: 0.75 },
    { frequency: 392, duration: 0.75 },
    // Bar 3-4
    { frequency: 440, duration: 1.5 },
    { frequency: 392, duration: 0.75 },
    { frequency: 330, duration: 0.75 },
    // Bar 5-6: octave jump
    { frequency: 524, duration: 1.5 },
    { frequency: 440, duration: 0.75 },
    { frequency: 392, duration: 0.75 },
    // Bar 7-8
    { frequency: 330, duration: 2.25 },
    { frequency: 294, duration: 0.75 },
    // Bar 9-10: descent
    { frequency: 262, duration: 1.5 },
    { frequency: 294, duration: 0.75 },
    { frequency: 330, duration: 0.75 },
    // Bar 11-12
    { frequency: 392, duration: 0.75 },
    { frequency: 440, duration: 0.75 },
    { frequency: 524, duration: 1.5 },
    // Bar 13-14
    { frequency: 588, duration: 0.75 },
    { frequency: 524, duration: 0.75 },
    { frequency: 440, duration: 1.5 },
    // Bar 15-16: resolution
    { frequency: 392, duration: 0.75 },
    { frequency: 330, duration: 0.75 },
    { frequency: 294, duration: 0.75 },
    { frequency: 262, duration: 0.75 },
  ];

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
        bgmVolume: this.bgmVolume,
        sfxMuted: this.sfxMuted,
        bgmMuted: this.bgmMuted,
      });
    }, 200);
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    this.ctx = new AudioContext();

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.bgmVolume;
    this.bgmGain.connect(this.ctx.destination);

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.initialized = true;

    // Restore saved audio settings from localStorage
    const saved = loadAudio();
    this.setSfxVolume(saved.sfxVolume);
    this.setBgmVolume(saved.bgmVolume);
    this.setSfxMuted(saved.sfxMuted);
    this.setBgmMuted(saved.bgmMuted);
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
        this.playSingleSfx(ctx, 'sine', 880, 0.15, (gain) => {
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        });
        break;
      case 'match':
        this.playSingleSfx(ctx, 'triangle', 660, 0.20, (gain) => {
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.20);
        });
        break;
      case 'combo':
        this.playFilteredSfx(ctx, 'square', 1047, 0.25, (gain) => {
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        });
        break;
      case 'win':
        this.playWinChord(ctx);
        break;
      case 'fail':
        this.playFailSweep(ctx);
        break;
      case 'click':
        this.playSingleSfx(ctx, 'sine', 1047, 0.08, (gain) => {
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        });
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
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.type = oscType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    envelopeSetup(gain);
    osc.connect(filter).connect(gain).connect(this.sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playWinChord(ctx: AudioContext): void {
    const frequencies = [523, 659, 784]; // C-E-G
    const staggeredStart = [0, 0.08, 0.16];
    const duration = 0.6;

    for (let i = 0; i < frequencies.length; i++) {
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

  // ─── BGM ──────────────────────────────────────────────

  startBgm(): void {
    if (!this.ctx || !this.bgmGain || this.bgmMuted || this.bgmPlaying) return;
    if (this.ctx.state !== 'running') {
      this.ctx.resume().catch(() => { /* will retry on next call */ });
      return;
    }

    this.bgmPlaying = true;
    this.nextBgmIndex = 0;
    this.scheduleBgmBlock();

    // Re-schedule every 2 bars (~1500ms) to stay ahead
    this.bgmTimer = setInterval(() => {
      this.scheduleBgmBlock();
    }, 1500);
  }

  private scheduleBgmBlock(): void {
    const ctx = this.ctx;
    if (!ctx || !this.bgmPlaying) return;

    const now = ctx.currentTime;
    const beatDuration = 0.75; // ~80 BPM
    const melody = AudioManager.MELODY;

    // Schedule the next 8 notes (roughly 2 bars)
    let time = Math.max(now, (this.nextBgmIndex === 0 ? now : now));
    // We need to know the current schedule time. Use nextBgmIndex to compute.
    let scheduleTime = now + 0.05; // small look-ahead
    // But we also need to continue from where we last scheduled.
    // Simple approach: schedule 8 notes ahead of current time + accumulated offset
    const plannedNotes = 8;
    const startIdx = this.nextBgmIndex;
    const endIdx = Math.min(startIdx + plannedNotes, melody.length);

    for (let i = startIdx; i < endIdx; i++) {
      const note = melody[i];
      const freq = note.frequency;
      const dur = note.duration * beatDuration;

      // Main tone
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, 0);

      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0, 0);
      gain1.gain.linearRampToValueAtTime(0.2, scheduleTime + 0.01);
      gain1.gain.setValueAtTime(0.2, scheduleTime + dur * 0.85);
      gain1.gain.linearRampToValueAtTime(0, scheduleTime + dur);

      osc1.connect(gain1).connect(this.bgmGain!);

      // Soft overtone at 2x frequency
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, 0);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, 0);
      gain2.gain.linearRampToValueAtTime(0.1, scheduleTime + 0.01);
      gain2.gain.setValueAtTime(0.1, scheduleTime + dur * 0.7);
      gain2.gain.linearRampToValueAtTime(0, scheduleTime + dur);

      osc2.connect(gain2).connect(this.bgmGain!);

      osc1.start(scheduleTime);
      osc1.stop(scheduleTime + dur);
      osc2.start(scheduleTime);
      osc2.stop(scheduleTime + dur);

      this.bgmOscillators.push(osc1, osc2);

      scheduleTime += dur;
    }

    this.nextBgmIndex = endIdx;
    if (this.nextBgmIndex >= melody.length) {
      this.nextBgmIndex = 0;
    }
  }

  stopBgm(): void {
    // Disconnect all active oscillators
    for (const osc of this.bgmOscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
      try { osc.disconnect(); } catch { /* already disconnected */ }
    }
    this.bgmOscillators.length = 0;

    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }

    this.bgmPlaying = false;
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

  setBgmVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    this.bgmVolume = clamped;
    if (this.bgmGain && !this.bgmMuted) {
      this.bgmGain.gain.value = clamped;
    }
    this.scheduleSaveAudio();
  }

  setSfxMuted(m: boolean): void {
    this.sfxMuted = m;
    if (!this.sfxGain) return;
    this.sfxGain.gain.value = m ? 0 : this.sfxVolume;
    this.scheduleSaveAudio();
  }

  setBgmMuted(m: boolean): void {
    this.bgmMuted = m;
    if (!this.bgmGain) return;
    this.bgmGain.gain.value = m ? 0 : this.bgmVolume;
    this.scheduleSaveAudio();
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  getBgmVolume(): number {
    return this.bgmVolume;
  }

  isSfxMuted(): boolean {
    return this.sfxMuted;
  }

  isBgmMuted(): boolean {
    return this.bgmMuted;
  }
}
