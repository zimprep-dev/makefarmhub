import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../components/UI/Toast';
import {
  Search,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  Filter,
} from 'lucide-react';
export default function AdminListings() {
  const { listings, moderateListing } = useAppData();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);

  // Add moderation status to listings for demo
  const listingsWithStatus = useMemo(() => listings.map((listing, index) => ({
    ...listing,
    moderationStatus: (listing as any).moderationStatus || (index % 4 === 0 ? 'pending' : index % 4 === 1 ? 'approved' : index % 4 === 2 ? 'rejected' : 'flagged'),
    flaggedReason: (listing as any).flaggedReason || (index % 4 === 3 ? 'Suspicious pricing' : undefined),
  })), [listings]);

  const filteredListings = listingsWithStatus.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || listing.moderationStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: listingsWithStatus.length,
    pending: listingsWithStatus.filter((l) => l.moderationStatus === 'pending').length,
    approved: listingsWithStatus.filter((l) => l.moderationStatus === 'approved').length,
    flagged: listingsWithStatus.filter((l) => l.moderationStatus === 'flagged').length,
    rejected: listingsWithStatus.filter((l) => l.moderationStatus === 'rejected').length,
  };

  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map((l) => l.id));
    }
  };

  const handleSelectListing = (listingId: string) => {
    setSelectedListings((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

  const handleModerate = (listing: any, action: 'approve' | 'reject') => {
    moderateListing(listing.id, action);
    showToast('success', `Listing ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
  };

  const handleBulkApprove = () => {
    selectedListings.forEach(id => moderateListing(id, 'approve'));
    showToast('success', `${selectedListings.length} listing(s) approved successfully`);
    setSelectedListings([]);
  };

  const handleBulkReject = () => {
    selectedListings.forEach(id => moderateListing(id, 'reject'));
    showToast('success', `${selectedListings.length} listing(s) rejected successfully`);
    setSelectedListings([]);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Listing Moderation</h1>
          <p>Review and approve listings before they go live</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <Package size={24} />
          <div>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Listings</span>
          </div>
        </div>
        <div className="admin-stat-card pending">
          <Clock size={24} />
          <div>
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="admin-stat-card success">
          <CheckCircle size={24} />
          <div>
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="admin-stat-card warning">
          <AlertTriangle size={24} />
          <div>
            <span className="stat-value">{stats.flagged}</span>
            <span className="stat-label">Flagged</span>
          </div>
        </div>
        <div className="admin-stat-card danger">
          <XCircle size={24} />
          <div>
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedListings.length} listing(s) selected</span>
          <div className="bulk-actions">
            <button className="btn-bulk verify" onClick={handleBulkApprove}>
              <CheckCircle size={16} />
              Approve Selected
            </button>
            <button className="btn-bulk suspend" onClick={handleBulkReject}>
              <XCircle size={16} />
              Reject Selected
            </button>
            <button className="btn-bulk cancel" onClick={() => setSelectedListings([])}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search listings or sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Category</label>
          <div className="select-wrapper">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="crops">Crops</option>
              <option value="livestock">Livestock</option>
              <option value="equipment">Equipment</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <div className="select-wrapper">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="listings-moderation-grid">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <div key={listing.id} className={`listing-moderation-card ${selectedListings.includes(listing.id) ? 'selected' : ''}`}>
              <div className="listing-mod-header">
                <input
                  type="checkbox"
                  checked={selectedListings.includes(listing.id)}
                  onChange={() => handleSelectListing(listing.id)}
                />
                <span className={`moderation-status ${listing.moderationStatus}`}>
                  {listing.moderationStatus === 'pending' && <Clock size={14} />}
                  {listing.moderationStatus === 'approved' && <CheckCircle size={14} />}
                  {listing.moderationStatus === 'flagged' && <AlertTriangle size={14} />}
                  {listing.moderationStatus === 'rejected' && <XCircle size={14} />}
                  {listing.moderationStatus}
                </span>
              </div>

              <img src={listing.images[0]} alt={listing.title} className="listing-mod-image" />

              <div className="listing-mod-content">
                <h3>{listing.title}</h3>
                <div className="listing-mod-meta">
                  <span className="price">${listing.price}/{listing.unit}</span>
                  <span className="category">{listing.category}</span>
                </div>
                <div className="listing-mod-seller">
                  <img src={listing.sellerAvatar} alt={listing.sellerName} />
                  <span>{listing.sellerName}</span>
                </div>
                {listing.flaggedReason && (
                  <div className="flagged-reason">
                    <AlertTriangle size={14} />
                    {listing.flaggedReason}
                  </div>
                )}
              </div>

              <div className="listing-mod-actions">
                <Link to={`/listing/${listing.id}`} className="btn-view-listing">
                  <Eye size={16} />
                  View
                </Link>
                {listing.moderationStatus === 'pending' || listing.moderationStatus === 'flagged' ? (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => handleModerate(listing, 'approve')}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleModerate(listing, 'reject')}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Package size={48} />
            <h3>No listings found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
