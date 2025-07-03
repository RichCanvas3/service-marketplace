import React, { useState, useEffect } from 'react';
import '../custom-styles.css';
import serviceList from '../components/data/service-list.json';

const LoyaltyCardPage: React.FC = () => {
  const [joined, setJoined] = useState(false);

  // Check membership status on component mount
  useEffect(() => {
    const checkMembershipStatus = () => {
      // First check localStorage
      const mcoData = localStorage.getItem('mcoData');
      if (mcoData) {
        const mcoObj = JSON.parse(mcoData);
        if (mcoObj.loyaltyMember) {
          setJoined(true);
          return;
        }
      }

      // If not found, remain not joined
    };

    checkMembershipStatus();
  }, []);

  const handleJoinLoyalty = () => {
    let mco = localStorage.getItem('mcoData');
    let account = localStorage.getItem('walletAddress');
    let mcoObj = mco ? JSON.parse(mco) : {};
    if (mcoObj.loyaltyMember) {
      setJoined(true);
      return;
    }
    // Populate with default loyalty info
    mcoObj = {
      ...mcoObj,
      userId: account || mcoObj.userId || '',
      preferredName: mcoObj.preferredName || '',
      loyaltyMember: true,
      membershipLevel: 'Bronze',
      loyaltyPoints: 0,
      rewards: [],
      pastTransactions: [],
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('mcoData', JSON.stringify(mcoObj));
    setJoined(true);
  };

  return (
    <div className="individual-page">
      <div className="content" style={{ width: '100%', padding: '40px 20px' }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          background: 'linear-gradient(135deg, rgba(157, 140, 255, 0.1) 0%, rgba(79, 209, 197, 0.1) 100%)',
          borderRadius: '24px',
          padding: '60px 40px',
          border: '1px solid rgba(157, 140, 255, 0.2)'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            margin: '0 0 20px 0',
            background: 'linear-gradient(135deg, #9d8cff 0%, #4fd1c5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2'
          }}>
            Service Marketplace Loyalty Program
          </h1>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            color: 'var(--text-color)',
            margin: '0 0 40px 0',
            opacity: '0.9'
          }}>
            Spend crypto, earn points, redeem for everyday rewards.
          </h2>

          <button
            style={{
              background: joined
                ? 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)'
                : 'linear-gradient(135deg, #ED8936 0%, #dd7324 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '16px',
              fontWeight: '600',
              cursor: joined ? 'default' : 'pointer',
              boxShadow: joined
                ? '0 8px 32px rgba(79, 209, 197, 0.3)'
                : '0 8px 32px rgba(237, 137, 54, 0.3)',
              transition: 'all 0.3s ease',
              fontSize: '18px',
              transform: joined ? 'none' : 'translateY(0)',
              minWidth: '200px'
            }}
            onClick={handleJoinLoyalty}
            disabled={joined}
            onMouseEnter={(e) => {
              if (!joined) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(237, 137, 54, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!joined) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(237, 137, 54, 0.3)';
              }
            }}
          >
            {joined ? "✓ You're a member!" : 'Get the Loyalty Card'}
          </button>

          {joined && (
            <div style={{
              color: '#4fd1c5',
              marginTop: '20px',
              fontWeight: '500',
              fontSize: '18px',
              padding: '12px 24px',
              background: 'rgba(79, 209, 197, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(79, 209, 197, 0.3)'
            }}>
              🎉 Welcome to the Loyalty Program!
            </div>
          )}
        </div>

        {/* Card Image Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '60px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(157, 140, 255, 0.05) 0%, rgba(79, 209, 197, 0.05) 100%)',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid rgba(157, 140, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src='/graphics/mm_card.png'
              alt='Service Marketplace Loyalty Card'
              style={{
                maxWidth: '500px',
                width: '100%',
                height: 'auto',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>
        </div>

        {/* Overview Section */}
        <div className="loyalty-section" style={{
          background: 'rgba(51, 51, 51, 0.6)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '40px',
          border: '1px solid rgba(157, 140, 255, 0.1)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontSize: '2rem',
            marginBottom: '20px',
            color: 'var(--accent-color)',
            fontWeight: '600'
          }}>
            Overview
          </h3>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-color)' }}>
            <p style={{ marginBottom: '20px' }}>
              <strong style={{ color: 'var(--accent-color)' }}>Service Marketplace</strong> is a decentralized marketplace where local service providers offer everyday services like cleaning, tax preparation, training, catering, design, auto repair, and tutoring.
            </p>
            <p style={{ marginBottom: '20px' }}>
              <strong style={{ color: 'var(--accent-color-secondary)' }}>The Loyalty Program</strong> is a comprehensive rewards system that combines <strong>on-chain reputation</strong>, <strong>loyalty points</strong>, and <strong>premium service access</strong>. Users earn credibility scores through service completion and reviews, unlocking exclusive benefits and discounts.
            </p>
            <p>
              With <strong>MetaMask Delegation Toolkit (DTK)</strong> integration, users enjoy secure, gasless transactions while building their on-chain reputation and earning rewards for every service interaction.
            </p>
          </div>
        </div>

        {/* Main Features */}
        <div className="loyalty-section" style={{
          background: 'rgba(51, 51, 51, 0.6)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '40px',
          border: '1px solid rgba(79, 209, 197, 0.1)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontSize: '2rem',
            marginBottom: '20px',
            color: 'var(--accent-color-secondary)',
            fontWeight: '600'
          }}>
            Main Features
          </h3>
          <ul style={{
            fontSize: '1.1rem',
            lineHeight: '1.7',
            listStyle: 'none',
            padding: '0'
          }}>
            <li style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(157, 140, 255, 0.1)',
              position: 'relative',
              paddingLeft: '30px'
            }}>
              Browse 7 service categories with detailed provider information
            </li>
            <li style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(157, 140, 255, 0.1)',
              position: 'relative',
              paddingLeft: '30px'
            }}>
              Pay with USDC (1 USDC per service) using secure delegation
            </li>
            <li style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(157, 140, 255, 0.1)',
              position: 'relative',
              paddingLeft: '30px'
            }}>
              Build on-chain reputation through service reviews and completion
            </li>
            <li style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(157, 140, 255, 0.1)',
              position: 'relative',
              paddingLeft: '30px'
            }}>
              Earn loyalty points and unlock premium services with high reputation
            </li>
            <li style={{
              padding: '12px 0',
              position: 'relative',
              paddingLeft: '30px'
            }}>
              Access exclusive discounts based on membership tier (5-20% off)
            </li>
          </ul>
        </div>

        {/* Loyalty Program Section */}
        <div className="loyalty-section" style={{
          background: 'rgba(51, 51, 51, 0.6)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '40px',
          border: '1px solid rgba(157, 140, 255, 0.1)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontSize: '2rem',
            marginBottom: '20px',
            color: 'var(--accent-color)',
            fontWeight: '600'
          }}>
            The Loyalty Program
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '30px' }}>
            Users participate in a tiered loyalty system that rewards service completion, reviews, and reputation building with exclusive benefits and premium service access.
          </p>

          <h4 style={{
            fontSize: '1.5rem',
            marginBottom: '25px',
            color: 'var(--accent-color-secondary)',
            fontWeight: '600'
          }}>
            Loyalty Tiers
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              { title: 'Bronze', subtitle: 'Default for new users', features: ['5% discount on all services', 'Basic loyalty points earning', 'Access to standard services'], color: '#CD7F32' },
              { title: 'Silver', subtitle: 'Earned through service completion', features: ['10% discount on all services', 'Enhanced loyalty points', 'Access to premium services (85+ reputation)'], color: '#C0C0C0' },
              { title: 'Gold', subtitle: 'High reputation and frequent usage', features: ['15% discount on all services', 'Premium loyalty rewards', 'Access to exclusive services (90+ reputation)'], color: '#FFD700' },
              { title: 'Platinum', subtitle: 'Top-tier reputation and loyalty', features: ['20% discount on all services', 'Exclusive rewards and perks', 'Access to all premium services (95+ reputation)'], color: '#E5E4E2' }
            ].map((tier, index) => (
              <div key={index} style={{
                background: `linear-gradient(135deg, rgba(${tier.color === '#CD7F32' ? '205, 127, 50' : tier.color === '#C0C0C0' ? '192, 192, 192' : tier.color === '#FFD700' ? '255, 215, 0' : '229, 228, 226'}, 0.1) 0%, rgba(51, 51, 51, 0.8) 100%)`,
                border: `1px solid ${tier.color}40`,
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 30px ${tier.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <h5 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: tier.color
                }}>
                  {tier.title}
                </h5>
                <p style={{
                  fontSize: '0.9rem',
                  margin: '0 0 16px 0',
                  opacity: '0.8'
                }}>
                  {tier.subtitle}
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0'
                }}>
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      fontSize: '0.9rem',
                      padding: '4px 0',
                      position: 'relative',
                      paddingLeft: '20px'
                    }}>
                      <span style={{ position: 'absolute', left: '0', color: tier.color }}>•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h4 style={{
            fontSize: '1.5rem',
            marginBottom: '20px',
            color: 'var(--accent-color-secondary)',
            fontWeight: '600'
          }}>
            Gaining Tiers
          </h4>
          <ul style={{
            fontSize: '1.1rem',
            lineHeight: '1.7',
            listStyle: 'none',
            padding: '0'
          }}>
            {[
              'Complete service transactions (earn loyalty points)',
              'Write reviews for completed services (boost reputation score)',
              'Build on-chain reputation through consistent service usage',
              'Earn behavioral rewards for streaks and milestones'
            ].map((item, index) => (
              <li key={index} style={{
                padding: '12px 0',
                borderBottom: index < 2 ? '1px solid rgba(157, 140, 255, 0.1)' : 'none',
                position: 'relative',
                paddingLeft: '30px'
              }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Loyalty Points & Reputation Section */}
        <div className="loyalty-section" style={{
          background: 'rgba(51, 51, 51, 0.6)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '40px',
          border: '1px solid rgba(79, 209, 197, 0.1)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontSize: '2rem',
            marginBottom: '20px',
            color: 'var(--accent-color-secondary)',
            fontWeight: '600'
          }}>
            Loyalty Points & Reputation
          </h3>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.7',
            marginBottom: '30px',
            padding: '20px',
            background: 'rgba(79, 209, 197, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(79, 209, 197, 0.2)'
          }}>
            <strong style={{ color: 'var(--accent-color-secondary)' }}>Loyalty Points</strong> are earned through service completion and can be redeemed for discounts. <strong style={{ color: 'var(--accent-color)' }}>Reputation Scores</strong> (0-100) are built through reviews and service quality, unlocking premium services and exclusive benefits.
          </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {/* Earning Points & Reputation */}
            <div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '20px',
                color: 'var(--accent-color)',
                fontWeight: '600'
              }}>
                Earning Points & Reputation
              </h4>

              {[
                { title: 'Service Completion', items: ['Earn loyalty points for each completed service', 'Points vary based on service value and quality'] },
                { title: 'Writing Reviews', items: ['Boost reputation score with detailed reviews', 'Higher ratings provide bigger reputation gains'] },
                { title: 'Behavioral Rewards', items: ['Streak bonuses for consecutive services', 'Milestone rewards for service milestones'] }
              ].map((section, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  background: 'rgba(157, 140, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(157, 140, 255, 0.1)'
                }}>
                  <h5 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {section.title}
                  </h5>
                  <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} style={{
                        fontSize: '0.95rem',
                        padding: '6px 0',
                        position: 'relative',
                        paddingLeft: '20px',
                        lineHeight: '1.5'
                      }}>
                        <span style={{ position: 'absolute', left: '0', color: 'var(--accent-color)' }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Using Points & Reputation */}
            <div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '20px',
                color: 'var(--accent-color)',
                fontWeight: '600'
              }}>
                Using Points & Reputation
              </h4>

              <div style={{
                padding: '20px',
                background: 'rgba(79, 209, 197, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(79, 209, 197, 0.1)'
              }}>
                <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                  {[
                    { title: 'Service Discounts', desc: 'Automatic discounts based on membership tier (5-20%)' },
                    { title: 'Premium Services', desc: 'Access exclusive services requiring high reputation scores' },
                    { title: 'Reputation Benefits', desc: 'Unlock premium features and exclusive provider access' },
                    { title: 'Behavioral Rewards', desc: 'Earn bonus points and exclusive perks' }
                  ].map((item, index) => (
                    <li key={index} style={{
                      marginBottom: '20px',
                      padding: '16px',
                      background: 'rgba(51, 51, 51, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <strong style={{ color: 'var(--accent-color-secondary)', fontSize: '1.1rem' }}>{item.title}</strong>
                      </div>
                      <p style={{ margin: '0 0 8px 0px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {item.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="loyalty-section" style={{
          background: 'linear-gradient(135deg, rgba(157, 140, 255, 0.1) 0%, rgba(79, 209, 197, 0.1) 100%)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(157, 140, 255, 0.2)',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontSize: '2rem',
            marginBottom: '20px',
            color: 'var(--accent-color)',
            fontWeight: '600'
          }}>
            Conclusion
          </h3>
          <p style={{
            fontSize: '1.2rem',
            lineHeight: '1.7',
            margin: '0',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            A comprehensive loyalty program that combines <strong style={{ color: 'var(--accent-color-secondary)' }}>on-chain reputation</strong>, <strong style={{ color: 'var(--accent-color)' }}>loyalty points</strong>, and <strong style={{ color: 'var(--accent-color-secondary)' }}>premium service access</strong>—rewarding users for service completion, quality reviews, and consistent engagement while unlocking exclusive benefits through MetaMask DTK integration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCardPage;