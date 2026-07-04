import { Assets, type AssetsManifest } from 'pixi.js';
import manifestJson from '../../public/assets/assets.json';

const assetKeys = [
  'bg_home',
  'bg_game',
  'bg_result',
  'btn_wooden_capsule',
  'btn_green_capsule',
  'btn_circle_brown',
  'icon_gear',
  'icon_back',
  'icon_menu',
  'tile_face',
  'tile_side',
  'tile_blocked_arrow',
  'particle_square',
  'deco_ring',
  'deco_lotus',
  'logo_vita_mahjong',
  'fonts_css',
] as const;

export type AssetKey = (typeof assetKeys)[number];

export const ASSET_MANIFEST = manifestJson satisfies AssetsManifest;

export type AssetBundleName = (typeof ASSET_MANIFEST.bundles)[number]['name'];

let initPromise: Promise<void> | undefined;

async function ensureAssetsInitialized(): Promise<void> {
  initPromise ??= Assets.init({ manifest: ASSET_MANIFEST });
  await initPromise;
}

export async function loadAssets(bundleNames: readonly AssetBundleName[]): Promise<Record<string, unknown>> {
  await ensureAssetsInitialized();
  return Assets.loadBundle([...bundleNames]);
}
