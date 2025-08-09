'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ComponentConfig } from '../common/types';
import './ResizableWrapper.css';
import ErrorBoundary from './ErrorBoundary';
import { eventBus } from '../utils/eventBus';
import { sendMessageToParent } from '../utils/messageBus';
import {
  calculateGridSnap,
  shouldSnapToGrid,
  calculateComponentBounds,
  calculateAlignmentGuides,
  DEFAULT_GRID_CONFIG,
  AlignmentGuide,
} from '../utils/snappingUtils';
import { getTextComponentSize } from '../utils/textUtils';

// 组件最小尺寸常量
const MIN_DIMENSIONS = {
  width: 10,
  height: 10,
} as const;

/**
 * 计算文本组件的推荐尺寸
 * @param componentConfig 组件配置
 * @returns 推荐的尺寸或 null（如果不是文本组件）
 */
const calculateTextComponentRecommendedSize = (componentConfig: ComponentConfig): { width: number; height: number } | null => {
  // 检查是否为文本组件
  if (componentConfig.compName !== 'Text') {
    return null;
  }

  // 获取文本内容
  const content = (componentConfig.compProps?.content as string) || '请输入文本内容';

  // 获取样式属性
  const styleProps = componentConfig.styleProps || {};

  // 计算推荐尺寸
  const recommendedSize = getTextComponentSize(content, styleProps);

  // 确保最小尺寸
  return {
    width: Math.max(recommendedSize.width, MIN_DIMENSIONS.width),
    height: Math.max(recommendedSize.height, MIN_DIMENSIONS.height),
  };
};

