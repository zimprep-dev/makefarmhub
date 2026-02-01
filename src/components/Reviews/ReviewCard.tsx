import { useState } from 'react';
import type { Review } from '../../types';
import StarRating from './StarRating';
import { ThumbsUp, ThumbsDown, CheckCircle, MessageSquare, X, ZoomIn } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onUnhelpful?: (reviewId: string) => void;
  isSellerView?: boolean;
  onSellerRespond?: (reviewId: string, response: string) => void;
}

export default function ReviewCard({ review, onHelpful, onUnhelpful, isSellerView, onSellerRespond }: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmitResponse = () => {
    if (responseText.trim() && onSellerRespond) {
      onSellerRespond(review.id, responseText);
      setResponseText('');
      setShowResponseForm(false);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          {review.reviewerAvatar ? (
            <img 
              src={review.reviewerAvatar} 
              alt={review.reviewerName}
              className="reviewer-avatar"
            />
          ) : (
            <div className="reviewer-avatar placeholder">
              {review.reviewerName.charAt(0)}
            </div>
          )}
          <div className="reviewer-details">
            <div className="reviewer-name">
              {review.reviewerName}
              {review.verified && (
                <span className="verified-badge">
                  <CheckCircle size={14} />
                  Verified Purchase
                </span>
              )}
            </div>
            <span className="review-date">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        <StarRating rating={review.rating} size={16} />
      </div>

      <div className="review-content">
        <h4 className="review-title">{review.title}</h4>
        <p className="review-comment">{review.comment}</p>
        
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            {review.images.map((img, index) => (
              <img 
                key={index}
                src={img}
                alt={`Review image ${index + 1}`}
                className="review-image"
              />
            ))}
          </div>
        )}
      </div>

      {/* Seller Response */}
      {review.sellerResponse && (
        <div className="seller-response">
          <div className="response-header">
            <MessageSquare size={16} />
            <strong>Seller Response</strong>
            <span className="response-date">
              {formatDate(review.sellerResponse.respondedAt)}
            </span>
          </div>
          <p>{review.sellerResponse.comment}</p>
        </div>
      )}

      <div className="review-footer">
        <div className="voting-buttons">
          <button 
            className="helpful-btn"
            onClick={() => onHelpful?.(review.id)}
          >
            <ThumbsUp size={14} />
            Helpful ({review.helpful})
          </button>
          <button 
            className="unhelpful-btn"
            onClick={() => onUnhelpful?.(review.id)}
          >
            <ThumbsDown size={14} />
            ({review.unhelpful || 0})
          </button>
        </div>

        {isSellerView && !review.sellerResponse && (
          <button 
            className="respond-btn"
            onClick={() => setShowResponseForm(!showResponseForm)}
          >
            <MessageSquare size={14} />
            Respond
          </button>
        )}
      </div>

      {/* Seller Response Form */}
      {showResponseForm && (
        <div className="response-form">
          <textarea
            placeholder="Write your response to this review..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={3}
          />
          <div className="response-actions">
            <button className="btn-cancel" onClick={() => setShowResponseForm(false)}>
              Cancel
            </button>
            <button 
              className="btn-submit"
              onClick={handleSubmitResponse}
              disabled={!responseText.trim()}
            >
              Submit Response
            </button>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="image-lightbox" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close">
            <X size={24} />
          </button>
          <img src={selectedImage} alt="Review" />
        </div>
      )}
    </div>
  );
}
