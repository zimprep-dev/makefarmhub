import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Info, Check, Lightbulb } from 'lucide-react';
import './PriceSuggestions.css';

interface PriceSuggestion {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  marketAverage: number;
  competitorLow: number;
  competitorHigh: number;
  demandLevel: 'high' | 'medium' | 'low';
  reason: string;
}

export default function PriceSuggestions() {
  const [suggestions] = useState<PriceSuggestion[]>([
    {
      productId: '1',
      productName: 'Organic Tomatoes',
      currentPrice: 5.00,
      suggestedPrice: 5.50,
      marketAverage: 5.25,
      competitorLow: 4.50,
      competitorHigh: 6.00,
      demandLevel: 'high',
      reason: 'High demand season - consider increasing price',
    },
    {
      productId: '2',
      productName: 'Fresh Maize',
      currentPrice: 12.00,
      suggestedPrice: 10.50,
      marketAverage: 10.00,
      competitorLow: 9.00,
      competitorHigh: 11.00,
      demandLevel: 'medium',
      reason: 'Your price is above market average',
    },
    {
      productId: '3',
      productName: 'Broiler Chickens',
      currentPrice: 15.00,
      suggestedPrice: 15.00,
      marketAverage: 15.50,
      competitorLow: 14.00,
      competitorHigh: 17.00,
      demandLevel: 'high',
      reason: 'Price is competitive - no change needed',
    },
  ]);

  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  const applySuggestion = (productId: string) => {
    setAppliedSuggestions(prev => [...prev, productId]);
  };

  const getPriceChange = (current: number, suggested: number) => {
    const change = ((suggested - current) / current) * 100;
    return change;
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="price-suggestions">
      <div className="suggestions-header">
        <h2><Lightbulb size={24} /> Price Suggestions</h2>
        <p>AI-powered pricing recommendations based on market data</p>
      </div>

      <div className="suggestions-list">
        {suggestions.map((suggestion) => {
          const priceChange = getPriceChange(suggestion.currentPrice, suggestion.suggestedPrice);
          const isApplied = appliedSuggestions.includes(suggestion.productId);

          return (
            <div key={suggestion.productId} className={`suggestion-card ${isApplied ? 'applied' : ''}`}>
              <div className="suggestion-main">
                <div className="product-info">
                  <h3>{suggestion.productName}</h3>
                  <span className="demand-badge" style={{ backgroundColor: getDemandColor(suggestion.demandLevel) }}>
                    {suggestion.demandLevel} demand
                  </span>
                </div>

                <div className="price-comparison">
                  <div className="price-item current">
                    <span className="label">Current</span>
                    <span className="value">${suggestion.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="price-arrow">
                    {priceChange > 0 ? <TrendingUp size={20} className="up" /> : 
                     priceChange < 0 ? <TrendingDown size={20} className="down" /> : 
                     <span className="neutral">→</span>}
                  </div>
                  <div className="price-item suggested">
                    <span className="label">Suggested</span>
                    <span className="value">${suggestion.suggestedPrice.toFixed(2)}</span>
                    {priceChange !== 0 && (
                      <span className={`change ${priceChange > 0 ? 'positive' : 'negative'}`}>
                        {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="market-data">
                <div className="market-item">
                  <Info size={14} />
                  <span>Market avg: ${suggestion.marketAverage.toFixed(2)}</span>
                </div>
                <div className="market-item">
                  <DollarSign size={14} />
                  <span>Range: ${suggestion.competitorLow.toFixed(2)} - ${suggestion.competitorHigh.toFixed(2)}</span>
                </div>
              </div>

              <p className="suggestion-reason">{suggestion.reason}</p>

              <button
                className={`btn-apply ${isApplied ? 'applied' : ''}`}
                onClick={() => applySuggestion(suggestion.productId)}
                disabled={isApplied || suggestion.currentPrice === suggestion.suggestedPrice}
              >
                {isApplied ? <><Check size={16} /> Applied</> : 'Apply Suggestion'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
