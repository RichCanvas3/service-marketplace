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
import { Link } from 'react-router-dom';

interface Service {
  name: string;
  price: string;
  description?: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  experience: string;
  rating: number;
}

interface EmployeesData {
  cleaning: Employee[];
  training: Employee[];
  tutoring: Employee[];
  garage: Employee[];
  tax: Employee[];
  catering: Employee[];
  design: Employee[];
}

const CleaningPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dhcServices = data.find(service => service.name === "Daisy's Home Cleaning")?.services || [];
  const employeesData = employees as EmployeesData;
  const isStep1Valid = selectedServices.length > 0;
  const isStep2Valid = preferredDate && preferredTime;

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
      const selectedServiceDetails = dhcServices
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
            <div style={{ color: '#ED8936', fontSize: '0.9em', marginBottom: '10px' }}>
              Points earned with the Loyalty Member Card.{' '}
              <Link to="/loyalty-card" style={{ color: '#ED8936', textDecoration: 'underline' }}>
                Learn more
              </Link>
            </div>
            <ul className="service-list">
              {dhcServices.map((service, index) => (
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
                  const service = dhcServices.find(s => s.name === serviceName);
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
              <h4>Loyalty Tier Discount:</h4>
              <ul className="review-list">
                {(() => {
                  const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
                  const membershipLevel = mcoData.membershipLevel || 'Bronze';
                  const discountPercentage = {
                    'Bronze': 5,
                    'Silver': 10,
                    'Gold': 15,
                    'Platinum': 20
                  }[membershipLevel];

                  const totalBeforeDiscount = selectedServices.reduce((total, serviceName) => {
                    const service = dhcServices.find(s => s.name === serviceName);
                    return total + (parseFloat(service?.price?.replace(/[^0-9.-]+/g, '') || '0'));
                  }, 0);

                  const discountAmount = (totalBeforeDiscount * discountPercentage) / 100;
                  const totalAfterDiscount = totalBeforeDiscount - discountAmount;

                  return (
                    <>
                      <li className="review-item" style={{ borderTop: '1px solid var(--hover-color)', marginTop: '8px', paddingTop: '8px', color: '#ED8936' }}>
                        <span>Your Tier ({membershipLevel})</span>
                        <span>{discountPercentage}% off</span>
                      </li>
                      <li className="review-item" style={{
                        backgroundColor: 'var(--card-bg)',
                        fontWeight: 'bold',
                        color: '#ED8936'
                      }}>
                        <span>Total with Loyalty Card</span>
                        <span>${totalAfterDiscount.toFixed(2)}</span>
                      </li>
                      <li className="review-item" style={{
                        backgroundColor: 'var(--card-bg)',
                        fontWeight: 'bold',
                        color: '#FFFFFF'
                      }}>
                        <span>Total with Debit/Credit Card</span>
                        <span>${totalBeforeDiscount.toFixed(2)}</span>
                      </li>
                    </>
                  );
                })()}
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
      <h2>Daisy's Home Cleaning Page</h2>

      <img
        className='service-card-image'
        src='/images/cleaning.jpg'
        alt="Daisy's Home Cleaning Service"
      />

      <div style={companyInfoStyles.companyInfo}>
        <div style={companyInfoStyles.infoGrid}>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Address</span>
            <span style={companyInfoStyles.infoValue}>123 Maple Street, Erie, CO 16501</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Phone</span>
            <span style={companyInfoStyles.infoValue}>(814) 555-0123</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Employees</span>
            <span style={companyInfoStyles.infoValue}>{employeesData.cleaning.length} Team Members</span>
          </div>
        </div>

        <div style={companyInfoStyles.reviewsSection}>
          <div
            style={companyInfoStyles.reviewsHeader}
            onClick={() => setShowReviews(!showReviews)}
          >
            <h3 style={{ ...companyInfoStyles.reviewsTitle, color: '#ED8936' }}>Customer Reviews</h3>
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
                  <span>Sarah Johnson</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 15, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "The team was incredibly thorough and professional. They transformed my home into a spotless haven. The attention to detail was impressive, and they were very respectful of my space."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Michael Chen</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 12, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "I've been using their services for my office for months now. Consistent quality, reliable scheduling, and great communication. The team is always friendly and efficient."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Emily Rodriguez</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 10, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "The deep cleaning service was worth every penny. They tackled areas I hadn't cleaned in years. The team was knowledgeable about different surfaces and used appropriate cleaning methods."
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

        <div style={companyInfoStyles.reviewsSection}>
          <div
            style={companyInfoStyles.reviewsHeader}
            onClick={() => setShowRewards(!showRewards)}
          >
            <h3 style={{ ...companyInfoStyles.reviewsTitle, color: '#ED8936' }}>Exclusive Rewards for Loyalty Members</h3>
            <button
              style={{
                ...companyInfoStyles.toggleButton,
                ...(showRewards ? companyInfoStyles.toggleButtonOpen : {})
              }}
            >
              ▼
            </button>
          </div>
          <div style={{
            ...companyInfoStyles.reviewsGrid,
            ...(showRewards ? companyInfoStyles.reviewsGridOpen : {})
          }}>
            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Bronze Tier</span>
                  <span style={companyInfoStyles.loyaltyLabel}>5% Off</span>
                </div>
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Get started with our loyalty program and enjoy 5% off all cleaning services. Perfect for regular home maintenance."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Silver Tier</span>
                  <span style={companyInfoStyles.loyaltyLabel}>10% Off</span>
                </div>
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Unlock 10% off all services plus one free deep cleaning per month. Ideal for busy households."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Gold Tier</span>
                  <span style={companyInfoStyles.loyaltyLabel}>15% Off</span>
                </div>
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Enjoy 15% off all services, monthly deep cleaning, and priority scheduling. For dedicated customers."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Platinum Tier</span>
                  <span style={companyInfoStyles.loyaltyLabel}>20% Off</span>
                </div>
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Our highest tier offers 20% off all services, unlimited deep cleaning, priority scheduling, and premium cleaning products. For serious home maintenance."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', lineHeight: '1.6', width: '100%' }}>
        <p>Welcome to Daisy's Home Cleaning Service, where we bring sparkle and shine to every corner of your home. With over a decade of experience in professional home cleaning, we understand that a clean home is more than just appearance – it's about creating a healthy, comfortable space for you and your loved ones.</p>

        <p>Our comprehensive cleaning services include:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Deep cleaning of kitchens and bathrooms</li>
          <li>Thorough dusting and vacuuming of all living spaces</li>
          <li>Window and glass surface cleaning</li>
          <li>Eco-friendly cleaning options available</li>
          <li>Regular maintenance cleaning schedules</li>
        </ul>

        <p>What sets us apart:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Fully insured and bonded professional cleaners</li>
          <li>Flexible scheduling to fit your busy lifestyle</li>
          <li>Attention to detail and consistent quality</li>
          <li>Pet-friendly cleaning products available</li>
          <li>100% satisfaction guarantee</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're committed to making your home cleaning experience effortless and reliable. Ready to experience the difference of professional home cleaning?</p>
      </div>

      <button className="service-button" onClick={() => setIsModalOpen(true)}>
        Book Services
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Book Cleaning Services"
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

export default CleaningPage;
