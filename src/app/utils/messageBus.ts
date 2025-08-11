// 消息总线系统，用于处理主框架和画布iframe之间的通信
export type MessageType =
  | 'UPDATE_COMPONENT_TREE'
  | 'UPDATE_COMPONENT_PROPS'
  | 'UPDATE_COMPONENT_STYLE'
  | 'SELECT_COMPONENT'
  | 'ADD_CHILD_COMPONENT'
  | 'ZOOM_CANVAS'
  | 'FONT_CHANGE'
  | 'CANVAS_READY';

export interface AddChildComponentData {
  parentComponentId: number;
  componentType: string;
  componentId: number;
}

import type { ComponentConfig, FontSubSet } from '../common/types';
import React from 'react';

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

// 主框架向画布发送消息
export const sendMessageToCanvas = (
  type: MessageType,
  data: Record<string, unknown> | unknown[] | AddChildComponentData | UpdateComponentTreeData | FontSubSet,
  componentId?: number,
) => {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe[src="/canvas"]');
  if (iframe?.contentWindow) {
    const payload: MessagePayload = {
      type,
      data,
      componentId,
      timestamp: Date.now(),
    };
    iframe.contentWindow.postMessage(payload, '*');
  }
};

// 画布向主框架发送消息
export const sendMessageToParent = (
  type: MessageType,
  data: Record<string, unknown> | unknown[] | AddChildComponentData | UpdateComponentTreeData,
  componentId?: number,
) => {
  if (window.parent) {
    const payload: MessagePayload = {
      type,
      data,
      componentId,
      timestamp: Date.now(),
    };
    window.parent.postMessage(payload, '*');
  }
};

// 监听来自画布的消息（在主框架中使用）
export const listenToCanvasMessages = (callback: (payload: MessagePayload) => void) => {
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data as MessagePayload);
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
};

// 监听来自主框架的消息（在画布中使用）
export const listenToParentMessages = (callback: (payload: MessagePayload) => void) => {
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data as MessagePayload);
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
};
