/**
 * useSearch Hook - React hook for advanced search functionality
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { searchService, type SearchFilters, type SearchResult, type SearchHistoryItem, type SavedSearch } from '../services/search';
import { useDebounce } from './useDebounce';
import type { Listing } from '../types';

interface UseSearchOptions {
  debounceMs?: number;
  initialFilters?: SearchFilters;
  autoSearch?: boolean;
}

export function useSearch(items: Listing[], options: UseSearchOptions = {}) {
  const { debounceMs = 300, initialFilters = {}, autoSearch = true } = options;

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [result, setResult] = useState<SearchResult<Listing> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Debounce the query for suggestions
  const debouncedQuery = useDebounce(filters.query || '', debounceMs);

  // Perform search
  const search = useCallback((searchFilters?: SearchFilters) => {
    setIsSearching(true);
    const filtersToUse = searchFilters || filters;
    
    // Use setTimeout to prevent blocking UI
    setTimeout(() => {
      const searchResult = searchService.search(items, filtersToUse);
      setResult(searchResult);
      setIsSearching(false);
    }, 0);
  }, [items, filters]);

  // Auto search when filters change
  useEffect(() => {
    if (autoSearch) {
      search();
    }
  }, [filters, autoSearch, search]);

  // Update suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      const newSuggestions = searchService.getSuggestions(debouncedQuery, items);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, items]);

  // Update query
  const setQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query, page: 1 }));
  }, []);

  // Update single filter
  const setFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  // Update multiple filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: filters.limit });
  }, [filters.limit]);

  // Go to page
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // Get search history
  const history = useMemo(() => searchService.getHistory(), [result]);

  // Clear history
  const clearHistory = useCallback(() => {
    searchService.clearHistory();
  }, []);

  // Save current search
  const saveSearch = useCallback((name: string, notifyOnNew: boolean = false) => {
    return searchService.saveSearch(name, filters, notifyOnNew);
  }, [filters]);

  // Get saved searches
  const savedSearches = useMemo(() => searchService.getSavedSearches(), [result]);

  // Load saved search
  const loadSavedSearch = useCallback((saved: SavedSearch) => {
    setFilters(saved.filters);
  }, []);

  // Delete saved search
  const deleteSavedSearch = useCallback((id: string) => {
    searchService.deleteSavedSearch(id);
  }, []);

  return {
    // State
    filters,
    result,
    isSearching,
    suggestions,
    history,
    savedSearches,

    // Results
    items: result?.items || [],
    total: result?.total || 0,
    page: result?.page || 1,
    totalPages: result?.totalPages || 1,
    facets: result?.facets,

    // Actions
    search,
    setQuery,
    setFilter,
    updateFilters,
    clearFilters,
    goToPage,
    clearHistory,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,

    // Helpers
    hasFilters: Object.keys(filters).some(k => 
      k !== 'page' && k !== 'limit' && filters[k as keyof SearchFilters] !== undefined
    ),
    hasResults: (result?.items.length || 0) > 0,
    hasMore: (result?.page || 1) < (result?.totalPages || 1),
  };
}

/**
 * Hook for search suggestions only
 */
export function useSearchSuggestions(items: Listing[], debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setSuggestions(searchService.getSuggestions(debouncedQuery, items));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, items]);

  return { query, setQuery, suggestions };
}

/**
 * Hook for search history
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(searchService.getHistory());
  }, []);

  const clearHistory = useCallback(() => {
    searchService.clearHistory();
    setHistory([]);
  }, []);

  const removeItem = useCallback((query: string) => {
    searchService.removeFromHistory(query);
    setHistory(searchService.getHistory());
  }, []);

  return { history, clearHistory, removeItem };
}

export default useSearch;
