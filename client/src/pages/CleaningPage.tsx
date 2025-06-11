import { ShoppingCartIcon, BriefcaseIcon, UserCircleIcon, StarIcon} from '@heroicons/react/20/solid'
import '../custom-styles.css'
import ServiceList from '../components/ServiceList.tsx'
import { SendMcpMessage } from '../components/SendMcpMessage';

const CleaningPage: React.FC = () => {
  return (
    <div className="individual-page">
      <h2> Daisy's Home Cleaning Page </h2>

      <img className='service-card-image' src='/images/cleaning.jpg' width='600px' height='auto' />

      <div style={{ maxWidth: '800px', margin: '20px 0', lineHeight: '1.6', alignSelf: 'flex-start' }}>
        <p>Welcome to Daisy's Home Cleaning Service, where we bring sparkle and shine to every corner of your home. With over a decade of experience in professional home cleaning, we understand that a clean home is more than just appearance – it's about creating a healthy, comfortable space for you and your loved ones.</p>

        <p>Our comprehensive cleaning services include:</p>
        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Deep cleaning of kitchens and bathrooms</li>
          <li>Thorough dusting and vacuuming of all living spaces</li>
          <li>Window and glass surface cleaning</li>
          <li>Eco-friendly cleaning options available</li>
          <li>Regular maintenance cleaning schedules</li>
        </ul>

        <p>What sets us apart:</p>
        <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <li>Fully insured and bonded professional cleaners</li>
          <li>Flexible scheduling to fit your busy lifestyle</li>
          <li>Attention to detail and consistent quality</li>
          <li>Pet-friendly cleaning products available</li>
          <li>100% satisfaction guarantee</li>
        </ul>

        <p>Serving the Erie area and surrounding communities, we're committed to making your home cleaning experience effortless and reliable. Ready to experience the difference of professional home cleaning?</p>
      </div>

      <div style={{ alignSelf: 'flex-start' }}>
        <button
          className="service-button"
          onClick={() => window.location.href = '/'}
        >
          View Catalog
        </button>
      </div>

      <SendMcpMessage />
    </div>
  );
};

export default CleaningPage;
