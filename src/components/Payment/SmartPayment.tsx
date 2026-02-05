import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// Dynamically import based on Stripe availability
const StripePayment = import('./StripePayment').then(m => m.default);
const RealStripePayment = import('./RealStripePayment').then(m => m.default);

interface SmartPaymentProps {
  amount: number;
  currency?: string;
  orderId: string;
  customerEmail?: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

/**
 * Smart Payment Component
 * Automatically switches between demo and real Stripe payments
 * based on environment configuration
 */
export default function SmartPayment(props: SmartPaymentProps) {
  const [PaymentComponent, setPaymentComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentComponent = async () => {
      try {
        const hasStripeKey = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        
        if (hasStripeKey) {
          // Use real Stripe payment
          const RealPayment = await RealStripePayment;
          setPaymentComponent(() => RealPayment);
        } else {
          // Fall back to demo payment
          const DemoPayment = await StripePayment;
          setPaymentComponent(() => DemoPayment);
        }
      } catch (err) {
        console.error('Failed to load payment component:', err);
        setError('Payment system unavailable. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentComponent();
  }, []);

  if (loading) {
    return (
      <div className="stripe-payment loading">
        <div className="processing-animation">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <p>Loading payment system...</p>
      </div>
    );
  }

  if (error || !PaymentComponent) {
    return (
      <div className="stripe-payment error">
        <AlertCircle size={48} />
        <h3>Payment Unavailable</h3>
        <p>{error || 'Unable to load payment system.'}</p>
        {props.onCancel && (
          <button className="cancel-btn" onClick={props.onCancel}>
            Go Back
          </button>
        )}
      </div>
    );
  }

  return <PaymentComponent {...props} />;
}
