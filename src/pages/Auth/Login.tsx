import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    setIsLoading(true);
    setError('');
    
    // Simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('otp');
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const success = await login(phone, otp);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span>🌾</span>
            MAKEFARMHUB
          </div>
          <h1>Welcome</h1>
          <p>Sign in to access your account</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                placeholder="+263 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="auth-hint">
              For demo, use any phone number and OTP "1234"
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            {/* Demo OTP Display */}
            <div className="demo-otp-box">
              <div className="demo-otp-label">📱 Demo OTP Code</div>
              <div className="demo-otp-code">1234</div>
              <div className="demo-otp-hint">In production, this would be sent via SMS</div>
            </div>

            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
              />
              <span className="form-hint">OTP sent to {phone}</span>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Login
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-text"
              onClick={() => setStep('phone')}
            >
              Change phone number
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup">Create account</Link>
          </p>
        </div>
      </div>

      <div className="auth-side">
        <div className="auth-side-content">
          <h2>Connect with the agricultural ecosystem</h2>
          <ul>
            <li>✓ Verified farmers and buyers</li>
            <li>✓ Secure escrow payments</li>
            <li>✓ Reliable transport network</li>
            <li>✓ Real-time messaging</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
