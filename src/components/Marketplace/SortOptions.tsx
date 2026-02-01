import { ArrowUpDown, TrendingUp, DollarSign, Clock } from 'lucide-react';
import './SortOptions.css';

interface SortOptionsProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
  resultCount: number;
}

export default function SortOptions({ sortBy, setSortBy, resultCount }: SortOptionsProps) {
  const sortOptions = [
    { id: 'newest', label: 'Newest First', icon: Clock },
    { id: 'price-low', label: 'Price: Low to High', icon: DollarSign },
    { id: 'price-high', label: 'Price: High to Low', icon: DollarSign },
    { id: 'popular', label: 'Most Popular', icon: TrendingUp },
    { id: 'rating', label: 'Highest Rated', icon: TrendingUp },
    { id: 'distance', label: 'Nearest First', icon: TrendingUp },
  ];

  return (
    <div className="sort-options">
      <div className="results-count">
        <strong>{resultCount}</strong> {resultCount === 1 ? 'product' : 'products'} found
      </div>
      
      <div className="sort-selector">
        <ArrowUpDown size={18} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
