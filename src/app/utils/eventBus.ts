interface EventMap {
  'updateComponentStyle': (componentId: number, styleUpdates: Record<string, string>) => void;
  'updateComponentProps': (componentId: number, propsUpdates: Record<string, number | number[] | string | string[] | undefined>) => void;
}

type EventCallback<T extends unknown[] = unknown[]> = (...args: T) => void;

class EventBus {
  private events: Map<string, EventCallback[]>;

  constructor() {
    this.events = new Map();
  }

  on<K extends keyof EventMap>(eventName: K, callback: EventMap[K]): void;
  on<T extends unknown[]>(eventName: string, callback: EventCallback<T>): void;
  on(eventName: string, callback: EventCallback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)?.push(callback);
  }

  emit<K extends keyof EventMap>(eventName: K, ...args: Parameters<EventMap[K]>): void;
  emit<T extends unknown[]>(eventName: string, ...args: T): void;
  emit(eventName: string, ...args: unknown[]) {
    if (this.events.has(eventName)) {
      this.events.get(eventName)?.forEach(callback => callback(...args));
    }
  }

  off<K extends keyof EventMap>(eventName: K, callback: EventMap[K]): void;
  off<T extends unknown[]>(eventName: string, callback: EventCallback<T>): void;
  off(eventName: string, callback: EventCallback) {
    if (this.events.has(eventName)) {
      const callbacks = this.events.get(eventName) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

export const eventBus = new EventBus();