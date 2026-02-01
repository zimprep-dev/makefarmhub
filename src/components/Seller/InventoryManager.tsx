import { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Edit2, 
  Check, 
  X,
  Bell,
  Settings
} from 'lucide-react';
import { useToast } from '../UI/Toast';
import './InventoryManager.css';

interface InventoryItem {
  id: string;
  title: string;
  category: string;
  currentStock: number;
  unit: string;
  lowStockThreshold: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export default function InventoryManager() {
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  // Mock inventory data
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', title: 'Organic Tomatoes', category: 'crops', currentStock: 45, unit: 'kg', lowStockThreshold: 20, lastUpdated: '2026-01-30', status: 'in_stock' },
    { id: '2', title: 'Fresh Maize', category: 'crops', currentStock: 12, unit: 'bags', lowStockThreshold: 15, lastUpdated: '2026-01-29', status: 'low_stock' },
    { id: '3', title: 'Broiler Chickens', category: 'livestock', currentStock: 0, unit: 'each', lowStockThreshold: 10, lastUpdated: '2026-01-28', status: 'out_of_stock' },
    { id: '4', title: 'Free-range Eggs', category: 'livestock', currentStock: 200, unit: 'each', lowStockThreshold: 50, lastUpdated: '2026-01-30', status: 'in_stock' },
    { id: '5', title: 'Cabbage', category: 'crops', currentStock: 8, unit: 'heads', lowStockThreshold: 10, lastUpdated: '2026-01-27', status: 'low_stock' },
  ]);

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'green';
      case 'low_stock': return 'orange';
      case 'out_of_stock': return 'red';
    }
  };

  const getStatusLabel = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValue(item.currentStock);
  };

  const saveEdit = (id: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = editValue === 0 
          ? 'out_of_stock' 
          : editValue <= item.lowStockThreshold 
            ? 'low_stock' 
            : 'in_stock';
        return {
          ...item,
          currentStock: editValue,
          status: newStatus,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    }));
    setEditingId(null);
    showToast('success', 'Stock updated successfully');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const lowStockCount = inventory.filter(i => i.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'out_of_stock').length;

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <div>
          <h2>
            <Package size={24} />
            Inventory Management
          </h2>
          <p>Track and manage your product stock levels</p>
        </div>
        <button className="btn-settings" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <h4>Notification Settings</h4>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={lowStockAlerts}
              onChange={(e) => setLowStockAlerts(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span>Low stock email alerts</span>
          </label>
        </div>
      )}

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="summary-card total">
          <Package size={20} />
          <div>
            <span className="count">{inventory.length}</span>
            <span className="label">Total Products</span>
          </div>
        </div>
        <div className="summary-card low-stock">
          <TrendingDown size={20} />
          <div>
            <span className="count">{lowStockCount}</span>
            <span className="label">Low Stock</span>
          </div>
        </div>
        <div className="summary-card out-of-stock">
          <AlertTriangle size={20} />
          <div>
            <span className="count">{outOfStockCount}</span>
            <span className="label">Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="stock-alert">
          <Bell size={18} />
          <span>
            You have <strong>{lowStockCount + outOfStockCount}</strong> products that need attention
          </span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table">
        <div className="table-header">
          <span>Product</span>
          <span>Category</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Last Updated</span>
          <span>Actions</span>
        </div>
        {inventory.map((item) => (
          <div key={item.id} className={`table-row ${item.status}`}>
            <span className="product-name">{item.title}</span>
            <span className="category">{item.category}</span>
            <span className="stock-cell">
              {editingId === item.id ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                  min="0"
                  autoFocus
                />
              ) : (
                <span className="stock-value">
                  {item.currentStock} {item.unit}
                </span>
              )}
            </span>
            <span>
              <span className={`status-badge ${getStatusColor(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
            </span>
            <span className="date">{item.lastUpdated}</span>
            <span className="actions">
              {editingId === item.id ? (
                <>
                  <button className="btn-save" onClick={() => saveEdit(item.id)}>
                    <Check size={16} />
                  </button>
                  <button className="btn-cancel" onClick={cancelEdit}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <button className="btn-edit" onClick={() => startEditing(item)}>
                  <Edit2 size={16} />
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
