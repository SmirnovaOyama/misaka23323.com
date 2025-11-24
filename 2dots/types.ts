export enum DotColor {
  Red = 'Red',
  Blue = 'Blue',
  Green = 'Green',
  Yellow = 'Yellow',
  Purple = 'Purple',
}

export interface Point {
  row: number;
  col: number;
}

export interface DotItem {
  id: string; // Unique ID for Framer Motion keys
  color: DotColor;
  row: number; // Current visual position (for logic, we might rely on array index, but explicit row/col helps animations)
  col: number;
  isNew?: boolean; // For entrance animation
}

export interface GameState {
  grid: DotItem[][]; // [row][col]
  score: number;
  movesRemaining: number;
  isPlaying: boolean;
}
