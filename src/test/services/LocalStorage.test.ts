/**
 * LocalStorage Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getItem, setItem, removeItem, clearAll, hasItem, STORAGE_KEYS } from '../../services/storage/LocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('LocalStorage Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('setItem and getItem', () => {
    it('stores and retrieves a string', () => {
      setItem('test', 'hello');
      expect(getItem<string>('test')).toBe('hello');
    });

    it('stores and retrieves an object', () => {
      const obj = { name: 'Test', value: 123 };
      setItem('test', obj);
      expect(getItem<typeof obj>('test')).toEqual(obj);
    });

    it('stores and retrieves an array', () => {
      const arr = [1, 2, 3];
      setItem('test', arr);
      expect(getItem<typeof arr>('test')).toEqual(arr);
    });

    it('returns null for non-existent key', () => {
      expect(getItem('nonexistent')).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('returns value before expiry', () => {
      setItem('test', 'value', 10000); // 10 seconds
      expect(getItem<string>('test')).toBe('value');
    });

    it('returns null after expiry', () => {
      vi.useFakeTimers();
      setItem('test', 'value', 1000); // 1 second
      
      vi.advanceTimersByTime(2000); // Advance 2 seconds
      expect(getItem<string>('test')).toBeNull();
      
      vi.useRealTimers();
    });
  });

  describe('removeItem', () => {
    it('removes an item', () => {
      setItem('test', 'value');
      removeItem('test');
      expect(getItem('test')).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('clears all app items', () => {
      setItem('test1', 'value1');
      setItem('test2', 'value2');
      clearAll();
      expect(getItem('test1')).toBeNull();
      expect(getItem('test2')).toBeNull();
    });
  });

  describe('hasItem', () => {
    it('returns true for existing item', () => {
      setItem('test', 'value');
      expect(hasItem('test')).toBe(true);
    });

    it('returns false for non-existent item', () => {
      expect(hasItem('nonexistent')).toBe(false);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('has all required keys', () => {
      expect(STORAGE_KEYS.USER).toBe('user');
      expect(STORAGE_KEYS.AUTH_TOKEN).toBe('auth_token');
      expect(STORAGE_KEYS.THEME).toBe('theme');
      expect(STORAGE_KEYS.SEARCH_HISTORY).toBe('search_history');
      expect(STORAGE_KEYS.FAVORITES).toBe('favorites');
    });
  });
});
