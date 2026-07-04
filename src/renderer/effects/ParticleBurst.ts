import { Container, Graphics, type Ticker } from 'pixi.js';
import { config } from '../../app/config';

const POOL_BUDGET = 40;

interface Particle {
  graphic: Graphics;
  vx: number;
  vy: number;
  elapsedMs: number;
}

class ParticlePool {
  private readonly idle: Graphics[] = [];
  private readonly active = new Set<Graphics>();
  private allocated = 0;

  obtain(parent: Container): Graphics | null {
    let g = this.idle.pop();
    if (!g) {
      if (this.allocated >= POOL_BUDGET) return null;
      g = new Graphics();
      this.allocated += 1;
    }
    g.visible = true;
    g.alpha = 1;
    g.scale.set(1);
    g.clear();
    this.active.add(g);
    parent.addChild(g);
    return g;
  }

  free(g: Graphics): void {
    if (!this.active.delete(g)) return;
    g.parent?.removeChild(g);
    g.visible = false;
    g.clear();
    this.idle.push(g);
  }
}

function pickColor(isLowEnd: boolean): number {
  if (isLowEnd) return config.particles.colors.primary;
  const roll = Math.random();
  if (roll < 0.6) return config.particles.colors.primary;
  const secondaries = config.particles.colors.secondaries;
  return secondaries[Math.floor(Math.random() * secondaries.length)];
}

export class ParticleBurst extends Container {
  private readonly pool = new ParticlePool();
  private readonly particles: Particle[] = [];
  private readonly particleCount: number;

  constructor(isLowEnd: boolean) {
    super();
    this.particleCount = isLowEnd ? config.particles.lowCount : config.particles.highCount;
    this.visible = false;
  }

  emit(midX: number, midY: number): void {
    const count = this.particleCount;
    const size = config.particles.particleSize;
    const minSpeed = config.particles.minSpeed * 60;
    const maxSpeed = config.particles.maxSpeed * 60;

    for (let i = 0; i < count; i += 1) {
      const g = this.pool.obtain(this);
      if (!g) break; // pool exhausted — drop silently

      const angle = Math.random() * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const color = pickColor(false); // isLowEnd handled by count, colors still varied

      g.rect(-size / 2, -size / 2, size, size);
      g.fill({ color });
      g.position.set(midX, midY);

      this.particles.push({
        graphic: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        elapsedMs: 0,
      });
    }

    if (this.particles.length > 0) {
      this.visible = true;
    }
  }

  update(ticker: Ticker): void {
    if (!this.visible) return;

    const duration = config.particles.burstDurationMs;
    const gravity = config.particles.gravity;

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.elapsedMs += ticker.deltaMS;
      const progress = Math.min(p.elapsedMs / duration, 1);

      p.graphic.x += p.vx * ticker.deltaMS * 0.06;
      p.graphic.y += p.vy * ticker.deltaMS * 0.06;
      p.vy += gravity;
      p.graphic.alpha = 1 - progress;
      p.graphic.scale.set(1 - progress * 0.6);

      if (progress >= 1) {
        this.pool.free(p.graphic);
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length === 0) {
      this.visible = false;
    }
  }
}
