import { ShoppingCartIcon, BriefcaseIcon, UserCircleIcon, StarIcon } from '@heroicons/react/20/solid';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../custom-styles.css';
import ServiceList from '../components/ServiceList';
import { useZipCode } from '../context/ZipCodeContext';
import { useSearch } from '../context/SearchContext';
import { useNotification } from '../context/NotificationContext';
import mcoMock from '../components/data/mco-mock.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RootPage: React.FC = () => {
  const { zipCode } = useZipCode();
  const { searchQuery } = useSearch();
  const { showNotification } = useNotification();
  const [account, setAccount] = useState<string | null>(null);
  const [preferredName, setPreferredName] = useState<string>('');
  const [mcoData, setMcoData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedAccount = localStorage.getItem('walletAddress');
    if (savedAccount) {
      setAccount(savedAccount);
      // Try to load mco data from localStorage
      const storedMco = localStorage.getItem('mcoData');
      if (storedMco) {
        setMcoData(JSON.parse(storedMco));
      }
    }
    const savedName = localStorage.getItem('preferredName') || '';
    setPreferredName(savedName);
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        // On first login, check localStorage for mcoData, otherwise load from mock
        let mco = localStorage.getItem('mcoData');
        let mcoObj;
        if (!mco) {
          mcoObj = { ...mcoMock, userId: accounts[0] };
          localStorage.setItem('mcoData', JSON.stringify(mcoObj));
          setMcoData(mcoObj);
        } else {
          mcoObj = { ...JSON.parse(mco), userId: accounts[0] };
          localStorage.setItem('mcoData', JSON.stringify(mcoObj));
          setMcoData(mcoObj);
        }
        showNotification('Wallet connected successfully!', 'success');
      } else {
        showNotification('Please install MetaMask to use this feature', 'error');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      showNotification('Failed to connect to MetaMask', 'error');
    }
  };

  const handleDisconnect = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('walletAddress');

      // Clear MetaMask connection
      if (window.ethereum) {
        // Request MetaMask to disconnect
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        });
      }

      showNotification('Wallet disconnected successfully', 'info');
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      showNotification('Failed to disconnect wallet. Please try again.', 'error');
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 5)}...`;
  };

  // Function to get color based on KYC credibility score
  const getKycCredibilityColor = (score: number) => {
    if (score >= 90) return { primary: '#22c55e', secondary: '#16a34a', name: 'Excellent' }; // Green
    if (score >= 80) return { primary: '#eab308', secondary: '#ca8a04', name: 'Very Good' }; // Yellow
    if (score >= 70) return { primary: '#f97316', secondary: '#ea580c', name: 'Good' }; // Orange
    return { primary: '#ef4444', secondary: '#dc2626', name: 'Fair' }; // Red
  };

  const handleWalletClick = () => {
    if (account) {
      navigate('/account');
    } else {
      connectWallet();
    }
  };

  // Use preferred name if available and connected, otherwise fallback to address or Connect Wallet
  const accountButtonLabel = account
    ? (preferredName && preferredName.trim() !== ''
        ? preferredName
        : truncateAddress(account))
    : 'Connect Wallet';

  return (
    <div className="root-page-container">
      <div className="top-buttons">
        <Link to="/loyalty-card">
          <button className="loyalty-card-button">Loyalty Program</button>
        </Link>
        <button
          className="connect-wallet-button"
          onClick={handleWalletClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: account && mcoData?.kycCredibilityScore ? '8px' : '0px',
            padding: account && mcoData?.kycCredibilityScore ? '12px 16px' : '16px 32px'
          }}
        >
          <span>{accountButtonLabel}</span>
          {account && mcoData?.kycCredibilityScore && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: `linear-gradient(135deg, ${getKycCredibilityColor(mcoData.kycCredibilityScore).primary}, ${getKycCredibilityColor(mcoData.kycCredibilityScore).secondary})`,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white',
                boxShadow: `0 2px 8px rgba(${getKycCredibilityColor(mcoData.kycCredibilityScore).primary === '#22c55e' ? '34, 197, 94' : getKycCredibilityColor(mcoData.kycCredibilityScore).primary === '#eab308' ? '234, 179, 8' : getKycCredibilityColor(mcoData.kycCredibilityScore).primary === '#f97316' ? '249, 115, 22' : '239, 68, 68'}, 0.3)`
              }}
            >
              <span>{mcoData.kycCredibilityScore}</span>
            </div>
          )}
        </button>
      </div>
      <h2 className="content-heading">
        {zipCode ? `Services near ${zipCode}` : 'All Services'}
      </h2>
      <ServiceList searchQuery={searchQuery} />
    </div>
  );
};

export default RootPage;
