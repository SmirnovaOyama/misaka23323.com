
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import Dot from './components/Dot';
import { DotItem, DotColor, Point } from './types';
import { COLORS, MAX_MOVES, STROKE_COLOR, DEFAULT_GRID_SIZE, GRID_OPTIONS } from './constants';
import { playSelect, playPop, playSquare, initAudio } from './utils/audio';

// --- Helper Functions ---

const getRandomColor = (): DotColor => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

const createInitialGrid = (size: number): DotItem[][] => {
  const grid: DotItem[][] = [];
  for (let r = 0; r < size; r++) {
    const row: DotItem[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        id: uuidv4(),
        color: getRandomColor(),
        row: r,
        col: c,
        isNew: true, // Trigger initial falling animation
      });
    }
    grid.push(row);
  }
  return grid;
};

// --- Main Component ---

export default function App() {
  // Game State
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [grid, setGrid] = useState<DotItem[][]>(createInitialGrid(DEFAULT_GRID_SIZE));
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(MAX_MOVES);
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  
  // Best Score State (with localStorage persistence)
  const [bestScore, setBestScore] = useState(() => {
      if (typeof window !== 'undefined') {
          try {
            return parseInt(localStorage.getItem('twoDotsBestScore') || '0', 10);
          } catch (e) {
            return 0;
          }
      }
      return 0;
  });
  
  // Interaction State
  const [selection, setSelection] = useState<Point[]>([]);
  const [isSquare, setIsSquare] = useState(false);
  const [selectionColor, setSelectionColor] = useState<DotColor | null>(null);

  // Refs
  const gridRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const selectionRef = useRef(selection);
  const selectionColorRef = useRef(selectionColor);
  const gridStateRef = useRef(grid);
  const gridSizeRef = useRef(gridSize);
  
  // Sync refs
  useEffect(() => { selectionRef.current = selection; }, [selection]);
  useEffect(() => { selectionColorRef.current = selectionColor; }, [selectionColor]);
  useEffect(() => { gridStateRef.current = grid; }, [grid]);
  useEffect(() => { gridSizeRef.current = gridSize; }, [gridSize]);

  // Update Best Score
  useEffect(() => {
      if (score > bestScore) {
          setBestScore(score);
          localStorage.setItem('twoDotsBestScore', score.toString());
      }
  }, [score, bestScore]);

  // --- Initialization & Audio Unlock ---
  useEffect(() => {
    const unlockAudio = () => {
        initAudio();
    };
    
    // Listen to multiple event types to ensure we catch the first user gesture
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    
    return () => {
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // --- Logic ---

  const restartGame = useCallback((newSize?: number) => {
    const size = newSize || gridSize;
    if (newSize) setGridSize(newSize);
    setGrid(createInitialGrid(size)); // Will create grid with isNew: true
    setScore(0);
    setMoves(MAX_MOVES);
    setGameState('playing');
    setSelection([]);
    setIsSquare(false);
    setSelectionColor(null);
  }, [gridSize]);

  const isAdjacent = (p1: Point, p2: Point) => {
    return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col) === 1;
  };

  const checkHasSquare = (points: Point[]): boolean => {
    const set = new Set(points.map(p => `${p.row},${p.col}`));
    return set.size < points.length;
  };

  const handleMove = useCallback((r: number, c: number) => {
    if (!isDragging.current || gameState !== 'playing') return;

    const currentGrid = gridStateRef.current;
    const currentSelection = selectionRef.current;
    const currentColor = selectionColorRef.current;
    const size = gridSizeRef.current;

    if (!currentColor) return;
    
    if (r < 0 || r >= size || c < 0 || c >= size) return;

    const currentDot = currentGrid[r][c];
    if (currentDot.color !== currentColor) return;

    const lastPoint = currentSelection[currentSelection.length - 1];
    if (lastPoint.row === r && lastPoint.col === c) return;

    if (!isAdjacent(lastPoint, { row: r, col: c })) return;

    // Backtracking
    if (currentSelection.length > 1) {
      const prevPoint = currentSelection[currentSelection.length - 2];
      if (prevPoint.row === r && prevPoint.col === c) {
        const newSelection = currentSelection.slice(0, -1);
        setSelection(newSelection);
        setIsSquare(checkHasSquare(newSelection));
        playSelect(newSelection.length - 1); 
        return;
      }
    }

    // Add new point
    const existingIndex = currentSelection.findIndex(p => p.row === r && p.col === c);
    if (existingIndex >= 0) {
      // Square formed
      const newSelection = [...currentSelection, { row: r, col: c }];
      setSelection(newSelection);
      if (!isSquare) {
          setIsSquare(true);
          playSquare();
      }
    } else {
      const newSelection = [...currentSelection, { row: r, col: c }];
      setSelection(newSelection);
      playSelect(newSelection.length - 1);
    }
  }, [gameState, isSquare]);

  const handleStart = (r: number, c: number, e?: React.PointerEvent) => {
    // Explicitly init audio on game interaction to be safe
    initAudio();
    
    if (gameState !== 'playing' || moves <= 0) return;
    if (e) e.preventDefault();

    const dot = gridStateRef.current[r][c];
    if (!dot) return;

    isDragging.current = true;
    setSelection([{ row: r, col: c }]);
    setSelectionColor(dot.color);
    setIsSquare(false);
    playSelect(0);
  };

  const handleEnd = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const currentSelection = selectionRef.current;
    
    if (currentSelection.length < 2) {
      setSelection([]);
      setSelectionColor(null);
      setIsSquare(false);
      return;
    }

    await processMatch();
  };

  const processMatch = async () => {
    const currentGrid = gridStateRef.current;
    const currentSelection = selectionRef.current;
    const currentIsSquare = isSquare; 
    const currentColor = selectionColorRef.current;
    const size = gridSizeRef.current;

    let dotsToRemove = new Set<string>();
    
    if (currentIsSquare && currentColor) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (currentGrid[r][c].color === currentColor) {
            dotsToRemove.add(`${r},${c}`);
          }
        }
      }
      setScore(s => s + dotsToRemove.size * 2); 
      playPop(dotsToRemove.size); // Sound
    } else {
      for (const p of currentSelection) {
        dotsToRemove.add(`${p.row},${p.col}`);
      }
      setScore(s => s + dotsToRemove.size);
      playPop(dotsToRemove.size); // Sound
    }

    setMoves(m => m - 1);
    
    // Gravity Logic
    const cols: DotItem[][] = Array.from({ length: size }, () => []);

    for (let c = 0; c < size; c++) {
      for (let r = 0; r < size; r++) {
        if (!dotsToRemove.has(`${r},${c}`)) {
          // EXISTING dots falling: MUST set isNew to false to avoid resetting to top
          cols[c].push({ ...currentGrid[r][c], isNew: false });
        }
      }
    }

    for (let c = 0; c < size; c++) {
      const missingCount = size - cols[c].length;
      for (let i = 0; i < missingCount; i++) {
        // NEW dots spawning: Set isNew to true
        cols[c].unshift({
          id: uuidv4(),
          color: getRandomColor(),
          row: -1,
          col: c,
          isNew: true
        });
      }
    }

    const finalGrid: DotItem[][] = [];
    for (let r = 0; r < size; r++) {
      const row: DotItem[] = [];
      for (let c = 0; c < size; c++) {
        const dot = cols[c][r];
        row.push({ ...dot, row: r, col: c });
      }
      finalGrid.push(row);
    }

    setSelection([]);
    setIsSquare(false);
    setSelectionColor(null);
    setGrid(finalGrid);

    if (moves <= 1) {
      setGameState('gameover');
    }
  };

  // Pointer Events
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const size = gridSizeRef.current;
      const cellWidth = rect.width / size;
      const cellHeight = rect.height / size;
      
      const c = Math.floor(x / cellWidth);
      const r = Math.floor(y / cellHeight);

      handleMove(r, c);
    };

    const onPointerUp = () => handleEnd();

    el.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [handleMove]);

  const getConnectorPath = () => {
    if (selection.length < 2) return "";
    const size = gridSize;
    const cellPct = 100 / size;
    const getX = (c: number) => c * cellPct + cellPct / 2;
    const getY = (r: number) => r * cellPct + cellPct / 2;

    return selection.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${getX(p.col)},${getY(p.row)}`
    ).join(" ");
  };

  const flatDots = grid.flat();

  return (
    <div className="flex flex-col items-center justify-start pt-2 md:pt-4 -mt-4 md:-mt-8 h-[100dvh] bg-slate-50 relative selection:bg-none overflow-hidden touch-none select-none">
      
      {/* Header Area */}
      <div className="w-full max-w-md px-6 pb-6 pt-2 flex flex-col gap-4 z-20 shrink-0">
         
         {/* Top Bar: Title & Reset */}
         <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Two Dots</h1>
            <button 
                onClick={() => restartGame()}
                className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-full shadow-sm border border-slate-200 transition-all active:scale-90"
                aria-label="Restart Game"
            >
                <RefreshCw className="w-6 h-6" />
            </button>
         </div>

         {/* Stats Card */}
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-3 divide-x divide-slate-100">
             <div className="flex flex-col items-center">
                 <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Moves</span>
                 <span className="text-2xl font-black text-slate-800 leading-none">{moves}</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Score</span>
                 <span className="text-2xl font-black text-slate-800 leading-none">{score}</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider text-amber-500">Best</span>
                 <span className="text-2xl font-black text-slate-800 leading-none">{bestScore}</span>
             </div>
         </div>

         {/* Grid Controls */}
         <div className="grid grid-cols-3 gap-3">
            {GRID_OPTIONS.map(size => (
                <button
                    key={size}
                    onClick={() => restartGame(size)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border shadow-sm ${
                        gridSize === size 
                        ? 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-200 ring-offset-2' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    {size}x{size}
                </button>
            ))}
         </div>
      </div>

      {/* Game Board */}
      <div 
        ref={gridRef}
        className="relative bg-white rounded-xl touch-none select-none shadow-sm shrink-0"
        style={{
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
        }}
      >
        <svg 
            className="absolute inset-0 pointer-events-none z-30 w-full h-full rounded-xl overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <AnimatePresence>
            {selection.length > 1 && selectionColor && (
                <motion.path
                    key="connector"
                    d={getConnectorPath()}
                    fill="none"
                    stroke={STROKE_COLOR[selectionColor]}
                    strokeWidth={20 / gridSize} // Dynamic stroke width based on grid density
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                />
            )}
            </AnimatePresence>
        </svg>

        <div className="w-full h-full relative">
            <AnimatePresence initial={false}>
                {flatDots.map((dot) => {
                    const isSelected = selection.some(p => p.row === dot.row && p.col === dot.col);
                    const isSquareActive = isSquare && dot.color === selectionColor;
                    const isDimmed = isSquare && dot.color !== selectionColor;
                    
                    return (
                        <React.Fragment key={dot.id}>
                             <div
                                className="absolute"
                                style={{
                                    width: `${100/gridSize}%`,
                                    height: `${100/gridSize}%`,
                                    left: `${dot.col * (100/gridSize)}%`,
                                    top: `${dot.row * (100/gridSize)}%`,
                                    zIndex: 50,
                                    cursor: 'pointer'
                                }}
                                onPointerDown={(e) => handleStart(dot.row, dot.col, e)}
                             />
                             <Dot 
                                dot={dot}
                                isSelected={isSelected}
                                isSquareActive={isSquareActive}
                                isDimmed={isDimmed}
                                gridSize={gridSize}
                             />
                        </React.Fragment>
                    );
                })}
            </AnimatePresence>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-xs w-full mx-4"
            >
               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                 <Trophy className="w-10 h-10 text-blue-500" />
               </div>
               
               <h2 className="text-2xl font-black text-slate-800 mb-2">Finished!</h2>
               <p className="text-slate-500 mb-2 font-medium">You scored <span className="text-slate-800 font-bold">{score}</span> points</p>
               {score >= bestScore && score > 0 && (
                  <p className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-6">New Best Score!</p>
               )}
               {score < bestScore && (
                   <p className="text-slate-400 text-sm font-medium mb-6">Best: {bestScore}</p>
               )}
               
               <button 
                 onClick={() => restartGame()}
                 className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all"
               >
                 <RefreshCw className="w-5 h-5" />
                 Play Again
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
