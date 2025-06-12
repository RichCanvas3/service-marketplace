import '../custom-styles.css'
import ServiceCard from './ServiceCard';
import data from './data/service-list.json';
import { useZipCode } from '../context/ZipCodeContext';
import { useState, useEffect } from 'react';

interface SearchProps {
  searchQuery: string;
}

const ServiceList: React.FC<SearchProps> = ({ searchQuery }) => {
  const { zipCode } = useZipCode();
  const [filteredServices, setFilteredServices] = useState(data);

  useEffect(() => {
    const filtered = data.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZip = !zipCode || service.zipCode.includes(zipCode);
      return matchesSearch && matchesZip;
    });
    setFilteredServices(filtered);
  }, [searchQuery, zipCode]);

  if (filteredServices.length === 0) {
    return (
      <div className="no-results-container">
        <div className="no-results">
          <p>No services found matching your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-grid">
      {filteredServices.map((service, index) => (
        <ServiceCard
          key={index}
          url={service.url}
          name={service.name}
          linkTo={service.linkTo}
          zipCode={service.zipCode}
          tags={service.tags}
        />
      ))}
    </div>
  );
};

export default ServiceList;
