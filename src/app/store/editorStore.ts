import { create } from 'zustand';

import type { ComponentConfig, ComponentData } from '../common/types';
import { deleteNodeAndChildren } from '../utils/utils';

interface EditorStore {
  switch: boolean;
  root: ComponentData;
  componentTree: Array<ComponentData>;
  componentTypes: ComponentConfig[]; // 新增：组件类型列表
  addComponent: (compName: string, parentId?: number) => void;
  removeComponent: (id: number) => void;
  reorderComponent: (draggedComponentId: number, targetComponentId: number) => void;
  selectedComponentId: number | null;
  setSelectedComponentId: (id: number) => void;
  updateComponentProps: (id: number, newProps: ComponentData['compProps']) => void;
  updateComponentStyleProps: (id: number, newProps: ComponentData['styleProps']) => void;
  addComponentType: (componentType: ComponentConfig) => void; // 新增：添加组件类型的方法
}

const useEditorStore = create<EditorStore>((set, get) => ({
  switch: false,
  root: {
    id: -1,
    compName: 'Wrap',
    compProps: { fontSize: '32px', color: 'red' },
    parentId: null,
    children: [],
  },
  componentTree: [],
  componentTypes: [],
  selectedComponentId: null,
  selectedComponent: null,
  triggerSwitch: () => {
    set((state) => ({ switch: !state.switch }));
  },
  addComponent: (compName: string, parentId?: number) => {
    const { selectedComponentId, componentTree, root, componentTypes } = get();
    // 为新组件添加 id
    const _newComponent: ComponentData = { id: componentTree.length };

    // 初始化组件的默认属性
    const componentType = componentTypes.find((type) => type.config.compName === compName);
    if (componentType && componentType.config?.compProps) {
      const defaultProps: Record<string, unknown> = {};
      componentType.config.compProps.forEach((prop) => {
        defaultProps[prop.key] = prop.defaultValue;
      });
      const { name, compName, isEditable, isContainer } = componentType.config;
      _newComponent.config = {
        name,
        compName,
        isEditable,
        isContainer,
      };
      _newComponent.compProps = {
        ...(defaultProps as Record<string, string | number | number[] | string[] | undefined>),
        ..._newComponent.compProps,
      };
    }

    // 检查是否指定了 parentId
    if (parentId !== undefined && parentId !== null) {
      // 如果指定了 parentId，使用指定的父组件
      _newComponent.parentId = parentId;
      const parentComponentIndex = componentTree.findIndex((item) => item?.id === parentId);
      if (parentComponentIndex !== -1) {
        // 更新父组件的 children 数组
        componentTree[parentComponentIndex]!.children = [...(componentTree[parentComponentIndex]!.children || []), _newComponent.id!];
      } else if (parentId === root.id) {
        // 如果父组件是根组件
        root.children = [...(root.children || []), _newComponent.id!];
        set(() => ({ root: { ...root } }));
      }
    } else {
      // 如果没有指定 parentId，使用原来的逻辑
      const selectedComponent = selectedComponentId ? componentTree[selectedComponentId] : null;
      if (selectedComponent && selectedComponent.config?.isContainer) {
        // 如果选中的组件有插槽，那么新组件的父组件就是选中的组件
        _newComponent.parentId = selectedComponentId;
        const selectedComponentIndex = componentTree.findIndex((item) => item?.id === selectedComponentId);
        componentTree[selectedComponentIndex]!.children = [...(componentTree[selectedComponentIndex]!.children || []), _newComponent.id!];
      } else {
        // 否则，新组件的父组件就是根组件
        _newComponent.parentId = root.id;
        root.children = [...(root.children || []), _newComponent.id!];
        set(() => ({ root: { ...root } }));
      }
    }
    set(() => ({ componentTree: [...componentTree, _newComponent] }));
  },
  removeComponent: (id: number) => {
    const { componentTree } = get();
    const component = componentTree[id];
    if (!component) {
      return;
    }
    let parentComp = componentTree[component.parentId!];
    const newTree = [...componentTree];
    deleteNodeAndChildren(newTree, id);
    if (!parentComp) {
      parentComp = get().root;
      set(() => ({ root: { ...parentComp!, children: parentComp!.children?.filter((item) => item !== id) } }));
    } else {
      newTree[parentComp.id!] = { ...parentComp, children: parentComp!.children?.filter((item) => item !== id) };
      set(() => ({ componentTree: newTree }));
    }
  },
  reorderComponent: (draggedComponentId: number, targetComponentId: number) => {
    const { componentTree, root } = get();
    const newTree = [...componentTree];

    // 获取被拖拽的组件和目标组件
    const draggedComponent = newTree[draggedComponentId];
    const targetComponent = newTree[targetComponentId];

    if (!draggedComponent || !targetComponent) {
      return;
    }

    // 获取被拖拽组件的原始父组件
    const originalParentId = draggedComponent.parentId;
    let originalParentComp;
    if (originalParentId === root.id) {
      originalParentComp = root;
    } else {
      originalParentComp = newTree[originalParentId!];
    }

    // 从原始父组件的 children 中移除被拖拽的组件
    if (originalParentComp) {
      if (originalParentId === root.id) {
        const newRoot = { ...root, children: root.children?.filter((id) => id !== draggedComponentId) };
        set(() => ({ root: newRoot }));
      } else {
        newTree[originalParentId!] = {
          ...originalParentComp,
          children: originalParentComp.children?.filter((id) => id !== draggedComponentId),
        };
      }
    }

    // 将被拖拽的组件添加到目标组件的 children 中
    newTree[targetComponentId] = {
      ...targetComponent,
      children: [...(targetComponent.children || []), draggedComponentId],
    };

    // 更新被拖拽组件的 parentId
    newTree[draggedComponentId] = {
      ...draggedComponent,
      parentId: targetComponentId,
    };

    set(() => ({ componentTree: newTree }));
  },
  setSelectedComponentId: (id: number) => {
    const { componentTree } = get();
    set(() => ({ selectedComponentId: id, selectedComponent: componentTree[id] }));
  },
  updateComponentProps: (id: number, newProps: ComponentData['compProps']) => {
    const { componentTree } = get();
    const newTree = [...componentTree];
    const component = newTree[id];
    if (!component) return;

    newTree[id] = {
      ...component,
      compProps: { ...component.compProps, ...newProps },
    };

    set(() => ({ componentTree: newTree }));
  },
  updateComponentStyleProps: (id: number, newProps: ComponentData['styleProps']) => {
    const { componentTree } = get();
    const newTree = [...componentTree];
    const component = newTree[id];
    if (!component) return;

    newTree[id] = {
      ...component,
      styleProps: { ...component.styleProps, ...newProps },
    };

    set(() => ({ componentTree: newTree }));
  },
  addComponentType: (componentType: ComponentConfig) => {
    set((state) => ({
      componentTypes: [...state.componentTypes, componentType],
    }));
  },
}));

export default useEditorStore;
