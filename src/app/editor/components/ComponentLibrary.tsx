'use client';

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon, ImageIcon, TextIcon, LayoutIcon, ContainerIcon, DashboardIcon } from '@radix-ui/react-icons';
import useEditorStore from '../../store/editorStore';

const ComponentLibrary = () => {
  const addComponent = useEditorStore((state) => state.addComponent);

  const handleAddComponent = (compName: string) => {
    addComponent(compName);
  };

  return (
    <div className="w-full">
      <Accordion.Root type="single" defaultValue="item-1" collapsible className="w-full">
        <Accordion.Item value="item-1" className="border-b border-gray-200">
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md px-4">
              <span className="flex items-center">
                <DashboardIcon className="w-4 h-4 mr-2" />
                基础组件
              </span>
              <ChevronDownIcon className="w-4 h-4 transition-transform duration-200 ease-out accordion-state-open:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:accordion-up data-[state=open]:accordion-down">
            <div className="flex items-center justify-between ml-2 p-2 mb-2 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-100">
              <div
                className="flex items-center"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('componentType', 'Text');
                }}
              >
                <TextIcon className="w-4 h-4" />
                <span className="ml-2">文本组件</span>
              </div>
              <button className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600" onClick={() => handleAddComponent('Text')}>
                添加
              </button>
            </div>
            <div className="flex items-center justify-between ml-2 p-2 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-100">
              <div
                className="flex items-center"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('componentType', 'Pic');
                }}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="ml-2">图片组件</span>
              </div>
              <button className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600" onClick={() => handleAddComponent('Pic')}>
                添加
              </button>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="item-2" className="border-b border-gray-200">
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-left text-gray-700 bg-gray-50 hover:bg-gray-100 px-4">
              <span className="flex items-center">
                <LayoutIcon className="w-4 h-4 mr-2" />
                布局组件
              </span>
              <ChevronDownIcon className="w-4 h-4 transition-transform duration-200 ease-out accordion-state-open:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:accordion-up data-[state=open]:accordion-down">
            <div className="flex items-center justify-between ml-2 p-2 mb-2 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-100">
              <div
                className="flex items-center"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('componentType', 'Wrap');
                }}
              >
                <ContainerIcon className="w-4 h-4" />
                <span className="ml-2">容器</span>
              </div>
              <button className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600" onClick={() => handleAddComponent('Wrap')}>
                添加
              </button>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default ComponentLibrary;
