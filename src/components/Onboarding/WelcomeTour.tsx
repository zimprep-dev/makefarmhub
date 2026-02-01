import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import './WelcomeTour.css';

interface TourStep {
  title: string;
  description: string;
  image?: string;
  targetElement?: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to MakeFarmHub! 🌾',
    description: 'Your trusted marketplace for fresh produce directly from Zimbabwean farmers. Let\'s take a quick tour to help you get started.',
  },
  {
    title: 'Browse the Marketplace',
    description: 'Discover a wide variety of crops, livestock, and equipment. Use filters to find exactly what you need.',
    image: '/images/tour-marketplace.png',
  },
  {
    title: 'Secure Payments',
    description: 'All transactions are protected with escrow. Your money is safe until you confirm delivery.',
    image: '/images/tour-wallet.png',
  },
  {
    title: 'Easy Transport',
    description: 'Book reliable transport for your purchases with verified transporters across Zimbabwe.',
    image: '/images/tour-transport.png',
  },
  {
    title: 'Start Selling',
    description: 'Farmers can list products, manage orders, and grow their business with our platform.',
    image: '/images/tour-selling.png',
  },
];

export default function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('mfh_tour_completed');
    if (!tourCompleted) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('mfh_tour_completed', 'true');
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
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

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <div className="welcome-tour-overlay">
      <div className="welcome-tour-modal">
        <button className="tour-close" onClick={handleClose} aria-label="Close tour">
          <X size={20} />
        </button>

        <div className="tour-content">
          <div className="tour-step-indicator">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>

          <div className="tour-step-content">
            <h2>{step.title}</h2>
            <p>{step.description}</p>
            {step.image && (
              <div className="tour-image">
                <img src={step.image} alt={step.title} />
              </div>
            )}
          </div>

          <div className="tour-actions">
            <button className="btn-skip" onClick={handleSkip}>
              Skip Tour
            </button>
            
            <div className="tour-navigation">
              {currentStep > 0 && (
                <button className="btn-previous" onClick={handlePrevious}>
                  <ChevronLeft size={18} />
                  Previous
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
