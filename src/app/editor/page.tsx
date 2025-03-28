'use client';

import React, { useCallback, useEffect } from 'react';
import useEditorStore from '../store/editorStore';
import './index.css';
import PropertyPanel from '../innerComponents/PropertyPanel';
// 引入 Ant Design 组件
import { Menu, Button, Divider, Tooltip } from 'antd';
import { FileTextOutlined, PictureOutlined, AppstoreOutlined, LayoutOutlined } from '@ant-design/icons';
import TextComp from '../components/TextComp';
import { ComponentConfig } from '../common/types';
import { PicComp, WrapComp } from '../components';
import { eventBus } from '../utils/eventBus';

const components: ComponentConfig[] = [TextComp, PicComp, WrapComp];

function Page() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const canvasWraperRef = React.useRef<HTMLDivElement>(null);
  const zoomRatioRef = React.useRef<HTMLDivElement>(null);
  const zoomRatio = React.useRef(0.5);
  const { root, componentTree, updateComponentStyleProps, setSelectedComponentId, addComponent, addComponentType } = useEditorStore((state) => state);

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
    (deltaY: number) => {
      if (deltaY < 0) {
        console.log('放大...', deltaY);
        zoomRatio.current = zoomRatio.current * (1 - deltaY * 0.01);
      } else if (deltaY > 0) {
        zoomRatio.current = zoomRatio.current * (1 - deltaY * 0.01);
        console.log('缩小...', deltaY);
      }
      canvasRef.current!.style.transform = `scale(${zoomRatio.current})`;
      canvasWraperRef.current!.style.width = `${1440 * zoomRatio.current + 400}px`;
      canvasWraperRef.current!.style.height = `${1024 * zoomRatio.current + 400}px`;
      zoomRatioRef.current!.innerText = `${Math.round(zoomRatio.current * 100)}%`;
      document.dispatchEvent(new Event('canvas-zoom'));
    },
    [zoomRatio],
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, deltaY, component, componentId, styleUpdates } = event.data;

      if (type === 'zoom' && deltaY) {
        zoom(deltaY);
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
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener(
      'wheel',
      function (event: WheelEvent) {
        if (!event.deltaY || !event.ctrlKey) {
          return;
        }
        event.preventDefault();
        zoom(event.deltaY);
        return false;
      },
      { passive: false },
    );

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [zoom, setSelectedComponentId, componentTree, updateComponentStyleProps]);

  useEffect(() => {
    iframeRef.current!.contentWindow!.postMessage({ name: 'update', componentTree, root }, '*');
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

  // 定义菜单项
  const menuItems = [
    {
      key: 'basic',
      icon: <AppstoreOutlined />,
      label: '基础组件',
      children: [
        {
          key: 'Text', // 直接使用组件名称作为key
          icon: <FileTextOutlined />,
          label: '文本组件',
        },
        {
          key: 'Pic', // 直接使用组件名称作为key
          icon: <PictureOutlined />,
          label: '图片组件',
        },
      ],
    },
    {
      key: 'layout',
      icon: <LayoutOutlined />,
      label: '布局组件',
      children: [
        {
          key: 'container',
          label: '容器',
        },
        {
          key: 'grid',
          label: '栅格',
        },
      ],
    },
  ];

  return (
    <div className="editor">
      <div className="navbar">顶部导航+工具栏</div>
      <div className="main-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3 style={{ padding: '16px', margin: 0 }}>组件库</h3>
            <Divider style={{ margin: '0 0 8px 0' }} />
          </div>

          <Menu
            mode="inline"
            style={{ borderRight: 0 }}
            defaultOpenKeys={['basic']}
            items={menuItems}
            onClick={(info) => {
              // 直接使用key作为组件名称
              if (['Text', 'Pic'].includes(info.key)) {
                handleAddComponent(info.key);
              }
            }}
          />

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ padding: '0 16px' }}>
            <Tooltip title="添加更多组件">
              <Button type="primary" icon={<AppstoreOutlined />} block>
                添加自定义组件
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="canvas-container ">
          <div className=" zoom-ratio" ref={zoomRatioRef}>{`${Math.round(zoomRatio.current * 100)}%`}</div>
          <div
            className=" p-[200px]"
            style={{
              width: `${1440 * zoomRatio.current + 400}px`,
              height: `${1024 * zoomRatio.current + 400}px`,
            }}
            ref={canvasWraperRef}
          >
            <div
              className=" canvas origin-top-left h-[1024px] w-[1440px]"
              style={{
                transform: `scale(${zoomRatio.current})`,
              }}
              ref={canvasRef}
            >
              <iframe className=" h-full w-full" src="/canvas" ref={iframeRef}></iframe>
            </div>
          </div>
        </div>
        <div className="properties">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}

export default Page;
