
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Activity } from 'lucide-react';
import { optimizedMonitoringService } from '@/services/optimizedMonitoringService';
import { useQuery } from '@tanstack/react-query';
import KeepAliveStatus from './KeepAliveStatus';

const OptimizedMonitoringDashboard = memo(() => {
  const { data: healthMetrics, isLoading, refetch } = useQuery({
    queryKey: ['health-metrics'],
    queryFn: () => optimizedMonitoringService.checkServiceHealth(),
    refetchInterval: 120000, // Increased from 60s to 2 minutes for cost efficiency
    staleTime: 60000, // Increased cache time to 60 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  const statusCards = useMemo(() => {
    if (!healthMetrics) return [] as React.ReactElement[];

    return Object.entries(healthMetrics.services).map(([service, status]) => (
      <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4" />
          <span className="font-medium capitalize">{service}</span>
        </div>
        <Badge 
          className={
            status === 'connected' ? 'bg-green-100 text-green-800' :
            status === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }
        >
          {status}
        </Badge>
      </div>
    ));
  }, [healthMetrics?.services]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Cost-optimized resource monitoring</p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <KeepAliveStatus />
        </div>
        
        {healthMetrics && (
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.responseTime}ms</div>
                <p className="text-xs text-muted-foreground">Last check</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(healthMetrics.services).filter(s => s === 'connected').length}/
                  {Object.keys(healthMetrics.services).length}
                </div>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            Service Status
          </CardTitle>
          <CardDescription>Efficient system health overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusCards.length > 0 ? statusCards : <p className="text-muted-foreground">Loading service status...</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedMonitoringDashboard.displayName = 'OptimizedMonitoringDashboard';

export default OptimizedMonitoringDashboard;
