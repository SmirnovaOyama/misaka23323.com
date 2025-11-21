import React from 'react';
import { RotateCcw } from 'lucide-react';

interface GameControlsProps {
  score: number;
  bestScore: number;
  onReset: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  score, 
  bestScore, 
  onReset, 
}) => {
  return (
    <div className="w-full max-w-[280px] sm:max-w-[400px] flex flex-col gap-4 mb-4 sm:mb-8">
      {/* Header & Scores */}
      <div className="flex justify-between items-start">
        <h1 className="text-4xl sm:text-6xl font-bold text-[#776e65] m-0 leading-none">2048</h1>
        <div className="flex gap-2">
          <div className="bg-[#bbada0] p-2 rounded-md min-w-[60px] sm:min-w-[70px] text-center flex flex-col justify-center">
            <div className="text-[10px] sm:text-[11px] text-[#eee4da] uppercase font-bold leading-tight">Score</div>
            <div className="text-lg sm:text-xl font-bold text-white leading-tight">{score}</div>
          </div>
          <div className="bg-[#bbada0] p-2 rounded-md min-w-[60px] sm:min-w-[70px] text-center flex flex-col justify-center">
            <div className="text-[10px] sm:text-[11px] text-[#eee4da] uppercase font-bold leading-tight">Best</div>
            <div className="text-lg sm:text-xl font-bold text-white leading-tight">{bestScore}</div>
          </div>
        </div>
      </div>

      {/* Description & Buttons */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-[#776e65] text-sm sm:text-base font-medium leading-tight">
          Join the numbers and get to the <strong className="text-[#776e65] border-b-2 border-[#776e65]">2048 tile!</strong>
        </p>
        <button
          onClick={onReset}
          className="bg-[#8f7a66] hover:bg-[#806e5c] text-[#f9f6f2] font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-[3px] flex items-center justify-center transition-colors text-base sm:text-lg whitespace-nowrap shadow-sm"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameControls;