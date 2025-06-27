class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  private readonly pingInterval = 5 * 60 * 1000; // 5 minutes
  private readonly healthEndpoint = '/api/keep-alive'; // Use lighter endpoint
  private failedAttempts = 0;
  private readonly maxFailedAttempts = 3;

  start() {
    if (this.isActive) {
      console.log('Keep-alive service already running');
      return;
    }

    console.log('Starting optimized keep-alive service...');
    this.isActive = true;

    // Immediate lightweight ping
    this.ping();

    // Set up interval pinging with exponential backoff on failures
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.getNextInterval());

    // Optimized browser activity (less frequent)
    this.preventTabSleep();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    this.failedAttempts = 0;
    console.log('Keep-alive service stopped');
  }

  private getNextInterval(): number {
    // Exponential backoff for failed attempts to reduce resource usage
    if (this.failedAttempts > 0) {
      return Math.min(this.pingInterval * Math.pow(2, this.failedAttempts), 15 * 60 * 1000); // Max 15 minutes
    }
    return this.pingInterval;
  }

  private async ping() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout

      const response = await fetch(this.healthEndpoint, {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.failedAttempts = 0; // Reset on success
        console.log('Keep-alive ping successful:', new Date().toISOString());
      } else {
        this.handleFailure();
      }
    } catch (error) {
      this.handleFailure();
    }
  }

  private handleFailure() {
    this.failedAttempts++;
    console.warn(`Keep-alive ping failed (attempt ${this.failedAttempts}/${this.maxFailedAttempts})`);
    
    if (this.failedAttempts >= this.maxFailedAttempts) {
      console.error('Keep-alive service disabled due to repeated failures');
      this.stop();
    }
  }

  private preventTabSleep() {
    // More efficient tab keep-alive (every 2 minutes instead of 30 seconds)
    setInterval(() => {
      // Minimal DOM activity
      if (document.hidden) return; // Skip if tab is not visible
      
      const originalTitle = document.title;
      document.title = originalTitle.includes('●') 
        ? originalTitle.replace('●', '') 
        : originalTitle + '●';
      
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }, 2 * 60 * 1000); // Every 2 minutes
  }

  isRunning() {
    return this.isActive;
  }
}

export const keepAliveService = new KeepAliveService();
