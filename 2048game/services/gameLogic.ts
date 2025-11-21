import { GRID_SIZE, WINNING_SCORE } from '../constants';
import { Direction, Grid, Coordinates } from '../types';

export const getEmptyGrid = (): Grid => {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
};

export const getEmptyCoordinates = (grid: Grid): Coordinates[] => {
  const empty: Coordinates[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        empty.push({ r, c });
      }
    }
  }
  return empty;
};

export const spawnTile = (grid: Grid): Grid => {
  const emptyCoords = getEmptyCoordinates(grid);
  if (emptyCoords.length === 0) return grid;

  const { r, c } = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newGrid = copyGrid(grid);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

export const copyGrid = (grid: Grid): Grid => {
  return grid.map((row) => [...row]);
};

const slideRowLeft = (row: number[]): { newRow: number[]; score: number } => {
  const nonZero = row.filter((val) => val !== 0);
  const newRow: number[] = [];
  let score = 0;
  let skip = false;

  for (let i = 0; i < nonZero.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }
    // Merge
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2;
      newRow.push(mergedVal);
      score += mergedVal;
      skip = true;
    } else {
      newRow.push(nonZero[i]);
    }
  }

  // Pad with zeros
  while (newRow.length < GRID_SIZE) {
    newRow.push(0);
  }
  return { newRow, score };
};

export const moveGrid = (
  grid: Grid,
  direction: Direction
): { grid: Grid; score: number; moved: boolean } => {
  let newGrid = copyGrid(grid);
  let scoreGained = 0;
  let moved = false;

  if (direction === Direction.LEFT) {
    for (let r = 0; r < GRID_SIZE; r++) {
      const { newRow, score } = slideRowLeft(newGrid[r]);
      if (newRow.some((v, i) => v !== newGrid[r][i])) moved = true;
      newGrid[r] = newRow;
      scoreGained += score;
    }
  } else if (direction === Direction.RIGHT) {
    for (let r = 0; r < GRID_SIZE; r++) {
      const reversed = [...newGrid[r]].reverse();
      const { newRow, score } = slideRowLeft(reversed);
      const finalRow = newRow.reverse();
      if (finalRow.some((v, i) => v !== newGrid[r][i])) moved = true;
      newGrid[r] = finalRow;
      scoreGained += score;
    }
  } else if (direction === Direction.UP) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
      const { newRow, score } = slideRowLeft(col);
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] !== newRow[r]) moved = true;
        newGrid[r][c] = newRow[r];
      }
      scoreGained += score;
    }
  } else if (direction === Direction.DOWN) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
      const reversed = col.reverse();
      const { newRow, score } = slideRowLeft(reversed);
      const finalCol = newRow.reverse();
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] !== finalCol[r]) moved = true;
        newGrid[r][c] = finalCol[r];
      }
      scoreGained += score;
    }
  }

  return { grid: newGrid, score: scoreGained, moved };
};

export const isGameOver = (grid: Grid): boolean => {
  // Check for empty cells
  if (getEmptyCoordinates(grid).length > 0) return false;

  // Check for possible merges
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (c + 1 < GRID_SIZE && grid[r][c + 1] === val) return false;
      if (r + 1 < GRID_SIZE && grid[r + 1][c] === val) return false;
    }
  }
  return true;
};

export const hasWon = (grid: Grid): boolean => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] >= WINNING_SCORE) return true;
    }
  }
  return false;
};
