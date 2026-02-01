/**
 * SearchService - Advanced search with fuzzy matching, filters, and history
 */

import { storage, STORAGE_KEYS } from '../storage/LocalStorage';
import type { Listing } from '../../types';

// Fuzzy search configuration
interface FuzzyConfig {
  threshold: number; // 0-1, lower = more strict
  distance: number; // Max edit distance
  ignoreCase: boolean;
  ignoreAccents: boolean;
}

const defaultFuzzyConfig: FuzzyConfig = {
  threshold: 0.4,
  distance: 100,
  ignoreCase: true,
  ignoreAccents: true,
};

// Search filters
export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  radius?: number; // km
  verified?: boolean;
  featured?: boolean;
  status?: string;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'distance';
  page?: number;
  limit?: number;
}

// Search result
export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  filters: SearchFilters;
  suggestions?: string[];
  facets?: SearchFacets;
}

// Search facets for filtering UI
export interface SearchFacets {
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
}

// Search history item
export interface SearchHistoryItem {
  query: string;
  filters: SearchFilters;
  timestamp: number;
  resultCount: number;
}

// Saved search
export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: number;
  notifyOnNew?: boolean;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy match score (0-1, higher = better match)
 */
function fuzzyScore(query: string, text: string, config: FuzzyConfig = defaultFuzzyConfig): number {
  if (!query || !text) return 0;

  let q = query;
  let t = text;

  if (config.ignoreCase) {
    q = q.toLowerCase();
    t = t.toLowerCase();
  }

  if (config.ignoreAccents) {
    q = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Exact match
  if (t === q) return 1;

  // Contains match
  if (t.includes(q)) return 0.9;

  // Word starts with query
  const words = t.split(/\s+/);
  if (words.some(w => w.startsWith(q))) return 0.8;

  // Fuzzy match using Levenshtein
  const distance = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const score = 1 - distance / maxLen;

  return score >= config.threshold ? score : 0;
}

/**
 * Tokenize text for search
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Generate search suggestions based on partial query
 */
function generateSuggestions(query: string, items: Listing[]): string[] {
  if (!query || query.length < 2) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  items.forEach(item => {
    // Add matching titles
    if (item.title.toLowerCase().includes(queryLower)) {
      suggestions.add(item.title);
    }

    // Add matching categories
    if (item.category.toLowerCase().includes(queryLower)) {
      suggestions.add(item.category);
    }

    // Add matching subcategories
    if (item.subcategory.toLowerCase().includes(queryLower)) {
      suggestions.add(item.subcategory);
    }

    // Add matching locations
    if (item.location.toLowerCase().includes(queryLower)) {
      suggestions.add(item.location.split(',')[0].trim());
    }
  });

  return Array.from(suggestions).slice(0, 8);
}

/**
 * Calculate facets from search results
 */
function calculateFacets(items: Listing[]): SearchFacets {
  const categories = new Map<string, number>();
  const locations = new Map<string, number>();
  const prices: number[] = [];

  items.forEach(item => {
    // Categories
    categories.set(item.category, (categories.get(item.category) || 0) + 1);

    // Locations (city only)
    const city = item.location.split(',')[0].trim();
    locations.set(city, (locations.get(city) || 0) + 1);

    // Prices
    prices.push(item.price);
  });

  // Price ranges
  const priceRanges: { min: number; max: number; count: number }[] = [];
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const step = range / 4;

    for (let i = 0; i < 4; i++) {
      const min = Math.floor(minPrice + step * i);
      const max = Math.ceil(minPrice + step * (i + 1));
      const count = prices.filter(p => p >= min && p <= max).length;
      priceRanges.push({ min, max, count });
    }
  }

  return {
    categories: Array.from(categories.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    locations: Array.from(locations.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    priceRanges,
  };
}

class SearchService {
  private searchHistory: SearchHistoryItem[] = [];
  private savedSearches: SavedSearch[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load search data from storage
   */
  private loadFromStorage(): void {
    const history = storage.get<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY);
    if (history) this.searchHistory = history;

    const saved = storage.get<SavedSearch[]>(STORAGE_KEYS.SAVED_SEARCHES);
    if (saved) this.savedSearches = saved;
  }

  /**
   * Save search data to storage
   */
  private saveToStorage(): void {
    storage.set(STORAGE_KEYS.SEARCH_HISTORY, this.searchHistory.slice(0, 50));
    storage.set(STORAGE_KEYS.SAVED_SEARCHES, this.savedSearches);
  }

  /**
   * Search listings with fuzzy matching and filters
   */
  search(items: Listing[], filters: SearchFilters): SearchResult<Listing> {
    let results = [...items];
    const query = filters.query?.trim() || '';

    // Text search with fuzzy matching
    if (query) {
      results = results.map(item => {
        const titleScore = fuzzyScore(query, item.title) * 2; // Title weighted higher
        const descScore = fuzzyScore(query, item.description);
        const categoryScore = fuzzyScore(query, item.category) * 1.5;
        const subcategoryScore = fuzzyScore(query, item.subcategory) * 1.5;
        const locationScore = fuzzyScore(query, item.location);

        const totalScore = titleScore + descScore + categoryScore + subcategoryScore + locationScore;

        return { item, score: totalScore };
      })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(item => item.category === filters.category);
    }

    if (filters.subcategory) {
      results = results.filter(item => item.subcategory === filters.subcategory);
    }

    if (filters.minPrice !== undefined) {
      results = results.filter(item => item.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter(item => item.price <= filters.maxPrice!);
    }

    if (filters.location) {
      results = results.filter(item =>
        item.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.verified) {
      results = results.filter(item => item.sellerVerified);
    }

    if (filters.featured) {
      results = results.filter(item => item.featured);
    }

    if (filters.status) {
      results = results.filter(item => item.status === filters.status);
    }

    // Calculate facets before pagination
    const facets = calculateFacets(results);

    // Sorting (if not already sorted by relevance)
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      switch (filters.sortBy) {
        case 'price-asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'rating':
          results.sort((a, b) => b.sellerRating - a.sellerRating);
          break;
      }
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);

    // Generate suggestions
    const suggestions = query ? generateSuggestions(query, items) : [];

    // Add to history
    if (query) {
      this.addToHistory(query, filters, total);
    }

    return {
      items: paginatedResults,
      total,
      page,
      totalPages,
      query,
      filters,
      suggestions,
      facets,
    };
  }

  /**
   * Get search suggestions as user types
   */
  getSuggestions(query: string, items: Listing[]): string[] {
    if (!query || query.length < 2) return [];

    // Combine history suggestions with item suggestions
    const historySuggestions = this.searchHistory
      .filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
      .map(h => h.query)
      .slice(0, 3);

    const itemSuggestions = generateSuggestions(query, items);

    // Deduplicate and limit
    const combined = [...new Set([...historySuggestions, ...itemSuggestions])];
    return combined.slice(0, 8);
  }

  /**
   * Add search to history
   */
  addToHistory(query: string, filters: SearchFilters, resultCount: number): void {
    // Remove duplicate if exists
    this.searchHistory = this.searchHistory.filter(h => h.query !== query);

    // Add new entry
    this.searchHistory.unshift({
      query,
      filters,
      timestamp: Date.now(),
      resultCount,
    });

    // Keep only last 50
    this.searchHistory = this.searchHistory.slice(0, 50);
    this.saveToStorage();
  }

  /**
   * Get search history
   */
  getHistory(): SearchHistoryItem[] {
    return this.searchHistory;
  }

  /**
   * Clear search history
   */
  clearHistory(): void {
    this.searchHistory = [];
    this.saveToStorage();
  }

  /**
   * Remove item from history
   */
  removeFromHistory(query: string): void {
    this.searchHistory = this.searchHistory.filter(h => h.query !== query);
    this.saveToStorage();
  }

  /**
   * Save a search for later
   */
  saveSearch(name: string, filters: SearchFilters, notifyOnNew: boolean = false): SavedSearch {
    const saved: SavedSearch = {
      id: `saved-${Date.now()}`,
      name,
      filters,
      createdAt: Date.now(),
      notifyOnNew,
    };

    this.savedSearches.push(saved);
    this.saveToStorage();
    return saved;
  }

  /**
   * Get saved searches
   */
  getSavedSearches(): SavedSearch[] {
    return this.savedSearches;
  }

  /**
   * Delete a saved search
   */
  deleteSavedSearch(id: string): void {
    this.savedSearches = this.savedSearches.filter(s => s.id !== id);
    this.saveToStorage();
  }

  /**
   * Update a saved search
   */
  updateSavedSearch(id: string, updates: Partial<SavedSearch>): void {
    const index = this.savedSearches.findIndex(s => s.id === id);
    if (index !== -1) {
      this.savedSearches[index] = { ...this.savedSearches[index], ...updates };
      this.saveToStorage();
    }
  }
}

// Singleton instance
export const searchService = new SearchService();

export default searchService;
