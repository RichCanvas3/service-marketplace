import { useState, useEffect } from 'react';
import ServiceList from '../components/ServiceList.tsx'
import { SendMcpMessage } from '../components/SendMcpMessage';
import Modal from '../components/Modal';
import InfoModal from '../components/InfoModal';
import CreditCardForm from '../components/CreditCardForm';
import ServiceContractModal from '../components/ServiceContractModal';
import PremiumServices from '../components/PremiumServices';
import data from '../components/data/service-list.json';
import employees from '../components/data/employees.json';
import mcoMockData from '../components/data/mco-mock.json';
import { companyInfoStyles } from '../styles/companyInfoStyles';
import '../custom-styles.css'
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

interface Service {
  name: string;
  price: string;
  description?: string;
}

const CateringPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [isServiceContractModalOpen, setIsServiceContractModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [isLoyaltyMember, setIsLoyaltyMember] = useState(false);
  const cateringServices = data.find(service => service.name === "Diane's Catering")?.services || [];
  const isStep1Valid = selectedServices.length > 0;
  const isStep2Valid = preferredDate && preferredTime;

  // Check membership status on component mount
  useEffect(() => {
    const checkMembershipStatus = () => {
      // First check localStorage
      const mcoData = localStorage.getItem('mcoData');
      if (mcoData) {
        const mcoObj = JSON.parse(mcoData);
        if (mcoObj.loyaltyMember) {
          setIsLoyaltyMember(true);
          return;
        }
      }

      // If not in localStorage, check mock data
      if (mcoMockData.loyaltyMember) {
        setIsLoyaltyMember(true);
      }
    };

    checkMembershipStatus();
  }, []);

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
    showNotification('Request for service sent!', 'success');
  };

  const handleButton2Click = () => {
    console.log('Opening Service Contract Modal');
    console.log('Selected services being passed:', selectedServices);
    setIsServiceContractModalOpen(true);
    // Close the main modal without clearing selectedServices
    setIsModalOpen(false);
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
              .
            </div>
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
                                     }[membershipLevel as 'Bronze' | 'Silver' | 'Gold' | 'Platinum'];

                  const totalBeforeDiscount = selectedServices.reduce((total, serviceName) => {
                    const service = cateringServices.find(s => s.name === serviceName);
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
                <button className="payment-card-button" onClick={handleButton1Click}>
                  Pay with Debit/Credit Card
                </button>
                <button className="payment-loyalty-button" onClick={handleButton2Click} disabled={!isLoyaltyMember}>
                  Pay with MetaMask Card
                </button>
              </div>
              <div style={{ color: '#ED8936', fontSize: '0.9em', marginTop: '10px', textAlign: 'center' }}>
                <Link to="/loyalty-card" style={{ color: '#ED8936', textDecoration: 'underline' }}>
                  Learn more about the Loyalty Program.
                </Link>
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
      <div className="hero-section">
        <div className="hero-image-container">
          <img
            className="hero-image"
            src="/images/catering.jpg"
            alt="Gourmet Delights Catering"
          />
          <div className="hero-content">
            <h2 className="hero-title">Diane's Catering</h2>
            <p className="hero-tagline">Elevate your events with our exquisite culinary experiences</p>
          </div>
        </div>
      </div>

      {/* Book Services Button - Prominent Position */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '32px 0',
        padding: '0 20px'
      }}>
        <button
          className="service-button"
          onClick={() => setIsModalOpen(true)}
          style={{
            fontSize: '18px',
            padding: '16px 32px',
            fontWeight: '700',
            boxShadow: '0 8px 16px rgba(237, 137, 54, 0.3)',
            transform: 'scale(1.05)'
          }}
        >
          Book Diane's Catering
        </button>
      </div>

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
            <span style={companyInfoStyles.infoValue}>{employees.catering.length} Team Members</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>KYB Credibility</span>
            <span style={{
              ...companyInfoStyles.infoValue,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)'
              }}>95.1/100</span>
              <span style={{
                fontSize: '12px',
                color: '#22c55e',
                fontWeight: '500'
              }}>✓ Verified</span>
            </span>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">About Us</h3>
          <div style={{ maxWidth: '800px', lineHeight: 'var(--line-height-relaxed)' }}>
            <p>Welcome to Diane's Catering, where we create memorable culinary experiences for your events. Our team of expert chefs and event specialists combines creativity with exceptional service to deliver unforgettable catering solutions.</p>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Our Services</h3>
          <ul className="service-list">
            {cateringServices.map((service, index) => (
              <li
                key={index}
                className={`service-list-item ${index === 0 ? 'popular' : ''}`}
              >
                <div className="service-list-item-checkbox">
                  <div className="service-list-item-name">
                    <label htmlFor={`service-${index}`}>{service.name}</label>
                    {service.description && (
                      <p className="service-list-item-description">{service.description}</p>
                    )}
                  </div>
                </div>
                <div className="service-list-item-price">
                  <span>{service.price}</span>
                  <span>
                    {service.price.replace('$', '')} points
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium Services Section */}
        <PremiumServices
          serviceName="Catering"
          premiumServices={[
            {
              name: "Celebrity Chef Experience",
              price: "$10,000+",
              description: "Michelin-starred chef creates a bespoke dining experience with wine pairings, live cooking demonstration, and personalized menu design.",
              reputationRequired: 98,
              exclusive: true
            },
            {
              name: "Luxury Wedding Package",
              price: "$8,000+",
              description: "Full-service luxury wedding catering with dedicated event coordinator, premium tableware, and 5-course gourmet menu.",
              reputationRequired: 93,
              exclusive: true
            },
            {
              name: "Executive Corporate Catering",
              price: "$150/person",
              description: "High-end corporate event catering with live cooking stations, premium ingredients, and white-glove service.",
              reputationRequired: 90
            },
            {
              name: "Private Chef Service",
              price: "$300/hr",
              description: "Personal chef comes to your home for intimate dinner parties, cooking classes, or special occasions.",
              reputationRequired: 87
            }
          ]}
          onSelectService={(serviceName) => {
            setSelectedServices(prev => [...prev, serviceName]);
            setIsModalOpen(true);
          }}
        />

        <div className="loyalty-section">
          <h3>Exclusive Rewards for Loyalty Members</h3>
          <div className="tiers-grid">
            <div className="tier-card">
              <h4>Bronze Tier</h4>
              <p>Get started with our loyalty program and enjoy 5% off all catering services. Perfect for small events.</p>
            </div>
            <div className="tier-card">
              <h4>Silver Tier</h4>
              <p>Unlock 10% off all services plus one free menu consultation per month. Ideal for regular clients.</p>
            </div>
            <div className="tier-card">
              <h4>Gold Tier</h4>
              <p>Enjoy 15% off all services, monthly tastings, and priority scheduling. Perfect for growing businesses.</p>
            </div>
            <div className="tier-card">
              <h4>Platinum Tier</h4>
              <p>Get 20% off all services, unlimited tastings, and exclusive chef's table experiences. For serious clients.</p>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <div
            className="reviews-header"
            onClick={() => setShowReviews(!showReviews)}
          >
            <h3 className="reviews-title">Customer Reviews</h3>
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
            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">
                  <span>Jessica Martinez</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Bronze Member</span>
                </div>
                <span className="review-date">December 2, 2024</span>
              </div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p className="review-text">
                "Diane catered our wedding and it was absolutely perfect! The food was delicious and beautifully presented. She worked with our dietary restrictions seamlessly and the service was flawless. Our guests are still talking about the amazing appetizers and desserts. Thank you for making our special day even more memorable!"
              </p>
            </div>

            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">
                  <span>Robert Kim</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Gold Member</span>
                </div>
                <span className="review-date">November 18, 2024</span>
              </div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p className="review-text">
                "We've used Diane's catering for multiple corporate events and she never disappoints. The lunch spreads are always fresh, varied, and accommodate all dietary needs. Her team is professional and the setup/cleanup is seamless. Our employees always look forward to catered meetings now!"
              </p>
            </div>

            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">
                  <span>Amanda Foster</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Silver Member</span>
                </div>
                <span className="review-date">October 30, 2024</span>
              </div>
              <div className="review-rating">
                {[...Array(4)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
                {[...Array(1)].map((_, i) => (
                  <span key={i} style={{ ...companyInfoStyles.star, opacity: 0.3 }}>★</span>
                ))}
              </div>
              <p className="review-text">
                "Hired Diane for my daughter's graduation party. The gourmet menu was a huge hit with both adults and kids. Everything was prepared fresh and tasted amazing. Only small issue was running a bit late on setup, but the quality more than made up for it. Will definitely book again!"
              </p>
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

            <ServiceContractModal
        isOpen={isServiceContractModalOpen}
        onClose={() => setIsServiceContractModalOpen(false)}
        serviceName="Diane's Catering"
                      servicePrice="1 USDC"
        selectedServices={selectedServices}
      />
    </div>
  );
};

export default CateringPage;