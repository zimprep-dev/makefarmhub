import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sprout, ShoppingCart, Truck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './WelcomeTour.css';

interface TourStep {
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

const commonSteps: TourStep[] = [
  {
    title: 'Welcome to MakeFarmHub!',
    icon: '🌾',
    description: 'Zimbabwe\'s trusted digital agriculture marketplace. Connect with farmers, buyers, and transporters — all in one place.',
    features: ['Browse fresh produce & livestock', 'Secure mobile money & card payments', 'Real-time messaging & notifications'],
  },
  {
    title: 'Browse the Marketplace',
    icon: '🛒',
    description: 'Search thousands of listings from verified farmers. Filter by location, price, category, and rating.',
    features: ['Advanced search & saved filters', 'Quick view product details', 'Favorite items for later'],
  },
  {
    title: 'Secure Payments',
    icon: '🔒',
    description: 'Pay with EcoCash, OneMoney, InnBucks, Telecash, or card. Every transaction is protected.',
    features: ['Mobile money integration', 'Stripe card payments', 'Transaction history & receipts'],
  },
  {
    title: 'Transport & Delivery',
    icon: '🚛',
    description: 'Book verified transporters to deliver your goods anywhere in Zimbabwe with real-time tracking.',
    features: ['Book transport instantly', 'Track deliveries live', 'Rate your experience'],
  },
];

const roleSteps: Record<string, TourStep> = {
  farmer: {
    title: 'Start Selling Today',
    icon: '🧑‍🌾',
    description: 'List your crops, livestock, or equipment. Manage orders from your dashboard and grow your business.',
    features: ['Create listings in minutes', 'Manage inventory & pricing', 'View sales analytics'],
  },
  buyer: {
    title: 'Shop Fresh Produce',
    icon: '🥬',
    description: 'Order directly from farmers at the best prices. Track orders from purchase to delivery.',
    features: ['Order with one click', 'Track delivery status', 'Leave reviews & ratings'],
  },
  transporter: {
    title: 'Earn with Deliveries',
    icon: '📦',
    description: 'Register your vehicles and accept delivery bookings. Earn money by connecting farmers and buyers.',
    features: ['Manage your fleet', 'Accept booking requests', 'Optimized route planning'],
  },
  admin: {
    title: 'Platform Management',
    icon: '📊',
    description: 'Monitor platform health, manage users, resolve disputes, and view detailed analytics.',
    features: ['User & listing management', 'Revenue analytics', 'Dispute resolution'],
  },
};

export default function WelcomeTour() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    ...commonSteps,
    roleSteps[user?.role || 'buyer'],
  ];

  useEffect(() => {
    const tourCompleted = localStorage.getItem('mfh_tour_completed');
    if (!tourCompleted) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('mfh_tour_completed', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="welcome-tour-overlay">
      <div className="welcome-tour-modal">
        <button className="tour-close" onClick={handleClose} aria-label="Close tour">
          <X size={20} />
        </button>

        <div className="tour-content">
          <div className="tour-step-indicator">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>

          <div className="tour-step-content">
            <div className="tour-icon">{step.icon}</div>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
            {step.features && (
              <ul className="tour-features">
                {step.features.map((feature, i) => (
                  <li key={i}>
                    <Check size={16} className="feature-check" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="tour-actions">
            <button className="btn-skip" onClick={handleClose}>
              Skip Tour
            </button>
            
            <div className="tour-navigation">
              {currentStep > 0 && (
                <button className="btn-previous" onClick={handlePrevious}>
                  <ChevronLeft size={18} />
                  Back
                </button>
              )}
              
              <button className="btn-next" onClick={handleNext}>
                {isLastStep ? (
                  <>
                    <Check size={18} />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
