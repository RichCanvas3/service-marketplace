import { ShoppingCartIcon, BriefcaseIcon, UserCircleIcon, StarIcon } from '@heroicons/react/20/solid';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../custom-styles.css';
import ServiceList from '../components/ServiceList';
import { useZipCode } from '../context/ZipCodeContext';
import { useSearch } from '../context/SearchContext';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RootPage: React.FC = () => {
  const { zipCode } = useZipCode();
  const { searchQuery } = useSearch();
  const [account, setAccount] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedAccount = localStorage.getItem('walletAddress');
    if (savedAccount) {
      setAccount(savedAccount);
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
      } else {
        alert('Please install MetaMask to use this feature');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask');
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 5)}...`;
  };

  const handleWalletClick = () => {
    if (account) {
      navigate('/account');
    } else {
      connectWallet();
    }
  };

  return (
    <div className="root-page-container">
      <div className="top-buttons">
        <Link to="/loyalty-card">
          <button className="loyalty-card-button">Loyalty Card</button>
        </Link>
        <button
          className="connect-wallet-button"
          onClick={handleWalletClick}
        >
          {account ? truncateAddress(account) : 'Connect Wallet'}
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
