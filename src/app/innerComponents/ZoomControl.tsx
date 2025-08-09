'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from './uiComponents/Slider';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { editorStyles } from '../styles/editorStyles';

interface ZoomControlProps {
  zoomRatio: number;
  onZoomChange: (direction: 'zoomIn' | 'zoomOut' | 'reset') => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
}

const ZoomControl: React.FC<ZoomControlProps> = ({
  zoomRatio,
  onZoomChange,
  minZoom = 0.1,
  maxZoom = 3,
  step = 0.1,
}) => {
  const [localZoomRatio, setLocalZoomRatio] = useState(zoomRatio);

  // 当外部zoomRatio变化时，更新内部状态
  useEffect(() => {
    setLocalZoomRatio(zoomRatio);
  }, [zoomRatio]);

  const handleZoomChange = (value: number[]) => {
    const newRatio = value[0];
    setLocalZoomRatio(newRatio);
    // Calculate direction based on change
    if (newRatio > localZoomRatio) {
      onZoomChange('zoomIn');
    } else if (newRatio < localZoomRatio) {
      onZoomChange('zoomOut');
    }
  };

  const handleZoomOut = () => {
    const newRatio = Math.max(minZoom, localZoomRatio - step);
    setLocalZoomRatio(newRatio);
    onZoomChange('zoomOut');
  };

  const handleZoomIn = () => {
    const newRatio = Math.min(maxZoom, localZoomRatio + step);
    setLocalZoomRatio(newRatio);
    onZoomChange('zoomIn');
  };

  const handleResetZoom = () => {
    // Instead of setting locally, tell parent to reset
    // Parent will update zoomRatio which will update local state via useEffect
    onZoomChange('reset');
  };

  return (
    <div className={`${editorStyles.zoomControl.container} fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-md w-96`}>
      <button
        className={`${editorStyles.form.button} bg-gray-100 hover:bg-gray-200 p-2`}
        onClick={handleZoomOut}
        disabled={localZoomRatio <= minZoom}
        aria-label="缩小"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      
      <div className="flex-1 flex items-center gap-3">
        <Slider
          className={`${editorStyles.zoomControl.slider} relative flex items-center select-none touch-none w-full h-5`}
          value={[localZoomRatio]}
          min={minZoom}
          max={maxZoom}
          step={step}
          onValueChange={handleZoomChange}
          aria-label="画布缩放"
        />
        
        <div 
          className={`${editorStyles.zoomControl.ratioDisplay} w-16 text-center text-sm font-medium cursor-pointer hover:bg-gray-100 rounded px-2 py-1`}
          onClick={handleResetZoom}
        >
          {Math.round(localZoomRatio * 100)}%
        </div>
      </div>
      
      <button
        className={`${editorStyles.form.button} bg-gray-100 hover:bg-gray-200 p-2`}
        onClick={handleZoomIn}
        disabled={localZoomRatio >= maxZoom}
        aria-label="放大"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControl;