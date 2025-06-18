import { useState } from 'react';
import ServiceList from '../components/ServiceList.tsx'
import { SendMcpMessage } from '../components/SendMcpMessage';
import Modal from '../components/Modal';
import InfoModal from '../components/InfoModal';
import CreditCardForm from '../components/CreditCardForm';
import data from '../components/data/service-list.json';
import employees from '../components/data/employees.json';
import { companyInfoStyles } from '../styles/companyInfoStyles';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const CateringPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const cateringServices = data.find(service => service.name === "Diane's Catering")?.services || [];
  const isStep1Valid = selectedServices.length > 0;
  const isStep2Valid = preferredDate && preferredTime;
  const [showReviews, setShowReviews] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceName)
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) return;
    if (currentStep === 2 && !isStep2Valid) return;
    if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Handle form submission
      const selectedServiceDetails = cateringServices
        .filter(service => selectedServices.includes(service.name))
        .map(service => `${service.name} (${service.price})`);

      alert(`Booking submitted!\n\nSelected services:\n${selectedServiceDetails.join('\n')}`);
      handleCloseModal();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setSelectedServices([]);
    setPreferredDate('');
    setPreferredTime('');
    setSpecialInstructions('');
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsInfoModalOpen(true);
  };

  const handleButton1Click = () => {
    setIsCardFormOpen(true);
  };

  const handleCardSubmit = (cardData: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
  }) => {
    // Here you would typically send the card data to your payment processor
    console.log('Card data submitted:', cardData);
    setIsCardFormOpen(false);
    handleCloseModal();
    alert('Payment successful! Your booking has been confirmed.');
  };

  const handleButton2Click = () => {
    // Handle MetaMask payment
    alert('MetaMask payment selected');
    handleCloseModal();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Step 1: Select Services</h3>
            <ul className="service-list">
              {cateringServices.map((service, index) => (
                <li key={index} className="service-list-item">
                  <div className="service-list-item-checkbox">
                    <input
                      type="checkbox"
                      id={`service-${index}`}
                      checked={selectedServices.includes(service.name)}
                      onChange={() => handleServiceToggle(service.name)}
                      className="service-checkbox"
                    />
                    <div className="service-list-item-name">
                      <label htmlFor={`service-${index}`}>{service.name}</label>
                      {service.description && (
                        <p className="service-list-item-description">{service.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="service-list-item-price" style={{ textAlign: 'right', minWidth: 70 }}>
                    <span>{service.price}</span>
                    <span style={{
                      color: '#ED8936',
                      fontSize: '0.8em',
                      display: 'block',
                      marginTop: '2px'
                    }}>
                      {service.price.replace('$', '')} points
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 2:
        return (
          <div>
            <h3>Step 2: Schedule Service</h3>
            <div className="schedule-form">
              <div className="form-group">
                <label>Preferred Date</label>
                <input type="date" className="form-input" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <select className="form-input" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} required>
                  <option value="">Select a time...</option>
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="evening">Evening (4PM - 8PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Any special requirements or notes..."
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3>Step 3: Review & Confirm</h3>
            <div className="review-section">
              <h4>Selected Services:</h4>
              <ul className="review-list">
                {selectedServices.map((serviceName, index) => {
                  const service = cateringServices.find(s => s.name === serviceName);
                  return (
                    <li key={index} className="review-item">
                      <span>{service?.name}</span>
                      <span>{service?.price}</span>
                    </li>
                  );
                })}
              </ul>
              <h4>Appointment Details:</h4>
              <ul className="review-list">
                <li className="review-item">
                  <span>Preferred Date</span>
                  <span>{preferredDate}</span>
                </li>
                <li className="review-item">
                  <span>Preferred Time</span>
                  <span>
                    {preferredTime === 'morning' ? 'Morning (8AM - 12PM)' :
                     preferredTime === 'afternoon' ? 'Afternoon (12PM - 4PM)' :
                     preferredTime === 'evening' ? 'Evening (4PM - 8PM)' :
                     preferredTime}
                  </span>
                </li>
                {specialInstructions && (
                  <li className="review-item">
                    <span>Special Instructions</span>
                    <span>{specialInstructions}</span>
                  </li>
                )}
              </ul>
              <div className="confirmation-message">
                <p>Click 'Next' to proceed to payment options.</p>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3>Step 4: Choose Payment Method</h3>
            <div className="payment-section">
              <div className="payment-options">
                <button className="service-button" onClick={handleButton1Click}>
                  Pay with Card
                </button>
                <button
                  onClick={handleButton2Click}
                  style={{
                    backgroundColor: '#ED8936',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    width: 'fit-content',
                    margin: '20px 0',
                    fontSize: '16px'
                  }}
                >
                  Pay with Loyalty Card
                </button>
                <a href="#" className="help-link" onClick={handleInfoClick}>What is this?</a>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="individual-page">
      <h2>Diane's Catering</h2>

      <img
        className='service-card-image'
        src='/images/catering.jpg'
        alt="Diane's Catering"
      />

      <div style={companyInfoStyles.companyInfo}>
        <div style={companyInfoStyles.infoGrid}>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Address</span>
            <span style={companyInfoStyles.infoValue}>321 Elm Street, Erie, CO 16501</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Phone</span>
            <span style={companyInfoStyles.infoValue}>(814) 555-0126</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Employees</span>
            <span style={companyInfoStyles.infoValue}>{employees.catering.length} Team Members</span>
          </div>
        </div>

        <div style={companyInfoStyles.reviewsSection}>
          <div
            style={companyInfoStyles.reviewsHeader}
            onClick={() => setShowReviews(!showReviews)}
          >
            <h3 style={companyInfoStyles.reviewsTitle}>Customer Reviews</h3>
            <button
              style={{
                ...companyInfoStyles.toggleButton,
                ...(showReviews ? companyInfoStyles.toggleButtonOpen : {})
              }}
            >
              ▼
            </button>
          </div>
          <div style={{
            ...companyInfoStyles.reviewsGrid,
            ...(showReviews ? companyInfoStyles.reviewsGridOpen : {})
          }}>
            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Jennifer & Mark</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 16, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Diane's team catered our wedding and exceeded all expectations! The food was exquisite, service was impeccable, and they handled everything with such professionalism."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Corporate Events Inc.</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 9, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "We've used Diane's Catering for multiple corporate events. Their attention to detail, quality of food, and professional service make them our go-to caterer."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Patricia Lee</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 3, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Hosted a birthday party for 50 guests and Diane's team made it perfect. The menu was creative, food was delicious, and they handled all the setup and cleanup."
              </p>
            </div>
            <div style={companyInfoStyles.tooltipContainer}>
              <button
                style={companyInfoStyles.writeReviewButton}
                onClick={() => alert('Write Review functionality coming soon!')}
                aria-label="Write Review"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                Write Review
              </button>
              {showTooltip && (
                <div style={companyInfoStyles.tooltip}>
                  You need to have purchased a service from this provider before writing a review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', lineHeight: '1.6', width: '100%' }}>
        <p>Welcome to Diane's Catering, where we turn every event into an unforgettable culinary experience. From intimate gatherings to grand celebrations, we bring creativity, quality, and exceptional service to your table. Our passion for food and attention to detail ensures your event will be remembered for its outstanding cuisine.</p>

        <p>Our catering services include:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Wedding receptions and rehearsal dinners</li>
          <li>Corporate events and business meetings</li>
          <li>Private parties and celebrations</li>
          <li>Holiday events and seasonal gatherings</li>
          <li>Custom menu planning and design</li>
        </ul>

        <p>Why choose us:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Professional culinary team</li>
          <li>Fresh, locally-sourced ingredients</li>
          <li>Customizable menu options</li>
          <li>Full-service event catering</li>
          <li>Experienced event coordination</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're committed to making your event exceptional through outstanding cuisine and impeccable service. Ready to create an unforgettable dining experience?</p>
      </div>

      <button className="service-button" onClick={() => setIsModalOpen(true)}>
        Book Catering
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Book Catering Services"
        currentStep={currentStep}
        totalSteps={4}
        onNext={handleNext}
        onPrevious={handlePrevious}
        showNavigation={true}
        nextDisabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
      >
        {renderStepContent()}
      </Modal>

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Payment Information"
      >
        <div>
          <p>Choose your preferred payment method:</p>
          <ul>
            <li>Card Payment: Secure credit/debit card processing</li>
            <li>MetaMask: Pay using cryptocurrency</li>
          </ul>
        </div>
      </InfoModal>

      <CreditCardForm
        isOpen={isCardFormOpen}
        onClose={() => setIsCardFormOpen(false)}
        onSubmit={handleCardSubmit}
      />
    </div>
  );
};

export default CateringPage;