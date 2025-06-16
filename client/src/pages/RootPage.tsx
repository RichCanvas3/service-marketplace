import { ShoppingCartIcon, BriefcaseIcon, UserCircleIcon, StarIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';
import '../custom-styles.css';
import ServiceList from '../components/ServiceList';
import { useZipCode } from '../context/ZipCodeContext';
import { useSearch } from '../context/SearchContext';

const RootPage: React.FC = () => {
  const { zipCode } = useZipCode();
  const { searchQuery } = useSearch();

  return (
    <div className="root-page-container">
      <div className="top-buttons">
        <Link to="/loyalty-card">
          <button className="loyalty-card-button">Loyalty Card</button>
        </Link>
        <button className="connect-wallet-button">Connect Wallet</button>
      </div>
      <h2 className="content-heading">
        {zipCode ? `Services near ${zipCode}` : 'All Services'}
      </h2>
      <ServiceList searchQuery={searchQuery} />
    </div>
  );
};

export default RootPage;
