import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../UI/Toast';
import type { Listing } from '../../types';
import {
  X,
  MapPin,
  Heart,
  Share2,
  MessageSquare,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  Check,
} from 'lucide-react';

interface ProductQuickViewProps {
  listing: Listing;
  onClose: () => void;
}

export default function ProductQuickView({ listing, onClose }: ProductQuickViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const totalPrice = listing.price * quantity;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  const handleBuyNow = () => {
    showToast('success', `Processing purchase of ${quantity} ${listing.unit}...`);
    setTimeout(() => {
      onClose();
      navigate('/orders');
    }, 1500);
  };

  const handleContactSeller = () => {
    onClose();
    navigate('/messages');
    showToast('info', 'Opening chat with seller...');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(isFavorite ? 'info' : 'success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
      showToast('success', 'Link copied to clipboard!');
    } catch {
      showToast('error', 'Failed to copy link');
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/listing/${listing.id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-quick-view" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="quick-view-content">
          {/* Image Gallery */}
          <div className="quick-view-gallery">
            <div className="quick-view-main-image">
              <img src={listing.images[currentImage]} alt={listing.title} />
              {listing.images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={prevImage}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className="gallery-nav next" onClick={nextImage}>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="image-counter">
                {currentImage + 1} / {listing.images.length}
              </div>
            </div>
            {listing.images.length > 1 && (
              <div className="quick-view-thumbnails">
                {listing.images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === currentImage ? 'active' : ''}`}
                    onClick={() => setCurrentImage(index)}
                  >
                    <img src={img} alt={`${listing.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="quick-view-info">
            <div className="quick-view-header">
              <div className="quick-view-badges">
                <span className="category-badge">{listing.subcategory}</span>
                {listing.featured && <span className="featured-badge">Featured</span>}
                <span className={`status-badge status-${listing.status}`}>
                  {listing.status}
                </span>
              </div>
              <div className="quick-view-actions">
                <button 
                  className={`action-btn ${isFavorite ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button className="action-btn" onClick={handleShare}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <h2>{listing.title}</h2>

            <div className="quick-view-location">
              <MapPin size={14} />
              {listing.location}
            </div>

            <div className="quick-view-stats">
              <span><Eye size={14} /> {listing.views} views</span>
            </div>

            <div className="quick-view-price">
              <span className="price">${listing.price}</span>
              <span className="unit">per {listing.unit}</span>
            </div>

            <div className="quick-view-stock">
              <Check size={14} />
              {listing.quantity} {listing.unit}s available
            </div>

            <div className="quick-view-description">
              <h4>Description</h4>
              <p>{listing.description}</p>
            </div>

            {/* Seller Info */}
            <div className="quick-view-seller">
              <img src={listing.sellerAvatar} alt={listing.sellerName} />
              <div>
                <span className="seller-name">{listing.sellerName}</span>
                <span className="seller-rating">
                  <Star size={12} fill="#f7b733" color="#f7b733" />
                  {listing.sellerRating}
                </span>
              </div>
            </div>

            {/* Order Section */}
            {user?.role === 'buyer' && (
              <div className="quick-view-order">
                <div className="quantity-row">
                  <label>Quantity:</label>
                  <div className="quantity-input">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantity, Number(e.target.value))))}
                      min={1}
                      max={listing.quantity}
                    />
                    <button onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}>+</button>
                  </div>
                  <span className="order-total">Total: <strong>${totalPrice.toFixed(2)}</strong></span>
                </div>

                <div className="quick-view-buttons">
                  <button className="btn-primary" onClick={handleBuyNow}>
                    <ShoppingCart size={18} />
                    Buy Now
                  </button>
                  <button className="btn-outline" onClick={handleContactSeller}>
                    <MessageSquare size={18} />
                    Message
                  </button>
                </div>
              </div>
            )}

            <button className="btn-view-full" onClick={handleViewFullDetails}>
              View Full Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
