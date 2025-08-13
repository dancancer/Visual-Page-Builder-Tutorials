import mitt from 'mitt';
import { AddChildComponentData } from './messageBus';

type EventBusEvents = {
  updateComponentStyle: { componentId: number; styleUpdates: Record<string, unknown> };
  updateComponentProps: { componentId: number; propsUpdates: Record<string, number | number[] | string | string[] | undefined> };
  componentSelected: any;
  addComponent: { componentType: string; position: { x: number; y: number }; parentComponentId?: number };
  addChildComponent: AddChildComponentData;
  zoomCanvas: string;
  updateComponentTree: { componentTree: any[]; root: any };
  selectComponent: number;
  addComponentType: any;
};

export const eventBus = mitt<EventBusEvents>();
