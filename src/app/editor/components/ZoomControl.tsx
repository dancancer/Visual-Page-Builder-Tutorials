'use client';

import React from 'react';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { editorStyles } from '../../styles/editorStyles';
import useEditorStore from '../../store/editorStore';

interface ZoomControlProps {
  minZoom?: number;
  maxZoom?: number;
  step?: number;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ minZoom = 0.1, maxZoom = 3, step = 0.1 }) => {
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);

  const handleZoomOut = () => {
    const newRatio = Math.max(minZoom, zoom - step);
    setZoom(newRatio);
  };

  const handleZoomIn = () => {
    const newRatio = Math.min(maxZoom, zoom + step);
    setZoom(newRatio);
  };

  return (
    <div
      className={`${editorStyles.zoomControl.container} fixed w-[50px] bottom-2 right-[25%] z-50 flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-md flex-col`}
    >
      <button
        className={`${editorStyles.form.button} bg-gray-100 hover:bg-gray-200 p-2`}
        onClick={handleZoomOut}
        disabled={zoom <= minZoom}
        aria-label="缩小"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <span>{(zoom * 100).toFixed()}</span>
      <button
        className={`${editorStyles.form.button} bg-gray-100 hover:bg-gray-200 p-2`}
        onClick={handleZoomIn}
        disabled={zoom >= maxZoom}
        aria-label="放大"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControl;
