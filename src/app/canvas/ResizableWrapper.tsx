'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ComponentConfig } from '../common/types';
import './ResizableWrapper.css';
import ErrorBoundary from './ErrorBoundary';
import { eventBus } from '../utils/eventBus';

// 组件最小尺寸常量
const MIN_DIMENSIONS = {
  width: 50,
  height: 50,
} as const;

interface ResizableWrapperProps {
  children: React.ReactNode | React.ReactNode[];
  componentConfig: ComponentConfig;
  isSelected?: boolean;
  onSelect?: () => void;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onResizeComplete?: (width: number, height: number) => void;
}

/**
 * 可调整大小的包装器组件
 * 提供拖拽、调整大小等功能
 */
const ResizableWrapper: React.FC<ResizableWrapperProps> = ({
  children,
  componentConfig,
  isSelected,
  onSelect,
  onResize,
  onMove,
  onResizeComplete,
}) => {
  // 组件位置状态
  const [position, setPosition] = useState({
    x: parseInt(componentConfig.styleProps?.left as string) || 0,
    y: parseInt(componentConfig.styleProps?.top as string) || 0,
  });

  // 组件尺寸状态
  const [size, setSize] = useState({
    width: parseInt(componentConfig.styleProps?.width as string) || MIN_DIMENSIONS.width,
    height: parseInt(componentConfig.styleProps?.height as string) || MIN_DIMENSIONS.height,
  });

  // 交互状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * 处理鼠标按下事件，开始拖拽
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position]
  );

  /**
   * 处理调整大小开始事件
   */
  const handleResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(direction);
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartSize({ width: size.width, height: size.height });
    },
    [size]
  );

  /**
   * 更新组件样式
   */
  const updateComponentStyle = useCallback((styles: Record<string, string>) => {
    eventBus.emit('updateComponentStyle', componentConfig.id, styles);
  }, [componentConfig.id]);

  /**
   * 处理鼠标移动事件
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;
        setPosition({ x: newX, y: newY });
        onMove?.(newX, newY);
      } else if (isResizing) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        let newWidth = startSize.width;
        let newHeight = startSize.height;

        // 处理水平方向的调整
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(MIN_DIMENSIONS.width, startSize.width + dx);
        } else if (resizeDirection.includes('w')) {
          newWidth = Math.max(MIN_DIMENSIONS.width, startSize.width - dx);
        }

        // 处理垂直方向的调整
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(MIN_DIMENSIONS.height, startSize.height + dy);
        } else if (resizeDirection.includes('n')) {
          newHeight = Math.max(MIN_DIMENSIONS.height, startSize.height - dy);
        }

        setSize({ width: newWidth, height: newHeight });
        onResize?.(newWidth, newHeight);
      }
    },
    [isDragging, isResizing, startPos, startSize, resizeDirection, onMove, onResize]
  );

  /**
   * 处理鼠标释放事件
   */
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      onResizeComplete?.(size.width, size.height);
      updateComponentStyle({
        width: `${size.width}px`,
        height: `${size.height}px`,
      });
    } else if (isDragging) {
      updateComponentStyle({
        left: `${position.x}px`,
        top: `${position.y}px`,
      });
    }
    setIsDragging(false);
    setIsResizing(false);
  }, [isResizing, isDragging, size, position, onResizeComplete, updateComponentStyle]);

  // 添加和移除事件监听器
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <ErrorBoundary>
      <div
        ref={wrapperRef}
        id={`wrapper-${componentConfig.id}`}
        className={`resizable-wrapper ${isDragging ? 'dragging' : ''} ${
          isResizing ? 'resizing' : ''
        } ${isSelected ? 'selected' : ''}`}
        style={{
          ...componentConfig.styleProps,
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          position: 'relative',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        {isSelected && (
          <>
            <div
              className="drag-handle"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'move',
                pointerEvents: 'all',
              }}
              onMouseDown={handleMouseDown}
            />
            <div className="resize-handles">
              {['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].map((direction) => (
                <div
                  key={direction}
                  className={`resize-handle ${direction}`}
                  onMouseDown={(e) => handleResizeStart(e, direction)}
                />
              ))}
            </div>
          </>
        )}
        {children}
      </div>
    </ErrorBoundary>
  );
};

export default ResizableWrapper;
