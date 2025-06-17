
import { supabase } from '@/integrations/supabase/client';

export interface HealthMetrics {
  responseTime: number;
  timestamp: string;
  services: Record<string, 'connected' | 'failed' | 'degraded'>;
  errors?: string[];
  autoCorrections?: string[];
}

export interface MonitoringLog {
  id?: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  service: string;
  message: string;
  metadata?: Record<string, any>;
  auto_corrected?: boolean;
}

class MonitoringService {
  private metrics: HealthMetrics[] = [];
  private maxMetricsHistory = 100;

  async logEvent(log: Omit<MonitoringLog, 'timestamp'>) {
    const logEntry: MonitoringLog = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    // Store in local array for quick access
    console.log(`[${logEntry.level.toUpperCase()}] ${logEntry.service}: ${logEntry.message}`, logEntry.metadata);

    // Attempt to store in Supabase (non-blocking)
    try {
      await supabase.from('monitoring_logs').insert([{
        timestamp: logEntry.timestamp,
        level: logEntry.level,
        service: logEntry.service,
        message: logEntry.message,
        metadata: logEntry.metadata || {},
        auto_corrected: logEntry.auto_corrected || false
      }]);
    } catch (error) {
      console.warn('Failed to store monitoring log:', error);
    }
  }

  async checkServiceHealth(): Promise<HealthMetrics> {
    const startTime = performance.now();
    const services: Record<string, 'connected' | 'failed' | 'degraded'> = {};
    const errors: string[] = [];
    const autoCorrections: string[] = [];

    // Check Supabase connectivity
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        services.supabase = 'failed';
        errors.push(`Supabase error: ${error.message}`);
        
        // Auto-correction: Try to reconnect
        try {
          await this.attemptSupabaseReconnection();
          services.supabase = 'connected';
          autoCorrections.push('Supabase reconnection successful');
        } catch (reconnectError) {
          await this.logEvent({
            level: 'error',
            service: 'supabase',
            message: 'Failed to reconnect to Supabase',
            metadata: { error: reconnectError }
          });
        }
      } else {
        services.supabase = 'connected';
      }
    } catch (error) {
      services.supabase = 'failed';
      errors.push(`Supabase connection failed: ${error}`);
    }

    // Check environment variables
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      services.environment = 'failed';
      errors.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    } else {
      services.environment = 'connected';
    }

    // Check performance
    const responseTime = Math.round(performance.now() - startTime);
    if (responseTime > 1000) {
      services.performance = 'degraded';
      errors.push(`Slow response time: ${responseTime}ms`);
    } else {
      services.performance = 'connected';
    }

    const metrics: HealthMetrics = {
      responseTime,
      timestamp: new Date().toISOString(),
      services,
      errors: errors.length > 0 ? errors : undefined,
      autoCorrections: autoCorrections.length > 0 ? autoCorrections : undefined
    };

    // Store metrics
    this.addMetrics(metrics);

    // Log health check
    await this.logEvent({
      level: errors.length > 0 ? 'warning' : 'info',
      service: 'health-check',
      message: `Health check completed - ${Object.values(services).filter(s => s === 'connected').length}/${Object.keys(services).length} services healthy`,
      metadata: { metrics, autoCorrections: autoCorrections.length }
    });

    return metrics;
  }

  private async attemptSupabaseReconnection(): Promise<void> {
    // Simple reconnection attempt by making a basic query
    const { error } = await supabase.auth.getUser();
    if (error) {
      throw new Error(`Reconnection failed: ${error.message}`);
    }
  }

  private addMetrics(metrics: HealthMetrics) {
    this.metrics.push(metrics);
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  getMetricsHistory(): HealthMetrics[] {
    return [...this.metrics];
  }

  async getRecentLogs(limit = 50): Promise<MonitoringLog[]> {
    try {
      const { data, error } = await supabase
        .from('monitoring_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Failed to fetch monitoring logs:', error);
      return [];
    }
  }

  startAutoMonitoring(intervalMs = 60000) {
    // Run initial health check
    this.checkServiceHealth();

    // Set up periodic monitoring
    return setInterval(async () => {
      try {
        await this.checkServiceHealth();
      } catch (error) {
        await this.logEvent({
          level: 'error',
          service: 'auto-monitor',
          message: 'Auto monitoring failed',
          metadata: { error }
        });
      }
    }, intervalMs);
  }
}

export const monitoringService = new MonitoringService();
