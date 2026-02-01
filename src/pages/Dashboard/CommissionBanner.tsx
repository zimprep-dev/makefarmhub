import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { AlertCircle, DollarSign, CheckCircle, X } from 'lucide-react';
import './commission-banner.css';

export default function CommissionBanner() {
  const { user } = useAuth();
  const { getSellerStats, payCommission, walletBalance } = useAppData();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  if (!user || user.role !== 'farmer') return null;
  
  const stats = getSellerStats(user.id);
  const commissionAmount = 5.00; // Fixed $5 commission
  const needsToPayCommission = stats.totalSales >= 100 && !stats.commissionPaid;
  
  if (!needsToPayCommission) return null;

  const handlePayCommission = () => {
    if (walletBalance < commissionAmount) {
      alert('Insufficient balance. Please add funds to your wallet first.');
      return;
    }
    payCommission(user.id, commissionAmount);
    setShowPaymentModal(false);
  };

  return (
    <>
      <div className="commission-banner">
        <div className="commission-icon">
          <AlertCircle size={24} />
        </div>
        <div className="commission-content">
          <h3>Service Contribution Required</h3>
          <p>
            Congratulations on reaching <strong>${stats.totalSales.toFixed(2)}</strong> in total sales! 
            To continue listing and selling, please pay a one-time service contribution of <strong>${commissionAmount.toFixed(2)}</strong>.
          </p>
        </div>
        <button 
          className="btn-pay-commission"
          onClick={() => setShowPaymentModal(true)}
        >
          <DollarSign size={16} />
          Pay Now
        </button>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pay Service Contribution</h2>
              <button className="btn-close" onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="commission-details">
                <div className="commission-stat">
                  <span className="label">Total Sales:</span>
                  <span className="value">${stats.totalSales.toFixed(2)}</span>
                </div>
                <div className="commission-stat">
                  <span className="label">Service Contribution:</span>
                  <span className="value commission-amount">${commissionAmount.toFixed(2)}</span>
                </div>
                <div className="commission-stat">
                  <span className="label">Wallet Balance:</span>
                  <span className={`value ${walletBalance < commissionAmount ? 'insufficient' : ''}`}>
                    ${walletBalance.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="commission-info">
                <CheckCircle size={20} />
                <p>
                  This one-time contribution helps us maintain and improve MakeFarmHub's platform services, 
                  including secure payments, customer support, and marketplace features.
                </p>
              </div>
              {walletBalance < commissionAmount && (
                <div className="warning-message">
                  <AlertCircle size={18} />
                  <span>Insufficient wallet balance. Please add funds before proceeding.</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handlePayCommission}
                disabled={walletBalance < commissionAmount}
              >
                <DollarSign size={16} />
                Pay ${commissionAmount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
