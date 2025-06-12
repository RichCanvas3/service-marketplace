import { useState } from 'react';
import Modal from '../components/Modal';
import data from '../components/data/service-list.json';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const GaragePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const mmgServices = data.find(service => service.name === "Mike's Mobile Garage")?.services || [];
  const isStep1Valid = selectedServices.length > 0;
  const isStep2Valid = preferredDate && preferredTime && vehicleInfo && serviceLocation;

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
      // Handle form submission
      const selectedServiceDetails = mmgServices
        .filter(service => selectedServices.includes(service.name))
        .map(service => `${service.name} (${service.price})`);

      alert(`Booking submitted!\n\nSelected services:\n${selectedServiceDetails.join('\n')}`);
      handleCloseModal();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 3));
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
    setVehicleInfo('');
    setServiceLocation('');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Step 1: Select Services</h3>
            <ul className="service-list">
              {mmgServices.map((service, index) => (
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
            <h3>Step 2: Service Details</h3>
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
                  <option value="afternoon">Afternoon (1PM - 5PM)</option>
                  <option value="emergency">Emergency Service</option>
                </select>
              </div>
              <div className="form-group">
                <label>Vehicle Information</label>
                <input type="text" className="form-input" placeholder="Year, Make, and Model" value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Service Location</label>
                <input type="text" className="form-input" placeholder="Address where service is needed" value={serviceLocation} onChange={e => setServiceLocation(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea className="form-input" rows={4} placeholder="Describe any specific issues or concerns with your vehicle..."></textarea>
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
                  const service = mmgServices.find(s => s.name === serviceName);
                  return (
                    <li key={index} className="review-item">
                      <span>{service?.name}</span>
                      <span>{service?.price}</span>
                    </li>
                  );
                })}
              </ul>
              <h4>Service Details:</h4>
              <ul className="review-list">
                <li className="review-item">
                  <span>Vehicle Information</span>
                  <span>{vehicleInfo}</span>
                </li>
                <li className="review-item">
                  <span>Service Location</span>
                  <span>{serviceLocation}</span>
                </li>
                <li className="review-item">
                  <span>Preferred Date</span>
                  <span>{preferredDate}</span>
                </li>
                <li className="review-item">
                  <span>Preferred Time</span>
                  <span>{preferredTime}</span>
                </li>
              </ul>
              <div className="confirmation-message">
                <p>Click 'Finish' to submit your service request. We'll contact you shortly to confirm the appointment and discuss any additional details about your vehicle.</p>
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
        title="Book Mobile Service"
        currentStep={currentStep}
        totalSteps={3}
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

export default GaragePage;