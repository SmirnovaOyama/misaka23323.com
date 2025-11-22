import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface GameOverModalProps {
  score: number;
  isOpen: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ score, isOpen, onRestart }) => {
  if (!isOpen) return null;

  const highScore = parseInt(localStorage.getItem('dotConnectHighScore') || '0');
  const isNewBest = score >= highScore && score > 0;

  const handleRestart = () => {
    playClickSound();
    onRestart();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl max-w-xs w-full text-center transform transition-all scale-100">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-yellow-500" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mb-1">Out of Moves!</h2>
        {isNewBest && <p className="text-yellow-500 font-bold text-sm mb-4 animate-bounce">New High Score!</p>}
        
        <p className="text-slate-500 mb-6 text-sm">
          You scored <span className="text-slate-900 font-bold">{score}</span>
          <br/>
          Best: <span className="text-slate-900 font-bold">{Math.max(score, highScore)}</span>
        </p>
        
        <button 
            onClick={handleRestart}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
            <RotateCcw size={20} />
            Play Again
        </button>
      </div>
    </div>
  );
};
