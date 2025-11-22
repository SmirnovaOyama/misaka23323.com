import { DotColor, GameConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  rows: 6,
  cols: 6,
  moves: 100,
};

export const COLOR_STYLES: Record<DotColor, string> = {
  [DotColor.Red]: 'bg-red-500',
  [DotColor.Blue]: 'bg-blue-500',
  [DotColor.Green]: 'bg-emerald-500',
  [DotColor.Yellow]: 'bg-amber-400',
  [DotColor.Purple]: 'bg-violet-500',
};

export const LINE_COLORS: Record<DotColor, string> = {
  [DotColor.Red]: '#ef4444', // red-500
  [DotColor.Blue]: '#3b82f6', // blue-500
  [DotColor.Green]: '#10b981', // emerald-500
  [DotColor.Yellow]: '#fbbf24', // amber-400
  [DotColor.Purple]: '#8b5cf6', // violet-500
};

// Ambient background colors - made very subtle/white for the new theme or unused
export const BG_COLORS: Record<DotColor, string> = {
  [DotColor.Red]: 'bg-red-50',
  [DotColor.Blue]: 'bg-blue-50',
  [DotColor.Green]: 'bg-emerald-50',
  [DotColor.Yellow]: 'bg-amber-50',
  [DotColor.Purple]: 'bg-violet-50',
};
