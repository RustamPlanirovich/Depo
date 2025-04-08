import React, { Suspense, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

const LazyLoad: React.FC<Props> = ({ children, fallback = <div>Loading...</div>, errorFallback }) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyLoad; 