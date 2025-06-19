import '../custom-styles.css'

interface ServiceCardProps {
  url: string;
  name: string;
  linkTo: string;
  zipCode: string;
  tags: string[];
  kybCredibilityScore: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ url, name, linkTo, zipCode, tags, kybCredibilityScore }) => {
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault(); // Prevent navigation when clicking tags
    e.stopPropagation(); // Prevent event bubbling
    // The tag click will be handled by the parent ServiceList component
  };

  // Function to get color based on credibility score
  const getCredibilityColor = (score: number) => {
    if (score >= 90) return { primary: '#22c55e', secondary: '#16a34a', name: 'Excellent' }; // Green
    if (score >= 80) return { primary: '#eab308', secondary: '#ca8a04', name: 'Very Good' }; // Yellow
    if (score >= 70) return { primary: '#f97316', secondary: '#ea580c', name: 'Good' }; // Orange
    return { primary: '#ef4444', secondary: '#dc2626', name: 'Fair' }; // Red
  };

  const credibilityColors = getCredibilityColor(kybCredibilityScore);

  return (
    <a href={linkTo} className="service-card-link">
      <div className='service-card'>
        <div className="service-card-image-container">
          <img
            className='service-card-image'
            src={url}
            loading="lazy"
            width={600}
            height={400}
            alt={`${name} service`}
          />
          <div className="service-card-overlay">
            <div className="service-card-gradient"></div>
          </div>
        </div>

        <div className="service-card-content">
          <div className="service-card-header">
            <div className="service-name-and-location">
              <h3 className="service-card-title">{name}</h3>
              <div className="service-location-badge">
                <span className="location-icon">📍</span>
                <span className="location-text">{zipCode}</span>
              </div>
            </div>

            <div className="service-credibility-container">
              <div className="kyb-credibility-badge" style={{
                background: `linear-gradient(135deg, ${credibilityColors.primary}, ${credibilityColors.secondary})`,
                boxShadow: `0 4px 12px rgba(${credibilityColors.primary === '#22c55e' ? '34, 197, 94' : credibilityColors.primary === '#eab308' ? '234, 179, 8' : credibilityColors.primary === '#f97316' ? '249, 115, 22' : '239, 68, 68'}, 0.3)`
              }}>
                <span className="score-number">{kybCredibilityScore}</span>
                <span className="score-label">/100</span>
              </div>
              <div className="credibility-label" style={{
                color: credibilityColors.primary
              }}>
                {credibilityColors.name}
              </div>
            </div>
          </div>

          <div className="service-tags">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="service-tag"
                onClick={(e) => handleTagClick(e, tag)}
                style={{ cursor: 'pointer' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
};

export default ServiceCard;
