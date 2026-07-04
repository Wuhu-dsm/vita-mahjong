export interface Stone {
  id: string;
  z: number;
  x: number;
  y: number;
  face: number;
  picked: boolean;
  top: Stone[];
  left: Stone[];
  right: Stone[];
}

export type ThemeId =
  | 'zodiac'
  | 'traditional'
  | 'animals'
  | 'oriental'
  | 'seasons'
  | 'myth';

export interface FaceSet {
  id: ThemeId;
  faceIds: number[];
}

export interface LevelLayout {
  id: number;
  name: string;
  theme: ThemeId;
  positions: Array<[z: number, x: number, y: number]>;
  maxLayer: number;
}

export interface Level {
  id: number;
  name: string;
  stones: Array<{ z: number; x: number; y: number; face: number }>;
  theme: ThemeId;
  maxLayer: number;
}