interface ResizableWrapperProps {
  children: React.ReactNode | React.ReactNode[];
  componentConfig: ComponentConfig;
  isSelected?: boolean;
  onSelect?: () => void;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onResizeComplete?: (width: number, height: number) => void;
  onTextEdit?: (text: string) => void;
  onAlignmentGuidesChange?: (guides: AlignmentGuide[]) => void; // New prop
  componentTree?: ComponentConfig[]; // New prop for alignment calculations
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
  onAlignmentGuidesChange,
  componentTree,
}) => {
  // 组件位置状态
  const [position, setPosition] = useState({
    x: parseInt(componentConfig.styleProps?.left as string) || 0,
    y: parseInt(componentConfig.styleProps?.top as string) || 0,
  });

  // 组件尺寸状态
  const [size, setSize] = useState(() => {
    // 首先检查是否为文本组件并计算推荐尺寸
    const recommendedSize = calculateTextComponentRecommendedSize(componentConfig);
    if (recommendedSize) {
      return recommendedSize;
    }

    // 否则使用原有的尺寸计算方式
    return {
      width: parseInt(componentConfig.styleProps?.width as string) || MIN_DIMENSIONS.width,
      height: parseInt(componentConfig.styleProps?.height as string) || MIN_DIMENSIONS.height,
    };
  });

  useEffect(() => {
    if (componentConfig.compName === 'Text') {
      // 检查是否为文本组件并计算推荐尺寸
      const recommendedSize = calculateTextComponentRecommendedSize(componentConfig);
      if (recommendedSize) {
        setSize(recommendedSize);
      }
    }
  }, [
    componentConfig.compProps?.content,
    componentConfig.styleProps?.content,
    componentConfig.styleProps?.fontSize,
    componentConfig.styleProps?.fontFamily,
    componentConfig.styleProps?.fontWeight,
    componentConfig.styleProps?.fontStyle,
    componentConfig.styleProps?.textDecoration,
    componentConfig.styleProps?.textTransform,
  ]);

  // 交互状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [originPos, setOriginPos] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
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
    [position],
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

      // 根据调整方向计算固定点坐标（使用文档坐标）
      let originX = position.x;
      let originY = position.y;

      // 根据不同的调整方向确定固定点
      switch (direction) {
        case 'e': // 右边调整：固定左边
          originX = position.x;
          originY = position.y;
          break;
        case 'w': // 左边调整：固定右边
          originX = position.x + size.width;
          originY = position.y;
          break;
        case 's': // 下边调整：固定上边
          originX = position.x;
          originY = position.y;
          break;
        case 'n': // 上边调整：固定下边
          originX = position.x;
          originY = position.y + size.height;
          break;
        case 'ne': // 右上角调整：固定左下角
          originX = position.x;
          originY = position.y + size.height;
          break;
        case 'nw': // 左上角调整：固定右下角
          originX = position.x + size.width;
          originY = position.y + size.height;
          break;
        case 'se': // 右下角调整：固定左上角
          originX = position.x;
          originY = position.y;
          break;
        case 'sw': // 左下角调整：固定右上角
          originX = position.x + size.width;
          originY = position.y;
          break;
      }

      // 存储固定点坐标用于调整大小计算
      setOriginPos({ x: originX, y: originY });
    },
    [size, position],
  );

  /**
   * 更新组件样式
   */
  const updateComponentStyle = useCallback(
    (styles: Record<string, string>) => {
      eventBus.emit('updateComponentStyle', componentConfig.id, styles);
    },
    [componentConfig.id],
  );

  const updateComponentProps = useCallback(
    (value: string | null) => {
      // 使用新的消息系统发送更新到主框架
      sendMessageToParent('UPDATE_COMPONENT_PROPS', { content: value || '' }, componentConfig.id);

      // 保持原有的事件总线以确保兼容性
      eventBus.emit('updateComponentProps', componentConfig.id, { content: value || '' });
    },
    [componentConfig.id],
  );

  /**
   * 处理鼠标移动事件
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;

        // Calculate snapped position if grid is enabled
        let finalX = newX;
        let finalY = newY;

        if (DEFAULT_GRID_CONFIG.enabled) {
          const gridX = calculateGridSnap(newX, DEFAULT_GRID_CONFIG.size);
          const gridY = calculateGridSnap(newY, DEFAULT_GRID_CONFIG.size);

          // Snap to grid if within threshold
          if (shouldSnapToGrid(newX, gridX, DEFAULT_GRID_CONFIG.snapThreshold)) {
            finalX = gridX;
          }
          if (shouldSnapToGrid(newY, gridY, DEFAULT_GRID_CONFIG.snapThreshold)) {
            finalY = gridY;
          }
        }

        setPosition({ x: finalX, y: finalY });
        onMove?.(finalX, finalY);
        // Calculate component bounds for alignment
        const currentBounds = calculateComponentBounds({
          ...componentConfig,
          styleProps: {
            ...componentConfig.styleProps,
            left: `${newX}px`,
            top: `${newY}px`,
          },
        });

        // Calculate alignment guides with other components
        let updatedAlignmentGuides: AlignmentGuide[] = [];
        if (currentBounds && componentTree) {
          const otherBounds = componentTree
            .filter((comp) => comp.id !== componentConfig.id)
            .map((comp) => calculateComponentBounds(comp))
            .filter(Boolean) as ComponentBounds[];

          updatedAlignmentGuides = calculateAlignmentGuides(currentBounds, otherBounds, DEFAULT_GRID_CONFIG.snapThreshold);
        }
        setAlignmentGuides(updatedAlignmentGuides);
      } else if (isResizing) {
        // 使用固定点作为参考点
        const originX = originPos.x;
        const originY = originPos.y;

        // 计算新的宽度和高度（使用绝对值确保为正数）
        const newWidth = Math.max(MIN_DIMENSIONS.width, Math.abs(e.clientX - originX));
        const newHeight = Math.max(MIN_DIMENSIONS.height, Math.abs(e.clientY - originY));

        // 根据固定点和新的尺寸计算新的位置
        let newX = position.x;
        let newY = position.y;

        // 根据不同的调整方向确定新位置
        switch (resizeDirection) {
          case 'e': // 右边调整：固定左边
            newX = originX;
            newY = originY;
            break;
          case 'w': // 左边调整：固定右边
            newX = originX - newWidth;
            newY = originY;
            break;
          case 's': // 下边调整：固定上边
            newX = originX;
            newY = originY;
            break;
          case 'n': // 上边调整：固定下边
            newX = originX;
            newY = originY - newHeight;
            break;
          case 'ne': // 右上角调整：固定左下角
            newX = originX;
            newY = originY - newHeight;
            break;
          case 'nw': // 左上角调整：固定右下角
            newX = originX - newWidth;
            newY = originY - newHeight;
            break;
          case 'se': // 右下角调整：固定左上角
            newX = originX;
            newY = originY;
            break;
          case 'sw': // 左下角调整：固定右上角
            newX = originX - newWidth;
            newY = originY;
            break;
        }

        // 更新尺寸和位置
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
        onResize?.(newWidth, newHeight);
      }
    },
    [isDragging, isResizing, startPos, onMove, componentConfig, componentTree, originPos, position, resizeDirection, onResize],
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
        left: `${position.x}px`,
        top: `${position.y}px`,
      });
    } else if (isDragging) {
      updateComponentStyle({
        left: `${position.x}px`,
        top: `${position.y}px`,
      });
    }
    setIsDragging(false);
    setIsResizing(false);
    setAlignmentGuides([]);
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

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      console.log('handleBlur', e.target.childNodes[0].textContent);
      setIsEditing(false);
      updateComponentProps(e.target.childNodes[0].textContent);
    },
    [updateComponentProps],
  );

  useEffect(() => {
    onAlignmentGuidesChange?.(alignmentGuides);
  }, [alignmentGuides, onAlignmentGuidesChange]);

  const stylePosition = useMemo(() => {
    return componentConfig.styleProps?.position || 'static';
  }, [componentConfig.styleProps]);

  return (
    <ErrorBoundary>
      <div
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        ref={wrapperRef}
        id={`wrapper-${componentConfig.id}`}
        className={`resizable-wrapper ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isSelected ? 'selected' : ''}`}
        style={{
          ...componentConfig.styleProps,
          width: `${size.width + (isSelected ? 4 : 2)}px`,
          height: `${size.height + (isSelected ? 4 : 2)}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          position: stylePosition,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        onDoubleClick={handleDoubleClick}
      >
        {children}
        {isSelected && !isEditing && (
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
            <div className="resize-handles ">
              {['ne', 'nw', 'se', 'sw'].map((direction) => (
                <div key={direction} className={`resize-handle ${direction}`} onMouseDown={(e) => handleResizeStart(e, direction)} />
              ))}
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ResizableWrapper;
