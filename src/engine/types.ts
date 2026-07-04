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

export interface Level {
  id: number;
  name: string;
  stones: Array<{ z: number; x: number; y: number; face: number }>;
  theme: string;
  maxLayer: number;
}
