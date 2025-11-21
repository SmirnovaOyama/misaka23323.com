export const GRID_SIZE = 4;
export const WINNING_SCORE = 2048;

export const TILE_COLORS: Record<number, string> = {
  2: 'bg-[#eee4da] text-[#776e65]',
  4: 'bg-[#ede0c8] text-[#776e65]',
  8: 'bg-[#f2b179] text-[#f9f6f2]',
  16: 'bg-[#f59563] text-[#f9f6f2]',
  32: 'bg-[#f67c5f] text-[#f9f6f2]',
  64: 'bg-[#f65e3b] text-[#f9f6f2]',
  128: 'bg-[#edcf72] text-[#f9f6f2] shadow-[0_0_10px_rgba(237,207,114,0.6)]',
  256: 'bg-[#edcc61] text-[#f9f6f2] shadow-[0_0_15px_rgba(237,207,114,0.7)]',
  512: 'bg-[#edc850] text-[#f9f6f2] shadow-[0_0_20px_rgba(237,207,114,0.8)]',
  1024: 'bg-[#edc53f] text-[#f9f6f2] shadow-[0_0_25px_rgba(237,207,114,0.9)]',
  2048: 'bg-[#edc22e] text-[#f9f6f2] shadow-[0_0_30px_rgba(237,207,114,1)]',
};

export const DEFAULT_TILE_COLOR = 'bg-[#3c3a32] text-[#f9f6f2]';