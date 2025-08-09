// 自定义hook用于处理主框架和画布iframe之间的store同步
import { useEffect, useCallback } from 'react';
import { sendMessageToCanvas, listenToCanvasMessages, MessagePayload } from '../utils/messageBus';
import useEditorStore from '../store/editorStore';

export const useStoreSync = () => {
  const { componentTree, root, updateComponentProps, updateComponentStyleProps, setSelectedComponentId } = useEditorStore();

  // 发送组件树更新到画布
  const syncComponentTreeToCanvas = useCallback(() => {
    sendMessageToCanvas('UPDATE_COMPONENT_TREE', { componentTree, root });
  }, [componentTree, root]);

  // 发送组件属性更新到画布
  const syncComponentPropsToCanvas = useCallback((componentId: number, props: any) => {
    sendMessageToCanvas('UPDATE_COMPONENT_PROPS', props, componentId);
  }, []);

  // 发送组件样式更新到画布
  const syncComponentStyleToCanvas = useCallback((componentId: number, style: any) => {
    sendMessageToCanvas('UPDATE_COMPONENT_STYLE', style, componentId);
  }, []);

  // 发送组件选择更新到画布
  const syncComponentSelectionToCanvas = useCallback((componentId: number) => {
    sendMessageToCanvas('SELECT_COMPONENT', {}, componentId);
  }, []);

  // 监听来自画布的消息并更新store
  useEffect(() => {
    const handleMessage = (payload: MessagePayload) => {
      switch (payload.type) {
        case 'UPDATE_COMPONENT_PROPS':
          if (payload.componentId !== undefined && payload.componentId >= 0) {
            updateComponentProps(payload.componentId, payload.data);
          }
          break;
        case 'UPDATE_COMPONENT_STYLE':
          if (payload.componentId !== undefined && payload.componentId >= 0) {
            updateComponentStyleProps(payload.componentId, payload.data);
          }
          break;
        case 'SELECT_COMPONENT':
          if (payload.componentId !== undefined) {
            setSelectedComponentId(payload.componentId);
          }
          break;
      }
    };

    const unsubscribe = listenToCanvasMessages(handleMessage);
    return unsubscribe;
  }, [updateComponentProps, updateComponentStyleProps, setSelectedComponentId]);

  return {
    syncComponentTreeToCanvas,
    syncComponentPropsToCanvas,
    syncComponentStyleToCanvas,
    syncComponentSelectionToCanvas,
  };
};