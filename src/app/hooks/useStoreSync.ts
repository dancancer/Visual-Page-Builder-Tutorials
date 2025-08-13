// 自定义hook用于处理主框架和画布iframe之间的store同步
import { useEffect, useCallback } from 'react';
import { eventBus } from '../utils/eventBus';
import useEditorStore from '../store/editorStore';
import type { ComponentData } from '../common/types';

export const useStoreSync = () => {
  const { componentTree, root, updateComponentProps, updateComponentStyleProps, setSelectedComponentId } = useEditorStore();

  // 发送组件树更新到画布
  const syncComponentTreeToCanvas = useCallback(() => {
    eventBus.emit('updateComponentTree', { componentTree, root });
  }, [componentTree, root]);

  // 发送组件属性更新到画布
  const syncComponentPropsToCanvas = useCallback((componentId: number, props: ComponentData['compProps']) => {
    if (props) {
      eventBus.emit('updateComponentProps', {
        componentId,
        propsUpdates: props as Record<string, number | number[] | string | string[] | undefined>,
      });
    }
  }, []);

  // 发送组件样式更新到画布
  const syncComponentStyleToCanvas = useCallback((componentId: number, style: ComponentData['styleProps']) => {
    if (style) {
      eventBus.emit('updateComponentStyle', { componentId, styleUpdates: style as Record<string, unknown> });
    }
  }, []);

  // 发送组件选择更新到画布
  const syncComponentSelectionToCanvas = useCallback((componentId: number) => {
    eventBus.emit('selectComponent', componentId);
  }, []);

  // 监听来自画布的消息并更新store
  useEffect(() => {
    const handleUpdateComponentProps = (data: { componentId: number; propsUpdates: ComponentData['compProps'] }) => {
      if (data.componentId !== undefined && data.componentId >= 0) {
        updateComponentProps(data.componentId, data.propsUpdates);
      }
    };

    const handleUpdateComponentStyle = (data: { componentId: number; styleUpdates: ComponentData['styleProps'] }) => {
      if (data.componentId !== undefined && data.componentId >= 0) {
        updateComponentStyleProps(data.componentId, data.styleUpdates);
      }
    };

    const handleSelectComponent = (componentId: number) => {
      if (componentId !== undefined) {
        setSelectedComponentId(componentId);
      }
    };

    eventBus.on('updateComponentProps', handleUpdateComponentProps);
    eventBus.on('updateComponentStyle', handleUpdateComponentStyle);
    eventBus.on('selectComponent', handleSelectComponent);

    return () => {
      eventBus.off('updateComponentProps', handleUpdateComponentProps);
      eventBus.off('updateComponentStyle', handleUpdateComponentStyle);
      eventBus.off('selectComponent', handleSelectComponent);
    };
  }, [updateComponentProps, updateComponentStyleProps, setSelectedComponentId]);

  return {
    syncComponentTreeToCanvas,
    syncComponentPropsToCanvas,
    syncComponentStyleToCanvas,
    syncComponentSelectionToCanvas,
  };
};
