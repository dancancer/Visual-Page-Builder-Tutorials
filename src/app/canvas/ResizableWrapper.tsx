'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect, ReactElement } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ComponentData } from '../common/types';
import './ResizableWrapper.css';
import ErrorBoundary from './ErrorBoundary';
// import { eventBus } from '../utils/eventBus';
import { sendMessageToParent } from '../utils/messageBus';
import {
  calculateGridSnap,
  shouldSnapToGrid,
  getComponentRect,
  calculateAlignmentGuides,
  findOverlappingComponents,
  DEFAULT_GRID_CONFIG,
  AlignmentGuide,
  CompRect,
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
  // console.log(recommendedSize);

  // 确保最小尺寸
  return {
    width: Math.max(recommendedSize.width, MIN_DIMENSIONS.width),
    height: Math.max(recommendedSize.height, MIN_DIMENSIONS.height),
  };
};

interface ResizableWrapperProps {
  componentData: ComponentData;
  isSelected?: boolean;
  onSelect?: () => void;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onResizeComplete?: (width: number, height: number) => void;
  onTextEdit?: (text: string) => void;
  onAlignmentGuidesChange?: (guides: AlignmentGuide[]) => void; // New prop
  componentTree?: ComponentData[]; // New prop for alignment calculations
  renderComponent: ({
    componentData,
    isEditing,
    onBlur,
  }: {
    componentData: ComponentData;
    isEditing?: boolean;
    onBlur?: (target: React.FocusEvent<HTMLDivElement, Element>) => void;
  }) => ReactElement<ComponentData, React.FunctionComponent<ComponentData>> | undefined;
}

/**
 * 可调整大小的包装器组件
 * 提供拖拽、调整大小等功能
 */
