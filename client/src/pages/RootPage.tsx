import { ShoppingCartIcon, BriefcaseIcon, UserCircleIcon, StarIcon} from '@heroicons/react/20/solid'
import '../custom-styles.css'
import ServiceList from '../components/ServiceList.tsx'
import { useZipCode } from '../context/ZipCodeContext'
import { useSearch } from '../context/SearchContext'

const RootPage: React.FC = () => {
  const { zipCode } = useZipCode();
  const { searchQuery } = useSearch();

  return (
    <div className="root-page-container">
      <h2 className="content-heading">
        {zipCode ? `Services near ${zipCode}` : 'All Services'}
      </h2>
      <ServiceList searchQuery={searchQuery} />
    </div>
  );
};

export default RootPage;
