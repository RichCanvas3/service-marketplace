import { useState } from 'react';
import ServiceList from '../components/ServiceList.tsx'
import { SendMcpMessage } from '../components/SendMcpMessage';
import Modal from '../components/Modal';
import InfoModal from '../components/InfoModal';
import data from '../components/data/service-list.json';
import employees from '../components/data/employees.json';
import { companyInfoStyles } from '../styles/companyInfoStyles';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const GaragePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const garageServices = data.find(service => service.name === "Mike's Mobile Garage")?.services || [];
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
      const selectedServiceDetails = garageServices
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
    // Handle card payment
    alert('Card payment selected');
    handleCloseModal();
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
              {garageServices.map((service, index) => (
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
                  <span className="service-list-item-price">{service.price}</span>
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
                  const service = garageServices.find(s => s.name === serviceName);
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
                <button className="service-button metamask-button" onClick={handleButton2Click}>
                  Pay with MetaMask
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
      <h2>Mike's Mobile Garage</h2>

      <img
        className='service-card-image'
        src='/images/mechanic.jpg'
        alt="Mike's Mobile Garage"
      />

      <div style={companyInfoStyles.companyInfo}>
        <div style={companyInfoStyles.infoGrid}>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Employees</span>
            <span style={companyInfoStyles.infoValue}>{employees.garage.length}</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Address</span>
            <span style={companyInfoStyles.infoValue}>321 Oak Avenue, Erie, CO 16504</span>
          </div>
          <div style={companyInfoStyles.infoItem}>
            <span style={companyInfoStyles.infoLabel}>Phone</span>
            <span style={companyInfoStyles.infoValue}>(814) 555-0126</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', lineHeight: '1.6', width: '100%' }}>
        <p>Welcome to Mike's Mobile Garage, your trusted mobile automotive service provider. We bring professional automotive care directly to your location, saving you time and hassle. Whether you need routine maintenance or emergency repairs, our certified mechanics are equipped to handle your vehicle's needs with expertise and convenience.</p>

        <p>Our mobile services include:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>On-location diagnostics and repairs</li>
          <li>Routine maintenance services</li>
          <li>Emergency breakdown assistance</li>
          <li>Pre-purchase vehicle inspections</li>
          <li>Fleet maintenance services</li>
        </ul>

        <p>Why choose us:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>ASE certified mechanics</li>
          <li>Convenient mobile service</li>
          <li>Competitive pricing</li>
          <li>Quality parts and materials</li>
          <li>Warranty on all services</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're committed to providing professional automotive care with the convenience of mobile service. Ready to experience hassle-free auto maintenance?</p>
      </div>

      <button className="service-button" onClick={() => setIsModalOpen(true)}>
        Book Service
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Book Garage Services"
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
      />
    </div>
  );
};

export default GaragePage;