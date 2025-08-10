import { useCallback } from 'react';
import useEditorStore from '../store/editorStore';
import type { ComponentConfig } from '../common/types';

export const useCanvasSync = () => {
  const updateComponentProps = useEditorStore((state) => state.updateComponentProps);

  const syncComponentProps = useCallback(
    (componentId: number, props: ComponentConfig['compProps']) => {
      // 更新本地状态
      updateComponentProps(componentId, props);
      // // 同步到画布
      // sendCanvasMessage('UPDATE_COMPONENT', {
      //   componentId,
      //   props
      // });
    },
    [updateComponentProps],
  );

  return { syncComponentProps };
};
