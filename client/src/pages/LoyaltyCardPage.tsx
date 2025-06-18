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
      loyaltyPoints: 300,
      rewards: [
        { id: 1, name: '5% Off Next Service', points: 50 },
        { id: 2, name: 'Free Consultation', points: 100 }
      ],
      pastTransactions: [
        {
          service: serviceList[0]?.name,
          date: '2024-05-01',
          amount: 120,
          description: serviceList[0]?.services[0]?.name
        },
        {
          service: serviceList[1]?.name,
          date: '2024-05-15',
          amount: 150,
          description: serviceList[1]?.services[0]?.name
        }
      ],
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('mcoData', JSON.stringify(mcoObj));
    setJoined(true);
  };

  return (
    <div className="individual-page">
      <div className="content" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>Introducing the Service Marketplace Loyalty Program &  Card</h1>
        <h2>Spend crypto, earn points, redeem for everyday rewards.</h2>

        <button
          style={{
            backgroundColor: '#ED8936',
            color: 'black',
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
          onClick={handleJoinLoyalty}
          disabled={joined}
        >
          {joined ? "You're already a member!" : 'Get the Loyalty Card'}
        </button>

        {joined && <div style={{ color: '#4fd1c5', marginBottom: 16, fontWeight: 500 }}>Welcome to the Loyalty Program!</div>}

        <img src='/mm-card.png' alt='Service Marketplace & Loyalty Card' width={500} style={{ position: 'relative', marginRight: '0px', marginLeft: 'auto', marginBottom: '40px'}}/>

        <div className="loyalty-section">
          <h3>Overview</h3>
          <p>
            <strong>Service Marketplace</strong> is a decentralized marketplace where local service providers can list their services and customers can easily discover, compare, and purchase those services using their credit or debit card. </p>
            <strong>The Loyalty Program</strong> is a free rewards program that gives customers the ability to purchase services using a stablecoin like <strong>USDC</strong> with their Loyalty Card, which is directly tied to their <strong>MetaMask Card</strong>, and earn exclusive rewards and discounts from service providers. The only requirement is that the user has a <strong>MetaMask Wallet</strong>, which they can create <a href="https://metamask.io/" target="_blank">here</a>.
            <br /> <br />By having on-chain transactions, purchases can be verified and tracked, allowing for both customers and businesses to benefit by earning rewards and continuous business.
        </div>

        <div className="loyalty-section">
          <h3>Main Features</h3>
          <ul>
            <li>Find and compare local services</li>
            <li>Purchase services using USDC</li>
            <li>Earn and redeem rewards through the <strong>Service Marketplace Loyalty Program</strong>, which is tied to a user's <strong>MetaMask Card</strong></li>
          </ul>
        </div>

        <div className="loyalty-section">
          <h3>The Loyalty Program</h3>
          <p>Users participate in a tiered loyalty system that reflects their overall engagement and activity in the marketplace.</p>

          <h4>Loyalty Tiers</h4>
          <div className="tiers-grid">
            <div className="tier-card">
              <h5>Bronze — Default for new users</h5>
              <ul>
                <li>Base token earning rate</li>
                <li>Basic cashback</li>
              </ul>
            </div>

            <div className="tier-card">
              <h5>Silver — Moderate spending and review-writing</h5>
              <ul>
                <li>Higher token rate</li>
                <li>Early access to deals</li>
              </ul>
            </div>

            <div className="tier-card">
              <h5>Gold — High spending, frequent referrals, and reviews</h5>
              <ul>
                <li>Better rewards</li>
                <li>Exclusive provider promotions</li>
              </ul>
            </div>

            <div className="tier-card">
              <h5>Platinum — Top-tier, heavy usage and referrals</h5>
              <ul>
                <li>Access to premier rewards and experiences</li>
              </ul>
            </div>
          </div>

          <h4>Gaining Tiers</h4>
          <ul>
            <li>Spend with service providers</li>
            <li>Write verified reviews (only available after at least one purchase)</li>
            <li>Refer new customers who complete transactions</li>
          </ul>
        </div>

        <div className="loyalty-section">
          <h3>Tokens</h3>
          <p>
            Tokens are the primary reward currency of the Service Marketplace Loyalty Program and are tied <strong>1-to-1 with USDC</strong>.
            Tokens are stored in a separate wallet linked to the user's <strong>MetaMask wallet</strong>.
          </p>

          <h4>Earning Tokens</h4>
          <div className="token-section">
            <h5>Using Services</h5>
            <ul>
              <li>Token rewards may vary by provider</li>
              <li>Bonus tokens for repeat business</li>
            </ul>

            <h5>Writing Reviews</h5>
            <ul>
              <li>Only verified after at least one purchase</li>
              <li>Bonus tokens for detailed or highly-rated reviews</li>
            </ul>

            <h5>Referring New Customers</h5>
            <ul>
              <li>Tokens rewarded when referrals complete service purchases</li>
              <li>Optional provider-side bonuses for customer acquisition</li>
            </ul>
          </div>

          <h4>Spending Tokens</h4>
          <div className="token-section">
            <ul>
              <li><strong>Cash Back</strong> — Redeem tokens as USDC credit or direct wallet deposit</li>
              <li><strong>Interest Earning</strong> — Stake tokens and earn <strong>4.79% APY</strong>, compounded monthly</li>
              <li><strong>Marketplace Discounts</strong> — Apply tokens for a percentage off future purchases</li>
              <li><strong>Premier Rewards</strong> — Redeem for exclusive experiences:
                <ul>
                  <li>Concert tickets</li>
                  <li>Airline credits</li>
                  <li>Wellness retreats</li>
                  <li>Luxury gift cards</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div className="loyalty-section">
          <h3>Conclusion</h3>
          <p>
            An innovative loyalty program that rewards users for everyday USDC spending via the MetaMask Card—leveraging <strong>on-chain identity and reputation</strong> to personalize and enhance rewards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCardPage;