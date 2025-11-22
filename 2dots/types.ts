export enum DotColor {
  Red = 'RED',
  Blue = 'BLUE',
  Green = 'GREEN',
  Yellow = 'YELLOW',
  Purple = 'PURPLE',
}

export interface Coordinate {
  row: number;
  col: number;
}

export interface DotItem {
  id: string;
  color: DotColor;
}

export type GridState = (DotItem | null)[][]; // null represents empty space before gravity fills it

export interface GameConfig {
  rows: number;
  cols: number;
  moves: number;
}
