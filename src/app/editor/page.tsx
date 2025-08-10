'use client';

import React, { useCallback, useEffect } from 'react';
import useEditorStore from '../store/editorStore';
import './index.css';
import PropertyPanel from '../innerComponents/PropertyPanel';
import ComponentTreePanel from '../innerComponents/ComponentTreePanel';
import TextComp from '../components/TextComp';
import { ComponentConfig } from '../common/types';
import { PicComp, WrapComp } from '../components';
import { eventBus } from '../utils/eventBus';
import Head from 'next/head';
import { sendMessageToCanvas, listenToCanvasMessages, MessagePayload, AddChildComponentData } from '../utils/messageBus';
import ZoomControl from '../innerComponents/ZoomControl';
import TextToolbar from '../innerComponents/TextToolbar';

const components: ComponentConfig[] = [TextComp, PicComp, WrapComp];

function Page() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const canvasWarperRef = React.useRef<HTMLDivElement>(null);
  const zoomRatio = React.useRef(0.4);
  const { root, componentTree, updateComponentProps, updateComponentStyleProps, setSelectedComponentId, addComponent, addComponentType } =
    useEditorStore((state) => state);

  useEffect(() => {
    const handleComponentStyleUpdate = (componentId: number, styleUpdates: Record<string, string>) => {
      console.log('componentId', componentId);
      console.log('styleUpdates', styleUpdates);
      const component = componentTree.find((item: ComponentConfig | undefined) => item?.id === componentId);
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

  const zoom = useCallback(
    (direction: 'zoomIn' | 'zoomOut' | 'reset') => {
      const step = 0.1;
      if (direction === 'zoomIn') {
        zoomRatio.current = Math.min(3, zoomRatio.current + step);
      } else if (direction === 'zoomOut') {
        zoomRatio.current = Math.max(0.1, zoomRatio.current - step);
      } else if (direction === 'reset') {
        zoomRatio.current = 1;
      }
      canvasRef.current!.style.transform = `scale(${zoomRatio.current})`;
      canvasWarperRef.current!.style.width = `${900 * zoomRatio.current + 100}px`;
      canvasWarperRef.current!.style.height = `${1600 * zoomRatio.current + 100}px`;
      document.dispatchEvent(new Event('canvas-zoom'));
    },
    [zoomRatio],
  );

  // 添加一个处理组件添加的公共函数
  const handleAddComponent = useCallback(
    (compName: string) => {
      addComponent({
        compName,
      });
    },
    [addComponent],
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, direction, component, componentId, styleUpdates, propUpdates, componentType } = event.data;

      if (type === 'zoom' && direction) {
        zoom(direction);
      } else if (type === 'componentSelected' && component) {
        setSelectedComponentId(component.id);
      } else if (type === 'addComponent' && componentType) {
        // 处理从画布拖拽添加组件
        handleAddComponent(componentType);
      } else if (type === 'updateComponentStyle' && componentId > -1 && styleUpdates) {
        // 处理从 canvas 传来的样式更新
        const component = componentTree.find((item: ComponentConfig | undefined) => item?.id === componentId);
        if (!component) {
          console.error(`Component with id ${componentId} not found in componentTree`);
          return;
        }
        updateComponentStyleProps(componentId, styleUpdates);
      } else if (type === 'updateComponentProps' && componentId > -1 && propUpdates) {
        // 处理从 canvas 传来的属性更新
        const component = componentTree.find((item: ComponentConfig | undefined) => item?.id === componentId);
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
            const component = componentTree.find((item: ComponentConfig | undefined) => item?.id === payload.componentId);
            if (!component) {
              console.error(`Component with id ${payload.componentId} not found in componentTree`);
              return;
            }
            updateComponentProps(payload.componentId, payload.data as ComponentConfig['compProps']);
          }
          break;
        case 'UPDATE_COMPONENT_STYLE':
          // 处理从画布传来的样式更新
          if (payload.componentId !== undefined && payload.componentId > -1) {
            const component = componentTree.find((item: ComponentConfig | undefined) => item?.id === payload.componentId);
            if (!component) {
              console.error(`Component with id ${payload.componentId} not found in componentTree`);
              return;
            }
            updateComponentStyleProps(payload.componentId, payload.data as ComponentConfig['styleProps']);
          }
          break;
        case 'ADD_CHILD_COMPONENT':
          // 处理从画布传来的添加子组件请求
          // Type guard to check if payload.data is AddChildComponentData
          if ('parentComponentId' in payload.data && 'componentType' in payload.data && 
              payload.data.parentComponentId !== undefined && payload.data.componentType) {
            // 创建新的子组件
            const newComponent: ComponentConfig = {
              compName: (payload.data as AddChildComponentData).componentType,
              parentId: (payload.data as AddChildComponentData).parentComponentId,
            };

            // 添加组件到指定的父组件
            addComponent(newComponent);
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
        zoom(direction);
        return false;
      },
      { passive: false },
    );

    return () => {
      window.removeEventListener('message', handleMessage);
      unsubscribe();
    };
  }, [zoom, setSelectedComponentId, componentTree, updateComponentStyleProps, updateComponentProps, addComponent, handleAddComponent]);

  useEffect(() => {
    // 发送更新到画布iframe
    iframeRef.current!.contentWindow!.postMessage({ name: 'update', componentTree, root }, '*');

    // 使用新的消息系统发送更新
    sendMessageToCanvas('UPDATE_COMPONENT_TREE', { componentTree, root });
  }, [root, componentTree]);

  const onUpdateStyle = useCallback((styleUpdates: Record<string, string>) => {
    const state = useEditorStore.getState();
    if (state.selectedComponentId !== null && state.selectedComponentId >= 0) {
      const component = state.componentTree[state.selectedComponentId];
      if (component && component.compName === 'Text') {
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
        {/* <div className="sidebar">
          <div className="sidebar-header">
            <h3 className={`${editorStyles.layout.header} ${editorStyles.text.primary}`}>组件库</h3>
            <div className={editorStyles.layout.divider}></div>
          </div>

          <div className={editorStyles.layout.sidebar}>
            <ComponentLibrary />
          </div>
        </div> */}

        <div className="properties">
          <ComponentTreePanel />
        </div>

        <div className="canvas-container flex justify-center items-center">
          <div
            className=" p-[50px]"
            style={{
              width: `${900 * zoomRatio.current + 100}px`,
              height: `${1600 * zoomRatio.current + 100}px`,
            }}
            ref={canvasWarperRef}
          >
            <div
              className=" canvas origin-top-left h-[1600px] w-[900px]"
              style={{
                transform: `scale(${zoomRatio.current})`,
              }}
              ref={canvasRef}
            >
              <iframe className=" h-full w-full" src="/canvas" ref={iframeRef}></iframe>
            </div>
          </div>
          <TextToolbar onUpdateStyle={onUpdateStyle} />
          <ZoomControl zoomRatio={zoomRatio.current} onZoomChange={zoom} />
        </div>
        <div className="properties">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}

export default Page;
