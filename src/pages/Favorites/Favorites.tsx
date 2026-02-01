import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../components/UI/Toast';
import {
  Heart,
  MapPin,
  Eye,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import '../../styles/favorites.css';

export default function Favorites() {
  const { listings, favorites, toggleFavorite } = useAppData();
  const { showToast } = useToast();

  const favoriteListings = listings.filter((listing) =>
    favorites.includes(listing.id)
  );

  const handleRemove = (listingId: string, listingTitle: string) => {
    toggleFavorite(listingId);
    showToast('info', `${listingTitle} removed from favorites`);
  };

  const handleClearAll = () => {
    favoriteListings.forEach((listing) => toggleFavorite(listing.id));
    showToast('info', 'All favorites cleared');
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div className="header-content">
          <h1>
            <Heart size={28} fill="#ef4444" stroke="#ef4444" />
            My Favorites
          </h1>
          <p>Items you've saved for later</p>
        </div>
        {favoriteListings.length > 0 && (
          <button className="btn-clear-all" onClick={handleClearAll}>
            <Trash2 size={18} />
            Clear All
          </button>
        )}
      </div>

      {favoriteListings.length > 0 ? (
        <>
          <div className="favorites-count">
            <span>{favoriteListings.length} item{favoriteListings.length !== 1 ? 's' : ''} saved</span>
          </div>

          <div className="favorites-grid">
            {favoriteListings.map((listing) => (
              <div key={listing.id} className="favorite-card">
                <Link to={`/listing/${listing.id}`} className="favorite-image">
                  <img src={listing.images[0]} alt={listing.title} />
                  {listing.featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </Link>

                <div className="favorite-content">
                  <div className="favorite-category">{listing.subcategory}</div>
                  <Link to={`/listing/${listing.id}`}>
                    <h3>{listing.title}</h3>
                  </Link>
                  <p className="favorite-description">{listing.description}</p>

                  <div className="favorite-location">
                    <MapPin size={14} />
                    {listing.location}
                  </div>

                  <div className="favorite-footer">
                    <div className="favorite-price">
                      <strong>${listing.price}</strong>
                      <span>/{listing.unit}</span>
                    </div>
                    <div className="favorite-meta">
                      <span>
                        <Eye size={14} /> {listing.views}
                      </span>
                      <span>{listing.quantity} available</span>
                    </div>
                  </div>

                  <div className="favorite-seller">
                    <img src={listing.sellerAvatar} alt={listing.sellerName} />
                    <span>{listing.sellerName}</span>
                    {listing.sellerVerified && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                  </div>

                  <div className="favorite-actions">
                    <Link to={`/listing/${listing.id}`} className="btn-view-listing">
                      View Listing
                      <ArrowRight size={16} />
                    </Link>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(listing.id, listing.title)}
                    >
                      <Heart size={18} fill="currentColor" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-favorites">
          <div className="empty-icon">
            <Heart size={64} />
          </div>
          <h2>No favorites yet</h2>
          <p>
            Browse the marketplace and tap the heart icon on items you like to
            save them here.
          </p>
          <Link to="/marketplace" className="btn-browse">
            <ShoppingBag size={20} />
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
