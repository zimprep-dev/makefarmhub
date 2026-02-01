/**
 * LocalStorage Service - Type-safe localStorage wrapper with expiration
 */

export interface StorageItem<T> {
  value: T;
  expiry?: number;
  createdAt: number;
}

const STORAGE_PREFIX = 'makefarmhub_';

/**
 * Get item from localStorage with type safety
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return null;

    const parsed: StorageItem<T> = JSON.parse(item);
    
    // Check expiry
    if (parsed.expiry && Date.now() > parsed.expiry) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
}

/**
 * Set item in localStorage with optional expiration
 */
export function setItem<T>(key: string, value: T, ttlMs?: number): void {
  try {
    const item: StorageItem<T> = {
      value,
      createdAt: Date.now(),
      expiry: ttlMs ? Date.now() + ttlMs : undefined,
    };
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Clear all app-related items from localStorage
 */
export function clearAll(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Get all keys with the app prefix
 */
export function getAllKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key.replace(STORAGE_PREFIX, ''));
    }
  }
  return keys;
}

/**
 * Check if key exists and is not expired
 */
export function hasItem(key: string): boolean {
  return getItem(key) !== null;
}

/**
 * Get storage size in bytes
 */
export function getStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value) {
        total += key.length + value.length;
      }
    }
  }
  return total * 2; // UTF-16 characters = 2 bytes each
}

// Predefined storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
  SEARCH_HISTORY: 'search_history',
  SAVED_SEARCHES: 'saved_searches',
  FAVORITES: 'favorites',
  CART: 'cart',
  RECENT_LISTINGS: 'recent_listings',
  NOTIFICATIONS_READ: 'notifications_read',
  PREFERENCES: 'preferences',
  DRAFT_LISTING: 'draft_listing',
  FILTERS: 'filters',
} as const;

// Export as default object
export const storage = {
  get: getItem,
  set: setItem,
  remove: removeItem,
  clear: clearAll,
  keys: getAllKeys,
  has: hasItem,
  size: getStorageSize,
  KEYS: STORAGE_KEYS,
};

export default storage;
