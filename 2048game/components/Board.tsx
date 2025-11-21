import React from 'react';
import { Grid } from '../types';
import Tile from './Tile';

interface BoardProps {
  grid: Grid;
}

const Board: React.FC<BoardProps> = ({ grid }) => {
  return (
    <div className="relative bg-[#bbada0] p-3 sm:p-4 rounded-md shadow-lg">
      <div className="grid grid-cols-4 grid-rows-4 gap-3 sm:gap-4 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px]">
        {grid.map((row, rIndex) =>
          row.map((cellValue, cIndex) => (
            <div
              key={`${rIndex}-${cIndex}`}
              className="w-full h-full bg-[#cdc1b4] rounded-[3px] sm:rounded-md flex items-center justify-center relative"
            >
              {cellValue !== 0 && (
                <Tile key={`${rIndex}-${cIndex}-${cellValue}`} value={cellValue} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;