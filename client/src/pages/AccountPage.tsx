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
  const [ethBalance, setEthBalance] = useState<string>('0.0000');

  const getEthBalance = async () => {
    if (window.ethereum && account) {
      try {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account, 'latest']
        });
        // Convert from wei to ETH
        const ethValue = parseInt(balance, 16) / Math.pow(10, 18);
        setEthBalance(ethValue.toFixed(4));
      } catch (error) {
        console.error('Error getting balance:', error);
        setEthBalance('Error');
      }
    }
  };

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
    getEthBalance();

    // Listen for network changes and account changes
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
        // Refresh balance when network changes
        getEthBalance();
      });

      window.ethereum.on('accountsChanged', () => {
        // Refresh balance when account changes
        getEthBalance();
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
        window.ethereum.removeListener('accountsChanged', () => {});
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

  const handleResetLoyalty = () => {
    if (window.confirm('Reset loyalty points to 0 and clear all rewards/transactions? This cannot be undone.')) {
      const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
      mcoData.loyaltyPoints = 0;
      mcoData.loyaltyMember = false;
      mcoData.membershipLevel = 'Bronze';
      mcoData.rewards = [];
      mcoData.pastTransactions = [];
      localStorage.setItem('mcoData', JSON.stringify(mcoData));
      showNotification('🔄 Loyalty data reset! You now have 0 points.', 'info');
      // Force a page refresh to update the UI
      window.location.reload();
    }
  };

  const truncateAddress = (address: string) => {
    return address ? `${address.slice(0, 5)}...` : '';
  };



  // Function to get color based on KYC credibility score
  const getKycCredibilityColor = (score: number) => {
    if (score >= 90) return { primary: '#22c55e', secondary: '#16a34a', name: 'Excellent' }; // Green
    if (score >= 80) return { primary: '#eab308', secondary: '#ca8a04', name: 'Very Good' }; // Yellow
    if (score >= 70) return { primary: '#f97316', secondary: '#ea580c', name: 'Good' }; // Orange
    return { primary: '#ef4444', secondary: '#dc2626', name: 'Fair' }; // Red
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
        <button
          className="connect-wallet-button"
          style={{
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            gap: mcoData?.kycCredibilityScore ? '8px' : '0px',
            padding: mcoData?.kycCredibilityScore ? '12px 16px' : '16px 32px'
          }}
        >
          <span>{accountButtonLabel}</span>
          {mcoData?.kycCredibilityScore && (
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
      <div className="content" style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <h1>Account</h1>
        <h2 style={{ marginBottom: 32 }}>Your Wallet & Settings</h2>

        <button
            onClick={handleDisconnect}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease',
              width: 'fit-content',
              margin: '24px 0',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              letterSpacing: 0.5
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
            }}
          >
            Disconnect Wallet
          </button>

        {/* Account Settings Section */}
        <div style={{
          background: 'linear-gradient(135deg, #18181b, #27272a)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          border: '1px solid #3f3f46',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>⚙️</div>
            <h3 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#f7fafc',
              letterSpacing: 0.5
            }}>Account Settings</h3>
          </div>
          <div style={{
            background: '#0f0f23',
            borderRadius: 12,
            padding: '20px',
            border: '1px solid #2d3748'
          }}>
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                color: '#e2e8f0',
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                Preferred Name (optional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                <input
                  type="text"
                  value={preferredName}
                  onChange={handleNameChange}
                  placeholder="Enter your preferred name"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #4a5568',
                    background: '#2d3748',
                    color: '#f7fafc',
                    fontSize: '16px',
                    minWidth: 200,
                    flex: 1,
                    maxWidth: '350px',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#a78bfa';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(167, 139, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#4a5568';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={handleSaveName}
                  style={{
                    background: 'linear-gradient(135deg, #ed8936, #dd6b20)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(237, 137, 54, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(237, 137, 54, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(237, 137, 54, 0.3)';
                  }}
                >
                  Save
                </button>
              </div>
              {saveMsg && (
                <div style={{
                  color: '#4fd1c5',
                  fontSize: 14,
                  fontWeight: 500,
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  ✅ {saveMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Information Section */}
        <div style={{
          background: 'linear-gradient(135deg, #18181b, #27272a)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 32,
          border: '1px solid #3f3f46',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #627eea, #8b9aeb)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>🦊</div>
            <h3 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#f7fafc',
              letterSpacing: 0.5
            }}>MetaMask Wallet Information</h3>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {/* Wallet Address Card */}
            <div style={{
              background: '#0f0f23',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid #2d3748',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4
              }}>
                <span style={{
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: 14
                }}>Wallet Address</span>
              </div>
              <div style={{
                background: '#1a1a2e',
                borderRadius: 8,
                padding: '12px 16px',
                border: '1px solid #4a5568'
              }}>
                <span style={{
                  color: '#4fd1c5',
                  fontFamily: 'Monaco, Consolas, monospace',
                  fontSize: 15,
                  wordBreak: 'break-all',
                  letterSpacing: 0.5
                }}>{account}</span>
              </div>
            </div>

            {/* Network Card */}
            <div style={{
              background: '#0f0f23',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid #2d3748',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: 14
                }}>Network</span>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: 8,
                padding: '6px 12px',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}>{network}</div>
            </div>
          </div>
        </div>

        {/* KYC Credibility Section */}
        {mcoData?.kycCredibilityScore && (
          <div style={{
            background: 'linear-gradient(135deg, #18181b, #27272a)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 32,
            border: '1px solid #3f3f46',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                color: '#f7fafc',
                letterSpacing: 0.5
              }}>Your KYC Credibility Score</h3>
            </div>

            {/* Main Score Display */}
            <div style={{
              background: '#0f0f23',
              borderRadius: 16,
              padding: '24px',
              border: '1px solid #2d3748',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${getKycCredibilityColor(mcoData.kycCredibilityScore).primary}, ${getKycCredibilityColor(mcoData.kycCredibilityScore).secondary})`,
                    borderRadius: 12,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: `0 4px 12px rgba(${getKycCredibilityColor(mcoData.kycCredibilityScore).primary === '#22c55e' ? '34, 197, 94' : getKycCredibilityColor(mcoData.kycCredibilityScore).primary === '#eab308' ? '234, 179, 8' : getKycCredibilityColor(mcoData.kycCredibilityScore).primary === '#f97316' ? '249, 115, 22' : '239, 68, 68'}, 0.3)`
                  }}>
                    <span style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: 'white'
                    }}>{mcoData.kycCredibilityScore}</span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'white',
                      opacity: 0.8
                    }}>/100</span>
                  </div>
                  <div>
                    <div style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: getKycCredibilityColor(mcoData.kycCredibilityScore).primary,
                      marginBottom: 2
                    }}>
                      {getKycCredibilityColor(mcoData.kycCredibilityScore).name}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: '#9ca3af'
                    }}>
                      Identity Verification Status
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 14,
                  color: '#e2e8f0',
                  lineHeight: 1.5
                }}>
                  Your KYC score reflects your identity verification level and transaction history. A higher score increases trust with service providers.
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                minWidth: 120
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `conic-gradient(${getKycCredibilityColor(mcoData.kycCredibilityScore).primary} ${mcoData.kycCredibilityScore * 3.6}deg, #2d3748 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: '#0f0f23',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: getKycCredibilityColor(mcoData.kycCredibilityScore).primary
                  }}>
                    {mcoData.kycCredibilityScore}%
                  </div>
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  textAlign: 'center'
                }}>
                  Credibility Level
                </div>
              </div>
            </div>

            {/* Verification Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}>
              {/* Identity Verification */}
              <div style={{
                background: '#0f0f23',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #2d3748'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{
                    color: '#e2e8f0',
                    fontWeight: 600,
                    fontSize: 14
                  }}>Identity Verification</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4
                }}>
                  <div style={{
                    background: getKycCredibilityColor(mcoData.kycCredibilityScore).primary,
                    color: 'white',
                    borderRadius: 8,
                    padding: '4px 8px',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {mcoData.kycVerificationLevel || 'Verified'}
                  </div>
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#9ca3af'
                }}>
                  Government ID and address verified
                </div>
              </div>

              {/* Transaction History */}
              <div style={{
                background: '#0f0f23',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #2d3748'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{
                    color: '#e2e8f0',
                    fontWeight: 600,
                    fontSize: 14
                  }}>Transaction History</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4
                }}>
                  <div style={{
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: 8,
                    padding: '4px 8px',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    Clean Record
                  </div>
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#9ca3af'
                }}>
                  No disputes or fraudulent activity
                </div>
              </div>

              {/* Account Security */}
              <div style={{
                background: '#0f0f23',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #2d3748'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{
                    color: '#e2e8f0',
                    fontWeight: 600,
                    fontSize: 14
                  }}>Account Security</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4
                }}>
                  <div style={{
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: 8,
                    padding: '4px 8px',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    Enhanced
                  </div>
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#9ca3af'
                }}>
                  2FA enabled, secure wallet connection
                </div>
              </div>

              {/* Last Updated */}
              <div style={{
                background: '#0f0f23',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #2d3748'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{
                    color: '#e2e8f0',
                    fontWeight: 600,
                    fontSize: 14
                  }}>Last Updated</span>
                </div>
                <div style={{
                  color: '#4fd1c5',
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 4
                }}>
                  {new Date(mcoData.kycLastUpdated || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#9ca3af'
                }}>
                  Verification status current
                </div>
              </div>
            </div>

            {/* Improve Score Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
              borderRadius: 12,
              padding: '20px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              marginTop: 20
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12
              }}>
                <span style={{
                  color: '#a78bfa',
                  fontWeight: 600,
                  fontSize: 16
                }}>
                  How to Improve Your Score
                </span>
              </div>
              <div style={{
                fontSize: 14,
                color: '#e2e8f0',
                lineHeight: 1.5,
                marginBottom: 12
              }}>
                Increase your KYC credibility score by completing more verifications and maintaining a positive transaction history.
              </div>
              <div style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                <button style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
                >
                  Complete Phone Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Card Section */}
        <div style={{
          background: 'linear-gradient(135deg, #18181b, #27272a)',
          borderRadius: 20,
          padding: '20px 24px',
          marginBottom: 32,
          border: '1px solid #3f3f46',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>🎫</div>
            <h3 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#f7fafc',
              letterSpacing: 0.5
            }}>My Loyalty Card</h3>

            {/* Reset Loyalty Button */}
            <button
              onClick={handleResetLoyalty}
              style={{
                background: 'transparent',
                border: '1px solid #f59e0b',
                color: '#f59e0b',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                marginLeft: 'auto'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f59e0b';
                (e.target as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#f59e0b';
              }}
            >
              🎯 Reset Loyalty
            </button>
          </div>
          {mcoData && mcoData.loyaltyMember ? (
            <div style={{
              background: '#0f0f23',
              borderRadius: 16,
              padding: '16px 20px',
              border: '1px solid #2d3748',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(167, 139, 250, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 600 }}>Membership</span>
                <span style={{
                  background: '#a78bfa',
                  color: '#232323',
                  borderRadius: 12,
                  padding: '3px 12px',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 0.5
                }}>{mcoData.membershipLevel}</span>
              </div>
              {mcoData.membershipLevel === 'Bronze' && (
                <div style={{
                  background: 'linear-gradient(135deg, #18181b, #2d3748)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 8,
                  border: '1px solid #c0c0c0',
                  boxShadow: '0 2px 8px rgba(192, 192, 192, 0.1)'
                }}>
                  <div style={{
                    fontSize: 14,
                    color: '#e2e8f0',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}>
                    <span>Spend <strong style={{ color: '#c0c0c0' }}>120 points</strong> by <strong style={{ color: '#c0c0c0' }}>March 15, 2025</strong> and become <strong style={{ color: '#c0c0c0' }}>Silver Tier</strong></span>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>★</div>
                  <div style={{ fontSize: 72, fontWeight: 600 }}>{mcoData.loyaltyPoints}</div>
                  <div style={{ fontSize: 12, color: '#bdbdbd' }}>Current Points</div>
                </div>
              </div>

              {/* Points Statistics */}
              <div style={{
                width: '100%',
                marginBottom: 12,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #18181b, #2d3748)',
                  borderRadius: 8,
                  padding: '12px',
                  flex: 1,
                  minWidth: 120,
                  border: '1px solid #34d399',
                  boxShadow: '0 4px 12px rgba(52, 211, 153, 0.15)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#34d399',
                    marginBottom: 2
                  }}>{parseInt(mcoData.loyaltyPoints)}</div>
                  <div style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    fontWeight: 500
                  }}>Total Points Accumulated</div>
                  <div style={{
                    fontSize: 10,
                    color: '#6b7280',
                    marginTop: 1
                  }}>All-time earned points</div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #18181b, #2d3748)',
                  borderRadius: 8,
                  padding: '12px',
                  flex: 1,
                  minWidth: 120,
                  border: '1px solid #f59e0b',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#f59e0b',
                    marginBottom: 2
                  }}>0</div>
                  <div style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    fontWeight: 500
                  }}>Total Points Redeemed</div>
                  <div style={{
                    fontSize: 10,
                    color: '#6b7280',
                    marginTop: 1
                  }}>Points used for rewards</div>
                </div>
              </div>

              {/* Points Redemption Section */}

              <div style={{ width: '100%', marginBottom: 12 }}>
                <div style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  color: '#a78bfa',
                  fontSize: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>Rewards & Benefits</span>
                </div>

                <div style={{ fontWeight: 600, marginBottom: 12, color: '#e2e8f0', fontSize: 14 }}>Redeem Your Points</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Free Service */}
                  <div style={{
                    background: '#18181b',
                    borderRadius: 10,
                    padding: '14px 16px',
                    color: '#e0e0e0',
                    fontSize: 15,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #ff5733',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                  onClick={() => alert('Free basic cleaning service voucher redeemed! Valid for 6 months.')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        background: '#ff5733',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16
                      }}>🏋️‍♂️</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f7fafc' }}>Free Personal Training Session (1 hour)</div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>Complete one-on-one personalized training</div>
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #ff5733, #ff5733)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      color: '#1a1a1a',
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      500 pts
                    </div>
                  </div>

                  {/* Gift Card */}
                  <div style={{
                    background: '#18181b',
                    borderRadius: 10,
                    padding: '14px 16px',
                    color: '#e0e0e0',
                    fontSize: 15,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #0096FF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                  onClick={() => alert('$25 gift card redeemed! Code will be sent to your email.')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        background: '#0096FF',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16
                      }}>💲</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f7fafc' }}>Redeem for USDC (3%)</div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>Redeem points for USDC</div>
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #0096FF, #0096FF)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      11.4 USDC
                    </div>
                  </div>

                </div>
              </div>

              {/* Rewards & Bonuses Section */}
              <div style={{ width: '100%', marginBottom: 32 }}>

                {/* Earned Rewards */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#e2e8f0', fontSize: 14 }}>Earned Rewards</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mcoData.rewards && mcoData.rewards.length > 0 ? mcoData.rewards.map((r: any, index: number) => {
                    // Define color schemes for different reward types
                    const colorSchemes = [
                      { bg: '#18181b', border: '#fbbf24', accent: '#fbbf24', icon: '🏆' },
                      { bg: '#18181b', border: '#34d399', accent: '#34d399', icon: '⭐' },
                      { bg: '#18181b', border: '#a78bfa', accent: '#a78bfa', icon: '🎯' },
                      { bg: '#18181b', border: '#f472b6', accent: '#f472b6', icon: '💎' },
                      { bg: '#18181b', border: '#06b6d4', accent: '#06b6d4', icon: '🚀' }
                    ];
                    const scheme = colorSchemes[index % colorSchemes.length];

                    return (
                      <div key={r.id} style={{
                        background: scheme.bg,
                        borderRadius: 10,
                        padding: '14px 16px',
                        color: '#e0e0e0',
                        fontSize: 15,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: `1px solid ${scheme.border}`,
                        boxShadow: `0 4px 12px rgba(${scheme.accent === '#fbbf24' ? '251, 191, 36' : scheme.accent === '#34d399' ? '52, 211, 153' : scheme.accent === '#a78bfa' ? '167, 139, 250' : scheme.accent === '#f472b6' ? '244, 114, 182' : '6, 182, 212'}, 0.15)`,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 16px rgba(${scheme.accent === '#fbbf24' ? '251, 191, 36' : scheme.accent === '#34d399' ? '52, 211, 153' : scheme.accent === '#a78bfa' ? '167, 139, 250' : scheme.accent === '#f472b6' ? '244, 114, 182' : '6, 182, 212'}, 0.25)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(${scheme.accent === '#fbbf24' ? '251, 191, 36' : scheme.accent === '#34d399' ? '52, 211, 153' : scheme.accent === '#a78bfa' ? '167, 139, 250' : scheme.accent === '#f472b6' ? '244, 114, 182' : '6, 182, 212'}, 0.15)`;
                      }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            background: scheme.accent,
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16
                          }}>{scheme.icon}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#f7fafc', marginBottom: 2 }}>{r.name}</div>
                            <div style={{ fontSize: 13, color: '#9ca3af' }}>{r.summary}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            background: `linear-gradient(135deg, ${scheme.accent}, ${scheme.accent}dd)`,
                            borderRadius: 8,
                            padding: '4px 10px',
                            color: scheme.accent === '#fbbf24' ? '#1a1a1a' : '#1a1a1a',
                            fontSize: 13,
                            fontWeight: 600,
                            boxShadow: `0 2px 4px rgba(${scheme.accent === '#fbbf24' ? '251, 191, 36' : scheme.accent === '#34d399' ? '52, 211, 153' : scheme.accent === '#a78bfa' ? '167, 139, 250' : scheme.accent === '#f472b6' ? '244, 114, 182' : '6, 182, 212'}, 0.3)`
                          }}>
                            Redeem
                          </div>
                          <div style={{
                            color: scheme.accent,
                            fontSize: 18,
                            fontWeight: 600
                          }}>→</div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{
                      background: '#18181b',
                      borderRadius: 10,
                      padding: '20px',
                      color: '#9ca3af',
                      fontSize: 15,
                      textAlign: 'center',
                      border: '1px dashed #374151',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <div style={{ fontSize: 24, opacity: 0.6 }}>🏆</div>
                      <div>No rewards earned yet</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Complete services to earn your first rewards!</div>
                    </div>
                  )}
                </div>
                </div>

                {/* Referral Bonuses */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#e2e8f0', fontSize: 14 }}>Referral Bonuses</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Completed Referral */}
                  <div style={{
                    background: '#18181b',
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: '#e0e0e0',
                    fontSize: 15,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #34d399'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        background: '#34d399',
                        borderRadius: '50%',
                        width: 8,
                        height: 8
                      }}></div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f7fafc' }}>Referral Complete</div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>John Smith purchased a service from Daisy's Home Cleaning via your referral</div>
                      </div>
                    </div>
                    <div style={{ color: '#34d399', fontWeight: 600, fontSize: 16 }}>10 points</div>
                  </div>

                  {/* Pending Referral */}
                  <div style={{
                    background: '#18181b',
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: '#e0e0e0',
                    fontSize: 15,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #fbbf24'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        background: '#fbbf24',
                        borderRadius: '50%',
                        width: 8,
                        height: 8
                      }}></div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f7fafc' }}>Referral Pending</div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>Sarah Johnson - awaiting first purchase from Rob's Tax Services</div>
                      </div>
                    </div>
                    <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: 16 }}>15 points</div>
                  </div>

                </div>
              </div>

              {/* Past Transactions & Activities Section */}

              <div style={{ width: '100%', marginBottom: 32 }}>

                {/* Exclusive Member Coupons */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#e2e8f0', fontSize: 14 }}>Exclusive Member Coupons</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Cleaning Service Coupon */}
                  <div style={{
                    background: '#18181b',
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: '#e0e0e0',
                    fontSize: 15,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #0ea5e9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        background: '#0ea5e9',
                        borderRadius: '50%',
                        width: 8,
                        height: 8
                      }}></div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f7fafc' }}>Return Customer Special - Daisy's Home Cleaning</div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>25% off your next deep cleaning service</div>
                        <div style={{ fontSize: 12, color: '#0ea5e9', marginTop: 2 }}>Valid until: Dec 31, 2024 • Code: LOYAL25</div>
                      </div>
                    </div>
                    <button
                      style={{
                        background: 'transparent',
                        color: '#0ea5e9',
                        border: '1px solid #0ea5e9',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#0ea5e9';
                        (e.target as HTMLButtonElement).style.color = '#232323';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLButtonElement).style.color = '#0ea5e9';
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText('LOYAL25');
                        alert('Coupon code copied to clipboard!');
                      }}
                    >
                      Copy Code
                    </button>
                  </div>

                </div>
                </div>

              <div style={{ width: '100%', margin: '12px 0', background: '#fff2', height: 1, borderRadius: 1 }} />

                {/* Past Transactions & History */}

                <div style={{
                  fontWeight: 600,
                  marginBottom: 16,
                  color: '#a78bfa',
                  fontSize: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>Past Transactions & History</span>
                </div>

                <div style={{ marginBottom: 24 }}>


                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#e2e8f0', fontSize: 14 }}>Past Transactions (3) </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mcoData.pastTransactions && mcoData.pastTransactions.length > 0 ? mcoData.pastTransactions.map((t: any, i: number) => (
                      <div key={i} style={{
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
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          flex: 1
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fbbf24' }}>{t.service}</div>
                          <div style={{ fontSize: 13, color: '#a78bfa' }}>{t.date}</div>
                          <div>{t.description} <span style={{ color: '#34d399', fontWeight: 600 }}>{t.amount} USDC</span></div>
                          <div><span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>Paid with MetaMask Card and USDC</span></div>
                        </div>
                        <div style={{ marginLeft: 16 }}>
                          {i === 0 ? (
                            // First transaction shows "Review Written"
                            <button
                              style={{
                                background: '#4ade80',
                                color: '#000',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'default',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              disabled
                            >
                              ✓ Review Written
                            </button>
                          ) : (
                            // Other transactions show "Write Review"
                            <button
                              style={{
                                background: 'transparent',
                                color: '#a78bfa',
                                border: '1px solid #a78bfa',
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#a78bfa';
                                (e.target as HTMLButtonElement).style.color = '#232323';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                                (e.target as HTMLButtonElement).style.color = '#a78bfa';
                              }}
                              onClick={() => {
                                // Placeholder for review functionality
                                alert(`Write a review for ${t.service}`);
                              }}
                            >
                              Write Review
                            </button>
                          )}
                        </div>
                      </div>
                    )) : <span style={{ color: '#bdbdbd' }}>No transactions yet</span>}
                  </div>
                </div>
                              </div>

              <div style={{ width: '100%', margin: '12px 0', background: '#fff2', height: 1, borderRadius: 1 }} />


                {/* Account Settings */}

              <div style={{ width: '100%' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <div style={{
                    fontWeight: 600,
                    color: '#a78bfa',
                    fontSize: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span>Account Settings</span>
                  </div>
                  <button
                    onClick={getEthBalance}
                    style={{
                      background: 'transparent',
                      border: '1px solid #a78bfa',
                      color: '#a78bfa',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#a78bfa';
                      (e.target as HTMLButtonElement).style.color = '#232323';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                      (e.target as HTMLButtonElement).style.color = '#a78bfa';
                    }}
                  >
                    Refresh ETH
                  </button>
                </div>

                {/* MetaMask Account ID */}
                <div style={{
                  background: '#18181b',
                  borderRadius: 10,
                  padding: '12px 16px',
                  color: '#e0e0e0',
                  fontSize: 15,
                  border: '1px solid #2d3748',
                  marginBottom: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #a78bfa, #9333ea)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600
                    }}>ID</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>MetaMask Account ID</div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: 13,
                        color: '#9ca3af',
                        wordBreak: 'break-all'
                      }}>{mcoData.userId}</div>
                    </div>
                  </div>
                </div>

                {/* VISA Card */}
                <div style={{
                  background: '#18181b',
                  borderRadius: 10,
                  padding: '12px 16px',
                  color: '#e0e0e0',
                  fontSize: 15,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #2d3748',
                  marginBottom: 8
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

                {/* MetaMask Wallet */}
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
                      background: 'linear-gradient(135deg, #627eea, #8b9aeb)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600
                    }}>ETH</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>MetaMask Wallet</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#34d399', fontWeight: 600, fontSize: 16 }}>{ethBalance} ETH</div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>Available Balance</div>
                  </div>
                </div>
              </div>






              </div>
            </div>
          ) : (
            <div style={{
              background: '#0f0f23',
              borderRadius: 16,
              padding: '32px 24px',
              border: '1px solid #2d3748',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: 16,
                opacity: 0.6
              }}>🎫</div>
              <div style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#e2e8f0',
                marginBottom: 8
              }}>You are not a loyalty member yet</div>
              <div style={{
                fontSize: 15,
                marginBottom: 20
              }}>Join our loyalty program to earn points and unlock exclusive rewards!</div>
              <Link to="/loyalty-card" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 16,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(167, 139, 250, 0.3)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                (e.target as HTMLAnchorElement).style.boxShadow = '0 6px 16px rgba(167, 139, 250, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.target as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.3)';
              }}
              >
                🎫 Join Loyalty Program
              </Link>
            </div>
          )}
        </div>

        {/* Signed Service Contracts Section */}
        <SignedContractsSection />

      </div>
    </div>
  );
};

// Component to display signed service contracts
const SignedContractsSection: React.FC = () => {
  const [signedContracts, setSignedContracts] = useState<any[]>([]);
  const { showNotification } = useNotification();

  // Get the appropriate block explorer URL for transaction hash
  const getExplorerUrl = (txHash: string) => {
    // Since we're primarily using Base Sepolia (84532), default to that
    // Users can verify the network from the transaction details
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  const loadContracts = () => {
    const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');

    // Migration: Move old signedContracts to MCO object
    const oldContracts = localStorage.getItem('signedContracts');
    if (oldContracts && !mcoData.signedContracts) {
      console.log('📦 Migrating signedContracts to MCO object...');
      mcoData.signedContracts = JSON.parse(oldContracts);
      localStorage.setItem('mcoData', JSON.stringify(mcoData));
      localStorage.removeItem('signedContracts'); // Clean up old key
      console.log('✅ Migration complete!');
    }

    const contracts = mcoData.signedContracts || [];
    setSignedContracts(contracts);
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleRefresh = () => {
    loadContracts();
    showNotification('Contracts refreshed!', 'info');
  };

  const handleClearAll = () => {
    if (signedContracts.length === 0) return;

    if (window.confirm('Are you sure you want to clear all signed contracts? This cannot be undone.')) {
      const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
      mcoData.signedContracts = [];
      localStorage.setItem('mcoData', JSON.stringify(mcoData));
      setSignedContracts([]);
      showNotification('All contracts cleared!', 'info');
    }
  };

  if (signedContracts.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #18181b, #27272a)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 32,
        border: '1px solid #3f3f46',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18
          }}>📋</div>
          <h3 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#f7fafc',
            letterSpacing: 0.5
          }}>Signed Service Contracts</h3>
        </div>
        <div style={{
          background: '#0f0f23',
          borderRadius: 16,
          padding: '32px 24px',
          border: '1px solid #2d3748',
          textAlign: 'center',
          color: '#9ca3af'
        }}>
          <div style={{
            fontSize: 48,
            marginBottom: 16,
            opacity: 0.6
          }}>📄</div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: 8
          }}>No contracts signed yet</div>
          <div style={{
            fontSize: 15
          }}>Your signed service contracts will appear here once you sign agreements with service providers.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #18181b, #27272a)',
      borderRadius: 20,
      padding: '24px 28px',
      marginBottom: 32,
      border: '1px solid #3f3f46',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18
        }}>📋</div>
        <h3 style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 600,
          color: '#f7fafc',
          letterSpacing: 0.5
        }}>Signed Service Contracts</h3>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: 8,
          padding: '4px 12px',
          color: 'white',
          fontSize: 12,
          fontWeight: 600
        }}>{signedContracts.length} Contract{signedContracts.length !== 1 ? 's' : ''}</div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button
            onClick={handleRefresh}
            style={{
              background: 'transparent',
              border: '1px solid #06b6d4',
              color: '#06b6d4',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#06b6d4';
              (e.target as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.color = '#06b6d4';
            }}
          >
            🔄 Refresh
          </button>
          {signedContracts.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
                (e.target as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#ef4444';
              }}
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {signedContracts.map((contract, index) => (
          <div key={contract.id || index} style={{
            background: '#0f0f23',
            borderRadius: 12,
            padding: '20px',
            border: '1px solid #2d3748',
            position: 'relative'
          }}>
            {/* Contract Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16
            }}>
              <div>
                <h4 style={{
                  margin: '0 0 4px 0',
                  color: '#06b6d4',
                  fontSize: 18,
                  fontWeight: 600
                }}>{contract.serviceName}</h4>
                <div style={{
                  color: '#9ca3af',
                  fontSize: 13,
                  fontFamily: 'monospace'
                }}>Contract #{contract.id?.substring(9) || 'N/A'}</div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 4
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600
                }}>✓ Signed</div>
                <div style={{
                  color: '#9ca3af',
                  fontSize: 12
                }}>{(() => {
                  if (!contract.signedAt) return 'N/A';
                  const date = new Date(contract.signedAt);
                  if (isNaN(date.getTime())) return 'N/A';

                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                })()}</div>
              </div>
            </div>

            {/* Selected Services */}
            {contract.selectedServices && contract.selectedServices.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8
                }}>Selected Services:</div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6
                }}>
                  {contract.selectedServices.map((service: string, serviceIndex: number) => (
                    <div key={serviceIndex} style={{
                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      ✓ {service}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contract Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 16
            }}>
              <div>
                <div style={{
                  color: '#9ca3af',
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 4
                }}>Payment Amount</div>
                <div style={{
                  color: '#10b981',
                  fontSize: 16,
                  fontWeight: 600
                }}>{contract.paymentAmount} {contract.servicePrice?.includes('USDC') ? 'USDC' : 'ETH'}</div>
              </div>
              <div>
                <div style={{
                  color: '#9ca3af',
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 4
                }}>Service Date</div>
                <div style={{
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: 500
                }}>{(() => {
                  if (!contract.serviceDate) return 'TBD';
                  const date = new Date(contract.serviceDate);
                  if (isNaN(date.getTime())) return 'TBD';

                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short'
                  });
                })()}</div>
              </div>
              <div>
                <div style={{
                  color: '#9ca3af',
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 4
                }}>Status</div>
                <div style={{
                  color: '#f59e0b',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>{contract.status || 'signed'}</div>
              </div>
            </div>

            {/* Signature Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 12
            }}>
              {contract.signature && (
                <div style={{
                  background: '#1a1a2e',
                  borderRadius: 8,
                  padding: '12px',
                  border: '1px solid #374151'
                }}>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 4
                  }}>Service Contract Signature</div>
                  <div style={{
                    color: '#4fd1c5',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    wordBreak: 'break-all',
                    lineHeight: 1.4
                  }}>{contract.signature.substring(0, 100)}...</div>
                </div>
              )}
              {contract.delegationData?.signature && (
                <div style={{
                  background: '#1a1a2e',
                  borderRadius: 8,
                  padding: '12px',
                  border: '1px solid #374151'
                }}>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 4
                  }}>Delegation Signature</div>
                  <div style={{
                    color: '#a78bfa',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    wordBreak: 'break-all',
                    lineHeight: 1.4
                  }}>{contract.delegationData.signature.substring(0, 100)}...</div>
                </div>
              )}
              {contract.paymentTx && (
                <div style={{
                  background: '#1a1a2e',
                  borderRadius: 8,
                  padding: '12px',
                  border: '1px solid #374151'
                }}>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    Payment Transaction Hash
                    <span style={{
                      fontSize: 10,
                      color: '#6b7280'
                    }}>🔗 Click to view on explorer</span>
                  </div>
                  <a
                    href={getExplorerUrl(contract.paymentTx)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#fbbf24',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = '#f59e0b';
                      (e.target as HTMLElement).style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = '#fbbf24';
                      (e.target as HTMLElement).style.textDecoration = 'none';
                    }}
                  >
                    {contract.paymentTx}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;