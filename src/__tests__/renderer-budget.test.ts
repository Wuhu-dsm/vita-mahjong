import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TILE_POOL_TRAY_NODE_ALLOWANCE } from '../renderer/pools/TilePool';
import type { Level } from '../engine/types';

function loadGeneratedLevel(levelId: number): Level {
  const levelPath = resolve(process.cwd(), 'public', 'levels', `${levelId}.json`);
  return JSON.parse(readFileSync(levelPath, 'utf8')) as Level;
}

describe('renderer tile node budget', () => {
  it('keeps level 20 within the Phase 1 active tile sprite budget', () => {
    const level = loadGeneratedLevel(20);
    expect(level.stones.length + TILE_POOL_TRAY_NODE_ALLOWANCE).toBeLessThanOrEqual(150);
  });
});
