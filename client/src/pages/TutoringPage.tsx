import { useState } from 'react';
import Modal from '../components/Modal';
import data from '../components/data/service-list.json';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const TutoringPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [subject, setSubject] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const abctServices = data.find(service => service.name === "ABC Tutoring")?.services || [];
  const isStep1Valid = selectedServices.length > 0;
  const isStep2Valid = subject && preferredDate && preferredTime && gradeLevel;

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
      const selectedServiceDetails = abctServices
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
    setSubject('');
    setPreferredDate('');
    setPreferredTime('');
    setGradeLevel('');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Step 1: Select Services</h3>
            <ul className="service-list">
              {abctServices.map((service, index) => (
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
            <h3>Step 2: Session Details</h3>
            <div className="schedule-form">
              <div className="form-group">
                <label>Subject Area</label>
                <select className="form-input" value={subject} onChange={e => setSubject(e.target.value)} required>
                  <option value="">Select a subject...</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="history">History</option>
                  <option value="sat">SAT Prep</option>
                  <option value="act">ACT Prep</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Start Date</label>
                <input type="date" className="form-input" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <select className="form-input" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} required>
                  <option value="">Select a time...</option>
                  <option value="after-school">After School (3PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 8PM)</option>
                  <option value="weekend-morning">Weekend Morning (9AM - 12PM)</option>
                  <option value="weekend-afternoon">Weekend Afternoon (1PM - 4PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Student Grade Level</label>
                <select className="form-input" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} required>
                  <option value="">Select grade level...</option>
                  <option value="elementary">Elementary School</option>
                  <option value="middle">Middle School</option>
                  <option value="high">High School</option>
                  <option value="college">College</option>
                </select>
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea className="form-input" rows={4} placeholder="Any specific areas of focus, learning style preferences, or concerns..."></textarea>
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
                  const service = abctServices.find(s => s.name === serviceName);
                  return (
                    <li key={index} className="review-item">
                      <span>{service?.name}</span>
                      <span>{service?.price}</span>
                    </li>
                  );
                })}
              </ul>
              <h4>Session Details:</h4>
              <ul className="review-list">
                <li className="review-item">
                  <span>Subject</span>
                  <span>{subject}</span>
                </li>
                <li className="review-item">
                  <span>Grade Level</span>
                  <span>{gradeLevel}</span>
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
                <p>Click 'Finish' to submit your tutoring request. We'll contact you shortly to match you with the best tutor for your needs and confirm your session details.</p>
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
      <h2>ABC Tutoring</h2>

      <img
        className='service-card-image'
        src='/images/tutoring.jpg'
        alt="ABC Tutoring"
      />

      <div style={{ maxWidth: '800px', lineHeight: '1.6', width: '100%' }}>
        <p>Welcome to ABC Tutoring, where we empower students to reach their full academic potential. Our experienced tutors provide personalized instruction across a wide range of subjects, helping students build confidence and achieve their educational goals. Whether you're looking to improve grades, prepare for standardized tests, or gain a deeper understanding of challenging subjects, we're here to help.</p>

        <p>Our tutoring services include:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>One-on-one personalized tutoring</li>
          <li>SAT/ACT test preparation</li>
          <li>Subject-specific assistance</li>
          <li>Study skills development</li>
          <li>Homework help and academic support</li>
        </ul>

        <p>Why choose us:</p>

        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Experienced, qualified tutors</li>
          <li>Personalized learning plans</li>
          <li>Flexible scheduling options</li>
          <li>Progress tracking and reporting</li>
          <li>Proven success strategies</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're committed to helping students achieve academic excellence through personalized tutoring and support. Ready to boost your academic performance?</p>
      </div>

      <button className="service-button" onClick={() => setIsModalOpen(true)}>
        Book Tutoring
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Book Tutoring Services"
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

export default TutoringPage;