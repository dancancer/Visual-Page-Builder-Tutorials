type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventCallback[]>;

  constructor() {
    this.events = new Map();
  }

  on(eventName: string, callback: EventCallback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)?.push(callback);
  }

  emit(eventName: string, ...args: any[]) {
    if (this.events.has(eventName)) {
      this.events.get(eventName)?.forEach(callback => callback(...args));
    }
  }

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