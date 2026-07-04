import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Solver } from '../engine/Solver';
import type { Level, ThemeId } from '../engine/types';
import { LayoutBuilder, LEVEL_SPECS, THEME_FACE_SETS } from './LayoutBuilder';
import { DEFAULT_SEED, SolvableDealer, createSeededRng } from './SolvableDealer';

interface LevelBudget {
  tileCount: number;
  layers: number;
}

interface GenerateLevelsOptions {
  outDir?: string;
  seed?: string;
}

const LEVEL_BUDGETS = new Map<number, LevelBudget>(
  LEVEL_SPECS.map((spec) => [
    spec.id,
    {
      tileCount: spec.tileCount,
      layers: spec.layers,
    },
  ]),
);

export function buildFacePairs(theme: ThemeId, pairCount: number): number[] {
  const faceIds = THEME_FACE_SETS[theme].faceIds;

  if (faceIds.length === 0) {
    throw new Error(`Theme ${theme} has no faces`);
  }

  return Array.from({ length: pairCount }, (_, index) => faceIds[index % faceIds.length]);
}

function assertEvenFaceCounts(level: Level): void {
  const counts = new Map<number, number>();

  for (const stone of level.stones) {
    counts.set(stone.face, (counts.get(stone.face) ?? 0) + 1);
  }

  for (const [face, count] of counts) {
    if (count % 2 !== 0) {
      throw new Error(`Level ${level.id} face ${face} appears ${count} times`);
    }
  }
}

function assertBudget(level: Level): void {
  const budget = LEVEL_BUDGETS.get(level.id);
  if (!budget) {
    throw new Error(`No budget is defined for level ${level.id}`);
  }

  const maxZ = Math.max(...level.stones.map((stone) => stone.z));
  if (level.stones.length !== budget.tileCount) {
    throw new Error(
      `Level ${level.id} has ${level.stones.length} stones, expected ${budget.tileCount}`,
    );
  }

  if (maxZ > budget.layers - 1 || level.maxLayer !== budget.layers - 1) {
    throw new Error(
      `Level ${level.id} exceeds layer budget: max z ${maxZ}, maxLayer ${level.maxLayer}, budget ${budget.layers}`,
    );
  }
}

function assertValidLevel(level: Level): void {
  assertBudget(level);
  assertEvenFaceCounts(level);

  if (!Solver.isSolvable(level)) {
    throw new Error(`Level ${level.id} is not solvable`);
  }
}

export function generateLevels(options: GenerateLevelsOptions = {}): Level[] {
  const outDir = options.outDir ?? resolve(process.cwd(), 'public/levels');
  const seed = options.seed ?? DEFAULT_SEED;
  const levels: Level[] = [];

  mkdirSync(outDir, { recursive: true });

  for (const layout of LayoutBuilder.getAll()) {
    try {
      const rng = createSeededRng(`${seed}:${layout.id}`);
      const faces = buildFacePairs(layout.theme, layout.positions.length / 2);
      const level = SolvableDealer.deal(layout, faces, rng);

      assertValidLevel(level);
      writeFileSync(
        resolve(outDir, `${layout.id}.json`),
        `${JSON.stringify(level, null, 2)}\n`,
        'utf8',
      );
      levels.push(level);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate level ${layout.id} (${layout.name}): ${message}`);
    }
  }

  if (levels.length !== 20) {
    throw new Error(`Generated ${levels.length} levels, expected 20`);
  }

  return levels;
}

export function runGenerateLevelsCli(): void {
  try {
    const levels = generateLevels();
    console.log(`Generated ${levels.length} levels in public/levels`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runGenerateLevelsCli();
}
