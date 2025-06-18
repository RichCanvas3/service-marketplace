import { useState } from 'react';
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

const DesignPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const ccdsServices = data.find(service => service.name === "Creative Collective Design Studio")?.services || [];
  const [projectType, setProjectType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [timeline, setTimeline] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const designServices = data.find(service => service.name === "Design Studio")?.services || [];
  const employeesData = employees as EmployeesData;
  const [showReviews, setShowReviews] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
      const selectedServiceDetails = ccdsServices
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
    setProjectType('');
    setBusinessName('');
    setIndustry('');
    setTimeline('');
    setProjectBrief('');
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
    console.log('Button 2 clicked');
    // Add your button 2 logic here
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsInfoModalOpen(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Step 1: Select Services</h3>
            <ul className="service-list">
              {ccdsServices.map((service, index) => (
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
                  const service = ccdsServices.find(s => s.name === serviceName);
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
      <h2>Creative Collective Design Studio</h2>

      <img
        className='service-card-image'
        src='/images/design.jpg'
        alt="Creative Collective Design Studio"
      />

      <div style={companyInfoStyles.companyInfo}>
        <div style={companyInfoStyles.infoGrid}>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Address</span>
            <span style={companyInfoStyles.infoValue}>987 Birch Street, Erie, CO 16501</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Phone</span>
            <span style={companyInfoStyles.infoValue}>(814) 555-0128</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Employees</span>
            <span style={companyInfoStyles.infoValue}>{employeesData.design.length} Team Members</span>
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
                  <span>Green Earth Cafe</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 20, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "The team at Creative Canvas transformed our cafe's branding. Their eco-friendly design approach perfectly captured our values, and the new look has significantly increased customer engagement."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>TechStart Inc.</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 14, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Working with Creative Canvas on our website redesign was a game-changer. Their modern, user-friendly approach helped us increase our conversion rate by 40%. Highly recommend their services!"
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Local Art Gallery</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 7, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "The exhibition catalog design was stunning. They perfectly captured the essence of our artists' work while maintaining a clean, professional layout. The attention to detail was impressive."
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
        <p>Welcome to Creative Collective Design Studio, where creativity meets strategy to build powerful brand experiences. Our team of passionate designers and brand strategists work collaboratively to create visually stunning and strategically sound design solutions. Whether you're starting from scratch or looking to refresh your brand, we're here to bring your vision to life.</p>

        <p>Our design services include:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Brand identity development</li>
          <li>Website design and development</li>
          <li>Print and digital collateral</li>
          <li>Packaging design</li>
          <li>Marketing materials and campaigns</li>
        </ul>

        <p>Why choose us:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Award-winning design team</li>
          <li>Strategic approach to design</li>
          <li>Collaborative creative process</li>
          <li>Industry-specific expertise</li>
          <li>Comprehensive brand solutions</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're dedicated to helping businesses and organizations stand out through exceptional design and branding. Ready to elevate your brand?</p>
      </div>

      <button className="service-button" onClick={() => setIsModalOpen(true)}>
        Start Project
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Start Design Project"
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

export default DesignPage;