import React from 'react';
import { Trophy, Move, RotateCcw, Crown } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  moves: number;
  onReset: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore, moves, onReset }) => {
  const handleReset = () => {
    playClickSound();
    onReset();
  };

  return (
    <div className="w-full max-w-lg px-4 py-3 bg-white rounded-2xl shadow-lg mb-2 flex items-center justify-between border border-slate-100 transition-all duration-300">
      
      {/* Score (Current) */}
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
           Score
        </div>
        <div key={score} className="text-2xl font-black text-slate-800 animate-bump">
            {score}
        </div>
      </div>

      <div className="h-8 w-px bg-slate-200 mx-2"></div>

      {/* Best (High Score) */}
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="flex items-center gap-1 text-yellow-500 text-[10px] font-bold uppercase tracking-wider mb-1">
           <Crown size={12} /> Best
        </div>
        <div key={`best-${highScore}`} className="text-2xl font-black text-slate-800">
            {highScore}
        </div>
      </div>

      <div className="h-8 w-px bg-slate-200 mx-2"></div>

      {/* Moves */}
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
          <Move size={12} /> Moves
        </div>
        <div 
            key={moves}
            className={`text-2xl font-black animate-bump ${moves <= 5 ? 'text-red-500' : 'text-slate-800'}`}
        >
          {moves}
        </div>
      </div>
      
      <div className="h-8 w-px bg-slate-200 mx-2"></div>

      <button 
        onClick={handleReset}
        className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all duration-200 active:scale-90 ease-elastic"
        aria-label="Restart Game"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
};
