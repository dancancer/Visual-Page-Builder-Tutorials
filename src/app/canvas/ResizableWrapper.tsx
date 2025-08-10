'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ComponentData } from '../common/types';
import './ResizableWrapper.css';
import ErrorBoundary from './ErrorBoundary';
import { eventBus } from '../utils/eventBus';
import { sendMessageToParent } from '../utils/messageBus';
import {
  calculateGridSnap,
  shouldSnapToGrid,
  calculateComponentBounds,
  calculateAlignmentGuides,
  findOverlappingComponents,
  DEFAULT_GRID_CONFIG,
  AlignmentGuide,
  ComponentBounds,
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
const calculateTextComponentRecommendedSize = (data: ComponentData): { width: number; height: number } | null => {
  // 检查是否为文本组件
  if (data.config?.compName !== 'Text') {
    return null;
  }

  // 获取文本内容
  const content = (data.compProps?.content as string) || '请输入文本内容';

  // 获取样式属性
  const styleProps = data.styleProps || {};

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
  componentData: ComponentData;
  isSelected?: boolean;
  onSelect?: () => void;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onResizeComplete?: (width: number, height: number) => void;
  onTextEdit?: (text: string) => void;
  onAlignmentGuidesChange?: (guides: AlignmentGuide[]) => void; // New prop
  componentTree?: ComponentData[]; // New prop for alignment calculations
}

/**
 * 可调整大小的包装器组件
 * 提供拖拽、调整大小等功能
 */
const ResizableWrapper: React.FC<ResizableWrapperProps> = ({
  children,
  componentData,
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
    x: parseInt(componentData.styleProps?.left as string) || 0,
    y: parseInt(componentData.styleProps?.top as string) || 0,
  });

  // 组件尺寸状态
  const [size, setSize] = useState(() => {
    // 首先检查是否为文本组件并计算推荐尺寸
    const recommendedSize = calculateTextComponentRecommendedSize(componentData);
    if (recommendedSize) {
      return recommendedSize;
    }

    // 否则使用原有的尺寸计算方式
    return {
      width: parseInt(componentData.styleProps?.width as string) || MIN_DIMENSIONS.width,
      height: parseInt(componentData.styleProps?.height as string) || MIN_DIMENSIONS.height,
    };
  });

  useEffect(() => {
    if (componentData.config?.compName === 'Text') {
      // 检查是否为文本组件并计算推荐尺寸
      const recommendedSize = calculateTextComponentRecommendedSize(componentData);
      if (recommendedSize) {
        setSize(recommendedSize);
      }
    }
  }, [componentData]);

  // 交互状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [overlappingSlotComponent, setOverlappingSlotComponent] = useState<ComponentData | null>(null);
  const [resizeDirection, setResizeDirection] = useState('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [originPos, setOriginPos] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0, fontSize: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * 处理鼠标按下事件，开始拖拽
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      // 检查是否有拖拽数据，如果有则可能是拖入操作
      const isDragFromLibrary = e.nativeEvent instanceof DragEvent && e.nativeEvent.dataTransfer?.types.includes('componentType');

      if (isDragFromLibrary) {
        // 如果是从组件库拖入的组件，阻止默认的拖拽行为
        e.preventDefault();
        return;
      }

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

      // 保存原始尺寸和字体大小，用于计算缩放比例
      if (componentData.config?.compName === 'Text') {
        const fontSize = parseInt(componentData.styleProps?.fontSize as string) || 16;
        setOriginalSize({
          width: size.width,
          height: size.height,
          fontSize: fontSize,
        });
      }

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
    [size, position, componentData],
  );

  /**
   * 更新组件样式
   */
  const updateComponentStyle = useCallback(
    (styles: Record<string, string>) => {
      eventBus.emit('updateComponentStyle', componentData.id, styles);
    },
    [componentData.id],
  );

  const updateComponentProps = useCallback(
    (value: string | null) => {
      // 使用新的消息系统发送更新到主框架
      sendMessageToParent('UPDATE_COMPONENT_PROPS', { content: value || '' }, componentData.id);

      // 保持原有的事件总线以确保兼容性
      eventBus.emit('updateComponentProps', componentData.id, { content: value || '' });
    },
    [componentData.id],
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
          ...componentData,
          styleProps: {
            ...componentData.styleProps,
            left: `${newX}px`,
            top: `${newY}px`,
          },
        });

        // Calculate alignment guides with other components
        let updatedAlignmentGuides: AlignmentGuide[] = [];
        if (currentBounds && componentTree) {
          const otherBounds = componentTree
            .filter((comp) => comp.id !== componentData.id)
            .map((comp) => calculateComponentBounds(comp))
            .filter(Boolean) as ComponentBounds[];

          updatedAlignmentGuides = calculateAlignmentGuides(currentBounds, otherBounds, DEFAULT_GRID_CONFIG.snapThreshold);

          // 检查是否有重叠的具有 isContainer 属性的组件
          const overlappingComponents = findOverlappingComponents(currentBounds, otherBounds);
          const slotComponents = overlappingComponents.filter((comp) => {
            const component = componentTree.find((c) => c.id === comp.id);
            return component?.config?.isContainer;
          });

          // 设置重叠的 slot 组件状态
          if (slotComponents.length > 0) {
            // 获取第一个重叠的 slot 组件
            const overlappingComponent = componentTree.find((c) => c.id === slotComponents[0].id);
            setOverlappingSlotComponent(overlappingComponent || null);
          } else {
            setOverlappingSlotComponent(null);
          }
        }
        setAlignmentGuides(updatedAlignmentGuides);
      } else if (isResizing) {
        // 使用固定点作为参考点
        const originX = originPos.x;
        const originY = originPos.y;

        // 计算新的宽度和高度（使用绝对值确保为正数）
        let newWidth = Math.max(MIN_DIMENSIONS.width, Math.abs(e.clientX - originX));
        let newHeight = Math.max(MIN_DIMENSIONS.height, Math.abs(e.clientY - originY));

        // 如果是文本组件，则保持等比缩放
        if (componentData.config?.compName === 'Text') {
          // 获取原始尺寸
          const originalWidth = size.width;
          const originalHeight = size.height;

          // 根据调整方向确定主导维度
          const aspectRatio = originalWidth / originalHeight;

          if (resizeDirection.includes('e') || resizeDirection.includes('w')) {
            // 如果是水平方向调整，以宽度为主导
            newHeight = newWidth / aspectRatio;
          } else if (resizeDirection.includes('n') || resizeDirection.includes('s')) {
            // 如果是垂直方向调整，以高度为主导
            newWidth = newHeight * aspectRatio;
          } else {
            // 对角线调整，根据鼠标移动的主要方向决定
            const deltaX = Math.abs(e.clientX - startPos.x);
            const deltaY = Math.abs(e.clientY - startPos.y);

            if (deltaX > deltaY) {
              // 水平移动更多，以宽度为主导
              newHeight = newWidth / aspectRatio;
            } else {
              // 垂直移动更多，以高度为主导
              newWidth = newHeight * aspectRatio;
            }
          }
        }

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
    [isDragging, isResizing, startPos, onMove, componentData, componentTree, originPos, position, resizeDirection, onResize, size],
  );

  /**
   * 处理鼠标释放事件
   */
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      onResizeComplete?.(size.width, size.height);

      // 创建样式更新对象
      const styleUpdates: Record<string, string> = {
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
      };

      // 如果是文本组件，根据缩放比例调整字体大小
      if (componentData.config?.compName === 'Text' && originalSize.width > 0) {
        // 计算缩放比例
        const scaleFactor = size.width / originalSize.width;

        // 使用保存的原始字体大小
        const originalFontSize = originalSize.fontSize;

        // 计算新的字体大小并应用
        const newFontSize = Math.max(8, Math.round(originalFontSize * scaleFactor));
        styleUpdates.fontSize = `${newFontSize}px`;
      }

      // 更新组件样式
      updateComponentStyle(styleUpdates);
    } else if (isDragging) {
      updateComponentStyle({
        left: `${position.x}px`,
        top: `${position.y}px`,
      });

      // 如果有重叠的 slot 组件，自动将当前组件添加为该 slot 组件的子组件
      if (overlappingSlotComponent) {
        // 向父窗口发送添加子组件的消息
        sendMessageToParent('ADD_CHILD_COMPONENT', {
          parentComponentId: overlappingSlotComponent.id,
          componentId: componentData.id,
          componentType: componentData.config?.compName,
        });
      }
    }
    setIsDragging(false);
    setIsResizing(false);
    setAlignmentGuides([]);
    setOverlappingSlotComponent(null);
  }, [
    isResizing,
    isDragging,
    onResizeComplete,
    size.width,
    size.height,
    position,
    componentData.config?.compName,
    componentData.id,
    originalSize.width,
    originalSize.fontSize,
    updateComponentStyle,
    overlappingSlotComponent,
  ]);

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
      setIsEditing(false);
      updateComponentProps(e.target.childNodes[0].textContent);
    },
    [updateComponentProps],
  );

  useEffect(() => {
    onAlignmentGuidesChange?.(alignmentGuides);
  }, [alignmentGuides, onAlignmentGuidesChange]);

  const stylePosition = useMemo(() => {
    return componentData.styleProps?.position || 'static';
  }, [componentData.styleProps]);

  // 处理拖拽放置事件
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 只有当组件具有 isContainer 属性为 true 时才处理拖入
    if (componentData.config?.isContainer) {
      const componentType = e.dataTransfer.getData('componentType');
      if (componentType) {
        // 向父窗口发送添加子组件的消息
        sendMessageToParent('ADD_CHILD_COMPONENT', {
          parentComponentId: componentData.id,
          componentType,
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 只有当组件具有 isContainer 属性为 true 时才允许拖入
    if (componentData.config?.isContainer) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  return (
    <ErrorBoundary>
      <div
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        ref={wrapperRef}
        id={`wrapper-${componentData.id}`}
        className={`resizable-wrapper ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isSelected ? 'selected' : ''} ${
          isDragOver ? 'drag-over' : ''
        } ${overlappingSlotComponent ? 'overlapping-slot' : ''}`}
        style={{
          ...componentData.styleProps,
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
