import { useState } from 'react';
import Modal from '../components/Modal';
import data from '../components/data/service-list.json';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const CateringPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [numGuests, setNumGuests] = useState('');
  const dcServices = data.find(service => service.name === "Diane's Catering")?.services || [];
  const isStep1Valid = selectedServices.length > 0;
  const isStep2Valid = eventDate && eventTime && numGuests;

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
      const selectedServiceDetails = dcServices
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
    setEventDate('');
    setEventTime('');
    setNumGuests('');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Step 1: Select Services</h3>
            <ul className="service-list">
              {dcServices.map((service, index) => (
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
            <h3>Step 2: Event Details</h3>
            <div className="schedule-form">
              <div className="form-group">
                <label>Event Date</label>
                <input type="date" className="form-input" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Event Time</label>
                <select className="form-input" value={eventTime} onChange={e => setEventTime(e.target.value)} required>
                  <option value="">Select a time...</option>
                  <option value="breakfast">Breakfast (7AM - 10AM)</option>
                  <option value="lunch">Lunch (11AM - 2PM)</option>
                  <option value="dinner">Dinner (5PM - 9PM)</option>
                  <option value="custom">Custom Time</option>
                </select>
              </div>
              <div className="form-group">
                <label>Number of Guests</label>
                <input type="number" className="form-input" placeholder="Estimated number of guests" min="1" value={numGuests} onChange={e => setNumGuests(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea className="form-input" rows={4} placeholder="Dietary restrictions, venue details, theme preferences..."></textarea>
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
                  const service = dcServices.find(s => s.name === serviceName);
                  return (
                    <li key={index} className="review-item">
                      <span>{service?.name}</span>
                      <span>{service?.price}</span>
                    </li>
                  );
                })}
              </ul>
              <h4>Event Details:</h4>
              <ul className="review-list">
                <li className="review-item">
                  <span>Event Date</span>
                  <span>{eventDate}</span>
                </li>
                <li className="review-item">
                  <span>Event Time</span>
                  <span>{eventTime}</span>
                </li>
                <li className="review-item">
                  <span>Number of Guests</span>
                  <span>{numGuests}</span>
                </li>
              </ul>
              <div className="confirmation-message">
                <p>Click 'Finish' to submit your catering request. We'll contact you shortly to discuss menu options and finalize the details for your event.</p>
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

export default CateringPage;