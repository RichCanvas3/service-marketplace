import { useState } from 'react';
import Modal from '../components/Modal';
import data from '../components/data/service-list.json';
import '../custom-styles.css'

interface Service {
  name: string;
  price: string;
  description?: string;
}

const DesignPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const ccdsServices = data.find(service => service.name === "Creative Collective Design Studio")?.services || [];
  const [projectType, setProjectType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [timeline, setTimeline] = useState('');
  const [projectBrief, setProjectBrief] = useState('');

  const isStep1Valid = selectedServices.length > 0;
  const isStep2Valid = projectType && businessName && industry && timeline && projectBrief;

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
      const selectedServiceDetails = ccdsServices
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
    setProjectType('');
    setBusinessName('');
    setIndustry('');
    setTimeline('');
    setProjectBrief('');
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
                  <span className="service-list-item-price">{service.price}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 2:
        return (
          <div>
            <h3>Step 2: Project Details</h3>
            <div className="schedule-form">
              <div className="form-group">
                <label>Project Type</label>
                <select className="form-input" value={projectType} onChange={e => setProjectType(e.target.value)} required>
                  <option value="">Select project type...</option>
                  <option value="branding">Brand Identity</option>
                  <option value="website">Website Design</option>
                  <option value="print">Print Design</option>
                  <option value="packaging">Packaging Design</option>
                  <option value="digital">Digital Marketing Assets</option>
                </select>
              </div>
              <div className="form-group">
                <label>Business/Organization Name</label>
                <input type="text" className="form-input" placeholder="Your business or organization name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input type="text" className="form-input" placeholder="Your industry or sector" value={industry} onChange={e => setIndustry(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Project Timeline</label>
                <select className="form-input" value={timeline} onChange={e => setTimeline(e.target.value)} required>
                  <option value="">Select timeline...</option>
                  <option value="urgent">Urgent (1-2 weeks)</option>
                  <option value="standard">Standard (3-4 weeks)</option>
                  <option value="relaxed">Relaxed (5+ weeks)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Project Brief</label>
                <textarea className="form-input" rows={4} placeholder="Describe your project, goals, target audience, and any specific requirements..." value={projectBrief} onChange={e => setProjectBrief(e.target.value)} required></textarea>
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
              <div className="confirmation-message">
                <p>Click 'Finish' to submit your design project request. We'll contact you shortly to discuss your project in detail and provide a customized quote based on your specific needs.</p>
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

export default DesignPage;