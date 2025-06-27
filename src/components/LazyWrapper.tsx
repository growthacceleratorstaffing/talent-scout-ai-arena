
import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyWrapper = ({ children, fallback }: LazyWrapperProps) => {
  return (
    <Suspense fallback={fallback || <Skeleton className="w-full h-32" />}>
      {children}
    </Suspense>
  );
};

export default LazyWrapper;
