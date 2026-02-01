import { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Plus, 
  Trash2, 
  Check,
  Shield
} from 'lucide-react';
import { useToast } from '../UI/Toast';
import './PaymentMethods.css';

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'card' | 'mobile' | 'bank'>('card');

  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', name: 'Visa ending in 4242', details: 'Expires 12/27', isDefault: true },
    { id: '2', type: 'mobile', name: 'EcoCash', details: '+263 77* *** **89', isDefault: false },
    { id: '3', type: 'bank', name: 'CBZ Bank', details: 'Account ending in 5678', isDefault: false },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'card': return CreditCard;
      case 'mobile': return Smartphone;
      case 'bank': return Building2;
      default: return CreditCard;
    }
  };

  const setDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    showToast('success', 'Default payment method updated');
  };

  const removeMethod = (id: string) => {
    const method = methods.find(m => m.id === id);
    if (method?.isDefault) {
      showToast('error', 'Cannot remove default payment method');
      return;
    }
    setMethods(prev => prev.filter(m => m.id !== id));
    showToast('success', 'Payment method removed');
  };

  const addMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: newMethodType,
      name: newMethodType === 'card' ? 'New Card' : newMethodType === 'mobile' ? 'Mobile Money' : 'Bank Account',
      details: 'Just added',
      isDefault: methods.length === 0,
    };
    setMethods(prev => [...prev, newMethod]);
    setShowAddForm(false);
    showToast('success', 'Payment method added');
  };

  return (
    <div className="payment-methods">
      <div className="methods-header">
        <h2><CreditCard size={24} /> Payment Methods</h2>
        <button className="btn-add" onClick={() => setShowAddForm(true)}>
          <Plus size={18} /> Add New
        </button>
      </div>

      <div className="methods-list">
        {methods.map((method) => {
          const Icon = getIcon(method.type);
          return (
            <div key={method.id} className={`method-card ${method.isDefault ? 'default' : ''}`}>
              <div className="method-icon">
                <Icon size={24} />
              </div>
              <div className="method-info">
                <span className="method-name">{method.name}</span>
                <span className="method-details">{method.details}</span>
              </div>
              <div className="method-actions">
                {method.isDefault ? (
                  <span className="default-badge"><Check size={14} /> Default</span>
                ) : (
                  <button className="btn-default" onClick={() => setDefault(method.id)}>
                    Set Default
                  </button>
                )}
                <button 
                  className="btn-remove" 
                  onClick={() => removeMethod(method.id)}
                  disabled={method.isDefault}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <div className="add-method-modal">
          <div className="modal-content">
            <h3>Add Payment Method</h3>
            <form onSubmit={addMethod}>
              <div className="method-type-selector">
                {(['card', 'mobile', 'bank'] as const).map((type) => {
                  const Icon = getIcon(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`type-btn ${newMethodType === type ? 'active' : ''}`}
                      onClick={() => setNewMethodType(type)}
                    >
                      <Icon size={20} />
                      <span>{type === 'card' ? 'Card' : type === 'mobile' ? 'Mobile Money' : 'Bank'}</span>
                    </button>
                  );
                })}
              </div>

              {newMethodType === 'card' && (
                <div className="form-fields">
                  <input type="text" placeholder="Card Number" maxLength={19} />
                  <div className="row">
                    <input type="text" placeholder="MM/YY" maxLength={5} />
                    <input type="text" placeholder="CVV" maxLength={4} />
                  </div>
                  <input type="text" placeholder="Cardholder Name" />
                </div>
              )}

              {newMethodType === 'mobile' && (
                <div className="form-fields">
                  <select>
                    <option>EcoCash</option>
                    <option>OneMoney</option>
                    <option>InnBucks</option>
                  </select>
                  <input type="tel" placeholder="Phone Number" />
                </div>
              )}

              {newMethodType === 'bank' && (
                <div className="form-fields">
                  <select>
                    <option>CBZ Bank</option>
                    <option>FBC Bank</option>
                    <option>Stanbic Bank</option>
                    <option>Standard Chartered</option>
                  </select>
                  <input type="text" placeholder="Account Number" />
                  <input type="text" placeholder="Account Holder Name" />
                </div>
              )}

              <div className="security-note">
                <Shield size={16} />
                <span>Your payment information is encrypted and secure</span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
