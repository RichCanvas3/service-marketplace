import { useState } from 'react';
import Modal from '../components/Modal';
import data from '../components/data/service-list.json';
import employees from '../components/data/employees.json';
import { companyInfoStyles } from '../styles/companyInfoStyles';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const TrainingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const datServices = data.find(service => service.name === "Doug's Athletic Training")?.services || [];
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
      const selectedServiceDetails = datServices
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

  const handleButton1Click = () => {
    console.log('Button 1 clicked');
    // Add your button 1 logic here
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
              {datServices.map((service, index) => (
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
            <h3>Step 2: Schedule Training</h3>
            <div className="schedule-form">
              <div className="form-group">
                <label>Preferred Date</label>
                <input type="date" className="form-input" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <select className="form-input" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} required>
                  <option value="">Select a time...</option>
                  <option value="early-morning">Early Morning (6AM - 9AM)</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (2PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Any fitness goals, health conditions, or preferences..."
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
                  const service = datServices.find(s => s.name === serviceName);
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
                <li className="review-item">
                  <span>Bronze</span>
                  <span>5% off</span>
                </li>
                <li className="review-item">
                  <span>Silver</span>
                  <span>10% off</span>
                </li>
                <li className="review-item">
                  <span>Gold</span>
                  <span>15% off</span>
                </li>
                <li className="review-item">
                  <span>Platinum</span>
                  <span>20% off</span>
                </li>
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
                    const service = datServices.find(s => s.name === serviceName);
                    return total + (parseFloat(service?.price?.replace(/[^0-9.-]+/g, '') || '0'));
                  }, 0);

                  const discountAmount = (totalBeforeDiscount * discountPercentage) / 100;
                  const totalAfterDiscount = totalBeforeDiscount - discountAmount;

                  return (
                    <>
                      <li className="review-item" style={{ borderTop: '1px solid var(--hover-color)', marginTop: '8px', paddingTop: '8px' }}>
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
      <h2>Doug's Athletic Training</h2>

      <img
        className='service-card-image'
        src='/images/training.jpeg'
        alt="Doug's Athletic Training"
      />

      <div style={companyInfoStyles.companyInfo}>
        <div style={companyInfoStyles.infoGrid}>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Address</span>
            <span style={companyInfoStyles.infoValue}>789 Cedar Lane, Erie, CO 16501</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Phone</span>
            <span style={companyInfoStyles.infoValue}>(814) 555-0125</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Employees</span>
            <span style={companyInfoStyles.infoValue}>{employees.training.length} Team Members</span>
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
                  <span>Alex Rivera</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 17, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "Doug's training program transformed my fitness journey. His personalized approach and expertise helped me achieve goals I never thought possible. The nutrition guidance was invaluable!"
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Rachel Kim</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 11, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "The group fitness classes are amazing! Doug creates a supportive environment where everyone feels welcome. I've seen incredible results in just a few months."
              </p>
            </div>

            <div style={companyInfoStyles.reviewItem}>
              <div style={companyInfoStyles.reviewHeader}>
                <div style={companyInfoStyles.reviewerName}>
                  <span>Tom Anderson</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Loyalty Program Member</span>
                </div>
                <span style={companyInfoStyles.reviewDate}>March 4, 2024</span>
              </div>
              <div style={companyInfoStyles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p style={companyInfoStyles.reviewText}>
                "As someone recovering from an injury, Doug's careful attention to form and personalized program has been crucial to my rehabilitation. Highly recommend his expertise!"
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
        <p>Welcome to Doug's Athletic Training, where we transform goals into achievements. Our personalized approach to fitness combines cutting-edge training techniques with nutrition guidance to help you reach your peak performance. Whether you're just starting your fitness journey or looking to break through plateaus, we're here to guide you every step of the way.</p>

        <p>Our comprehensive training services include:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>One-on-one personal training sessions</li>
          <li>Customized workout programs</li>
          <li>Nutrition planning and guidance</li>
          <li>Group fitness classes</li>
          <li>Performance assessment and tracking</li>
        </ul>

        <p>Why train with us:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Certified professional trainers</li>
          <li>Customized programs for your goals</li>
          <li>State-of-the-art equipment and facilities</li>
          <li>Flexible scheduling options</li>
          <li>Proven results and ongoing support</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're dedicated to helping you achieve your fitness goals through expert guidance and motivation. Ready to start your transformation?</p>
      </div>

      <button className="service-button" onClick={() => setIsModalOpen(true)}>
        Book Training
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Book Training Services"
        currentStep={currentStep}
        totalSteps={4}
        onNext={handleNext}
        onPrevious={handlePrevious}
        showNavigation={true}
        nextDisabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
      >
        {renderStepContent()}
      </Modal>
    </div>
  );
};

export default TrainingPage;