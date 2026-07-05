import type { FaceSet, LevelLayout, ThemeId } from '../engine/types';

interface LevelSpec {
  id: number;
  name: string;
  theme: ThemeId;
  tileCount: number;
  layers: number;
  columns: number;
  layerCounts: number[];
}

export const THEME_FACE_SETS: Record<ThemeId, FaceSet> = {
  zodiac: {
    id: 'zodiac',
    faceIds: Array.from({ length: 12 }, (_, index) => index),
  },
  traditional: {
    id: 'traditional',
    faceIds: Array.from({ length: 42 }, (_, index) => index),
  },
  animals: {
    id: 'animals',
    faceIds: Array.from({ length: 12 }, (_, index) => index),
  },
  oriental: {
    id: 'oriental',
    faceIds: Array.from({ length: 12 }, (_, index) => index),
  },
  seasons: {
    id: 'seasons',
    faceIds: Array.from({ length: 8 }, (_, index) => index),
  },
  myth: {
    id: 'myth',
    faceIds: Array.from({ length: 12 }, (_, index) => index),
  },
};

export const LEVEL_SPECS: LevelSpec[] = [
  {
    id: 1,
    name: '十二星座入门',
    theme: 'zodiac',
    tileCount: 24,
    layers: 2,
    columns: 6,
    layerCounts: [20, 4],
  },
  {
    id: 2,
    name: '传统麻将初体验',
    theme: 'zodiac',
    tileCount: 36,
    layers: 3,
    columns: 6,
    layerCounts: [24, 10, 2],
  },
  {
    id: 3,
    name: '十二星座加深',
    theme: 'zodiac',
    tileCount: 40,
    layers: 3,
    columns: 6,
    layerCounts: [28, 10, 2],
  },
  {
    id: 4,
    name: '万子与条子',
    theme: 'traditional',
    tileCount: 48,
    layers: 3,
    columns: 8,
    layerCounts: [32, 12, 4],
  },
  {
    id: 5,
    name: '筒子大满贯',
    theme: 'traditional',
    tileCount: 56,
    layers: 4,
    columns: 8,
    layerCounts: [32, 16, 6, 2],
  },
  {
    id: 6,
    name: '动物乐园',
    theme: 'traditional',
    tileCount: 60,
    layers: 4,
    columns: 8,
    layerCounts: [36, 16, 6, 2],
  },
  {
    id: 7,
    name: '东方初韵',
    theme: 'traditional',
    tileCount: 64,
    layers: 4,
    columns: 8,
    layerCounts: [36, 18, 8, 2],
  },
  {
    id: 8,
    name: '麻将全牌组 I',
    theme: 'traditional',
    tileCount: 72,
    layers: 4,
    columns: 8,
    layerCounts: [42, 20, 8, 2],
  },
  {
    id: 9,
    name: '生肖符号',
    theme: 'animals',
    tileCount: 72,
    layers: 4,
    columns: 8,
    layerCounts: [42, 20, 8, 2],
  },
  {
    id: 10,
    name: '混合主题 I',
    theme: 'animals',
    tileCount: 80,
    layers: 5,
    columns: 10,
    layerCounts: [42, 22, 10, 4, 2],
  },
  {
    id: 11,
    name: '东方深韵',
    theme: 'animals',
    tileCount: 84,
    layers: 5,
    columns: 10,
    layerCounts: [44, 24, 10, 4, 2],
  },
  {
    id: 12,
    name: '麻将全牌组 II',
    theme: 'traditional',
    tileCount: 90,
    layers: 5,
    columns: 10,
    layerCounts: [48, 26, 10, 4, 2],
  },
  {
    id: 13,
    name: '季节变换',
    theme: 'oriental',
    tileCount: 90,
    layers: 5,
    columns: 10,
    layerCounts: [48, 26, 10, 4, 2],
  },
  {
    id: 14,
    name: '神话符号 I',
    theme: 'oriental',
    tileCount: 96,
    layers: 5,
    columns: 10,
    layerCounts: [50, 28, 12, 4, 2],
  },
  {
    id: 15,
    name: '混合主题 II',
    theme: 'oriental',
    tileCount: 100,
    layers: 6,
    columns: 10,
    layerCounts: [50, 26, 12, 6, 4, 2],
  },
  {
    id: 16,
    name: '高密度麻将',
    theme: 'traditional',
    tileCount: 108,
    layers: 6,
    columns: 10,
    layerCounts: [54, 30, 14, 6, 2, 2],
  },
  {
    id: 17,
    name: '生肖大乱斗',
    theme: 'seasons',
    tileCount: 108,
    layers: 6,
    columns: 10,
    layerCounts: [54, 30, 14, 6, 2, 2],
  },
  {
    id: 18,
    name: '东方终极',
    theme: 'seasons',
    tileCount: 112,
    layers: 6,
    columns: 10,
    layerCounts: [56, 32, 14, 6, 2, 2],
  },
  {
    id: 19,
    name: '神话符号 II',
    theme: 'myth',
    tileCount: 120,
    layers: 6,
    columns: 10,
    layerCounts: [60, 34, 16, 6, 2, 2],
  },
  {
    id: 20,
    name: '终极混合',
    theme: 'myth',
    tileCount: 128,
    layers: 7,
    columns: 10,
    layerCounts: [64, 36, 16, 6, 2, 2, 2],
  },
];

