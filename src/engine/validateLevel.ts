import { Solver } from './Solver';
import type { Level, ThemeId } from './types';

const VALID_THEMES: readonly ThemeId[] = [
  'zodiac',
  'traditional',
  'animals',
  'oriental',
  'seasons',
  'myth',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && VALID_THEMES.includes(value as ThemeId);
}

export function validatePlayableLevel(value: unknown): Level {
  if (!isRecord(value)) {
    throw new Error('Malformed level: expected object');
  }

  const stones = value.stones;
  if (
    !Number.isInteger(value.id) ||
    value.id < 1 ||
    value.id > 20 ||
    typeof value.name !== 'string' ||
    !isTheme(value.theme) ||
    !Number.isInteger(value.maxLayer) ||
    !Array.isArray(stones)
  ) {
    throw new Error('Malformed level: invalid top-level fields');
  }

  if (value.maxLayer < 0 || value.maxLayer > 6) {
    throw new Error(`Malformed level ${value.id}: maxLayer must be 0..6`);
  }

  if (stones.length === 0 || stones.length % 2 !== 0 || stones.length > 128) {
    throw new Error(`Malformed level ${value.id}: invalid stone count`);
  }

  const faceCounts = new Map<number, number>();
  const positions = new Set<string>();
  const parsedStones = stones.map((stone, index) => {
    if (!isRecord(stone)) {
      throw new Error(`Malformed level ${value.id}: stone ${index} is not an object`);
    }

    const { z, x, y, face } = stone;
    if (
      !Number.isInteger(z) ||
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      !Number.isInteger(face) ||
      z < 0 ||
      z > value.maxLayer ||
      face < 0
    ) {
      throw new Error(`Malformed level ${value.id}: invalid stone ${index}`);
    }

    const positionKey = `${z},${x},${y}`;
    if (positions.has(positionKey)) {
      throw new Error(`Malformed level ${value.id}: duplicate position ${positionKey}`);
    }
    positions.add(positionKey);
    faceCounts.set(face, (faceCounts.get(face) ?? 0) + 1);
    return { z, x, y, face };
  });

  const oddFace = Array.from(faceCounts.entries()).find(([, count]) => count % 2 !== 0);
  if (oddFace) {
    throw new Error(`Malformed level ${value.id}: odd face count for face ${oddFace[0]}`);
  }

  const level: Level = {
    id: value.id,
    name: value.name,
    theme: value.theme,
    maxLayer: value.maxLayer,
    stones: parsedStones,
  };

  if (!Solver.isSolvable(level)) {
    throw new Error(`Malformed level ${value.id}: not solvable`);
  }

  return Object.freeze(level);
}
