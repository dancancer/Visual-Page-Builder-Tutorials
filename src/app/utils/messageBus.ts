import type { ComponentConfig, FontSubSet } from '../common/types';
import React from 'react';
// 消息总线系统，用于处理组件间的通信
export type MessageType =
  | 'UPDATE_COMPONENT_TREE'
  | 'UPDATE_COMPONENT_PROPS'
  | 'UPDATE_COMPONENT_STYLE'
  | 'SELECT_COMPONENT'
  | 'ADD_CHILD_COMPONENT'
  | 'ZOOM_CANVAS'
  | 'FONT_CHANGE'
  | 'CANVAS_READY'
  | 'ADD_COMPONENT';

export interface AddChildComponentData {
  parentComponentId: number;
  componentType: string;
  componentId?: number; // 不存在时则需要新创建一个 componentType 的组件
}

interface UpdateComponentTreeData {
  componentTree: ComponentConfig[];
  root: ComponentConfig;
}

export interface MessagePayload {
  type: MessageType;
  data: Record<string, unknown> | unknown[] | AddChildComponentData | UpdateComponentTreeData | React.CSSProperties | FontSubSet;
  componentId?: number;
  timestamp: number;
}

// 监听消息的通用函数
export const listenToMessages = (callback: (payload: MessagePayload) => void) => {
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data as MessagePayload);
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
};
