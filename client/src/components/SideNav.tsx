import '../custom-styles.css'
import { useZipCode } from '../context/ZipCodeContext';
import { useSearch } from '../context/SearchContext';

const SideNav: React.FC = () => {
  const { zipCode, setZipCode } = useZipCode();
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleZipCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearZipCode = () => {
    setZipCode('');
  };

  return (
    <div className='side-nav'>
      {/* Header Section */}
      <div className="nav-header">
        <a className='header-title' href='/'>
          <div className="header-content">
            <div className="header-logo-container">
              <div className="logo-wrapper">
                <img src="/favicon.svg" alt="Logo" className="header-logo" />
                <div className="logo-glow"></div>
              </div>
            </div>
            <h2>Service Marketplace</h2>
            <div className="header-subtitle">Where Blockchain Meets Your Neighborhood</div>
          </div>
        </a>
      </div>

      {/* Navigation Divider */}
      <div className="nav-divider"></div>

      {/* Search Section */}
      <div className="nav-section">
        <div className="section-header">
          <h3 className="section-title">Search Services</h3>
        </div>
        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              className='search-input'
              placeholder="Search services..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button className="clear-button" onClick={clearSearch} aria-label="Clear search">
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="nav-section">
        <div className="section-header">
          <h3 className="section-title">Location</h3>
        </div>
        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              className='zip-input'
              placeholder="Enter zip code"
              value={zipCode}
              onChange={handleZipCode}
              maxLength={5}
              pattern="[0-9]*"
            />
            {zipCode && (
              <button className="clear-button" onClick={clearZipCode} aria-label="Clear zip code">
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="nav-section">
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">7</span>
            <span className="stat-label">Local Providers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">80+</span>
            <span className="stat-label">Colorado Providers</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="nav-footer">
        <div className="footer-content">
          <p>Powered by MetaMask</p>
          <div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <span>•</span>
            <a href="#" className="footer-link">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
