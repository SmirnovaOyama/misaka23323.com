import React from 'react';
import { Coordinate, DotColor } from '../types';
import { LINE_COLORS } from '../constants';

interface ConnectorOverlayProps {
  path: Coordinate[];
  color: DotColor | null;
  isSquare: boolean;
  rows: number;
  cols: number;
}

// Helper to get center percentage of a cell
// With gap=0 in the grid, the logic is simple: (index + 0.5) / total
const getCenter = (idx: number, total: number) => {
  return ((idx + 0.5) / total) * 100;
};

export const ConnectorOverlay: React.FC<ConnectorOverlayProps> = ({ path, color, isSquare, rows, cols }) => {
  if (path.length < 2 || !color) return null;

  const strokeColor = LINE_COLORS[color];
  
  // Generate points string for polyline
  // Using percentages directly in SVG points (0-100 range) requires viewBox="0 0 100 100"
  
  const points = path.map(p => {
    const x = getCenter(p.col, cols);
    const y = getCenter(p.row, rows);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
    >
      {/* Main Path */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3" // Thinner line for cleaner look on 100x100 scale (relative to ~6-8% cell size)
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />
      
      {/* Square Effect */}
      {isSquare && (
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse opacity-40"
        />
      )}
    </svg>
  );
};