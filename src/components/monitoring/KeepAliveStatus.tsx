
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Power, PowerOff } from 'lucide-react';
import { useKeepAlive } from '@/hooks/useKeepAlive';

const KeepAliveStatus = () => {
  const { isActive, start, stop, toggle } = useKeepAlive(true);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Keep-Alive Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Service Status:</span>
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">24/7 Monitoring:</span>
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        <div className="pt-2">
          <Button 
            onClick={toggle}
            variant={isActive ? "destructive" : "default"}
            size="sm"
            className="w-full"
          >
            {isActive ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Stop Keep-Alive
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Start Keep-Alive
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          {isActive ? (
            <p>✅ App will stay online 24/7 with regular health checks every 5 minutes</p>
          ) : (
            <p>⚠️ App may go to sleep during periods of inactivity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeepAliveStatus;
