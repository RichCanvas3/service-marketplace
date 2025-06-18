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

  return (
    <div className='side-nav'>
      <a className='header-title' href='/'>
        <div className="header-content">
          <div className="header-logo-container">
            <img src="/favicon.svg" alt="Logo" className="header-logo" />
          </div>
          <h2>Service Marketplace</h2>
        </div>
      </a>

      <p>Search:</p>
      <input
        type="text"
        className='search-input'
        placeholder="Search services..."
        value={searchQuery}
        onChange={handleSearch}
      />

      <p>Zip Code:</p>
      <input
        type="text"
        className='zip-input'
        placeholder="Enter zip code"
        value={zipCode}
        onChange={handleZipCode}
        maxLength={5}
        pattern="[0-9]*"
      />
    </div>
  );
};

export default SideNav;
