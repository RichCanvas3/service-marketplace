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
    if (score >= 90) return { primary: '#22c55e', secondary: '#16a34a' }; // Green
    if (score >= 80) return { primary: '#eab308', secondary: '#ca8a04' }; // Yellow
    if (score >= 70) return { primary: '#f97316', secondary: '#ea580c' }; // Orange
    return { primary: '#ef4444', secondary: '#dc2626' }; // Red
  };

  const credibilityColors = getCredibilityColor(kybCredibilityScore);

  return (
    <a href={linkTo} className="service-card-link">
      <div className='service-card'>
        <img
          className='service-card-image'
          src={url}
          loading="lazy"
          width={600}
          height={400}
          alt={`${name} service`}
        />
        <div className="service-card-content">
          <div className="service-card-header">
            <div className="service-name-and-location">
              <h3><b>{name}</b></h3>
              <div className="service-zip-badge" style={{
                backgroundColor: '#2a2a2a',
                color: '#ccc',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px',
                border: '1px solid #404040'
              }}>
                📍 {zipCode}
              </div>
            </div>
            <div className="kyb-credibility-badge" style={{
              background: `linear-gradient(135deg, ${credibilityColors.primary}, ${credibilityColors.secondary})`,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: `0 2px 4px rgba(${credibilityColors.primary === '#22c55e' ? '34, 197, 94' : credibilityColors.primary === '#eab308' ? '234, 179, 8' : credibilityColors.primary === '#f97316' ? '249, 115, 22' : '239, 68, 68'}, 0.3)`,
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}>
              {kybCredibilityScore}/100
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
