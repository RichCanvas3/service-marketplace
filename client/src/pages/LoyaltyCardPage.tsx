import React, { useState } from 'react';
import '../custom-styles.css';
import serviceList from '../components/data/service-list.json';

const LoyaltyCardPage: React.FC = () => {
  const [joined, setJoined] = useState(false);

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
      loyaltyMember: true,
      membershipLevel: 'Bronze',
      loyaltyPoints: 380,
      rewards: [
        { id: 1, name: '5% Off Next House Cleaning', summary: 'Reward for writing a review and referring a friend', points: 100 }
      ],
      pastTransactions: [
        {
          service: serviceList[0]?.name,
          date: '2024-05-15',
          amount: 120,
          description: serviceList[0]?.services[0]?.name
        },
        {
          service: serviceList[1]?.name,
          date: '2024-03-12',
          amount: 150,
          description: serviceList[1]?.services[0]?.name
        },
        {
          service: serviceList[2]?.name,
          date: '2024-01-22',
          amount: 100,
          description: serviceList[2]?.services[1]?.name
        }
      ],
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
              src='/mm-card.png'
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
              <strong style={{ color: 'var(--accent-color)' }}>Service Marketplace</strong> is a decentralized marketplace where local service providers can list their services and customers can easily discover, compare, and purchase those services using their credit or debit card.
            </p>
            <p style={{ marginBottom: '20px' }}>
              <strong style={{ color: 'var(--accent-color-secondary)' }}>The Loyalty Program</strong> is a free rewards program that gives customers the ability to purchase services using a stablecoin like <strong>USDC</strong> with their Loyalty Card, which is directly tied to their <strong>MetaMask Card</strong>, and earn exclusive rewards and discounts from service providers. The only requirement is that the user has a <strong>MetaMask Wallet</strong>, which they can create <a href="https://metamask.io/" target="_blank" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>here</a>.
            </p>
            <p>
              By having on-chain transactions, purchases can be verified and tracked, allowing for both customers and businesses to benefit by earning rewards and continuous business.
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
              <span style={{ position: 'absolute', left: '0', color: 'var(--accent-color)' }}>🔍</span>
              Find and compare local services
            </li>
            <li style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(157, 140, 255, 0.1)',
              position: 'relative',
              paddingLeft: '30px'
            }}>
              <span style={{ position: 'absolute', left: '0', color: 'var(--accent-color)' }}>💰</span>
              Purchase services using USDC
            </li>
            <li style={{
              padding: '12px 0',
              position: 'relative',
              paddingLeft: '30px'
            }}>
              <span style={{ position: 'absolute', left: '0', color: 'var(--accent-color)' }}>🎁</span>
              Earn and redeem rewards through the <strong style={{ color: 'var(--accent-color-secondary)' }}>Service Marketplace Loyalty Program</strong>, which is tied to a user's <strong>MetaMask Card</strong>
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
            Users participate in a tiered loyalty system that reflects their overall engagement and activity in the marketplace.
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
              { title: 'Bronze', subtitle: 'Default for new users', features: ['Base token earning rate', 'Basic cashback'], color: '#CD7F32' },
              { title: 'Silver', subtitle: 'Moderate spending and review-writing', features: ['Higher token rate', 'Early access to deals'], color: '#C0C0C0' },
              { title: 'Gold', subtitle: 'High spending, frequent referrals, and reviews', features: ['Better rewards', 'Exclusive provider promotions'], color: '#FFD700' },
              { title: 'Platinum', subtitle: 'Top-tier, heavy usage and referrals', features: ['Access to premier rewards and experiences'], color: '#E5E4E2' }
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
              'Spend with service providers',
              'Write verified reviews (only available after at least one purchase)',
              'Refer new customers who complete transactions'
            ].map((item, index) => (
              <li key={index} style={{
                padding: '12px 0',
                borderBottom: index < 2 ? '1px solid rgba(157, 140, 255, 0.1)' : 'none',
                position: 'relative',
                paddingLeft: '30px'
              }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--accent-color-secondary)' }}>
                  {index === 0 ? '💳' : index === 1 ? '⭐' : '👥'}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Tokens Section */}
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
            Tokens
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
            Tokens are the primary reward currency of the Service Marketplace Loyalty Program and are tied <strong style={{ color: 'var(--accent-color-secondary)' }}>1-to-1 with USDC</strong>.
            Tokens are stored in a separate wallet linked to the user's <strong>MetaMask wallet</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {/* Earning Tokens */}
            <div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '20px',
                color: 'var(--accent-color)',
                fontWeight: '600'
              }}>
                Earning Tokens
              </h4>

              {[
                { title: 'Using Services', items: ['Token rewards may vary by provider', 'Bonus tokens for repeat business'], icon: '🛠️' },
                { title: 'Writing Reviews', items: ['Only verified after at least one purchase', 'Bonus tokens for detailed or highly-rated reviews'], icon: '📝' },
                { title: 'Referring New Customers', items: ['Tokens rewarded when referrals complete service purchases', 'Optional provider-side bonuses for customer acquisition'], icon: '🤝' }
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
                    <span>{section.icon}</span>
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

            {/* Spending Tokens */}
            <div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '20px',
                color: 'var(--accent-color)',
                fontWeight: '600'
              }}>
                Spending Tokens
              </h4>

              <div style={{
                padding: '20px',
                background: 'rgba(79, 209, 197, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(79, 209, 197, 0.1)'
              }}>
                <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                  {[
                    { title: 'Cash Back', desc: 'Redeem tokens as USDC credit or direct wallet deposit', icon: '💰' },
                    { title: 'Interest Earning', desc: 'Stake tokens and earn 4.79% APY, compounded monthly', icon: '📈' },
                    { title: 'Marketplace Discounts', desc: 'Apply tokens for a percentage off future purchases', icon: '🏷️' },
                    { title: 'Premier Rewards', desc: 'Redeem for exclusive experiences', icon: '🎁', subItems: ['Concert tickets', 'Airline credits', 'Wellness retreats', 'Luxury gift cards'] }
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
                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                        <strong style={{ color: 'var(--accent-color-secondary)', fontSize: '1.1rem' }}>{item.title}</strong>
                      </div>
                      <p style={{ margin: '0 0 8px 44px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {item.desc}
                      </p>
                      {item.subItems && (
                        <ul style={{ listStyle: 'none', padding: '0', margin: '0 0 0 44px' }}>
                          {item.subItems.map((subItem, subIndex) => (
                            <li key={subIndex} style={{
                              fontSize: '0.9rem',
                              padding: '3px 0',
                              position: 'relative',
                              paddingLeft: '16px',
                              opacity: '0.8'
                            }}>
                              <span style={{ position: 'absolute', left: '0', color: 'var(--accent-color-secondary)' }}>-</span>
                              {subItem}
                            </li>
                          ))}
                        </ul>
                      )}
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
            An innovative loyalty program that rewards users for everyday USDC spending via the MetaMask Card—leveraging <strong style={{ color: 'var(--accent-color-secondary)' }}>on-chain identity and reputation</strong> to personalize and enhance rewards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCardPage;