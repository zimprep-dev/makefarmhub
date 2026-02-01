/**
 * useApi Hook - React hook for API calls with loading, error, and caching
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cacheKey?: string;
  cacheTTL?: number;
}

// Simple in-memory cache for hook results
const hookCache = new Map<string, { data: unknown; expiry: number }>();

/**
 * Generic API hook for any async function
 */
export function useApi<T, Args extends unknown[] = []>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { initialData = null, onSuccess, onError, cacheKey, cacheTTL = 5 * 60 * 1000 } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData as T | null,
    loading: false,
    error: null,
  });
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);
  
  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    // Check cache first
    if (cacheKey) {
      const cached = hookCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        const cachedData = cached.data as T;
        setState({ data: cachedData, loading: false, error: null });
        onSuccess?.(cachedData);
        return cachedData;
      }
    }
    
    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiFunction(...args);
      
      if (!mountedRef.current) return null;
      
      // Cache the result
      if (cacheKey) {
        hookCache.set(cacheKey, { data, expiry: Date.now() + cacheTTL });
      }
      
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (err) {
      if (!mountedRef.current) return null;
      
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({ ...prev, loading: false, error }));
      onError?.(error);
      return null;
    }
  }, [apiFunction, cacheKey, cacheTTL, onSuccess, onError]);
  
  const reset = useCallback(() => {
    setState({ data: initialData as T | null, loading: false, error: null });
  }, [initialData]);
  
  const setData = useCallback((data: T | ((prev: T | null) => T)) => {
    setState(prev => ({
      ...prev,
      data: typeof data === 'function' ? (data as (prev: T | null) => T)(prev.data) : data,
    }));
  }, []);
  
  return {
    ...state,
    execute,
    reset,
    setData,
    isIdle: !state.loading && !state.error && state.data === null,
    isSuccess: !state.loading && !state.error && state.data !== null,
    isError: !state.loading && state.error !== null,
  };
}

/**
 * Hook for lazy API calls (manual trigger)
 */
export function useLazyApi<T, Args extends unknown[] = []>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  return useApi(apiFunction, options);
}

/**
 * Hook for immediate API calls on mount
 */
export function useApiOnMount<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {},
  deps: unknown[] = []
) {
  const api = useApi(apiFunction, options);
  
  useEffect(() => {
    api.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return api;
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number; totalPages: number }>,
  options: { limit?: number } & UseApiOptions<T[]> = {}
) {
  const { limit = 12, ...apiOptions } = options;
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [allData, setAllData] = useState<T[]>([]);
  
  const api = useApi(
    async (pageNum: number) => {
      const result = await apiFunction(pageNum, limit);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      return result.data;
    },
    {
      ...apiOptions,
      onSuccess: (data) => {
        if (page === 1) {
          setAllData(data);
        } else {
          setAllData(prev => [...prev, ...data]);
        }
        apiOptions.onSuccess?.(data);
      },
    }
  );
  
  const loadPage = useCallback((pageNum: number) => {
    setPage(pageNum);
    return api.execute(pageNum);
  }, [api]);
  
  const loadMore = useCallback(() => {
    if (page < totalPages) {
      return loadPage(page + 1);
    }
    return Promise.resolve(null);
  }, [page, totalPages, loadPage]);
  
  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    return api.execute(1);
  }, [api]);
  
  return {
    ...api,
    data: allData,
    page,
    totalPages,
    total,
    hasMore: page < totalPages,
    loadPage,
    loadMore,
    refresh,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T, Args extends unknown[] = []>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> & {
    optimisticUpdate?: (args: Args) => T;
    rollback?: (error: Error, previousData: T | null) => void;
  } = {}
) {
  const { optimisticUpdate, rollback, ...apiOptions } = options;
  const previousDataRef = useRef<T | null>(null);
  
  const api = useApi(apiFunction, {
    ...apiOptions,
    onError: (error) => {
      // Rollback on error
      if (rollback && previousDataRef.current !== null) {
        rollback(error, previousDataRef.current);
      }
      apiOptions.onError?.(error);
    },
  });
  
  const executeOptimistic = useCallback(async (...args: Args) => {
    // Store previous data for rollback
    previousDataRef.current = api.data;
    
    // Apply optimistic update immediately
    if (optimisticUpdate) {
      const optimisticData = optimisticUpdate(args);
      api.setData(optimisticData);
    }
    
    // Execute actual API call
    return api.execute(...args);
  }, [api, optimisticUpdate]);
  
  return {
    ...api,
    executeOptimistic,
  };
}

/**
 * Clear hook cache
 */
export function clearHookCache(pattern?: string): void {
  if (pattern) {
    for (const key of hookCache.keys()) {
      if (key.includes(pattern)) {
        hookCache.delete(key);
      }
    }
  } else {
    hookCache.clear();
  }
}
