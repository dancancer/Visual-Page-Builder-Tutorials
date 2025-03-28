'use client';

import React, { useCallback, useEffect } from 'react';
import { ComponentConfig } from '../common/types';
import './index.css';
import { TextComp, PicComp, WrapComp } from '../components';
import useEditorStore from '../store/editorStore';
import ResizableWrapper from './ResizableWrapper';
import { eventBus } from '../utils/eventBus';

// 可用组件列表
const components: ComponentConfig[] = [TextComp, PicComp, WrapComp];

function Page() {
  // 组件状态管理
  const [compTree, setCompTree] = React.useState<ComponentConfig[]>([]);
  const [root, setRoot] = React.useState<ComponentConfig | undefined>(undefined);
  const [selectedComponent, setSelectedComponent] = React.useState<ComponentConfig | null>(null);
  const { setSelectedComponentId, addComponentType } = useEditorStore();

  /**
   * 合并组件配置
   * @param comp 基础组件配置
   * @param component 当前组件配置
   * @returns 合并后的样式和属性配置
   */
  const mergeComponentConfigs = (comp: ComponentConfig, component: ComponentConfig) => {
    const mergedStyleConfig = { ...comp.styleProps, ...component.styleProps };
    const mergedCompConfig = { ...comp.compProps, ...component.compProps };
    return { mergedStyleConfig, mergedCompConfig };
  };

  /**
   * 处理组件选中事件
   */
  const handleSelectComponent = useCallback(
    (component: ComponentConfig) => {
      setSelectedComponent(component);
      setSelectedComponentId(component.id ?? -1);
      window.parent.postMessage(
        {
          type: 'componentSelected',
          component,
          componentTree: compTree,
        },
        '*'
      );
    },
    [compTree, setSelectedComponentId]
  );

  /**
   * 渲染组件树
   */
  const renderComponent = useCallback(
    (component: ComponentConfig) => {
      const { children } = component;
      
      // 渲染子组件
      const childNodeList: React.ReactNode[] = children
        ? children.map((childId: number) => {
            const child = compTree.find((item: ComponentConfig) => item.id === childId);
            if (!child) {
              console.error(`Child component with id ${childId} not found in compTree`);
              return null;
            }
            return renderComponent(child);
          })
        : [];

      // 查找组件定义
      const comp = components.find((comp) => comp.compName === component.compName);
      if (!comp) return null;

      // 合并组件配置
      const { mergedStyleConfig, mergedCompConfig } = mergeComponentConfigs(comp, component);

      return (
        <ResizableWrapper
          key={component.id}
          componentConfig={{ ...component, styleProps: mergedStyleConfig, compProps: mergedCompConfig }}
          isSelected={selectedComponent?.id === component.id}
          onSelect={() => handleSelectComponent(component)}
        >
          {comp.compType &&
            React.createElement(
              comp.compType,
              {
                compProps: mergedCompConfig,
                styleProps: mergedStyleConfig,
                compName: component.compName,
                compType: comp.compType,
              },
              ...childNodeList
            )}
        </ResizableWrapper>
      );
    },
    [compTree, selectedComponent, handleSelectComponent]
  );

  /**
   * 监听父窗口消息和滚轮事件
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.componentTree) {
        setCompTree(event.data.componentTree);
        setRoot(event.data.root);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!event.deltaY || !event.ctrlKey) return;
      event.preventDefault();
      window.parent.postMessage({ name: 'zoom', deltaY: event.deltaY }, '*');
      return false;
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [addComponentType, setCompTree, setRoot]);

  /**
   * 监听组件样式更新事件
   */
  useEffect(() => {
    const handleComponentStyleUpdate = (componentId: number, styleUpdates: Record<string, string>) => {
      // 更新本地组件树
      setCompTree((prevTree) =>
        prevTree.map((comp) =>
          comp.id === componentId
            ? {
                ...comp,
                styleProps: {
                  ...comp.styleProps,
                  ...styleUpdates,
                },
              }
            : comp
        )
      );

      // 向父窗口同步样式更新
      window.parent.postMessage(
        {
          type: 'updateComponentStyle',
          componentId,
          styleUpdates,
        },
        '*'
      );
    };

    eventBus.on('updateComponentStyle', handleComponentStyleUpdate);
    return () => {
      eventBus.off('updateComponentStyle', handleComponentStyleUpdate);
    };
  }, []);

  if (!root) return null;

  return (
    <div className="root" id="root">
      {renderComponent(root)}
    </div>
  );
}

export default Page;
