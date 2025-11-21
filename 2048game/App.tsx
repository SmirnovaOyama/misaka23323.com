import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Direction } from './types';
import { 
  getEmptyGrid, 
  spawnTile, 
  moveGrid, 
  isGameOver, 
  hasWon 
} from './services/gameLogic';
import Board from './components/Board';
import GameControls from './components/GameControls';

const LOCAL_STORAGE_BEST_KEY = 'gemini-2048-best-score';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    grid: getEmptyGrid(),
    score: 0,
    bestScore: 0,
    gameOver: false,
    won: false,
  });

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Initialize Game
  useEffect(() => {
    const savedBest = localStorage.getItem(LOCAL_STORAGE_BEST_KEY);
    const initialBest = savedBest ? parseInt(savedBest, 10) : 0;
    startNewGame(initialBest);
  }, []);

  const startNewGame = (currentBestScore?: number) => {
    let newGrid = getEmptyGrid();
    newGrid = spawnTile(newGrid);
    newGrid = spawnTile(newGrid);
    
    setGameState(prev => ({
      grid: newGrid,
      score: 0,
      bestScore: currentBestScore ?? prev.bestScore,
      gameOver: false,
      won: false,
    }));
  };

  const handleMove = useCallback((direction: Direction) => {
    if (gameState.gameOver) return;

    const { grid, score: moveScore, moved } = moveGrid(gameState.grid, direction);

    if (moved) {
      const gridWithSpawn = spawnTile(grid);
      const newScore = gameState.score + moveScore;
      const newBest = Math.max(newScore, gameState.bestScore);
      
      localStorage.setItem(LOCAL_STORAGE_BEST_KEY, newBest.toString());

      const gameEnded = isGameOver(gridWithSpawn);
      const gameWon = !gameState.won && hasWon(gridWithSpawn);

      setGameState({
        grid: gridWithSpawn,
        score: newScore,
        bestScore: newBest,
        gameOver: gameEnded,
        won: gameWon || gameState.won, // Keep won state true if already won and continuing
      });
    }
  }, [gameState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        handleMove(Direction.UP);
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleMove(Direction.DOWN);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleMove(Direction.LEFT);
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleMove(Direction.RIGHT);
        break;
    }
  }, [handleMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStart.current.x;
    const diffY = touchEndY - touchStart.current.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal
      if (Math.abs(diffX) > 30) {
        handleMove(diffX > 0 ? Direction.RIGHT : Direction.LEFT);
      }
    } else {
      // Vertical
      if (Math.abs(diffY) > 30) {
        handleMove(diffY > 0 ? Direction.DOWN : Direction.UP);
      }
    }
    touchStart.current = null;
  };

  return (
    <div 
      className="min-h-[calc(100vh-60px)] bg-[#faf8ef] flex flex-col items-center justify-center p-4 font-sans select-none text-[#776e65]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <GameControls 
        score={gameState.score} 
        bestScore={gameState.bestScore} 
        onReset={() => startNewGame()} 
      />

      <div className="relative touch-none">
        <Board grid={gameState.grid} />
        
        {/* Game Over Overlay */}
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-[#eee4da]/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-md z-10 animate-appear">
            <h2 className="text-5xl font-bold text-[#776e65] mb-4">Game Over!</h2>
            <button 
              onClick={() => startNewGame()}
              className="bg-[#8f7a66] text-[#f9f6f2] px-6 py-3 rounded-[3px] font-bold text-lg hover:bg-[#806e5c] transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Win Overlay (Dismissible) */}
        {gameState.won && !gameState.gameOver && (
          <div className="absolute inset-0 bg-[#edc22e]/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-md z-10 animate-appear">
            <h2 className="text-5xl font-bold text-[#f9f6f2] mb-4">You Win!</h2>
            <p className="text-[#f9f6f2] mb-6 font-medium text-lg">You reached 2048!</p>
            <div className="flex gap-4">
               <button 
                onClick={() => setGameState(prev => ({ ...prev, won: false }))} // Continue playing
                className="bg-transparent border-2 border-[#f9f6f2] text-[#f9f6f2] px-6 py-2 rounded-[3px] font-bold hover:bg-white/20 transition-colors"
              >
                Keep Playing
              </button>
              <button 
                onClick={() => startNewGame()}
                className="bg-[#f9f6f2] text-[#776e65] px-6 py-2 rounded-[3px] font-bold hover:scale-105 transition-transform shadow-md"
              >
                New Game
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-12 text-[#776e65] text-sm flex flex-col items-center gap-2 font-medium">
         <p>Use <span className="font-bold">arrow keys</span> or <span className="font-bold">swipe</span> to move tiles.</p>
      </div>
    </div>
  );
}