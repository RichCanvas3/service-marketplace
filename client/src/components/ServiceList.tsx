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

  // Get all unique tags from services, filtered and sorted alphabetically
  const allTags = Array.from(
    new Set(
      data
        .flatMap(service => service.tags)
        .filter(tag => tag && tag.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

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
        display: 'none',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
        padding: '0 40px',
        width: 'auto%'
      }}>
        {allTags.map((tag) => (
          <span
            key={tag}
            className="service-tag"
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              border: '2px solid transparent',
              transition: 'all 0.2s ease',
              backgroundColor: selectedTags.includes(tag)
                ? 'var(--accent-color-secondary)'
                : 'var(--accent-color)',
              transform: selectedTags.includes(tag) ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedTags.includes(tag)
                ? '0 2px 8px rgba(0,0,0,0.15)'
                : '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onClick={() => handleTagClick(tag)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = selectedTags.includes(tag) ? 'scale(1.05)' : 'scale(1)';
              e.currentTarget.style.boxShadow = selectedTags.includes(tag)
                ? '0 2px 8px rgba(0,0,0,0.15)'
                : '0 1px 3px rgba(0,0,0,0.1)';
            }}
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
            kybCredibilityScore={service.kybCredibilityScore}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceList;
