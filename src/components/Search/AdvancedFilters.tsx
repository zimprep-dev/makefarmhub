import { useState } from 'react';
import { MapPin, DollarSign, Sliders, Star, Calendar } from 'lucide-react';
import './AdvancedFilters.css';

interface FilterOptions {
  priceRange: [number, number];
  location: string;
  radius: number;
  minRating: number;
  organic: boolean;
  verified: boolean;
  readyToSell: boolean;
  dateRange: 'any' | 'today' | 'week' | 'month';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onApply: () => void;
  onReset: () => void;
}

const zimbabweProvinces = [
  'All Locations',
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands',
];

export default function AdvancedFilters({
  filters,
  onFilterChange,
  onApply,
  onReset,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const updatePriceRange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...filters.priceRange];
    newRange[index] = value;
    updateFilter('priceRange', newRange);
  };

  return (
    <div className="advanced-filters">
      <button
        className="filters-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Sliders size={18} />
        <span>Advanced Filters</span>
        <span className="toggle-icon">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="filters-panel">
          {/* Price Range */}
          <div className="filter-section">
            <h4>
              <DollarSign size={16} />
              Price Range
            </h4>
            <div className="price-inputs">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => updatePriceRange(0, Number(e.target.value))}
                placeholder="Min"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => updatePriceRange(1, Number(e.target.value))}
                placeholder="Max"
                min="0"
              />
            </div>
            <div className="price-slider">
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.priceRange[1]}
                onChange={(e) => updatePriceRange(1, Number(e.target.value))}
                className="slider"
              />
            </div>
          </div>

          {/* Location */}
          <div className="filter-section">
            <h4>
              <MapPin size={16} />
              Location
            </h4>
            <select
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            >
              {zimbabweProvinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            
            {filters.location !== 'All Locations' && (
              <div className="radius-control">
                <label>Within {filters.radius} km</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={filters.radius}
                  onChange={(e) => updateFilter('radius', Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="filter-section">
            <h4>
              <Star size={16} />
              Minimum Rating
            </h4>
            <div className="rating-options">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  className={`rating-btn ${filters.minRating === rating ? 'active' : ''}`}
                  onClick={() => updateFilter('minRating', rating)}
                >
                  {rating > 0 ? `${rating}+ ⭐` : 'Any'}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="filter-section">
            <h4>
              <Calendar size={16} />
              Listed Date
            </h4>
            <div className="date-options">
              {[
                { value: 'any', label: 'Any Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`date-btn ${filters.dateRange === option.value ? 'active' : ''}`}
                  onClick={() => updateFilter('dateRange', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="filter-section">
            <h4>Preferences</h4>
            <div className="toggle-options">
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={filters.organic}
                  onChange={(e) => updateFilter('organic', e.target.checked)}
                />
                <span>Organic Only</span>
              </label>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => updateFilter('verified', e.target.checked)}
                />
                <span>Verified Sellers</span>
              </label>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={filters.readyToSell}
                  onChange={(e) => updateFilter('readyToSell', e.target.checked)}
                />
                <span>Ready to Sell</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="filter-actions">
            <button className="reset-btn" onClick={onReset}>
              Reset All
            </button>
            <button className="apply-btn" onClick={onApply}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
