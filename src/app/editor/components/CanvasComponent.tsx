'use client';

import React, { useCallback, useEffect } from 'react';
import { ComponentData } from '../../common/types';
import { TextComp, PicComp, WrapComp } from '../../components';
import useEditorStore from '../../store/editorStore';
import ResizableWrapper from './ResizableWrapper';
import AlignmentGuides from './AlignmentGuides';
import { eventBus } from '../../utils/eventBus';
import { injectWebFont } from '../../utils/textUtils';

// 可用组件列表
const components = [TextComp, PicComp, WrapComp];

interface CanvasComponentProps {
  onComponentSelect?: (component: ComponentData) => void;
}

function CanvasComponent({ onComponentSelect }: CanvasComponentProps) {
  // 从store获取状态
  const { root, componentTree, fontSubSet, setSelectedComponentId, zoom } = useEditorStore();

  const [selectedComponent, setSelectedComponent] = React.useState<ComponentData | null>(null);
  const [alignmentGuides, setAlignmentGuides] = React.useState<{ type: 'vertical' | 'horizontal'; position: number; sourceComponentId?: number }[]>(
    [],
  );
  const [canvasSize, setCanvasSize] = React.useState({ width: 900, height: 1600, top: 0, left: 0 });
  const rootRef = React.useRef<HTMLDivElement>(null);

  // 监听画布尺寸变化
  React.useEffect(() => {
    const updateCanvasSize = () => {
      if (rootRef.current) {
        const { width, height, top, left } = rootRef.current.getBoundingClientRect();
        setCanvasSize({ width, height, top, left });
      }
    };

    // 初始化尺寸
    updateCanvasSize();

    // 监听窗口大小变化
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [zoom]);

  /**
   * 合并组件配置
   * @param comp 基础组件配置
   * @param component 当前组件配置
   * @returns 合并后的样式和属性配置
   */
  const mergeComponentConfigs = (comp: (typeof components)[number], component: ComponentData) => {
    const mergedStyleConfig = { ...comp.defaultProps?.styleProps, ...component.styleProps };
    const mergedCompConfig = { ...comp.defaultProps?.compProps, ...component.compProps };
    return { mergedStyleConfig, mergedCompConfig };
  };

  /**
   * 处理组件选中事件
   */
  const handleSelectComponent = useCallback(
    (component: ComponentData) => {
      setSelectedComponent(component);
      setSelectedComponentId(component.id ?? -1);
      if (onComponentSelect) {
        onComponentSelect(component);
      }
    },
    [setSelectedComponentId, onComponentSelect],
  );

  /**
   * 渲染组件树
   */
  const renderComponent = useCallback(
    (component: ComponentData) => {
      const { children } = component;

      // 渲染子组件
      const childNodeList: React.ReactNode[] = children
        ? children.map((childId: number) => {
            const child = componentTree.find((item: ComponentData) => item.id === childId);
            if (!child) {
              console.error(`Child component with id ${childId} not found in componentTree`);
              return null;
            }
            return renderComponent(child);
          })
        : [];

      // 查找组件定义
      const comp = components.find((comp) => comp.config.compName === component.config?.compName);
      if (!comp) return null;

      // 合并组件配置
      const { mergedStyleConfig, mergedCompConfig } = mergeComponentConfigs(comp, component);
      if (component.id === -1) {
        return (
          comp.config.compType &&
          React.createElement(
            comp.config.compType,
            {
              compProps: mergedCompConfig,
              styleProps: mergedStyleConfig,
              config: {
                name: comp.config.name,
                compName: component.config?.compName || '',
              },
            },
            ...childNodeList,
          )
        );
      }
      const renderRealComponent = (componentData: ComponentData) => {
        return (
          comp.config.compType &&
          React.createElement(
            comp.config.compType,
            {
              compProps: mergedCompConfig,
              styleProps: mergedStyleConfig,
              config: {
                name: comp.config.name,
                compName: componentData.config?.compName || '',
              },
              isEditing: componentData.isEditing,
              onBlur: componentData.onBlur,
            },
            ...childNodeList,
          )
        );
      };
      return (
        <ResizableWrapper
          key={component.id}
          componentData={{ ...component, styleProps: mergedStyleConfig, compProps: mergedCompConfig }}
          isSelected={selectedComponent?.id === component.id}
          onSelect={() => handleSelectComponent(component)}
          onAlignmentGuidesChange={setAlignmentGuides}
          componentTree={componentTree}
          renderComponent={renderRealComponent}
        ></ResizableWrapper>
      );
    },
    [componentTree, selectedComponent, handleSelectComponent],
  );

  useEffect(() => {
    if (fontSubSet) {
      for (const fontName in fontSubSet) {
        const fontData = fontSubSet[fontName].fontData;
        console.log(fontData);
        // const fontDataUrl = URL.createObjectURL(new Blob([fontData], { type: 'application/octet-stream' }));
        injectWebFont(fontName, fontData, 'normal', 'normal');
      }
    }
  }, [fontSubSet]);

  if (!root) return null;

  // 处理拖拽放置事件
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      // 获取鼠标位置
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 触发添加组件事件
      eventBus.emit('addComponent', { componentType, position: { x, y } });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const node = renderComponent(root);
  const onRootSelect = () => {
    setSelectedComponentId(-1);
  };
  return (
    <div
      ref={rootRef}
      className="root bg-white relative h-full w-full"
      id="root"
      onClick={onRootSelect}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {node}
      <AlignmentGuides
        guides={alignmentGuides}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
        canvasTop={canvasSize.top}
        canvasLeft={canvasSize.left}
      />
    </div>
  );
}

export default CanvasComponent;
