import { useState } from 'react';
import Modal from '../components/Modal';
import data from '../components/data/service-list.json';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const TaxPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const rtsServices = data.find(service => service.name === "Rob's Tax Services")?.services || [];
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
      // Handle form submission
      const selectedServiceDetails = rtsServices
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
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Step 1: Select Services</h3>
            <ul className="service-list">
              {rtsServices.map((service, index) => (
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
            <h3>Step 2: Schedule Consultation</h3>
            <div className="schedule-form">
              <div className="form-group">
                <label>Preferred Date</label>
                <input type="date" className="form-input" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <select className="form-input" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} required>
                  <option value="">Select a time...</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (1PM - 4PM)</option>
                  <option value="evening">Evening (4PM - 6PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea className="form-input" rows={4} placeholder="Any specific tax concerns or questions..."></textarea>
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
                  const service = rtsServices.find(s => s.name === serviceName);
                  return (
                    <li key={index} className="review-item">
                      <span>{service?.name}</span>
                      <span>{service?.price}</span>
                    </li>
                  );
                })}
              </ul>
              <h4>Consultation Details:</h4>
              <ul className="review-list">
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
                <p>Click 'Finish' to submit your consultation request. We'll contact you shortly to confirm your appointment and discuss any required documentation.</p>
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
      <h2>Rob's Tax Services</h2>

      <img
        className='service-card-image'
        src='/images/tax-services.jpg'
        alt="Rob's Tax Services"
      />

      <div style={{ maxWidth: '800px', lineHeight: '1.6', width: '100%' }}>
        <p>Welcome to Rob's Tax Services, your trusted partner in financial success. With years of experience in tax preparation and planning, we provide comprehensive solutions for both individuals and businesses. Our expertise ensures you receive maximum benefits while staying compliant with current tax regulations.</p>

        <p>Our comprehensive tax services include:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Personal tax return preparation and filing</li>
          <li>Business tax planning and compliance</li>
          <li>Strategic tax consultation</li>
          <li>Year-round tax planning</li>
          <li>IRS representation</li>
        </ul>

        <p>Why choose us:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Licensed and certified tax professionals</li>
          <li>Up-to-date knowledge of tax laws and regulations</li>
          <li>Personalized attention to your unique situation</li>
          <li>Maximum deductions and credits</li>
          <li>Year-round availability for tax planning</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're committed to helping you navigate the complexities of tax planning and preparation. Ready to optimize your tax strategy?</p>
      </div>

      <button className="service-button" onClick={() => setIsModalOpen(true)}>
        Book Consultation
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Book Tax Services"
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

export default TaxPage;