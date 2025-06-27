
interface CostMetrics {
  networkRequests: number;
  cacheHits: number;
  resourcesLoaded: number;
  estimatedCost: number;
  savingsFromOptimization: number;
}

class CostOptimizationService {
  private metrics: CostMetrics = {
    networkRequests: 0,
    cacheHits: 0,
    resourcesLoaded: 0,
    estimatedCost: 0,
    savingsFromOptimization: 0
  };

  private readonly COST_PER_REQUEST = 0.0001; // Estimated cost per API request
  private readonly COST_PER_MB = 0.01; // Estimated cost per MB transferred

  // Track network request costs
  trackRequest(size: number = 1024) { // Default 1KB
    this.metrics.networkRequests++;
    const requestCost = this.COST_PER_REQUEST + (size / 1024 / 1024) * this.COST_PER_MB;
    this.metrics.estimatedCost += requestCost;
  }

  // Track cache hits (cost savings)
  trackCacheHit(size: number = 1024) {
    this.metrics.cacheHits++;
    const savedCost = this.COST_PER_REQUEST + (size / 1024 / 1024) * this.COST_PER_MB;
    this.metrics.savingsFromOptimization += savedCost;
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.networkRequests + this.metrics.cacheHits);

    if (cacheHitRate < 0.3) {
      recommendations.push('Increase cache duration to reduce API calls');
    }

    if (this.metrics.networkRequests > 100) {
      recommendations.push('Implement request batching to reduce network overhead');
    }

    if (this.metrics.resourcesLoaded > 50) {
      recommendations.push('Enable lazy loading for non-critical resources');
    }

    if (recommendations.length === 0) {
      recommendations.push('Resource usage is well optimized');
    }

    return recommendations;
  }

  // Get cost analysis
  getCostAnalysis() {
    const totalPotentialCost = this.metrics.estimatedCost + this.metrics.savingsFromOptimization;
    const optimizationEfficiency = totalPotentialCost > 0 
      ? (this.metrics.savingsFromOptimization / totalPotentialCost) * 100 
      : 0;

    return {
      ...this.metrics,
      optimizationEfficiency: Math.round(optimizationEfficiency),
      recommendations: this.getOptimizationRecommendations()
    };
  }

  // Reset metrics
  reset() {
    this.metrics = {
      networkRequests: 0,
      cacheHits: 0,
      resourcesLoaded: 0,
      estimatedCost: 0,
      savingsFromOptimization: 0
    };
  }
}

export const costOptimizationService = new CostOptimizationService();
