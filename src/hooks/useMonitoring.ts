
import { useState, useEffect, useCallback } from 'react';
import { monitoringService, HealthMetrics } from '@/services/monitoringService';
import { useToast } from '@/hooks/use-toast';

export const useMonitoring = (autoStart = false) => {
  const [healthStatus, setHealthStatus] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoMonitoringActive, setAutoMonitoringActive] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const metrics = await monitoringService.checkServiceHealth();
      setHealthStatus(metrics);
      
      // Show toast for errors or auto-corrections
      if (metrics.errors && metrics.errors.length > 0) {
        toast({
          title: "Health check warnings",
          description: `${metrics.errors.length} issues detected`,
          variant: "destructive"
        });
      }
      
      if (metrics.autoCorrections && metrics.autoCorrections.length > 0) {
        toast({
          title: "Auto-corrections applied",
          description: `${metrics.autoCorrections.length} issues were automatically fixed`
        });
      }
      
      return metrics;
    } catch (error) {
      await monitoringService.logEvent({
        level: 'error',
        service: 'health-hook',
        message: 'Health check failed in hook',
        metadata: { error }
      });
      
      toast({
        title: "Health check failed",
        description: "Failed to check system health",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startAutoMonitoring = useCallback((intervalMs = 60000) => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Run initial check
    checkHealth();

    // Set up interval
    const newIntervalId = setInterval(checkHealth, intervalMs);
    setIntervalId(newIntervalId);
    setAutoMonitoringActive(true);

    monitoringService.logEvent({
      level: 'info',
      service: 'health-hook',
      message: 'Auto-monitoring started',
      metadata: { intervalMs }
    });

    return newIntervalId;
  }, [checkHealth, intervalId]);

  const stopAutoMonitoring = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setAutoMonitoringActive(false);

      monitoringService.logEvent({
        level: 'info',
        service: 'health-hook',
        message: 'Auto-monitoring stopped'
      });
    }
  }, [intervalId]);

  useEffect(() => {
    if (autoStart) {
      startAutoMonitoring();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoStart, startAutoMonitoring]);

  return {
    healthStatus,
    isLoading,
    autoMonitoringActive,
    checkHealth,
    startAutoMonitoring,
    stopAutoMonitoring
  };
};
