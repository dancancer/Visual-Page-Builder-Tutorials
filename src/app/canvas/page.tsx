'use client';

import React, { useCallback, useEffect } from 'react';
import { ComponentConfig, ComponentData, FontSubSet } from '../common/types';
import './index.css';
import { TextComp, PicComp, WrapComp } from '../components';
import useEditorStore from '../store/editorStore';
import ResizableWrapper from './ResizableWrapper';
import AlignmentGuides from './AlignmentGuides';
import { eventBus } from '../utils/eventBus';
import { listenToParentMessages, MessagePayload } from '../utils/messageBus';
import { injectWebFont } from '../utils/textUtils';

// 可用组件列表
const components: ComponentConfig[] = [TextComp, PicComp, WrapComp];

function Page() {
  // 组件状态管理
  const [fontSubSet, setFontSubSet] = React.useState<FontSubSet>();
  const [compTree, setCompTree] = React.useState<ComponentData[]>([]);
  const [root, setRoot] = React.useState<ComponentData | undefined>(undefined);
  const [selectedComponent, setSelectedComponent] = React.useState<ComponentData | null>(null);
  const [alignmentGuides, setAlignmentGuides] = React.useState<{ type: 'vertical' | 'horizontal'; position: number; sourceComponentId?: number }[]>(
    [],
  );
  const { setSelectedComponentId, addComponentType } = useEditorStore();

  /**
   * 合并组件配置
   * @param comp 基础组件配置
   * @param component 当前组件配置
   * @returns 合并后的样式和属性配置
   */
  const mergeComponentConfigs = (comp: ComponentConfig, component: ComponentData) => {
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
      window.parent.postMessage(
        {
          type: 'componentSelected',
          component,
          componentTree: compTree,
        },
        '*',
      );
    },
    [compTree, setSelectedComponentId],
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
            const child = compTree.find((item: ComponentData) => item.id === childId);
            if (!child) {
              console.error(`Child component with id ${childId} not found in compTree`);
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
          componentTree={compTree}
          renderComponent={renderRealComponent}
        ></ResizableWrapper>
      );
    },
    [compTree, selectedComponent, handleSelectComponent],
  );

  // 处理组件样式更新
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
          : comp,
      ),
    );

    // 向父窗口同步样式更新
    window.parent.postMessage(
      {
        type: 'updateComponentStyle',
        componentId,
        styleUpdates,
      },
      '*',
    );
  };

  // 处理组件属性更新
  const handleComponentPropsUpdate = (componentId: number, propsUpdates: Record<string, number | number[] | string | string[] | undefined>) => {
    // 更新本地组件树
    setCompTree((prevTree) =>
      prevTree.map((comp) =>
        comp.id === componentId
          ? {
              ...comp,
              compProps: {
                ...comp.compProps,
                ...propsUpdates,
              },
            }
          : comp,
      ),
    );

    // 向父窗口同步样式更新
    window.parent.postMessage(
      {
        type: 'updateComponentProps',
        componentId,
        propsUpdates,
      },
      '*',
    );
  };

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

  /**
   * 监听父窗口消息和滚轮事件
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 保持原有的消息处理以兼容现有代码
      if (event.data.componentTree) {
        setCompTree(event.data.componentTree);
        setRoot(event.data.root);
      }
    };

    const handleParentMessage = (payload: MessagePayload) => {
      switch (payload.type) {
        case 'UPDATE_COMPONENT_TREE':
          // Type guard to check if payload.data is UpdateComponentTreeData
          if ('componentTree' in payload.data && 'root' in payload.data) {
            const data = payload.data as { componentTree: ComponentData[]; root: ComponentData };
            setCompTree(data.componentTree);
            setRoot(data.root);
          }
          break;
        case 'UPDATE_COMPONENT_PROPS':
          // 处理组件属性更新
          handleComponentPropsUpdate(payload.componentId || -1, payload.data as Record<string, number | number[] | string | string[] | undefined>);
          break;
        case 'UPDATE_COMPONENT_STYLE':
          // 处理组件样式更新
          handleComponentStyleUpdate(payload.componentId || -1, payload.data as Record<string, string>);
          break;
        case 'SELECT_COMPONENT':
          // 处理组件选择
          if (payload.componentId !== undefined) {
            const component = compTree.find((item: ComponentData) => item.id === payload.componentId);
            if (component) {
              handleSelectComponent(component);
            }
          }
          break;
        case 'ADD_CHILD_COMPONENT':
          // 处理添加子组件
          // Type guard to check if payload.data is AddChildComponentData
          if (
            'parentComponentId' in payload.data &&
            'componentType' in payload.data &&
            payload.data.parentComponentId !== undefined &&
            payload.data.componentType !== undefined
          ) {
            // 向父窗口发送添加子组件的消息
            window.parent.postMessage(
              {
                type: 'ADD_CHILD_COMPONENT',
                parentComponentId: payload.data.parentComponentId,
                componentId: payload.data.componentId,
                componentType: payload.data.componentType,
              },
              '*',
            );
          }
          break;
        case 'FONT_CHANGE':
          setFontSubSet(payload.data as FontSubSet);
          break;
      }

      // 处理字体变化
    };

    const handleWheel = (event: WheelEvent) => {
      if (!event.deltaY || !event.ctrlKey) return;
      event.preventDefault();
      // Send zoom direction instead of raw deltaY
      const zoomDirection = event.deltaY > 0 ? 'zoomOut' : 'zoomIn';
      window.parent.postMessage({ name: 'zoom', direction: zoomDirection }, '*');
      return false;
    };

    window.addEventListener('message', handleMessage);
    const unsubscribe = listenToParentMessages(handleParentMessage);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('message', handleMessage);
      unsubscribe();
      document.removeEventListener('wheel', handleWheel);
    };
  }, [addComponentType, setCompTree, setRoot, compTree, handleSelectComponent]);

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
            : comp,
        ),
      );

      // 向父窗口同步样式更新
      window.parent.postMessage(
        {
          type: 'updateComponentStyle',
          componentId,
          styleUpdates,
        },
        '*',
      );
    };

    const handleComponentPropsUpdate = (componentId: number, propsUpdates: Record<string, number | number[] | string | string[] | undefined>) => {
      // 更新本地组件树
      setCompTree((prevTree) =>
        prevTree.map((comp) =>
          comp.id === componentId
            ? {
                ...comp,
                compProps: {
                  ...comp.compProps,
                  ...propsUpdates,
                },
              }
            : comp,
        ),
      );

      // 向父窗口同步样式更新
      window.parent.postMessage(
        {
          type: 'updateComponentProps',
          componentId,
          propsUpdates,
        },
        '*',
      );
    };

    eventBus.on('updateComponentStyle', handleComponentStyleUpdate);
    eventBus.on('updateComponentProps', handleComponentPropsUpdate);
    return () => {
      eventBus.off('updateComponentStyle', handleComponentStyleUpdate);
      eventBus.off('updateComponentProps', handleComponentPropsUpdate);
    };
  }, []);

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

      // 向父窗口发送添加组件的消息
      window.parent.postMessage(
        {
          type: 'addComponent',
          componentType,
          position: { x, y },
        },
        '*',
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const node = renderComponent(root);
  // console.log(node);
  return (
    <div className="root bg-white relative" id="root" onDrop={handleDrop} onDragOver={handleDragOver}>
      {node}
      <AlignmentGuides guides={alignmentGuides} canvasWidth={900} canvasHeight={1600} />
    </div>
  );
}

export default Page;
