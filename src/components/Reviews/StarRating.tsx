import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  showValue = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="star-rating">
      <div className="stars">
        {[...Array(maxRating)].map((_, index) => {
          const filled = index < Math.floor(rating);
          const partial = index === Math.floor(rating) && rating % 1 > 0;
          
          return (
            <button
              key={index}
              type="button"
              className={`star ${filled ? 'filled' : ''} ${partial ? 'partial' : ''} ${interactive ? 'interactive' : ''}`}
              onClick={() => handleClick(index)}
              disabled={!interactive}
            >
              <Star
                size={size}
                fill={filled ? '#F7B733' : 'none'}
                color={filled || partial ? '#F7B733' : '#CBD5E1'}
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="rating-value">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
