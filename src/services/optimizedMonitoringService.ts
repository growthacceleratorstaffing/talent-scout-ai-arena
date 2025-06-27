
class OptimizedMonitoringService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds cache
  private activeRequests = new Map<string, Promise<any>>();

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? (Date.now() - cached.timestamp) < this.CACHE_TTL : false;
  }

  private getCachedData(key: string) {
    return this.cache.get(key)?.data;
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async checkServiceHealth() {
    const cacheKey = 'health-check';
    
    // Return cached data if available and valid
    if (this.isCacheValid(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // Prevent duplicate requests
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey);
    }

    const healthCheck = this.performHealthCheck();
    this.activeRequests.set(cacheKey, healthCheck);

    try {
      const result = await healthCheck;
      this.setCachedData(cacheKey, result);
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async performHealthCheck() {
    const startTime = Date.now();
    const services: Record<string, string> = {};

    try {
      // Lightweight health check - just ping the server
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      services.server = response.ok ? 'connected' : 'failed';
    } catch (error) {
      services.server = 'failed';
    }

    // Check client-side storage (lightweight)
    try {
      localStorage.setItem('health-test', 'ok');
      localStorage.removeItem('health-test');
      services.storage = 'connected';
    } catch {
      services.storage = 'failed';
    }

    const responseTime = Date.now() - startTime;

    return {
      timestamp: new Date().toISOString(),
      responseTime,
      services,
      errors: [],
      autoCorrections: []
    };
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    this.cache.clear();
    this.activeRequests.clear();
  }
}

export const optimizedMonitoringService = new OptimizedMonitoringService();
