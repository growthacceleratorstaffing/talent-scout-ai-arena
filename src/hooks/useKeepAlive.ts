
import { useEffect, useState } from 'react';
import { keepAliveService } from '@/services/keepAliveService';

export const useKeepAlive = (autoStart = true) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (autoStart) {
      keepAliveService.start();
      setIsActive(true);
    }

    // Cleanup on unmount
    return () => {
      if (!autoStart) {
        keepAliveService.stop();
        setIsActive(false);
      }
    };
  }, [autoStart]);

  const start = () => {
    keepAliveService.start();
    setIsActive(true);
  };

  const stop = () => {
    keepAliveService.stop();
    setIsActive(false);
  };

  const toggle = () => {
    if (keepAliveService.isRunning()) {
      stop();
    } else {
      start();
    }
  };

  return {
    isActive: keepAliveService.isRunning(),
    start,
    stop,
    toggle
  };
};
