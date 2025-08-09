'use client';

import React from 'react';
import { DEFAULT_GRID_CONFIG } from '../utils/snappingUtils';

interface GridBackgroundProps {
  width: number;
  height: number;
  showGrid: boolean;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ 
  width, 
  height, 
  showGrid 
}) => {
  if (!showGrid || !DEFAULT_GRID_CONFIG.visible) {
    return null;
  }

  const gridSize = DEFAULT_GRID_CONFIG.size;
  const dots = [];
  
  // Generate grid dots
  for (let x = 0; x <= width; x += gridSize) {
    for (let y = 0; y <= height; y += gridSize) {
      dots.push(
        <div
          key={`dot-${x}-${y}`}
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: '1px',
            height: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '50%',
          }}
        />
      );
    }
  }

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: `${width}px`, 
        height: `${height}px`, 
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {dots}
    </div>
  );
};

export default GridBackground;