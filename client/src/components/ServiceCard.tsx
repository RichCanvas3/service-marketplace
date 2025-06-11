import '../custom-styles.css'

interface ServiceCardProps {
  url: string;
  name: string;
  linkTo: string;
  zipCode: string;
  tags: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ url, name, linkTo, zipCode, tags }) => {


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
          <h3><b>{name}</b></h3>
          <p className="service-zip">Zip Code: {zipCode}</p>
        </div>
        <div className="service-tags">
          {tags.map((tag, index) => (
            <span key={index} className="service-tag">{tag}</span>
          ))}
        </div>
      </div>
    </a>
  );
};

export default ServiceCard;
