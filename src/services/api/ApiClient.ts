/**
 * API Client - Core HTTP client with caching, retry, and error handling
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheTTL?: number;
  signal?: AbortSignal;
}

// Cache storage
const cache = new Map<string, { data: unknown; expiry: number }>();

// Request deduplication
const pendingRequests = new Map<string, Promise<unknown>>();

// Default configuration
const defaultConfig: ApiConfig = {
  baseUrl: '/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

let config: ApiConfig = { ...defaultConfig };

/**
 * Configure the API client
 */
export function configureApi(newConfig: Partial<ApiConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Generate cache key from request
 */
function getCacheKey(requestConfig: RequestConfig): string {
  const { method, endpoint, params, data } = requestConfig;
  return `${method}:${endpoint}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
}

/**
 * Get cached response if valid
 */
function getCachedResponse<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

/**
 * Set cache response
 */
function setCacheResponse<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

/**
 * Clear cache
 */
export function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(endpoint, config.baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
}

/**
 * Sleep utility for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP request with retry logic
 */
async function makeRequest<T>(
  requestConfig: RequestConfig,
  attempt: number = 1
): Promise<ApiResponse<T>> {
  const { method, endpoint, data, params, headers, signal } = requestConfig;
  
  const url = buildUrl(endpoint, params);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: signal || controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        code: errorData.code,
        details: errorData.details,
      } as ApiError;
    }
    
    const responseData = await response.json();
    
    return {
      data: responseData,
      status: response.status,
      timestamp: Date.now(),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Don't retry on abort
    if ((error as Error).name === 'AbortError') {
      throw { status: 0, message: 'Request cancelled' } as ApiError;
    }
    
    // Retry on network errors or 5xx errors
    const shouldRetry = 
      attempt < config.retries &&
      (!(error as ApiError).status || (error as ApiError).status >= 500);
    
    if (shouldRetry) {
      await sleep(config.retryDelay * attempt);
      return makeRequest(requestConfig, attempt + 1);
    }
    
    throw error;
  }
}

/**
 * Main request function with caching and deduplication
 */
export async function request<T>(requestConfig: RequestConfig): Promise<ApiResponse<T>> {
  const cacheKey = getCacheKey(requestConfig);
  
  // Check cache for GET requests
  if (requestConfig.method === 'GET' && requestConfig.cache !== false) {
    const cached = getCachedResponse<ApiResponse<T>>(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Deduplicate identical pending requests
  if (requestConfig.method === 'GET' && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<ApiResponse<T>>;
  }
  
  // Make request
  const requestPromise = makeRequest<T>(requestConfig);
  
  // Track pending GET requests for deduplication
  if (requestConfig.method === 'GET') {
    pendingRequests.set(cacheKey, requestPromise);
  }
  
  try {
    const response = await requestPromise;
    
    // Cache successful GET responses
    if (requestConfig.method === 'GET' && requestConfig.cache !== false) {
      const ttl = requestConfig.cacheTTL || 5 * 60 * 1000; // Default 5 minutes
      setCacheResponse(cacheKey, response, ttl);
    }
    
    return response;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Convenience methods
 */
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean>, options?: Partial<RequestConfig>) =>
    request<T>({ method: 'GET', endpoint, params, ...options }),
  
  post: <T>(endpoint: string, data?: unknown, options?: Partial<RequestConfig>) =>
    request<T>({ method: 'POST', endpoint, data, ...options }),
  
  put: <T>(endpoint: string, data?: unknown, options?: Partial<RequestConfig>) =>
    request<T>({ method: 'PUT', endpoint, data, ...options }),
  
  patch: <T>(endpoint: string, data?: unknown, options?: Partial<RequestConfig>) =>
    request<T>({ method: 'PATCH', endpoint, data, ...options }),
  
  delete: <T>(endpoint: string, options?: Partial<RequestConfig>) =>
    request<T>({ method: 'DELETE', endpoint, ...options }),
};

export default api;
