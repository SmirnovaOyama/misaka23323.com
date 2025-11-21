import React, { useEffect, useState } from 'react';
import { TILE_COLORS, DEFAULT_TILE_COLOR } from '../constants';

interface TileProps {
  value: number;
}

const Tile: React.FC<TileProps> = ({ value }) => {
  const [scaleClass, setScaleClass] = useState('scale-0');

  useEffect(() => {
    // Trigger appear animation
    requestAnimationFrame(() => {
      setScaleClass('scale-100');
    });
  }, []);

  // Trigger pop animation on value change (merge)
  useEffect(() => {
    setScaleClass('scale-110');
    const timer = setTimeout(() => setScaleClass('scale-100'), 150);
    return () => clearTimeout(timer);
  }, [value]);

  const colorClass = TILE_COLORS[value] || DEFAULT_TILE_COLOR;
  // Adjust font size logic if needed, but these tailwind classes work well
  const fontSize = value > 1000 ? 'text-2xl' : value > 100 ? 'text-3xl' : 'text-4xl';

  return (
    <div
      className={`
        w-full h-full rounded-[3px] sm:rounded-md flex items-center justify-center font-bold 
        transition-transform duration-200 ease-in-out shadow-sm
        ${colorClass} ${fontSize} ${scaleClass}
      `}
    >
      {value}
    </div>
  );
};

export default Tile;