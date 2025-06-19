import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import '../custom-styles.css';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const account = localStorage.getItem('walletAddress');
  const [network, setNetwork] = useState<string>('');
  const [preferredName, setPreferredName] = useState<string>('');
  const [saveMsg, setSaveMsg] = useState<string>('');
  const [mcoData, setMcoData] = useState<any>(null);

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

    // Load preferred name from localStorage
    const savedName = localStorage.getItem('preferredName') || '';
    setPreferredName(savedName);

    // Load mcoData from localStorage
    const mco = localStorage.getItem('mcoData');
    if (mco) setMcoData(JSON.parse(mco));

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

      showNotification('Wallet disconnected successfully', 'info');
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      showNotification('Failed to disconnect wallet. Please try again.', 'error');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferredName(e.target.value);
    setSaveMsg('');
  };

  const handleSaveName = () => {
    localStorage.setItem('preferredName', preferredName);
    setSaveMsg('Saved!');
    setTimeout(() => setSaveMsg(''), 1500);
  };

  const truncateAddress = (address: string) => {
    return address ? `${address.slice(0, 5)}...` : '';
  };

  // Use preferred name if available, otherwise fallback to address
  const accountButtonLabel = preferredName && preferredName.trim() !== ''
    ? preferredName
    : (account ? truncateAddress(account) : 'No Wallet');

  return (
    <div className="individual-page">
      <div className="top-buttons">
        <Link to="/loyalty-card">
          <button className="loyalty-card-button">Loyalty Card</button>
        </Link>
        <button className="connect-wallet-button" style={{ cursor: 'default' }}>
          {accountButtonLabel}
        </button>
      </div>
      <div className="content" style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <h1>Account</h1>
        <h2 style={{ marginBottom: 32 }}>Your Wallet & Settings</h2>

        {/* Account Settings Section */}
        <div className="loyalty-section" style={{ width: '100%' }}>
          <h3>Account Settings</h3>
          <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <label style={{ color: '#a0a0a0', fontWeight: 500 }}>
              Preferred Name (optional):
            </label>
            <input
              type="text"
              value={preferredName}
              onChange={handleNameChange}
              placeholder="Enter your preferred name"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#222',
                color: '#fff',
                fontSize: '16px',
                minWidth: 180,
                flex: 1,
                maxWidth: '300px'
              }}
            />
            <button
              onClick={handleSaveName}
              style={{
                backgroundColor: '#ED8936',
                color: 'black',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '15px',
                marginLeft: 4
              }}
            >
              Save
            </button>
            {saveMsg && <span style={{ color: '#4fd1c5', marginLeft: 8, fontWeight: 500 }}>{saveMsg}</span>}
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              width: 'fit-content',
              margin: '20px 0',
              fontSize: '16px'
            }}
          >
            Disconnect Wallet
          </button>
        </div>

        {/* Wallet Information Section */}
        <div className="loyalty-section">
          <h3>Wallet Information</h3>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
              <span style={{ color: '#a0a0a0' }}>Address: </span>
              <span style={{ color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{account}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ color: '#a0a0a0' }}>Network:</span>
              <span style={{ color: '#fff' }}>{network}</span>
            </div>
          </div>
        </div>

        {/* Loyalty Card Section */}
        <div className="loyalty-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#a78bfa', letterSpacing: 1 }}>Loyalty Card</h3>
          {mcoData && mcoData.loyaltyMember ? (
            <div style={{
              background: 'linear-gradient(135deg, #232323 70%, #a78bfa 100%)',
              borderRadius: 20,
              padding: '32px 36px',
              marginBottom: 32,
              color: '#fff',
              width: '100%',
              maxWidth: 750,
              boxShadow: '0 6px 32px 0 rgba(80,60,180,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 600 }}>Membership</span>
                <span style={{
                  background: '#a78bfa',
                  color: '#232323',
                  borderRadius: 16,
                  padding: '4px 16px',
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: 1
                }}>{mcoData.membershipLevel}</span>
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#fbbf24' }}>★</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{mcoData.loyaltyPoints}</div>
                  <div style={{ fontSize: 13, color: '#bdbdbd' }}>Points</div>
                </div>
              </div>
              <div style={{ width: '100%', margin: '12px 0', background: '#fff2', height: 1, borderRadius: 1 }} />
              <div style={{ width: '100%', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#a78bfa', fontSize: 16 }}>MetaMask Account ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#e0e0e0', background: '#18181b', borderRadius: 8, padding: '6px 10px', wordBreak: 'break-all' }}>{mcoData.userId}</div>
              </div>
              <div style={{ width: '100%', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#a78bfa', fontSize: 16 }}>Rewards</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {mcoData.rewards && mcoData.rewards.length > 0 ? mcoData.rewards.map((r: any) => (
                    <div key={r.id} style={{
                      background: '#fbbf24',
                      color: '#232323',
                      borderRadius: 12,
                      padding: '6px 14px',
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: '0 2px 8px 0 #fbbf2433',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      🎁 {r.name} <span style={{ fontSize: 13, color: '#a16207', marginLeft: 6 }}>({r.points} pts)</span>
                    </div>
                  )) : <span style={{ color: '#bdbdbd' }}>No rewards yet</span>}
                </div>
              </div>
              <div style={{ width: '100%', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#a78bfa', fontSize: 16 }}>Linked Payment Method</div>
                <div style={{
                  background: '#18181b',
                  borderRadius: 10,
                  padding: '12px 16px',
                  color: '#e0e0e0',
                  fontSize: 15,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #2d3748'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600
                    }}>VISA</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>•••• •••• •••• 4892</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>Personal Card</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#34d399', fontWeight: 600, fontSize: 16 }}>$247.85</div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>Available Balance</div>
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#a78bfa', fontSize: 16 }}>Past Transactions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mcoData.pastTransactions && mcoData.pastTransactions.length > 0 ? mcoData.pastTransactions.map((t: any, i: number) => (
                    <div key={i} style={{
                      background: '#18181b',
                      borderRadius: 10,
                      padding: '8px 14px',
                      color: '#e0e0e0',
                      fontSize: 15,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <div style={{ fontWeight: 600, color: '#fbbf24' }}>{t.service}</div>
                      <div style={{ fontSize: 13, color: '#a78bfa' }}>{t.date}</div>
                      <div>{t.description} <span style={{ color: '#34d399', fontWeight: 600 }}>${t.amount}</span></div>
                    </div>
                  )) : <span style={{ color: '#bdbdbd' }}>No transactions yet</span>}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#aaa', background: '#232323', borderRadius: 16, padding: 24, marginTop: 16, fontSize: 16, maxWidth: 420, textAlign: 'center' }}>
              You are not a loyalty member yet.<br />Join from the <Link to="/loyalty-card" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Loyalty Card</Link> page!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;