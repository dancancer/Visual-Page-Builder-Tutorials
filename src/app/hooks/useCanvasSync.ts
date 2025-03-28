import { useCallback } from 'react';
import { sendCanvasMessage } from '../utils/canvasMessage';
import useEditorStore from '../store/editorStore';

export const useCanvasSync = () => {
  const updateComponentProps = useEditorStore((state) => state.updateComponentProps);

  const syncComponentProps = useCallback(
    (componentId: number, props: any) => {
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
