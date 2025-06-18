class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  private readonly pingInterval = 5 * 60 * 1000; // 5 minutes
  private readonly healthEndpoint = '/api/health';

  start() {
    if (this.isActive) {
      console.log('Keep-alive service already running');
      return;
    }

    console.log('Starting keep-alive service...');
    this.isActive = true;

    // Immediate ping
    this.ping();

    // Set up interval pinging
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.pingInterval);

    // Keep browser tab active
    this.preventTabSleep();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log('Keep-alive service stopped');
  }

  private async ping() {
    try {
      const response = await fetch(this.healthEndpoint, {
        method: 'GET',
        cache: 'no-cache'
      });

      if (response.ok) {
        console.log('Keep-alive ping successful:', new Date().toISOString());
      } else {
        console.warn('Keep-alive ping failed:', response.status);
      }
    } catch (error) {
      console.error('Keep-alive ping error:', error);
    }
  }

  private preventTabSleep() {
    // Prevent browser from sleeping by requesting a wake lock if available
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch((err: any) => {
        console.log('Wake lock not available:', err);
      });
    }

    // Fallback: tiny activity to keep tab alive
    setInterval(() => {
      // Minimal DOM activity to prevent tab sleeping
      document.title = document.title.includes('●') 
        ? document.title.replace('●', '') 
        : document.title + '●';
      
      // Reset title after a second
      setTimeout(() => {
        if (document.title.includes('●')) {
          document.title = document.title.replace('●', '');
        }
      }, 1000);
    }, 30000); // Every 30 seconds
  }

  isRunning() {
    return this.isActive;
  }
}

export const keepAliveService = new KeepAliveService();
