'use client';

import React, { useCallback, useEffect } from 'react';
import useEditorStore from '../store/editorStore';
import './index.css';
import PropertyPanel from '../innerComponents/PropertyPanel';
import ComponentTreePanel from '../innerComponents/ComponentTreePanel';
import TextComp from '../components/TextComp';
import { ComponentConfig, ComponentData } from '../common/types';
import { PicComp, WrapComp } from '../components';
import { eventBus } from '../utils/eventBus';
import Head from 'next/head';
import { sendMessageToCanvas, listenToCanvasMessages, MessagePayload, AddChildComponentData } from '../utils/messageBus';
import ZoomControl from '../innerComponents/ZoomControl';
import TextToolbar from '../innerComponents/TextToolbar';

const components: ComponentConfig[] = [TextComp, PicComp, WrapComp];

function Page() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const canvasWarperRef = React.useRef<HTMLDivElement>(null);
  const {
    root,
    componentTree,
    fontSubSet,
    updateComponentProps,
    updateComponentStyleProps,
    setSelectedComponentId,
    addComponent,
    addComponentType,
    reorderComponent,
    zoom,
    setZoom,
  } = useEditorStore((state) => state);

  useEffect(() => {
    if (fontSubSet) {
      sendMessageToCanvas('FONT_CHANGE', fontSubSet);
    }
  }, [fontSubSet]);

  useEffect(() => {
    const handleComponentStyleUpdate = (componentId: number, styleUpdates: Record<string, string>) => {
      const component = componentTree.find((item: ComponentData | undefined) => item?.id === componentId);
      if (!component) {
        console.error(`Component with id ${componentId} not found in componentTree`);
        return;
      }
      updateComponentStyleProps(componentId, styleUpdates);
    };

    eventBus.on('updateComponentStyle', handleComponentStyleUpdate);

    return () => {
      eventBus.off('updateComponentStyle', handleComponentStyleUpdate);
    };
  }, [componentTree, updateComponentStyleProps]);

  useEffect(() => {
    components.forEach((comp) => {
      addComponentType(comp);
    });
  }, [addComponentType]);

  // 添加一个处理组件添加的公共函数
  const handleAddComponent = useCallback(
    (compName: string) => {
      addComponent(compName);
    },
    [addComponent],
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, component, componentId, styleUpdates, propUpdates, componentType } = event.data;

      if (type === 'componentSelected' && component) {
        setSelectedComponentId(component.id);
      } else if (type === 'addComponent' && componentType) {
        // 处理从画布拖拽添加组件
        handleAddComponent(componentType);
      } else if (type === 'updateComponentStyle' && componentId > -1 && styleUpdates) {
        // 处理从 canvas 传来的样式更新
        const component = componentTree.find((item: ComponentData | undefined) => item?.id === componentId);
        if (!component) {
          console.error(`Component with id ${componentId} not found in componentTree`);
          return;
        }
        updateComponentStyleProps(componentId, styleUpdates);
      } else if (type === 'updateComponentProps' && componentId > -1 && propUpdates) {
        // 处理从 canvas 传来的属性更新
        const component = componentTree.find((item: ComponentData | undefined) => item?.id === componentId);
        if (!component) {
          console.error(`Component with id ${componentId} not found in componentTree`);
          return;
        }
        updateComponentProps(componentId, propUpdates);
      }
    };

    const handleCanvasMessage = (payload: MessagePayload) => {
      switch (payload.type) {
        case 'UPDATE_COMPONENT_PROPS':
          // 处理从画布传来的属性更新
          if (payload.componentId !== undefined && payload.componentId > -1) {
            const component = componentTree.find((item: ComponentData | undefined) => item?.id === payload.componentId);
            if (!component) {
              console.error(`Component with id ${payload.componentId} not found in componentTree`);
              return;
            }
            updateComponentProps(payload.componentId, payload.data as ComponentData['compProps']);
          }
          break;
        case 'UPDATE_COMPONENT_STYLE':
          // 处理从画布传来的样式更新
          if (payload.componentId !== undefined && payload.componentId > -1) {
            const component = componentTree.find((item: ComponentData | undefined) => item?.id === payload.componentId);
            if (!component) {
              console.error(`Component with id ${payload.componentId} not found in componentTree`);
              return;
            }
            updateComponentStyleProps(payload.componentId, payload.data as ComponentData['styleProps']);
          }
          break;
        case 'ADD_CHILD_COMPONENT':
          // 处理从画布传来的添加子组件请求
          const addChildComponentData = payload.data as AddChildComponentData;
          if (addChildComponentData.parentComponentId !== undefined && addChildComponentData.componentId !== undefined) {
            const { parentComponentId, componentId } = addChildComponentData;
            // 添加组件到指定的父组件
            reorderComponent(componentId as number, parentComponentId as number);
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    const unsubscribe = listenToCanvasMessages(handleCanvasMessage);
    document.addEventListener(
      'wheel',
      function (event: WheelEvent) {
        if (!event.deltaY || !event.ctrlKey) {
          return;
        }
        event.preventDefault();
        const direction = event.deltaY > 0 ? 'zoomOut' : 'zoomIn';
        const step = 0.1;
        if (direction === 'zoomIn') {
          setZoom(Math.min(3, zoom + step));
        } else if (direction === 'zoomOut') {
          setZoom(Math.max(0.1, zoom - step));
        }
        return false;
      },
      { passive: false },
    );

    return () => {
      window.removeEventListener('message', handleMessage);
      unsubscribe();
    };
  }, [
    setSelectedComponentId,
    componentTree,
    updateComponentStyleProps,
    updateComponentProps,
    addComponent,
    handleAddComponent,
    reorderComponent,
    zoom,
    setZoom,
  ]);

  useEffect(() => {
    // 使用新的消息系统发送更新
    sendMessageToCanvas('UPDATE_COMPONENT_TREE', { componentTree, root });
  }, [root, componentTree]);

  const onUpdateStyle = useCallback((styleUpdates: Record<string, string>) => {
    const state = useEditorStore.getState();
    if (state.selectedComponentId !== null && state.selectedComponentId >= 0) {
      const component = state.componentTree[state.selectedComponentId];
      if (component && component.config?.compName === 'Text') {
        // Update style props in the store
        state.updateComponentStyleProps(state.selectedComponentId, styleUpdates);

        // Send message to canvas
        sendMessageToCanvas('UPDATE_COMPONENT_STYLE', styleUpdates, state.selectedComponentId);
      }
    }
  }, []);

  return (
    <div className="editor">
      <Head>
        <title>Next webm -- Editor</title>
        <meta name="description" content="Generated by Next webm -- Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="navbar">顶部导航+工具栏</div>
      <div className="main-container">
        <div className="properties">
          <ComponentTreePanel />
        </div>

        <div className="canvas-container">
          <div
            className="canvas"
            style={{
              width: `${900 * zoom}px`,
              height: `${1600 * zoom}px`,
            }}
            ref={canvasWarperRef}
          >
            <iframe className=" h-full w-full" src="/canvas" ref={iframeRef}></iframe>
          </div>
          <TextToolbar onUpdateStyle={onUpdateStyle} />
          <ZoomControl />
        </div>
        <div className="properties">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}

export default Page;
