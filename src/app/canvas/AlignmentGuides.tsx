'use client';

import React from 'react';
import { AlignmentGuide } from '../utils/snappingUtils';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  canvasWidth: number;
  canvasHeight: number;
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ guides, canvasWidth, canvasHeight }) => {
  console.log('guides', guides);
  return (
    <>
      {guides.map((guide, index) => {
        if (guide.type === 'vertical') {
          return (
            <div
              key={`vertical-${index}`}
              style={{
                position: 'absolute',
                left: `${guide.position}px`,
                top: '0px',
                width: '1px',
                height: `${canvasHeight}px`,
                backgroundColor: '#1890ff',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            />
          );
        } else {
          return (
            <div
              key={`horizontal-${index}`}
              style={{
                position: 'absolute',
                left: '0px',
                top: `${guide.position}px`,
                width: `${canvasWidth}px`,
                height: '1px',
                backgroundColor: '#1890ff',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            />
          );
        }
      })}
    </>
  );
};

export default AlignmentGuides;
