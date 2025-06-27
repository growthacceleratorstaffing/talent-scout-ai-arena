
class ResourceManager {
  private timers = new Set<NodeJS.Timeout>();
  private intervals = new Set<NodeJS.Timeout>();
  private abortControllers = new Set<AbortController>();

  addTimer(timer: NodeJS.Timeout) {
    this.timers.add(timer);
    return timer;
  }

  addInterval(interval: NodeJS.Timeout) {
    this.intervals.add(interval);
    return interval;
  }

  addAbortController(controller: AbortController) {
    this.abortControllers.add(controller);
    return controller;
  }

  cleanup() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Abort all ongoing requests
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Cleanup when page is about to unload
  setupAutoCleanup() {
    const handleBeforeUnload = () => this.cleanup();
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      this.cleanup();
    };
  }
}

export const resourceManager = new ResourceManager();
