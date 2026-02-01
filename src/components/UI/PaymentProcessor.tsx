import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Shield,
  ArrowRight,
  Smartphone,
  Building2,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import '../../styles/payment-processor.css';

interface PaymentProcessorProps {
  amount: number;
  paymentMethod: string;
  onSuccess: () => void;
  onCancel: () => void;
  type: 'deposit' | 'withdraw' | 'purchase';
  orderDetails?: {
    title: string;
    seller: string;
    quantity: number;
  };
}

type PaymentStep = 'confirm' | 'processing' | 'verifying' | 'success' | 'failed';

export default function PaymentProcessor({
  amount,
  paymentMethod,
  onSuccess,
  onCancel,
  type,
  orderDetails,
}: PaymentProcessorProps) {
  const [step, setStep] = useState<PaymentStep>('confirm');
  const [progress, setProgress] = useState(0);

  const getPaymentIcon = () => {
    if (paymentMethod.includes('EcoCash') || paymentMethod.includes('OneMoney')) {
      return <Smartphone size={32} />;
    }
    if (paymentMethod.includes('Bank')) {
      return <Building2 size={32} />;
    }
    return <CreditCard size={32} />;
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdraw': return 'Withdrawal';
      case 'purchase': return 'Payment';
      default: return 'Transaction';
    }
  };

  const startProcessing = () => {
    setStep('processing');
    setProgress(0);

    // Simulate payment processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Move to verifying after 2.5 seconds
    setTimeout(() => {
      setStep('verifying');
    }, 2500);

    // Complete after 4 seconds (simulated)
    setTimeout(() => {
      // 95% success rate for demo
      if (Math.random() > 0.05) {
        setStep('success');
      } else {
        setStep('failed');
      }
    }, 4000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="payment-processor-overlay">
      <div className="payment-processor-modal">
        {/* Confirm Step */}
        {step === 'confirm' && (
          <>
            <div className="pp-header">
              <div className="pp-icon confirm">
                {getPaymentIcon()}
              </div>
              <h2>Confirm {getTypeLabel()}</h2>
              <p>Please review the details below</p>
            </div>

            <div className="pp-body">
              <div className="pp-amount-display">
                <span className="pp-amount-label">Amount</span>
                <span className="pp-amount-value">{formatCurrency(amount)}</span>
              </div>

              <div className="pp-details">
                <div className="pp-detail-row">
                  <span>Payment Method</span>
                  <span className="pp-detail-value">
                    {getPaymentIcon()}
                    {paymentMethod}
                  </span>
                </div>
                {type === 'purchase' && orderDetails && (
                  <>
                    <div className="pp-detail-row">
                      <span>Product</span>
                      <span>{orderDetails.title}</span>
                    </div>
                    <div className="pp-detail-row">
                      <span>Seller</span>
                      <span>{orderDetails.seller}</span>
                    </div>
                    <div className="pp-detail-row">
                      <span>Quantity</span>
                      <span>{orderDetails.quantity}</span>
                    </div>
                  </>
                )}
                <div className="pp-detail-row">
                  <span>Processing Fee</span>
                  <span>{formatCurrency(type === 'withdraw' ? 1.00 : 0)}</span>
                </div>
                <div className="pp-detail-row total">
                  <span>Total</span>
                  <span>{formatCurrency(amount + (type === 'withdraw' ? 1.00 : 0))}</span>
                </div>
              </div>

              <div className="pp-security-note">
                <Shield size={16} />
                <span>Your transaction is secured with 256-bit encryption</span>
              </div>
            </div>

            <div className="pp-footer">
              <button className="btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={startProcessing}>
                <Lock size={18} />
                Confirm {getTypeLabel()}
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="pp-processing">
            <div className="pp-spinner">
              <Loader2 size={48} className="spinning" />
            </div>
            <h2>Processing Payment</h2>
            <p>Please wait while we process your {getTypeLabel().toLowerCase()}...</p>
            
            <div className="pp-progress-bar">
              <div className="pp-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="pp-progress-text">{progress}%</span>

            <div className="pp-processing-steps">
              <div className={`pp-step ${progress > 0 ? 'active' : ''} ${progress > 30 ? 'complete' : ''}`}>
                <CheckCircle size={16} />
                <span>Initiating transaction</span>
              </div>
              <div className={`pp-step ${progress > 30 ? 'active' : ''} ${progress > 60 ? 'complete' : ''}`}>
                <CheckCircle size={16} />
                <span>Connecting to {paymentMethod}</span>
              </div>
              <div className={`pp-step ${progress > 60 ? 'active' : ''} ${progress >= 100 ? 'complete' : ''}`}>
                <CheckCircle size={16} />
                <span>Processing payment</span>
              </div>
            </div>
          </div>
        )}

        {/* Verifying Step */}
        {step === 'verifying' && (
          <div className="pp-processing">
            <div className="pp-spinner verifying">
              <Shield size={48} />
            </div>
            <h2>Verifying Transaction</h2>
            <p>Confirming with payment provider...</p>
            
            <div className="pp-processing-steps">
              <div className="pp-step complete">
                <CheckCircle size={16} />
                <span>Payment received</span>
              </div>
              <div className="pp-step active">
                <Loader2 size={16} className="spinning" />
                <span>Verifying with {paymentMethod}</span>
              </div>
              <div className="pp-step">
                <CheckCircle size={16} />
                <span>Updating your wallet</span>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="pp-result success">
            <div className="pp-result-icon">
              <CheckCircle size={64} />
            </div>
            <h2>{getTypeLabel()} Successful!</h2>
            <p className="pp-result-amount">{formatCurrency(amount)}</p>
            <p className="pp-result-message">
              {type === 'deposit' && 'Funds have been added to your wallet'}
              {type === 'withdraw' && 'Funds are being transferred to your account'}
              {type === 'purchase' && 'Payment has been placed in escrow'}
            </p>

            <div className="pp-transaction-id">
              <span>Transaction ID</span>
              <code>TXN-{Date.now().toString(36).toUpperCase()}</code>
            </div>

            <button className="btn-done" onClick={onSuccess}>
              Done
            </button>
          </div>
        )}

        {/* Failed Step */}
        {step === 'failed' && (
          <div className="pp-result failed">
            <div className="pp-result-icon">
              <XCircle size={64} />
            </div>
            <h2>{getTypeLabel()} Failed</h2>
            <p className="pp-result-message">
              We couldn't process your payment. Please try again or use a different payment method.
            </p>

            <div className="pp-error-details">
              <AlertTriangle size={16} />
              <span>Error: Transaction declined by payment provider</span>
            </div>

            <div className="pp-failed-actions">
              <button className="btn-retry" onClick={() => setStep('confirm')}>
                Try Again
              </button>
              <button className="btn-cancel" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