const ResizableWrapper: React.FC<ResizableWrapperProps> = ({
  componentData,
  isSelected,
  onSelect,
  onResize,
  onMove,
  onResizeComplete,
  onAlignmentGuidesChange,
  componentTree,
  renderComponent,
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
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [startAngle, setStartAngle] = useState(0);

  /**
   * 处理鼠标按下事件，开始拖拽
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      // 检查是否有拖拽数据，如果有则可能是拖入操作
      const isDragFromLibrary = e.nativeEvent instanceof DragEvent && e.nativeEvent.dataTransfer?.types.includes('componentType');

      if (isDragFromLibrary || componentData.styleProps?.position !== 'absolute') {
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
    [componentData.styleProps?.position, position],
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

      // 获取元素的屏幕坐标
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      // 根据调整方向计算固定点坐标（使用屏幕坐标）
      let originX = rect.left;
      let originY = rect.top;

      // 根据不同的调整方向确定固定点
      switch (direction) {
        case 'e': // 右边调整：固定左边
          originX = rect.left;
          originY = rect.top;
          break;
        case 'w': // 左边调整：固定右边
          originX = rect.right;
          originY = rect.top;
          break;
        case 's': // 下边调整：固定上边
          originX = rect.left;
          originY = rect.top;
          break;
        case 'n': // 上边调整：固定下边
          originX = rect.left;
          originY = rect.bottom;
          break;
        case 'ne': // 右上角调整：固定左下角
          originX = rect.left;
          originY = rect.bottom;
          break;
        case 'nw': // 左上角调整：固定右下角
          originX = rect.right;
          originY = rect.bottom;
          break;
        case 'se': // 右下角调整：固定左上角
          originX = rect.left;
          originY = rect.top;
          break;
        case 'sw': // 左下角调整：固定右上角
          originX = rect.right;
          originY = rect.top;
          break;
      }

      // 存储固定点坐标用于调整大小计算
      setOriginPos({ x: originX, y: originY });
    },
    [size, componentData],
  );

  const handleRotateStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setIsRotating(true);

      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const startX = e.clientX - centerX;
      const startY = e.clientY - centerY;

      setStartAngle(Math.atan2(startY, startX) * (180 / Math.PI) - rotation);
    },
    [rotation],
  );

  /**
   * 更新组件样式
   */
  const updateComponentStyle = useCallback(
    (styles: Record<string, string>) => {
      sendMessageToParent('UPDATE_COMPONENT_STYLE', styles, componentData.id);
    },
    [componentData.id],
  );

  const updateComponentProps = useCallback(
    (value: string | null) => {
      // 使用新的消息系统发送更新到主框架
      sendMessageToParent('UPDATE_COMPONENT_PROPS', { content: value || '' }, componentData.id);
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
        const currentBounds = getComponentRect(componentData);

        // Calculate alignment guides with other components
        let updatedAlignmentGuides: AlignmentGuide[] = [];
        if (currentBounds && componentTree && componentData.styleProps?.position === 'absolute') {
          const otherBounds = componentTree
            .filter((comp) => comp.id !== componentData.id && comp.id !== componentData.parentId)
            .map((comp) => getComponentRect(comp)) as CompRect[];

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

        // 获取元素的当前屏幕坐标
        const currentRect = wrapperRef.current?.getBoundingClientRect();
        if (!currentRect) return;

        // 计算相对于文档的偏移量
        const offsetX = position.x - (currentRect.left - window.scrollX);
        const offsetY = position.y - (currentRect.top - window.scrollY);

        // 根据固定点和新的尺寸计算新的位置
        let newX = position.x;
        let newY = position.y;

        // 根据不同的调整方向确定新位置
        switch (resizeDirection) {
          case 'e': // 右边调整：固定左边
            // 左边固定，位置不变
            newX = originX - window.scrollX + offsetX;
            newY = originY - window.scrollY + offsetY;
            break;
          case 'w': // 左边调整：固定右边
            // 右边固定，左边位置需要调整
            newX = originX - window.scrollX - newWidth + offsetX;
            newY = originY - window.scrollY + offsetY;
            break;
          case 's': // 下边调整：固定上边
            // 上边固定，位置不变
            newX = originX - window.scrollX + offsetX;
            newY = originY - window.scrollY + offsetY;
            break;
          case 'n': // 上边调整：固定下边
            // 下边固定，上边位置需要调整
            newX = originX - window.scrollX + offsetX;
            newY = originY - window.scrollY - newHeight + offsetY;
            break;
          case 'ne': // 右上角调整：固定左下角
            // 左下角固定，右上角位置需要调整
            newX = originX - window.scrollX + offsetX;
            newY = originY - window.scrollY - newHeight + offsetY;
            break;
          case 'nw': // 左上角调整：固定右下角
            // 右下角固定，左上角位置需要调整
            newX = originX - window.scrollX - newWidth + offsetX;
            newY = originY - window.scrollY - newHeight + offsetY;
            break;
          case 'se': // 右下角调整：固定左上角
            // 左上角固定，位置不变
            newX = originX - window.scrollX + offsetX;
            newY = originY - window.scrollY + offsetY;
            break;
          case 'sw': // 左下角调整：固定右上角
            // 右上角固定，左下角位置需要调整
            newX = originX - window.scrollX - newWidth + offsetX;
            newY = originY - window.scrollY + offsetY;
            break;
        }

        // 更新尺寸和位置
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
        onResize?.(newWidth, newHeight);
      } else if (isRotating) {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const currentX = e.clientX - centerX;
        const currentY = e.clientY - centerY;

        const angle = Math.atan2(currentY, currentX) * (180 / Math.PI);
        setRotation(angle - startAngle);
      }
    },
    [
      isDragging,
      isResizing,
      startPos,
      onMove,
      componentData,
      componentTree,
      originPos,
      position,
      resizeDirection,
      onResize,
      size,
      isRotating,
      startAngle,
    ],
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
        const compRect = getComponentRect(componentData);
        const overlappingCompRect = getComponentRect(overlappingSlotComponent);

        const newTop = (compRect?.rect.top || 0) - (overlappingCompRect?.rect.top || 0) - (overlappingCompRect?.clientTop || 0);
        const newLeft = (compRect?.rect.left || 0) - (overlappingCompRect?.rect.left || 0) - (overlappingCompRect?.clientLeft || 0);
        console.log('newTop', newTop);
        console.log('newLeft', newLeft);
        updateComponentStyle({
          left: `${newLeft}px`,
          top: `${newTop}px`,
        });
        // 向父窗口发送添加子组件的消息
        sendMessageToParent('ADD_CHILD_COMPONENT', {
          parentComponentId: overlappingSlotComponent.id,
          componentId: componentData.id,
          componentType: componentData.config?.compName,
        });
        setTimeout(() => {
          // 2. 获取两个元素相对于视口的位置

          setPosition({ x: newLeft, y: newTop });
        }, 0);
      }
    } else if (isRotating) {
      updateComponentStyle({
        transform: `rotate(${rotation}deg)`,
      });
    }
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setAlignmentGuides([]);
    setOverlappingSlotComponent(null);
  }, [
    isResizing,
    isDragging,
    onResizeComplete,
    size,
    position,
    componentData,
    originalSize.width,
    originalSize.fontSize,
    updateComponentStyle,
    overlappingSlotComponent,
    isRotating,
    rotation,
  ]);

  // 添加和移除事件监听器
  React.useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (componentData.config?.isEditable) {
        e.stopPropagation();
        setIsEditing(true);
      }
    },
    [componentData],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (componentData.config?.isEditable) {
        setIsEditing(false);
        updateComponentProps(e.target.childNodes[0].textContent);
      }
    },
    [componentData, updateComponentProps],
  );

  useEffect(() => {
    onAlignmentGuidesChange?.(alignmentGuides);
  }, [alignmentGuides, onAlignmentGuidesChange]);

  useEffect(() => {
    if (isResizing) {
      onResize?.(size.width, size.height);
    }
  }, [size, isResizing, onResize]);

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
          transform: `rotate(${rotation}deg)`,
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
        {renderComponent({ componentData, isEditing, onBlur: handleBlur })}
        {isSelected && !isEditing && (
          <>
            <div
              className="drag-handle"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${size.width + (isSelected ? 4 : 2)}px`,
                height: `${size.height + (isSelected ? 4 : 2)}px`,
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
            <div className="rotate-handle" onMouseDown={handleRotateStart}>
              <ReloadIcon />
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ResizableWrapper;
