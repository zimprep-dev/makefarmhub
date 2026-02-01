import { useState } from 'react';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Tag,
  Image,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
  active: boolean;
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  position: 'top' | 'middle' | 'sidebar';
  active: boolean;
  startDate: string;
  endDate: string;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'categories' | 'banners'>('categories');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'cat-1',
      name: 'Crops',
      icon: '🌾',
      subcategories: ['Maize', 'Wheat', 'Rice', 'Vegetables', 'Fruits'],
      active: true,
    },
    {
      id: 'cat-2',
      name: 'Livestock',
      icon: '🐄',
      subcategories: ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs'],
      active: true,
    },
    {
      id: 'cat-3',
      name: 'Equipment',
      icon: '🚜',
      subcategories: ['Tractors', 'Ploughs', 'Harvesters', 'Irrigation', 'Tools'],
      active: true,
    },
  ]);

  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 'banner-1',
      title: 'Summer Harvest Sale',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
      link: '/marketplace?category=crops',
      position: 'top',
      active: true,
      startDate: '2024-12-01',
      endDate: '2024-12-31',
    },
    {
      id: 'banner-2',
      title: 'New Farmer Registration',
      imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
      link: '/signup',
      position: 'middle',
      active: true,
      startDate: '2024-11-01',
      endDate: '2025-01-31',
    },
  ]);

  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    subcategories: '',
  });

  const [newBanner, setNewBanner] = useState({
    title: '',
    imageUrl: '',
    link: '',
    position: 'top' as const,
    startDate: '',
    endDate: '',
  });

  const handleAddCategory = () => {
    const category: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      icon: newCategory.icon,
      subcategories: newCategory.subcategories.split(',').map(s => s.trim()).filter(Boolean),
      active: true,
    };
    setCategories([...categories, category]);
    setNewCategory({ name: '', icon: '📦', subcategories: '' });
    setShowAddCategory(false);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    setCategories(categories.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    ));
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const handleToggleCategory = (id: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, active: !cat.active } : cat
    ));
  };

  const handleAddBanner = () => {
    const banner: Banner = {
      id: `banner-${Date.now()}`,
      ...newBanner,
      active: true,
    };
    setBanners([...banners, banner]);
    setNewBanner({
      title: '',
      imageUrl: '',
      link: '',
      position: 'top',
      startDate: '',
      endDate: '',
    });
    setShowAddBanner(false);
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleToggleBanner = (id: string) => {
    setBanners(banners.map(b =>
      b.id === id ? { ...b, active: !b.active } : b
    ));
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Platform Settings</h1>
          <p>Manage categories, banners, and ads</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={18} />
          Categories
        </button>
        <button
          className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
          onClick={() => setActiveTab('banners')}
        >
          <Image size={18} />
          Banners & Ads
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="admin-card">
          <div className="card-header">
            <h2>Product Categories</h2>
            <button className="btn-primary" onClick={() => setShowAddCategory(true)}>
              <Plus size={18} /> Add Category
            </button>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className={`category-card ${!category.active ? 'inactive' : ''}`}>
                <div className="category-header">
                  <div className="category-icon">{category.icon}</div>
                  <h3>{category.name}</h3>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggleCategory(category.id)}
                    title={category.active ? 'Deactivate' : 'Activate'}
                  >
                    {category.active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <div className="subcategories">
                  {category.subcategories.map((sub, idx) => (
                    <span key={idx} className="subcategory-tag">{sub}</span>
                  ))}
                </div>
                <div className="category-actions">
                  <button className="btn-edit" onClick={() => setEditingCategory(category)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {showAddCategory && (
            <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add New Category</h2>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Seeds"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Icon (Emoji) *</label>
                  <input
                    type="text"
                    placeholder="e.g., 🌱"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Subcategories (comma-separated) *</label>
                  <input
                    type="text"
                    placeholder="e.g., Hybrid Seeds, Organic Seeds, Vegetable Seeds"
                    value={newCategory.subcategories}
                    onChange={(e) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowAddCategory(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn-verify"
                    onClick={handleAddCategory}
                    disabled={!newCategory.name || !newCategory.subcategories}
                  >
                    <Save size={18} /> Add Category
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Category Modal */}
          {editingCategory && (
            <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Category</h2>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Icon (Emoji) *</label>
                  <input
                    type="text"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Subcategories (comma-separated) *</label>
                  <input
                    type="text"
                    value={editingCategory.subcategories.join(', ')}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      subcategories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </button>
                  <button className="btn-verify" onClick={handleUpdateCategory}>
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="admin-card">
          <div className="card-header">
            <h2>Banners & Advertisements</h2>
            <button className="btn-primary" onClick={() => setShowAddBanner(true)}>
              <Plus size={18} /> Add Banner
            </button>
          </div>

          <div className="banners-list">
            {banners.map((banner) => (
              <div key={banner.id} className={`banner-item ${!banner.active ? 'inactive' : ''}`}>
                <img src={banner.imageUrl} alt={banner.title} className="banner-preview" />
                <div className="banner-info">
                  <h3>{banner.title}</h3>
                  <div className="banner-meta">
                    <span className="banner-position">{banner.position}</span>
                    <span className="banner-dates">
                      <Calendar size={14} />
                      {banner.startDate} to {banner.endDate}
                    </span>
                  </div>
                  <p className="banner-link">Link: {banner.link}</p>
                </div>
                <div className="banner-actions">
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggleBanner(banner.id)}
                  >
                    {banner.active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteBanner(banner.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Banner Modal */}
          {showAddBanner && (
            <div className="modal-overlay" onClick={() => setShowAddBanner(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add New Banner</h2>
                <div className="form-group">
                  <label>Banner Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Sale 2024"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newBanner.imageUrl}
                    onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Link URL *</label>
                  <input
                    type="text"
                    placeholder="/marketplace"
                    value={newBanner.link}
                    onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <select
                    value={newBanner.position}
                    onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value as any })}
                  >
                    <option value="top">Top of Page</option>
                    <option value="middle">Middle Section</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={newBanner.startDate}
                      onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={newBanner.endDate}
                      onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                    />
                  </div>
                </div>
                {newBanner.imageUrl && (
                  <div className="banner-preview-container">
                    <label>Preview</label>
                    <img src={newBanner.imageUrl} alt="Preview" className="preview-image" />
                  </div>
                )}
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowAddBanner(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn-verify"
                    onClick={handleAddBanner}
                    disabled={!newBanner.title || !newBanner.imageUrl || !newBanner.link}
                  >
                    <Save size={18} /> Add Banner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
