import { useState } from 'react';
import StarRating from './StarRating';
import { X } from 'lucide-react';

interface WriteReviewModalProps {
  targetName: string;
  targetType?: 'seller' | 'listing';
  onClose: () => void;
  onSubmit: (review: { rating: number; title: string; comment: string }) => void;
}

export default function WriteReviewModal({
  targetName,
  onClose,
  onSubmit,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!title.trim()) {
      newErrors.title = 'Please enter a title';
    }
    if (!comment.trim()) {
      newErrors.comment = 'Please enter your review';
    } else if (comment.length < 20) {
      newErrors.comment = 'Review must be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ rating, title, comment });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 0' }}>
          <h2 style={{ margin: 0 }}>
            Write a Review
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#64748b'
            }}
          >
            <X size={24} />
          </button>
        </div>
        
        <p style={{ padding: '0 1.5rem', color: '#64748b', margin: '0.5rem 0 0' }}>
          Share your experience with <strong>{targetName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-input">
            <label>Your Rating *</label>
            <StarRating 
              rating={rating} 
              size={32} 
              interactive 
              onChange={setRating}
            />
            {errors.rating && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.rating}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="review-title">Review Title *</label>
            <input
              id="review-title"
              type="text"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="review-comment">Your Review *</label>
            <textarea
              id="review-comment"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {comment.length}/500 characters (minimum 20)
            </span>
            {errors.comment && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem', display: 'block' }}>{errors.comment}</span>
            )}
          </div>

          <div className="review-form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
