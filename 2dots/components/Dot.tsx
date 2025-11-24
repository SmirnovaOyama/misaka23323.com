
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { DotItem } from '../types';
import { COLOR_PALETTE } from '../constants';

interface DotProps {
  dot: DotItem;
  isSelected: boolean;
  isSquareActive: boolean;
  isDimmed: boolean;
  gridSize: number;
}

const Dot: React.FC<DotProps> = ({ dot, isSelected, isSquareActive, isDimmed, gridSize }) => {
  const colorClass = COLOR_PALETTE[dot.color];
  const controls = useAnimation();
  const shadowControls = useAnimation();
  
  // Track previous row to detect falling
  const prevRowRef = useRef<number | null>(null);
  // Track if the initial entrance animation has occurred
  const hasEnteredRef = useRef(false);
  
  const cellPct = 100 / gridSize;
  
  useEffect(() => {
    const runAnimation = async () => {
      const currentRow = dot.row;
      const prevRow = prevRowRef.current;
      
      // Determine animation triggers
      const isFirstEntry = dot.isNew && !hasEnteredRef.current;
      const isFalling = prevRow !== null && currentRow > prevRow;

      // Calculate delay: 40ms progressive delay from top.
      const delay = currentRow * 0.04; 

      if (isFirstEntry || isFalling) {
        hasEnteredRef.current = true; // Mark as processed

        // Set initial state for new dots spawning from top
        if (isFirstEntry) {
            await controls.set({ 
                x: `${dot.col * 100}%`, 
                y: `-100%`, 
                scaleX: 1, scaleY: 1,
                opacity: 0
            });
            await shadowControls.set({ opacity: 0, scale: 0.5 });
        }

        // 1. FALL (Gravity Acceleration)
        const targetY = `${currentRow * 100}%`;
        
        // Parallel Shadow Animation
        shadowControls.start({
            opacity: 1,
            scale: 1,
            transition: { duration: 0.26, ease: "easeIn", delay }
        });

        await controls.start({
            y: targetY,
            opacity: 1,
            transition: { 
                duration: 0.26, 
                ease: [0.55, 0.085, 0.68, 0.53], // Cubic-in approx for gravity
                delay 
            }
        });

        // 2. SQUASH (Impact)
        await controls.start({
            scaleX: 1.08,
            scaleY: 0.92,
            y: `calc(${targetY} + 2%)`, 
            transition: { duration: 0.05, ease: "easeOut" }
        });

        // 3. REBOUND (Damped)
        await controls.start({
            scaleX: 1,
            scaleY: 1,
            y: [
                `calc(${targetY} + 2%)`, 
                `calc(${targetY} - 4px)`, 
                targetY
            ],
            transition: { 
                duration: 0.12, 
                ease: "circOut",
                times: [0, 0.6, 1]
            }
        });
        
      } else {
        // Standard State Update (Horizontal move, stationary, or state change like dimming)
        controls.start({
             x: `${dot.col * 100}%`,
             y: `${dot.row * 100}%`,
             scaleX: 1, scaleY: 1,
             opacity: isDimmed ? 0.3 : 1,
             transition: { duration: 0.2 } 
        });
        
        // Ensure shadow is consistent
        shadowControls.start({ opacity: 1, scale: 1 });
      }

      prevRowRef.current = currentRow;
    };

    runAnimation();
  }, [dot.row, dot.col, dot.isNew, controls, shadowControls, isDimmed, gridSize]);

  return (
    <motion.div
      className="absolute top-0 left-0 flex items-center justify-center"
      style={{ 
        width: `${cellPct}%`, 
        height: `${cellPct}%`,
        zIndex: isSelected ? 20 : 10,
        transformOrigin: '50% 80%' // Anchor near bottom
      }}
      animate={controls}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
    >
       {/* Shadow Element */}
       <motion.div 
         animate={shadowControls}
         className="absolute w-[50%] h-[10%] rounded-[100%] bg-slate-900/20 blur-[2px]"
         style={{ 
             bottom: '15%', 
             zIndex: -1 
         }} 
       />

      {/* The visible Dot circle */}
      <motion.div
        className={`rounded-full ${colorClass} relative`}
        style={{
          width: '60%',
          height: '60%',
          boxShadow: isSelected 
            ? '0 0 0 4px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
            : 'inset 0 -2px 4px rgba(0,0,0,0.1)',
        }}
        animate={{
            scale: isSelected ? 1.15 : isDimmed ? 0.85 : 1,
            ...(isSquareActive ? {
                scale: [1.15, 1.25, 1.15],
                transition: { repeat: Infinity, duration: 1.0 }
            } : {})
        }}
        transition={{ duration: 0.2 }}
      >
        {/* High contrast selection ring */}
        {isSelected && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="absolute inset-0 rounded-full border-[3px] border-white/90"
           />
        )}
      </motion.div>
    </motion.div>
  );
};

export default React.memo(Dot);
