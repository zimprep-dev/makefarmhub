import { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  TrendingDown, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../UI/Toast';
import './PriceAlerts.css';

interface PriceAlert {
  id: string;
  productName: string;
  productId: string;
  targetPrice: number;
  currentPrice: number;
  alertType: 'below' | 'above';
  isTriggered: boolean;
  createdAt: string;
}

export default function PriceAlerts() {
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    productName: '',
    targetPrice: '',
    alertType: 'below' as 'below' | 'above',
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      productName: 'Organic Tomatoes',
      productId: 'prod-1',
      targetPrice: 4.50,
      currentPrice: 5.00,
      alertType: 'below',
      isTriggered: false,
      createdAt: '2026-01-28',
    },
    {
      id: '2',
      productName: 'Fresh Maize',
      productId: 'prod-2',
      targetPrice: 12.00,
      currentPrice: 10.00,
      alertType: 'above',
      isTriggered: true,
      createdAt: '2026-01-25',
    },
  ]);

  const addAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.productName || !newAlert.targetPrice) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    const alert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productName: newAlert.productName,
      productId: `prod-${Date.now()}`,
      targetPrice: parseFloat(newAlert.targetPrice),
      currentPrice: parseFloat(newAlert.targetPrice) * 1.1,
      alertType: newAlert.alertType,
      isTriggered: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({ productName: '', targetPrice: '', alertType: 'below' });
    setShowAddForm(false);
    showToast('success', 'Price alert created!');
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('success', 'Alert deleted');
  };

  return (
    <div className="price-alerts">
      <div className="alerts-header">
        <h2>
          <Bell size={24} />
          Price Alerts
        </h2>
        <button className="btn-add" onClick={() => setShowAddForm(true)}>
          <Plus size={18} />
          New Alert
        </button>
      </div>

      <p className="alerts-description">
        Get notified when product prices reach your target
      </p>

      {showAddForm && (
        <form className="add-alert-form" onSubmit={addAlert}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Product name"
              value={newAlert.productName}
              onChange={(e) => setNewAlert(prev => ({ ...prev, productName: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Target price"
              value={newAlert.targetPrice}
              onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-row">
            <div className="alert-type-selector">
              <button
                type="button"
                className={newAlert.alertType === 'below' ? 'active' : ''}
                onClick={() => setNewAlert(prev => ({ ...prev, alertType: 'below' }))}
              >
                <TrendingDown size={16} />
                Price drops below
              </button>
              <button
                type="button"
                className={newAlert.alertType === 'above' ? 'active' : ''}
                onClick={() => setNewAlert(prev => ({ ...prev, alertType: 'above' }))}
              >
                <TrendingUp size={16} />
                Price goes above
              </button>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Create Alert
            </button>
          </div>
        </form>
      )}

      <div className="alerts-list">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${alert.isTriggered ? 'triggered' : ''}`}>
              <div className="alert-icon">
                {alert.alertType === 'below' ? (
                  <TrendingDown size={20} />
                ) : (
                  <TrendingUp size={20} />
                )}
              </div>
              <div className="alert-info">
                <span className="alert-product">{alert.productName}</span>
                <span className="alert-condition">
                  {alert.alertType === 'below' ? 'When price drops below' : 'When price goes above'}{' '}
                  <strong>${alert.targetPrice.toFixed(2)}</strong>
                </span>
                <span className="alert-current">
                  Current: ${alert.currentPrice.toFixed(2)}
                </span>
              </div>
              {alert.isTriggered && (
                <span className="triggered-badge">
                  <AlertCircle size={14} />
                  Triggered
                </span>
              )}
              <button className="btn-delete" onClick={() => deleteAlert(alert.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="no-alerts">
            <Bell size={48} />
            <p>No price alerts set</p>
            <span>Create an alert to get notified about price changes</span>
          </div>
        )}
      </div>
    </div>
  );
}
