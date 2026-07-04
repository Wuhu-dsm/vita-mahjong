import { buildNeighbors, isBlocked } from '../engine/isBlocked';
import type { Level, LevelLayout, Stone } from '../engine/types';

export const DEFAULT_SEED = 'vita-mahjong-v1';

function seedToUint32(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRng(seed: string): () => number {
  let state = seedToUint32(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function createStones(layout: LevelLayout): Stone[] {
  return layout.positions.map(([z, x, y], index) => ({
    id: `${layout.id}-${z}-${x}-${y}-${index}`,
    z,
    x,
    y,
    face: -1,
    picked: false,
    top: [],
    left: [],
    right: [],
  }));
}

function solverOrder(a: Stone, b: Stone): number {
  return a.z - b.z || a.y - b.y || a.x - b.x;
}

export class SolvableDealer {
  static deal(layout: LevelLayout, faces: number[], rng: () => number): Level {
    if (faces.length * 2 !== layout.positions.length) {
      throw new Error(
        `${layout.name} requires ${layout.positions.length / 2} face pairs, received ${faces.length}`,
      );
    }

    const stones = createStones(layout);
    const shuffledPairs = shuffle(faces, rng);

    for (const face of shuffledPairs) {
      buildNeighbors(stones);

      const free = stones
        .filter((stone) => !stone.picked && !isBlocked(stone))
        .sort(solverOrder);
      if (free.length < 2) {
        throw new Error(
          `${layout.name} has fewer than two free stones while dealing face ${face}`,
        );
      }

      const [first, second] = free;
      first.face = face;
      second.face = face;
      first.picked = true;
      second.picked = true;
    }

    for (const stone of stones) {
      stone.picked = false;
    }

    return {
      id: layout.id,
      name: layout.name,
      theme: layout.theme,
      maxLayer: layout.maxLayer,
      stones: stones.map(({ z, x, y, face }) => ({ z, x, y, face })),
    };
  }
}
