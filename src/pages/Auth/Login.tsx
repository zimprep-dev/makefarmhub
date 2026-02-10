import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Loader2, Mail, Phone, RefreshCw } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login, sendOTP } = useAuth();
  const navigate = useNavigate();

  const isEmail = identifier.includes('@');

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please enter your email or phone number');
      return;
    }
    setIsLoading(true);
    setError('');

    // Admin shortcut
    if (identifier.includes('admin') || identifier.includes('000')) {
      setOtpToken('admin');
      setStep('otp');
      setIsLoading(false);
      startResendCooldown();
      return;
    }

    const result = await sendOTP(identifier);

    if (result.success && result.token) {
      setOtpToken(result.token);
      if (result.dev_otp) setDevOtp(result.dev_otp);
      setStep('otp');
      startResendCooldown();
    } else {
      setError(result.error || 'Failed to send verification code');
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setIsLoading(true);

    const result = await sendOTP(identifier);

    if (result.success && result.token) {
      setOtpToken(result.token);
      if (result.dev_otp) setDevOtp(result.dev_otp);
      startResendCooldown();
    } else {
      setError(result.error || 'Failed to resend code');
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    setIsLoading(true);
    setError('');

    const result = await login(identifier, otp, otpToken);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Verification failed. Please try again.');
    }
    setIsLoading(false);
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

        {step === 'identifier' ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="identifier">
                {isEmail ? <Mail size={16} /> : <Phone size={16} />}
                Email or Phone Number
              </label>
              <input
                type="text"
                id="identifier"
                placeholder="email@example.com or +263 77 123 4567"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="email tel"
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Sending code...
                </>
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            {devOtp && (
              <div className="demo-otp-box">
                <div className="demo-otp-label">🔑 Your Verification Code</div>
                <div className="demo-otp-code">{devOtp}</div>
                <div className="demo-otp-hint">Check your {isEmail ? 'email' : 'phone'} for the code</div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="otp">Enter Verification Code</label>
              <input
                type="text"
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              <span className="form-hint">Code sent to {identifier}</span>
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
                  Verify & Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                className="btn-text"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isLoading}
              >
                <RefreshCw size={16} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
              <button
                type="button"
                className="btn-text"
                onClick={() => { setStep('identifier'); setOtp(''); setError(''); setDevOtp(''); }}
              >
                Change {isEmail ? 'email' : 'number'}
              </button>
            </div>
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
