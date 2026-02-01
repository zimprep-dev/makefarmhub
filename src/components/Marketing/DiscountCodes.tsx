import { useState } from 'react';
import { Tag, Check, X, Calendar } from 'lucide-react';
import { useToast } from '../UI/Toast';
import './DiscountCodes.css';

export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
}

interface DiscountCodesProps {
  appliedCode?: DiscountCode | null;
  onApplyCode: (code: DiscountCode) => void;
  onRemoveCode: () => void;
  orderTotal: number;
}

const availableCodes: DiscountCode[] = [
  {
    id: '1',
    code: 'NEWYEAR2026',
    description: '10% off all products',
    type: 'percentage',
    value: 10,
    maxDiscount: 50,
    expiresAt: '2026-02-28',
    usedCount: 234,
    active: true,
  },
  {
    id: '2',
    code: 'ORGANIC20',
    description: '20% off organic products',
    type: 'percentage',
    value: 20,
    minPurchase: 30,
    expiresAt: '2026-03-31',
    usedCount: 156,
    active: true,
  },
  {
    id: '3',
    code: 'FREESHIP',
    description: '$5 off delivery',
    type: 'fixed',
    value: 5,
    minPurchase: 20,
    expiresAt: '2026-12-31',
    usedCount: 512,
    active: true,
  },
];

export default function DiscountCodes({
  appliedCode,
  onApplyCode,
  onRemoveCode,
  orderTotal,
}: DiscountCodesProps) {
  const [codeInput, setCodeInput] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const { showToast } = useToast();

  const handleApplyCode = (code: string) => {
    const discountCode = availableCodes.find(
      c => c.code.toLowerCase() === code.toLowerCase() && c.active
    );

    if (!discountCode) {
      showToast('error', 'Invalid or expired code');
      return;
    }

    if (discountCode.minPurchase && orderTotal < discountCode.minPurchase) {
      showToast('error', `Minimum purchase of $${discountCode.minPurchase} required`);
      return;
    }

    onApplyCode(discountCode);
    showToast('success', `Code "${discountCode.code}" applied!`);
    setCodeInput('');
    setShowCodes(false);
  };

  const calculateDiscount = (code: DiscountCode): number => {
    if (code.type === 'percentage') {
      const discount = (orderTotal * code.value) / 100;
      return code.maxDiscount ? Math.min(discount, code.maxDiscount) : discount;
    }
    return code.value;
  };

  const isExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="discount-codes-section">
      <div className="discount-input-group">
        <input
          type="text"
          placeholder="Enter discount code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApplyCode(codeInput)}
        />
        <button
          className="btn-apply-code"
          onClick={() => handleApplyCode(codeInput)}
          disabled={!codeInput.trim()}
        >
          Apply
        </button>
      </div>

      {appliedCode && (
        <div className="applied-code">
          <div className="code-info">
            <Tag size={16} />
            <span>
              <strong>{appliedCode.code}</strong> - Save ${calculateDiscount(appliedCode).toFixed(2)}
            </span>
          </div>
          <button className="btn-remove-code" onClick={onRemoveCode}>
            <X size={16} />
          </button>
        </div>
      )}

      <button
        className="btn-view-codes"
        onClick={() => setShowCodes(!showCodes)}
      >
        <Tag size={16} />
        {showCodes ? 'Hide' : 'View'} Available Codes
      </button>

      {showCodes && (
        <div className="available-codes">
          {availableCodes
            .filter(code => code.active && !isExpired(code.expiresAt))
            .map((code) => (
              <div key={code.id} className="code-card">
                <div className="code-header">
                  <div className="code-badge">{code.code}</div>
                  {appliedCode?.id === code.id && (
                    <div className="applied-badge">
                      <Check size={14} />
                      Applied
                    </div>
                  )}
                </div>
                <p className="code-description">{code.description}</p>
                <div className="code-details">
                  {code.minPurchase && (
                    <span className="code-requirement">
                      Min. purchase: ${code.minPurchase}
                    </span>
                  )}
                  <span className="code-expiry">
                    <Calendar size={12} />
                    Expires {new Date(code.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="btn-use-code"
                  onClick={() => handleApplyCode(code.code)}
                  disabled={
                    appliedCode?.id === code.id ||
                    (code.minPurchase !== undefined && orderTotal < code.minPurchase)
                  }
                >
                  {appliedCode?.id === code.id ? 'Applied' : 'Use Code'}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
