
import { useEffect, useCallback, useRef } from 'react';
import { resourceOptimizer } from '@/services/resourceOptimizer';

interface UseResourceOptimizationOptions {
  enableAutoCleanup?: boolean;
  cleanupInterval?: number;
  maxCacheSize?: number;
}

export const useResourceOptimization = (options: UseResourceOptimizationOptions = {}) => {
  const {
    enableAutoCleanup = true,
    cleanupInterval = 300000, // 5 minutes
    maxCacheSize = 50
  } = options;

  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const componentMountTime = useRef(Date.now());

  // Optimized fetch with automatic resource management
  const optimizedFetch = useCallback(async <T>(
    url: string,
    options: RequestInit = {},
    cacheTTL?: number
  ): Promise<T> => {
    return resourceOptimizer.optimizedFetch<T>(url, options, cacheTTL);
  }, []);

  // Debounced function creator
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => {
    return resourceOptimizer.debounce(func, delay);
  }, []);

  // Throttled function creator
  const createThrottledFunction = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ) => {
    return resourceOptimizer.throttle(func, limit);
  }, []);

  // Lazy loading observer
  const createLazyObserver = useCallback((
    callback: IntersectionObserverCallback,
    observerOptions?: IntersectionObserverInit
  ) => {
    return resourceOptimizer.createIntersectionObserver(callback, observerOptions);
  }, []);

  // Get current resource metrics
  const getResourceMetrics = useCallback(() => {
    const metrics = resourceOptimizer.getResourceMetrics();
    const sessionTime = Date.now() - componentMountTime.current;
    
    return {
      ...metrics,
      sessionDuration: sessionTime,
      averageRequestsPerMinute: (metrics.networkRequests / (sessionTime / 60000)) || 0
    };
  }, []);

  // Manual cleanup trigger
  const triggerCleanup = useCallback(() => {
    resourceOptimizer.cleanupMemory();
  }, []);

  useEffect(() => {
    if (enableAutoCleanup) {
      cleanupIntervalRef.current = setInterval(() => {
        resourceOptimizer.cleanupMemory();
      }, cleanupInterval);
    }

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
      resourceOptimizer.cleanup();
    };
  }, [enableAutoCleanup, cleanupInterval]);

  return {
    optimizedFetch,
    createDebouncedFunction,
    createThrottledFunction,
    createLazyObserver,
    getResourceMetrics,
    triggerCleanup
  };
};
