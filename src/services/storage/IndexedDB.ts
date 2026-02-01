/**
 * IndexedDB Service - For larger data storage and offline support
 */

const DB_NAME = 'makefarmhub_db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  LISTINGS: 'listings',
  ORDERS: 'orders',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  CACHE: 'cache',
  SYNC_QUEUE: 'sync_queue',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize the database
 */
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance!);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.LISTINGS)) {
        const listingsStore = db.createObjectStore(STORES.LISTINGS, { keyPath: 'id' });
        listingsStore.createIndex('category', 'category', { unique: false });
        listingsStore.createIndex('sellerId', 'sellerId', { unique: false });
        listingsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        const ordersStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
        ordersStore.createIndex('buyerId', 'buyerId', { unique: false });
        ordersStore.createIndex('sellerId', 'sellerId', { unique: false });
        ordersStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messagesStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        messagesStore.createIndex('conversationId', 'conversationId', { unique: false });
        messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        const notificationsStore = db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id' });
        notificationsStore.createIndex('userId', 'userId', { unique: false });
        notificationsStore.createIndex('read', 'read', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CACHE)) {
        const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
        cacheStore.createIndex('expiry', 'expiry', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Get database instance
 */
async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return initDB();
  }
  return dbInstance;
}

/**
 * Add or update an item
 */
export async function put<T>(storeName: StoreName, item: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Add multiple items
 */
export async function putMany<T>(storeName: StoreName, items: T[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    items.forEach(item => store.put(item));
    
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

/**
 * Get an item by key
 */
export async function get<T>(storeName: StoreName, key: string): Promise<T | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all items from a store
 */
export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get items by index
 */
export async function getByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Delete an item
 */
export async function remove(storeName: StoreName, key: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all items from a store
 */
export async function clear(storeName: StoreName): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Count items in a store
 */
export async function count(storeName: StoreName): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Cache helpers
interface CacheItem<T> {
  key: string;
  value: T;
  expiry: number;
}

/**
 * Set cache item with expiration
 */
export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const item: CacheItem<T> = {
    key,
    value,
    expiry: Date.now() + ttlMs,
  };
  await put(STORES.CACHE, item);
}

/**
 * Get cache item if not expired
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const item = await get<CacheItem<T>>(STORES.CACHE, key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    await remove(STORES.CACHE, key);
    return null;
  }
  return item.value;
}

/**
 * Clear expired cache items
 */
export async function clearExpiredCache(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);
    const index = store.index('expiry');
    const range = IDBKeyRange.upperBound(Date.now());
    
    const request = index.openCursor(range);
    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    
    transaction.oncomplete = () => resolve();
  });
}

// Sync queue helpers
interface SyncQueueItem {
  id?: number;
  type: 'create' | 'update' | 'delete';
  storeName: string;
  data: unknown;
  createdAt: number;
}

/**
 * Add item to sync queue for offline operations
 */
export async function addToSyncQueue(
  type: SyncQueueItem['type'],
  storeName: string,
  data: unknown
): Promise<void> {
  const item: SyncQueueItem = {
    type,
    storeName,
    data,
    createdAt: Date.now(),
  };
  await put(STORES.SYNC_QUEUE, item);
}

/**
 * Get all pending sync items
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
}

/**
 * Clear sync queue after successful sync
 */
export async function clearSyncQueue(): Promise<void> {
  await clear(STORES.SYNC_QUEUE);
}

// Export as default object
export const indexedDB = {
  init: initDB,
  put,
  putMany,
  get,
  getAll,
  getByIndex,
  remove,
  clear,
  count,
  cache: {
    set: setCache,
    get: getCache,
    clearExpired: clearExpiredCache,
  },
  sync: {
    add: addToSyncQueue,
    getQueue: getSyncQueue,
    clearQueue: clearSyncQueue,
  },
  STORES,
};

export default indexedDB;
