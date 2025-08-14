import mitt from 'mitt';
import { AddChildComponentData } from './messageBus';
import { ComponentData } from '../common/types';

type EventBusEvents = {
  updateComponentStyle: { componentId: number; styleUpdates: Record<string, unknown> };
  updateComponentProps: { componentId: number; propsUpdates: Record<string, number | number[] | string | string[] | undefined> };
  addComponent: { componentType: string; position: { x: number; y: number }; parentComponentId?: number };
  addChildComponent: AddChildComponentData;
  zoomCanvas: string;
  updateComponentTree: { componentTree: ComponentData[]; root: ComponentData };
  selectComponent: number;
};

export const eventBus = mitt<EventBusEvents>();
