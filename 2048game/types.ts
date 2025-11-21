export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export type Grid = number[][];

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

export interface Coordinates {
  r: number;
  c: number;
}

export interface HintResponse {
  direction: Direction;
  reasoning: string;
}
