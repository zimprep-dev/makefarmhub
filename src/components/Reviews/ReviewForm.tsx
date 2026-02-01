import { useState, useRef } from 'react';
import { Star, Upload, X, Camera } from 'lucide-react';
import { useToast } from '../UI/Toast';
import './ReviewForm.css';

interface ReviewFormProps {
  orderId: string;
  targetId: string;
  targetName: string;
  targetType: 'seller' | 'buyer' | 'listing';
  onSubmit: (review: {
    rating: number;
    title: string;
    comment: string;
    photos: string[];
  }) => void;
  onCancel: () => void;
}

export default function ReviewForm({
  orderId,
  targetId,
  targetName,
  targetType,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 5) {
      showToast('error', 'Maximum 5 photos allowed');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Each photo must be under 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('error', 'Please select a rating');
      return;
    }

    if (!title.trim()) {
      showToast('error', 'Please add a title');
      return;
    }

    if (!comment.trim()) {
      showToast('error', 'Please add a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim(),
        photos,
      });
      showToast('success', 'Review submitted successfully!');
    } catch (error) {
      showToast('error', 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select rating';
    }
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>Write a Review</h3>
        <p>Share your experience with <strong>{targetName}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        {/* Star Rating */}
        <div className="form-group rating-group">
          <label>Your Rating *</label>
          <div className="star-rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star size={32} fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'} />
              </button>
            ))}
            <span className="rating-label">{getRatingLabel(hoverRating || rating)}</span>
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="review-title">Review Title *</label>
          <input
            id="review-title"
            type="text"
            placeholder="Summarize your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <span className="char-count">{title.length}/100</span>
        </div>

        {/* Comment */}
        <div className="form-group">
          <label htmlFor="review-comment">Your Review *</label>
          <textarea
            id="review-comment"
            placeholder="Tell others about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={1000}
          />
          <span className="char-count">{comment.length}/1000</span>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label>Add Photos (Optional)</label>
          <p className="help-text">Add up to 5 photos to help others see what you received</p>
          
          <div className="photo-upload-area">
            {photos.map((photo, index) => (
              <div key={index} className="photo-preview">
                <img src={photo} alt={`Upload ${index + 1}`} />
                <button
                  type="button"
                  className="remove-photo"
                  onClick={() => removePhoto(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {photos.length < 5 && (
              <button
                type="button"
                className="add-photo-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={24} />
                <span>Add Photo</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