function assertSpec(spec: LevelSpec): void {
  if (spec.layerCounts.length !== spec.layers) {
    throw new Error(`Level ${spec.id} defines ${spec.layerCounts.length} layer counts for ${spec.layers} layers`);
  }

  const total = spec.layerCounts.reduce((sum, count) => sum + count, 0);
  if (total !== spec.tileCount) {
    throw new Error(`Level ${spec.id} layer counts total ${total}, expected ${spec.tileCount}`);
  }

  if (spec.tileCount % 2 !== 0 || spec.layerCounts.some((count) => count % 2 !== 0)) {
    throw new Error(`Level ${spec.id} must use even tile and layer counts`);
  }
}

function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function rowWidthHash(levelId: number, z: number, row: number): number {
  return ((levelId * 73856093) ^ (z * 19349663) ^ (row * 83492791)) >>> 0;
}

function distributeRowWidths(count: number, maxColumns: number, z: number, levelId: number): number[] {
  const columns = Math.max(2, Math.min(maxColumns, count));
  const evenColumns = columns % 2 === 0 ? columns : columns - 1;
  let rowCount = Math.ceil(count / evenColumns);

  // A perfectly filled rectangle looks too regular. Add an extra row when possible
  // so the shape gains jagged edges while keeping the same tile count.
  if (rowCount * evenColumns === count && (rowCount + 1) * 2 <= count) {
    rowCount += 1;
  }

  const widths: number[] = Array(rowCount).fill(evenColumns);
  let currentTotal = rowCount * evenColumns;
  const minTotal = rowCount * 2;
  const rng = seededRng(rowWidthHash(levelId, z, count));

  while (currentTotal > count) {
    const reducible = widths
      .map((width, index) => ({ width, index }))
      .filter(({ width }) => width > 2 && currentTotal - 2 >= Math.max(count, minTotal));

    if (reducible.length === 0) break;

    const pick = reducible[Math.floor(rng() * reducible.length)];
    widths[pick.index] -= 2;
    currentTotal -= 2;
  }

  return widths;
}

function layerPositions(z: number, count: number, maxColumns: number, levelId: number): Array<[number, number, number]> {
  const widths = distributeRowWidths(count, maxColumns, z, levelId);
  const rowCount = widths.length;
  const positions: Array<[number, number, number]> = [];

  for (let row = 0; row < rowCount; row += 1) {
    const width = widths[row];
    if (width < 2 || width % 2 !== 0) {
      throw new Error(`Cannot build an even row for layer ${z}`);
    }

    const y = row - Math.floor(rowCount / 2);
    for (let col = 0; col < width; col += 1) {
      const x = col * 2 - (width - 1);
      positions.push([z, x, y]);
    }
  }

  return positions;
}

function createLayout(spec: LevelSpec): LevelLayout {
  assertSpec(spec);

  const positions = spec.layerCounts.flatMap((count, z) => {
    const layerColumns = Math.max(2, spec.columns - z * 2);
    return layerPositions(z, count, layerColumns, spec.id);
  });

  return {
    id: spec.id,
    name: spec.name,
    theme: spec.theme,
    positions,
    maxLayer: spec.layers - 1,
  };
}

export const LayoutBuilder = {
  getAll(): LevelLayout[] {
    return LEVEL_SPECS.map(createLayout);
  },

  get(levelId: number): LevelLayout {
    const spec = LEVEL_SPECS.find((candidate) => candidate.id === levelId);
    if (!spec) {
      throw new Error(`Unknown level id: ${levelId}`);
    }

    return createLayout(spec);
  },
};
