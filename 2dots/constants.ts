
import { DotColor } from './types';

export const DEFAULT_GRID_SIZE = 6;
export const MAX_MOVES = 30;

// Available grid options for the UI
export const GRID_OPTIONS = [6, 8, 10];

// Flat, authentic colors (similar to popular dot games)
export const COLOR_PALETTE: Record<DotColor, string> = {
  [DotColor.Red]: 'bg-[#E74C3C]',
  [DotColor.Blue]: 'bg-[#3498DB]',
  [DotColor.Green]: 'bg-[#2ECC71]',
  [DotColor.Yellow]: 'bg-[#F1C40F]',
  [DotColor.Purple]: 'bg-[#9B59B6]',
};

// Matching stroke colors for lines
export const STROKE_COLOR: Record<DotColor, string> = {
    [DotColor.Red]: '#E74C3C',
    [DotColor.Blue]: '#3498DB',
    [DotColor.Green]: '#2ECC71',
    [DotColor.Yellow]: '#F1C40F',
    [DotColor.Purple]: '#9B59B6',
};

export const COLOR_BORDER: Record<DotColor, string> = {
    [DotColor.Red]: 'border-[#E74C3C]',
    [DotColor.Blue]: 'border-[#3498DB]',
    [DotColor.Green]: 'border-[#2ECC71]',
    [DotColor.Yellow]: 'border-[#F1C40F]',
    [DotColor.Purple]: 'border-[#9B59B6]',
};

export const COLORS = [
  DotColor.Red,
  DotColor.Blue,
  DotColor.Green,
  DotColor.Yellow,
  DotColor.Purple,
];
