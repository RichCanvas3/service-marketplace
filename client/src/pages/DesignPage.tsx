import { useState, useEffect } from 'react';
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
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [isServiceContractModalOpen, setIsServiceContractModalOpen] = useState(false);
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
  const [showRewards, setShowRewards] = useState(false);
  const [isLoyaltyMember, setIsLoyaltyMember] = useState(false);

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
    showNotification('Request for service sent!', 'success');
  };

  const handleButton2Click = () => {
    console.log('Opening Service Contract Modal');
    console.log('Selected services being passed:', selectedServices);
    setIsServiceContractModalOpen(true);
    // Close the main modal without clearing selectedServices
    setIsModalOpen(false);
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
            <div style={{ color: '#ED8936', fontSize: '0.9em', marginBottom: '10px' }}>
              Points earned with the Loyalty Member Card.{' '}
              <Link to="/loyalty-card" style={{ color: '#ED8936', textDecoration: 'underline' }}>
                Learn more
              </Link>
              .
            </div>
            <ul className="service-list">
              {ccdsServices.map((service, index) => (
                <li
                  key={index}
                  className={`service-list-item ${index === 0 ? 'popular' : ''}`}
                >
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
                    const service = ccdsServices.find(s => s.name === serviceName);
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
                  Learn more.
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
            src="/images/design.jpg"
            alt="Creative Collective Design Studio"
          />
          <div className="hero-content">
            <h2 className="hero-title">Creative Collective Design Studio</h2>
            <p className="hero-tagline">Transform your vision into stunning reality with our expert design services</p>
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
          Book Creative Collective Design Studio
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
            <span style={companyInfoStyles.infoValue}>{employeesData.design.length} Team Members</span>
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
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
              }}>87.4/100</span>
              <span style={{
                fontSize: '12px',
                color: '#f59e0b',
                fontWeight: '500'
              }}>✓ Verified</span>
            </span>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">About Us</h3>
          <div style={{ maxWidth: '800px', lineHeight: 'var(--line-height-relaxed)' }}>
            <p>Welcome to Creative Collective Design Studio, where we transform your vision into stunning reality. Our team of expert designers combines creativity with technical expertise to deliver exceptional design solutions for your business.</p>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Our Services</h3>
          <ul className="service-list">
            {ccdsServices.map((service, index) => (
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
          serviceName="Design"
          premiumServices={[
            {
              name: "Enterprise Rebrand Package",
              price: "$25,000+",
              description: "Complete enterprise rebrand including logo, brand guidelines, website overhaul, marketing collateral, and launch strategy.",
              reputationRequired: 96,
              exclusive: true
            },
            {
              name: "Award-Submission Design",
              price: "$5,000+",
              description: "Competition-level design work by award-winning designers with portfolio guarantees and international recognition potential.",
              reputationRequired: 94,
              exclusive: true
            },
            {
              name: "VIP Design Consultation",
              price: "$500/hr",
              description: "One-on-one sessions with senior creative directors for strategic brand development and design direction.",
              reputationRequired: 90
            },
            {
              name: "Priority Rush Service",
              price: "+50% fee",
              description: "48-hour turnaround on any design project with dedicated team assignment and expedited revisions.",
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
              <p>Get started with our loyalty program and enjoy 5% off all design services. Perfect for small projects.</p>
            </div>
            <div className="tier-card">
              <h4>Silver Tier</h4>
              <p>Unlock 10% off all services plus one free design consultation per month. Ideal for regular clients.</p>
            </div>
            <div className="tier-card">
              <h4>Gold Tier</h4>
              <p>Enjoy 15% off all services, monthly consultations, and priority scheduling. Perfect for growing businesses.</p>
            </div>
            <div className="tier-card">
              <h4>Platinum Tier</h4>
              <p>Get 20% off all services, unlimited consultations, and exclusive design workshops. For serious businesses.</p>
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
                  <span>Elena Vasquez</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Bronze Member</span>
                </div>
                <span className="review-date">December 5, 2024</span>
              </div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p className="review-text">
                "Creative Canvas completely transformed our restaurant's brand identity! The new logo, menu design, and marketing materials are stunning. Their creative vision and attention to detail exceeded our expectations. Customer feedback has been overwhelmingly positive since the rebrand!"
              </p>
            </div>

            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">
                  <span>James Mitchell</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Gold Member</span>
                </div>
                <span className="review-date">November 22, 2024</span>
              </div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={companyInfoStyles.star}>★</span>
                ))}
              </div>
              <p className="review-text">
                "Working with Creative Canvas on our startup's website was incredible. They took our rough ideas and created a sleek, modern design that perfectly captures our vision. The user experience is seamless and our conversion rates have increased by 60% since launch!"
              </p>
            </div>

            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">
                  <span>Sophie Anderson</span>
                  <span style={companyInfoStyles.loyaltyLabel}>Platinum Member</span>
                </div>
                <span className="review-date">November 5, 2024</span>
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
                "Creative Canvas designed our wedding invitations and they were absolutely beautiful! The custom illustrations and elegant typography made them truly special. Our guests are still complimenting them. The only issue was a slight delay in delivery, but the quality made up for it."
              </p>
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

      <ServiceContractModal
        isOpen={isServiceContractModalOpen}
        onClose={() => setIsServiceContractModalOpen(false)}
        serviceName="Creative Collective Design Studio"
        servicePrice="1 USDC"
        selectedServices={selectedServices}
      />
    </div>
  );
};

export default DesignPage;