import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Zap, RefreshCw } from 'lucide-react';
import { monitoringService, HealthMetrics, MonitoringLog } from '@/services/monitoringService';
import { useToast } from '@/hooks/use-toast';
import KeepAliveStatus from './KeepAliveStatus';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<HealthMetrics[]>([]);
  const [logs, setLogs] = useState<MonitoringLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoMonitoringInterval, setAutoMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const healthCheck = await monitoringService.checkServiceHealth();
      setMetrics(monitoringService.getMetricsHistory());
      
      const recentLogs = await monitoringService.getRecentLogs();
      setLogs(recentLogs);

      toast({
        title: "Monitoring data refreshed",
        description: `Services status: ${Object.values(healthCheck.services).filter(s => s === 'connected').length}/${Object.keys(healthCheck.services).length} healthy`
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh monitoring data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoMonitoring = () => {
    if (autoMonitoringInterval) {
      clearInterval(autoMonitoringInterval);
      setAutoMonitoringInterval(null);
      toast({
        title: "Auto-monitoring disabled",
        description: "Stopped automatic health checks"
      });
    } else {
      const interval = monitoringService.startAutoMonitoring(30000); // Every 30 seconds
      setAutoMonitoringInterval(interval);
      toast({
        title: "Auto-monitoring enabled",
        description: "Running health checks every 30 seconds"
      });
    }
  };

  useEffect(() => {
    refreshData();
    return () => {
      if (autoMonitoringInterval) {
        clearInterval(autoMonitoringInterval);
      }
    };
  }, []);

  const latestMetrics = metrics[metrics.length - 1];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time health checks and 24/7 uptime monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleAutoMonitoring}
            variant={autoMonitoringInterval ? "destructive" : "default"}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {autoMonitoringInterval ? "Stop Auto-Monitor" : "Start Auto-Monitor"}
          </Button>
          <Button onClick={refreshData} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Keep-Alive Status Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <KeepAliveStatus />
        </div>
        
        {latestMetrics && (
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestMetrics.responseTime}ms</div>
                <p className="text-xs text-muted-foreground">Last health check</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Services Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(latestMetrics.services).filter(s => s === 'connected').length}/
                  {Object.keys(latestMetrics.services).length}
                </div>
                <p className="text-xs text-muted-foreground">Services healthy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {new Date(latestMetrics.timestamp).toLocaleTimeString()}
                </div>
                <p className="text-xs text-muted-foreground">System time</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics History</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Status</CardTitle>
              <CardDescription>Current status of all monitored services</CardDescription>
            </CardHeader>
            <CardContent>
              {latestMetrics ? (
                <div className="space-y-3">
                  {Object.entries(latestMetrics.services).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <span className="font-medium capitalize">{service}</span>
                      </div>
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                  
                  {latestMetrics.errors && latestMetrics.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Current Issues:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {latestMetrics.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {latestMetrics.autoCorrections && latestMetrics.autoCorrections.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Auto-Corrections Applied:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {latestMetrics.autoCorrections.map((correction, index) => (
                          <li key={index}>• {correction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No health data available. Click refresh to run a health check.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Recent system events and auto-corrections</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {logs.length > 0 ? (
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Badge className={getLevelColor(log.level)} variant="secondary">
                          {log.level}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{log.service}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{log.message}</p>
                          {log.auto_corrected && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Auto-corrected
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No logs available</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metrics History</CardTitle>
              <CardDescription>Performance trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {metrics.length > 0 ? (
                  <div className="space-y-2">
                    {metrics.slice().reverse().map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{metric.responseTime}ms</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {Object.values(metric.services).filter(s => s === 'connected').length}/
                            {Object.keys(metric.services).length} healthy
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No metrics history available</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
