
import { resourceOptimizer } from './resourceOptimizer';

class OptimizedMonitoringService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // Increased to 60 seconds for cost efficiency
  private activeRequests = new Map<string, Promise<any>>();
  private healthCheckCount = 0;
  private maxHealthChecks = 100; // Limit health checks per session

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? (Date.now() - cached.timestamp) < this.CACHE_TTL : false;
  }

  private getCachedData(key: string) {
    return this.cache.get(key)?.data;
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Limit cache size for memory efficiency
    if (this.cache.size > 20) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  async checkServiceHealth() {
    // Rate limiting to prevent excessive API calls
    if (this.healthCheckCount >= this.maxHealthChecks) {
      console.warn('Health check limit reached for this session');
      return this.getCachedData('health-check') || this.getDefaultHealthData();
    }

    const cacheKey = 'health-check';
    
    // Return cached data if available and valid
    if (this.isCacheValid(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // Prevent duplicate requests
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey);
    }

    const healthCheck = this.performOptimizedHealthCheck();
    this.activeRequests.set(cacheKey, healthCheck);

    try {
      const result = await healthCheck;
      this.setCachedData(cacheKey, result);
      this.healthCheckCount++;
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async performOptimizedHealthCheck() {
    const startTime = Date.now();
    const services: Record<string, string> = {};

    try {
      // Direct fetch to health endpoint to avoid JSON parsing issues
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          await response.json(); // Validate it's actually JSON
          services.server = 'connected';
        } else {
          services.server = 'failed';
        }
      } else {
        services.server = 'failed';
      }
    } catch (error) {
      console.warn('Health check failed:', error);
      services.server = 'failed';
    }

    // Lightweight client-side checks
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('health-test', 'ok');
        localStorage.removeItem('health-test');
        services.storage = 'connected';
      }
    } catch {
      services.storage = 'failed';
    }

    // Check memory usage (lightweight)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      services.memory = memInfo.usedJSHeapSize < memInfo.jsHeapSizeLimit * 0.8 ? 'connected' : 'degraded';
    } else {
      services.memory = 'connected';
    }

    const responseTime = Date.now() - startTime;

    return {
      timestamp: new Date().toISOString(),
      responseTime,
      services,
      errors: [],
      autoCorrections: [],
      resourceMetrics: resourceOptimizer.getResourceMetrics()
    };
  }

  private getDefaultHealthData() {
    return {
      timestamp: new Date().toISOString(),
      responseTime: 0,
      services: {
        server: 'unknown',
        storage: 'connected',
        memory: 'connected'
      },
      errors: ['Using cached data - health check limit reached'],
      autoCorrections: []
    };
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    this.cache.clear();
    this.activeRequests.clear();
    this.healthCheckCount = 0;
  }

  // Get resource usage statistics
  getResourceStats() {
    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size,
      healthCheckCount: this.healthCheckCount,
      resourceMetrics: resourceOptimizer.getResourceMetrics()
    };
  }
}

export const optimizedMonitoringService = new OptimizedMonitoringService();
