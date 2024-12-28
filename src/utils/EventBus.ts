class EventBus {
  events: Record<string, Set<(...args: any[]) => void>> = {};

  on(eventName: string, cb: (...args: any[]) => void) {
    (this.events[eventName] ??= new Set()).add(cb);
  }

  emit(eventName: string, ...args: any[]) {
    this.events[eventName]?.forEach(cb => cb(...args));
  }
}

export const eventBus = new EventBus();