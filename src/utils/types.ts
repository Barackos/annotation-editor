export interface Point {
  x: number;
  y: number;
}

export type DataStep = Point;

export interface ColorRgb {
  r: number;
  g: number;
  b: number;
}

export type ColorSetter = (color: ColorRgb) => void;

export interface GalleryImage {
  name: string;
  url: string;
}

export interface SavedAnnotation {
  undoSteps: DataStep[];
  redoSteps: DataStep[];
  shapes: Point[][];
  shapesRedo: Point[][];
}
