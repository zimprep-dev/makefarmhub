import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Tractor,
  ShoppingCart,
  Check,
} from 'lucide-react';

const roles: { id: UserRole; title: string; description: string; icon: typeof Tractor }[] = [
  {
    id: 'farmer',
    title: 'Farmer / Seller',
    description: 'List and sell your crops, livestock, and farm products',
    icon: Tractor,
  },
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Browse and purchase agricultural products',
    icon: ShoppingCart,
  },
];

export default function Signup() {
  const [step, setStep] = useState<'role' | 'details' | 'otp'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields');
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
      const success = await signup(
        formData.name,
        formData.phone,
        formData.email,
        selectedRole!,
        formData.location
      );
      if (success) {
        navigate('/dashboard');
      }
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container signup">
        <div className="auth-header">
          <div className="auth-logo">
            <span>🌾</span>
            MAKEFARMHUB
          </div>
          <h1>Create your account</h1>
          <p>Join the agricultural marketplace</p>
        </div>

        {/* Progress Steps */}
        <div className="signup-progress">
          <div className={`progress-step ${step === 'role' ? 'active' : 'completed'}`}>
            <div className="step-number">{step !== 'role' ? <Check size={16} /> : '1'}</div>
            <span>Select Role</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${step === 'details' ? 'active' : step === 'otp' ? 'completed' : ''}`}>
            <div className="step-number">{step === 'otp' ? <Check size={16} /> : '2'}</div>
            <span>Your Details</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${step === 'otp' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Verify</span>
          </div>
        </div>

        {step === 'role' && (
          <div className="role-selection">
            <h3>I want to join as a...</h3>
            <div className="role-cards">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <role.icon size={32} />
                  <h4>{role.title}</h4>
                  <p>{role.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit} className="auth-form">
            <button
              type="button"
              className="btn-back"
              onClick={() => setStep('role')}
            >
              <ArrowLeft size={18} />
              Back to role selection
            </button>

            <div className="selected-role-badge">
              {roles.find(r => r.id === selectedRole)?.title}
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                placeholder="+263 77 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
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
                  Continue
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <button
              type="button"
              className="btn-back"
              onClick={() => setStep('details')}
            >
              <ArrowLeft size={18} />
              Back to details
            </button>

            <div className="otp-message">
              <p>We've sent a verification code to</p>
              <strong>{formData.phone}</strong>
            </div>

            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                className="otp-input"
                placeholder="• • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="auth-hint">
              For demo, use any OTP code
            </p>

            <div className="terms-agreement">
              <p>
                By creating an account, you agree to our{' '}
                <Link to="/terms" target="_blank">Terms & Conditions</Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank">Privacy Policy</Link>
              </p>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-side">
        <div className="auth-side-content">
          <h2>Join thousands of farmers and buyers</h2>
          <ul>
            <li>✓ Free to join</li>
            <li>✓ Verified community</li>
            <li>✓ Secure transactions</li>
            <li>✓ 24/7 support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
