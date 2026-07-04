import { describe, expect, it } from 'vitest';
import { LayoutBuilder } from '../generator/LayoutBuilder';
import { buildFacePairs } from '../generator/generate-levels';
import { createSeededRng, DEFAULT_SEED, SolvableDealer } from '../generator/SolvableDealer';
import { TILE_POOL_TRAY_NODE_ALLOWANCE } from '../renderer/pools/TilePool';

describe('renderer tile node budget', () => {
  it('keeps level 20 within the Phase 1 active tile sprite budget', () => {
    const layout = LayoutBuilder.get(20);
    const level = SolvableDealer.deal(
      layout,
      buildFacePairs(layout.theme, layout.positions.length / 2),
      createSeededRng(`${DEFAULT_SEED}:${layout.id}`),
    );

    expect(level.stones.length + TILE_POOL_TRAY_NODE_ALLOWANCE).toBeLessThanOrEqual(150);
  });
});
