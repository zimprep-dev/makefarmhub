import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible, hasLoaded };
}

// Hook for lazy loading images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { ref, isVisible } = useLazyLoad<HTMLImageElement>();

  useEffect(() => {
    if (!isVisible || isLoaded) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
    };
  }, [isVisible, src, isLoaded]);

  return { ref, imageSrc, isLoaded, error };
}

// Hook for infinite scroll / load more
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean,
  options: UseLazyLoadOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const { ref, isVisible } = useLazyLoad(options);

  useEffect(() => {
    if (isVisible && hasMore && !isLoading) {
      setIsLoading(true);
      loadMore().finally(() => setIsLoading(false));
    }
  }, [isVisible, hasMore, isLoading, loadMore]);

  return { ref, isLoading };
}
