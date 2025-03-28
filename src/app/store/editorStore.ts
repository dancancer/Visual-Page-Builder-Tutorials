import { create } from 'zustand';

import type { ComponentConfig } from '../common/types';
import { deleteNodeAndChildren } from '../utils/utils';

interface EditorStore {
  switch: boolean;
  root: ComponentConfig;
  componentTree: Array<ComponentConfig | undefined>;
  componentTypes: ComponentConfig[]; // 新增：组件类型列表
  addComponent: (newComponent: ComponentConfig) => void;
  removeComponent: (id: number) => void;
  selectedComponentId: number | null;
  setSelectedComponentId: (id: number) => void;
  updateComponentProps: (id: number, newProps: ComponentConfig['compProps']) => void;
  updateComponentStyleProps: (id: number, newProps: ComponentConfig['styleProps']) => void;
  addComponentType: (componentType: ComponentConfig) => void; // 新增：添加组件类型的方法
}

const useEditorStore = create<EditorStore>((set, get) => ({
  switch: false,
  root: {
    id: -1,
    compName: 'Wrap',
    styleProps: { width: '100%', height: '100%' },
    compProps: { fontSize: '32px', color: 'red' },
    parentId: null,
    children: [],
    hasSlot: true,
  },
  componentTree: [],
  componentTypes: [],
  selectedComponentId: null,
  triggerSwitch: () => {
    set((state) => ({ switch: !state.switch }));
  },
  addComponent: (newComponet: ComponentConfig) => {
    const { selectedComponentId, componentTree, root } = get();
    // 为新组件添加 id
    const _newComponet = { ...newComponet, id: componentTree.length };
    const selectedComponent = selectedComponentId ? componentTree[selectedComponentId] : null;
    if (selectedComponent && selectedComponent.hasSlot) {
      // 如果选中的组件有插槽，那么新组件的父组件就是选中的组件
      _newComponet.parentId = selectedComponentId;
      const selectedComponentIndex = componentTree.findIndex((item) => item?.id === selectedComponentId);
      componentTree[selectedComponentIndex]!.children = [...(componentTree[selectedComponentIndex]!.children || []), _newComponet.id];
    } else {
      // 否则，新组件的父组件就是根组件
      _newComponet.parentId = root.id;
      root.children = [...(root.children || []), _newComponet.id];
      set(() => ({ root: { ...root } }));
    }
    set(() => ({ componentTree: [...componentTree, _newComponet] }));
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
  setSelectedComponentId: (id: number) => {
    set(() => ({ selectedComponentId: id }));
  },
  updateComponentProps: (id: number, newProps: ComponentConfig['compProps']) => {
    const { componentTree } = get();
    const newTree = [...componentTree];
    const component = newTree[id];
    if (!component) return;

    newTree[id] = {
      ...component,
      compProps: newProps,
    };

    set(() => ({ componentTree: newTree }));
  },
  updateComponentStyleProps: (id: number, newProps: ComponentConfig['styleProps']) => {
    const { componentTree } = get();
    const newTree = [...componentTree];
    const component = newTree[id];
    if (!component) return;

    newTree[id] = {
      ...component,
      styleProps: newProps,
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
