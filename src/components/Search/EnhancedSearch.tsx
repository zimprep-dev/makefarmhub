import { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, DollarSign, MapPin, Star, TrendingUp } from 'lucide-react';
import '../../styles/enhanced-search.css';

interface SearchFilters {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  category?: string;
  verifiedOnly: boolean;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'distance' | 'newest' | 'rating';
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  suggestions?: string[];
  categories?: string[];
  recentSearches?: string[];
}

export default function EnhancedSearch({
  onSearch,
  suggestions = [],
  categories = ['Crops', 'Livestock', 'Equipment', 'Seeds'],
  recentSearches = []
}: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    verifiedOnly: false,
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (filters.query.length > 0) {
      const filtered = [...suggestions, ...recentSearches].filter(s =>
        s.toLowerCase().includes(filters.query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions(recentSearches.slice(0, 5));
      setShowSuggestions(false);
    }
  }, [filters.query, suggestions, recentSearches]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    onSearch(filters);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters({ ...filters, query: suggestion });
    setShowSuggestions(false);
    onSearch({ ...filters, query: suggestion });
  };

  const clearQuery = () => {
    setFilters({ ...filters, query: '' });
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      verifiedOnly: false,
      sortBy: 'relevance'
    });
  };

  const activeFiltersCount = 
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.sortBy !== 'relevance' ? 1 : 0);

  return (
    <div className="enhanced-search" ref={searchRef}>
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search for crops, livestock, equipment..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onFocus={() => setShowSuggestions(true)}
            className="search-input"
          />
          {filters.query && (
            <button type="button" className="clear-btn" onClick={clearQuery}>
              <X size={18} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} />
          {activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
        </button>

        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Search size={16} />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h4>Advanced Filters</h4>
            {activeFiltersCount > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Price Range */}
            <div className="filter-group">
              <label>
                <DollarSign size={16} />
                Price Range
              </label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="filter-group">
              <label>
                <MapPin size={16} />
                Location
              </label>
              <select
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined })}
              >
                <option value="">All Locations</option>
                <option value="Harare">Harare</option>
                <option value="Bulawayo">Bulawayo</option>
                <option value="Manicaland">Manicaland</option>
                <option value="Mashonaland Central">Mashonaland Central</option>
                <option value="Mashonaland East">Mashonaland East</option>
                <option value="Mashonaland West">Mashonaland West</option>
                <option value="Masvingo">Masvingo</option>
                <option value="Matabeleland North">Matabeleland North</option>
                <option value="Matabeleland South">Matabeleland South</option>
                <option value="Midlands">Midlands</option>
              </select>
            </div>

            {/* Category */}
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label>
                <TrendingUp size={16} />
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              >
                <option value="relevance">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="distance">Nearest First</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="quick-filters">
            <label className="checkbox-filter">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
              />
              <Star size={16} />
              <span>Verified Sellers Only</span>
            </label>
          </div>

          <div className="filters-actions">
            <button className="apply-filters-btn" onClick={handleSearch}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
