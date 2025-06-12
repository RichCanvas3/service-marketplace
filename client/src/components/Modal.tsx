import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
  nextDisabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  currentStep = 1,
  totalSteps = 1,
  onNext,
  onPrevious,
  showNavigation = false,
  nextDisabled = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {totalSteps > 1 && (
          <div className="modal-steps">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`step-indicator ${i + 1 <= currentStep ? 'active' : ''}`}
              >
                <div className="step-number">{i + 1}</div>
              </div>
            ))}
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {showNavigation && totalSteps > 1 && (
          <div className="modal-navigation">
            <button
              className="service-button"
              onClick={onPrevious}
              disabled={currentStep === 1}
            >
              Previous
            </button>
            <div className="step-count">
              Step {currentStep} of {totalSteps}
            </div>
            {currentStep === totalSteps ? (
              <button
                className="service-button"
                onClick={onNext}
                disabled={nextDisabled}
              >
                Finish
              </button>
            ) : (
              <button
                className="service-button"
                onClick={onNext}
                disabled={currentStep === totalSteps || nextDisabled}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;