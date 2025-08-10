'use client';

import React, { useState, useCallback } from 'react';
import { ComponentConfig } from '../common/types';
import useEditorStore from '../store/editorStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './uiComponents/Tabs';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from './uiComponents/ContextMenu';
import { editorStyles } from '../styles/editorStyles';
import ComponentLibrary from './ComponentLibrary';
import { sendMessageToCanvas } from '../utils/messageBus';

interface TreeNodeProps {
  component: ComponentConfig;
  componentTree: (ComponentConfig | undefined)[];
  level?: number;
  onDragStart: (e: React.DragEvent, componentId: number) => void;
  onDragOver: (e: React.DragEvent, componentId: number) => void;
  onDrop: (e: React.DragEvent, targetComponentId: number) => void;
  onSelectComponent: (componentId: number) => void;
  onDeleteComponent: (componentId: number) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  component,
  componentTree,
  level = 0,
  onDragStart,
  onDragOver,
  onDrop,
  onSelectComponent,
  onDeleteComponent,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = component.children && component.children.length > 0;
  const { selectedComponentId } = useEditorStore((state) => state);
  
  const handleDelete = (e: Event) => {
    e.stopPropagation();
    onDeleteComponent(component.id!);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectComponent(component.id!);
  };

  return (
    <div className="w-full">
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
              level > 0 ? 'ml-4' : ''
            } ${selectedComponentId === component.id ? 'bg-blue-100 border-l-4 border-blue-500 pl-1' : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            draggable
            onDragStart={(e) => onDragStart(e, component.id!)}
            onDragOver={(e) => onDragOver(e, component.id!)}
            onDrop={(e) => onDrop(e, component.id!)}
            onClick={handleSelect}
          >
            {hasChildren && (
              <button
                className="mr-1 w-4 h-4 flex items-center justify-center text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? '−' : '+'}
              </button>
            )}
            {!hasChildren && <span className="mr-1 w-4 h-4"></span>}
            <span className="ml-1 text-sm">
              {component.config?.name || component.compName} {component.id}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className={editorStyles.dropdown.content}>
          <ContextMenuItem
            className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}
            onSelect={handleDelete}
          >
            删除组件
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      {hasChildren && isExpanded && (
        <div className="w-full">
          {component.children!.map((childId) => {
            const childComponent = componentTree[childId];
            if (!childComponent) return null;
            return (
              <TreeNode
                key={childComponent.id}
                component={childComponent}
                componentTree={componentTree}
                level={level + 1}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onSelectComponent={onSelectComponent}
                onDeleteComponent={onDeleteComponent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const ComponentTreePanel: React.FC = () => {
  const { root, componentTree, removeComponent, reorderComponent, setSelectedComponentId } = useEditorStore((state) => state);
  const [activeTab, setActiveTab] = useState('tree');

  const handleDragStart = useCallback((e: React.DragEvent, componentId: number) => {
    e.dataTransfer.setData('componentId', componentId.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetComponentId: number) => {
    e.preventDefault();
    const draggedComponentId = parseInt(e.dataTransfer.getData('componentId'));
    
    // 防止组件拖拽到自己身上
    if (draggedComponentId === targetComponentId) return;
    
    // 重新排序组件
    reorderComponent(draggedComponentId, targetComponentId);
  }, [reorderComponent]);

  const handleSelectComponent = useCallback((componentId: number) => {
    setSelectedComponentId(componentId);
    // 通知画布选中组件
    sendMessageToCanvas('SELECT_COMPONENT', {}, componentId);
  }, [setSelectedComponentId]);

  const handleDeleteComponent = useCallback((componentId: number) => {
    removeComponent(componentId);
  }, [removeComponent]);

  return (
    <div className={`${editorStyles.container.panel} ${editorStyles.text.primary}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={editorStyles.tabs.list}>
          <TabsTrigger
            value="tree"
            className={`${editorStyles.tabs.trigger} ${editorStyles.text.secondary} data-[state=active]:${editorStyles.text.primary}`}
          >
            页面结构
          </TabsTrigger>
          <TabsTrigger
            value="library"
            className={`${editorStyles.tabs.trigger} ${editorStyles.text.secondary} data-[state=active]:${editorStyles.text.primary}`}
          >
            组件库
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tree">
          <div className="mt-2">
            {root && (
              <TreeNode
                component={root}
                componentTree={componentTree}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onSelectComponent={handleSelectComponent}
                onDeleteComponent={handleDeleteComponent}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="library">
          <div className="mt-2">
            <ComponentLibrary />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentTreePanel;