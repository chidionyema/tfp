// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  callback: () => void;
  isLoading: boolean;
  hasMore: boolean;
  rootMargin?: string;
  threshold?: number;
}

export const useInfiniteScroll = ({
  callback,
  isLoading,
  hasMore,
  rootMargin = '100px',
  threshold = 0.1
}: UseInfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && !isLoading && hasMore) {
        callback();
      }
    },
    [callback, isLoading, hasMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    
    if (!sentinel) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { sentinelRef };
};