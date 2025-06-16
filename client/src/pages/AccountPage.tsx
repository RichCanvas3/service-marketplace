import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const account = localStorage.getItem('walletAddress');
  const [network, setNetwork] = useState<string>('');

  useEffect(() => {
    const getNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          // Convert chainId to network name
          switch (chainId) {
            case '0x1':
              setNetwork('Ethereum Mainnet');
              break;
            case '0xe704':
              setNetwork('Linea Mainnet');
              break;
            case '0xe705':
              setNetwork('Linea Testnet');
              break;
            default:
              setNetwork(`Unknown Network (${chainId})`);
          }
        } catch (error) {
          console.error('Error getting network:', error);
          setNetwork('Error fetching network');
        }
      }
    };

    getNetwork();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        switch (chainId) {
          case '0x1':
            setNetwork('Ethereum Mainnet');
            break;
          case '0xe704':
            setNetwork('Linea Mainnet');
            break;
          case '0xe705':
            setNetwork('Linea Testnet');
            break;
          default:
            setNetwork(`Unknown Network (${chainId})`);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

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

      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      alert('Failed to disconnect wallet. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => navigate('/')}
          style={styles.backButton}
        >
          <ArrowLeftIcon style={styles.backIcon} />
          Back
        </button>
        <h1 style={styles.title}>Account</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Wallet Information</h2>
          <div style={styles.walletInfo}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Address:</span>
              <span style={styles.value}>{account}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Network:</span>
              <span style={styles.value}>{network}</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Account Settings</h2>
          <button
            onClick={handleDisconnect}
            style={styles.disconnectButton}
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '40px',
    position: 'relative' as const,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#F3F4F6',
    },
  },
  backIcon: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  walletInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  label: {
    color: '#6B7280',
    fontSize: '14px',
  },
  value: {
    color: '#111827',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#DC2626',
    },
  },
};

export default AccountPage;