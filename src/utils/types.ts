export interface Point {
  x: number;
  y: number;
}

export interface ColorRgb {
  r: number;
  g: number;
  b: number;
}

export type ColorSetter = (color: ColorRgb) => void;
