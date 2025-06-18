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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from services
  const allTags = Array.from(new Set(data.flatMap(service => service.tags)));

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  useEffect(() => {
    const filtered = data.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZip = !zipCode || service.zipCode.includes(zipCode);
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => service.tags.includes(tag));
      return matchesSearch && matchesZip && matchesTags;
    });
    setFilteredServices(filtered);
  }, [searchQuery, zipCode, selectedTags]);

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
    <div>
      <div className="filter-tags" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '20px',
        padding: '0 40px'
      }}>
        {allTags.map((tag, index) => (
          <span
            key={index}
            className="service-tag"
            style={{
              cursor: 'pointer',
              backgroundColor: selectedTags.includes(tag) ? 'var(--accent-color-secondary)' : 'var(--accent-color)'
            }}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </span>
        ))}
      </div>
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
    </div>
  );
};

export default ServiceList;
