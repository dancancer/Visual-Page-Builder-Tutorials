'use client';

import React, { useCallback, useEffect } from 'react';
import useEditorStore from '../store/editorStore';
import './index.css';
import PropertyPanel from '../innerComponents/PropertyPanel';
import TextComp from '../components/TextComp';
import { ComponentConfig } from '../common/types';
import { PicComp, WrapComp } from '../components';
import { eventBus } from '../utils/eventBus';
import Head from 'next/head';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../innerComponents/uiComponents/DropdownMenu';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../innerComponents/uiComponents/Tooltip';
import { ChevronRightIcon, ImageIcon, TextIcon, LayoutIcon, ContainerIcon, DashboardIcon, GridIcon } from '@radix-ui/react-icons';
import { sendMessageToCanvas, listenToCanvasMessages, MessagePayload } from '../utils/messageBus';
import { editorStyles } from '../styles/editorStyles';
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, direction, component, componentId, styleUpdates, propUpdates } = event.data;

      if (type === 'zoom' && direction) {
        zoom(direction);
      } else if (type === 'componentSelected' && component) {
        setSelectedComponentId(component.id);
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
            updateComponentProps(payload.componentId, payload.data);
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
            updateComponentStyleProps(payload.componentId, payload.data);
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
  }, [zoom, setSelectedComponentId, componentTree, updateComponentStyleProps, updateComponentProps]);

  useEffect(() => {
    // 发送更新到画布iframe
    iframeRef.current!.contentWindow!.postMessage({ name: 'update', componentTree, root }, '*');

    // 使用新的消息系统发送更新
    sendMessageToCanvas('UPDATE_COMPONENT_TREE', { componentTree, root });
  }, [root, componentTree]);

  // 添加一个处理组件添加的公共函数
  const handleAddComponent = useCallback(
    (compName: string) => {
      addComponent({
        compName,
      });
    },
    [addComponent],
  );

  const onUpdateStyle = useCallback((styleUpdates) => {
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
        <div className="sidebar">
          <div className="sidebar-header">
            <h3 className={`${editorStyles.layout.header} ${editorStyles.text.primary}`}>组件库</h3>
            <div className={editorStyles.layout.divider}></div>
          </div>

          <div className={editorStyles.layout.sidebar}>
            <DropdownMenu>
              <DropdownMenuTrigger className={`${editorStyles.dropdown.trigger} ${editorStyles.text.primary}`}>
                <span>基础组件</span>
                <ChevronRightIcon className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className={editorStyles.dropdown.content}>
                <DropdownMenuItem
                  className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}
                  onSelect={() => handleAddComponent('Text')}
                >
                  <span className="ml-2">文本组件</span>
                </DropdownMenuItem>
                <DropdownMenuItem className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`} onSelect={() => handleAddComponent('Pic')}>
                  <span className="ml-2">图片组件</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={`${editorStyles.dropdown.trigger} ${editorStyles.text.primary}`}>
                <span>布局组件</span>
                <ChevronRightIcon className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className={editorStyles.dropdown.content}>
                <DropdownMenuItem
                  className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}
                  onSelect={() => console.log('添加容器组件')}
                >
                  <span className="ml-2">容器</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}
                  onSelect={() => console.log('添加栅格组件')}
                >
                  <span className="ml-2">栅格</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className={editorStyles.layout.divider}></div>

          <div className="px-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className={`${editorStyles.form.button} ${editorStyles.form.buttonPrimary}`} onClick={() => console.log('添加自定义组件')}>
                    <span>添加自定义组件</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs bg-gray-900 text-white rounded">添加更多组件</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
