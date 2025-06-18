import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyInfoStyles } from '../styles/companyInfoStyles';
import '../custom-styles.css';

const LoyaltyPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Disable scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div>
      {/* Rest of the component content */}
    </div>
  );
};

export default LoyaltyPage;