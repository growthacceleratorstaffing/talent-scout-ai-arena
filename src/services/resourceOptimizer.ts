
interface ResourceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  cacheHitRate: number;
}

class ResourceOptimizer {
  private metrics: ResourceMetrics = {
    memoryUsage: 0,
    cpuUsage: 0,
    networkRequests: 0,
    cacheHitRate: 0
  };

  private requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private intervalIds = new Set<NodeJS.Timeout>();
  private observerInstances = new Set<IntersectionObserver>();

  // Optimize network requests with intelligent caching
  async optimizedFetch<T>(
    url: string,
    options: RequestInit = {},
    cacheTTL = 300000 // 5 minutes default
  ): Promise<T> {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cached = this.requestCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.metrics.cacheHitRate++;
      return cached.data;
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      this.metrics.networkRequests++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      this.requestCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL
      });

      return data;
    } catch (error) {
      // Return cached data if available during errors
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  // Debounced function executor to reduce redundant calls
  debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
      this.intervalIds.add(timeoutId);
    };
  }

  // Throttled function executor for rate limiting
  throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        const timeoutId = setTimeout(() => inThrottle = false, limit);
        this.intervalIds.add(timeoutId);
      }
    };
  }

  // Lazy loading for images and components
  createIntersectionObserver(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, options);
    this.observerInstances.add(observer);
    return observer;
  }

  // Memory management
  cleanupMemory() {
    // Clear expired cache entries
    const now = Date.now();
    for (const [key, entry] of this.requestCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.requestCache.delete(key);
      }
    }

    // Limit cache size
    if (this.requestCache.size > 100) {
      const entries = Array.from(this.requestCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 20% of entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.requestCache.delete(entries[i][0]);
      }
    }
  }

  // Resource monitoring
  getResourceMetrics(): ResourceMetrics {
    return { ...this.metrics };
  }

  // Cleanup all resources
  cleanup() {
    // Clear all intervals
    this.intervalIds.forEach(id => clearTimeout(id));
    this.intervalIds.clear();

    // Disconnect all observers
    this.observerInstances.forEach(observer => observer.disconnect());
    this.observerInstances.clear();

    // Clear cache
    this.requestCache.clear();

    // Reset metrics
    this.metrics = {
      memoryUsage: 0,
      cpuUsage: 0,
      networkRequests: 0,
      cacheHitRate: 0
    };
  }

  // Start automatic cleanup interval
  startAutoCleanup(intervalMs = 300000) { // 5 minutes
    const cleanupInterval = setInterval(() => {
      this.cleanupMemory();
    }, intervalMs);
    
    this.intervalIds.add(cleanupInterval);
    return cleanupInterval;
  }
}

export const resourceOptimizer = new ResourceOptimizer();

// Auto-start cleanup
resourceOptimizer.startAutoCleanup();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    resourceOptimizer.cleanup();
  });
}
