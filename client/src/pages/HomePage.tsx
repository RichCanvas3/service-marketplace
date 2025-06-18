import React from 'react';
import { useNotification } from '../context/NotificationContext';

const HomePage: React.FC = () => {
  const { showNotification } = useNotification();

  const testNotification = () => {
    showNotification('This is a test notification!', 'success');
  };

  return (
    <div className="home-page">
      <h1>Welcome to Service Marketplace</h1>
      <p>Find and book local services in your area.</p>
      <div className="featured-services">
        <h2>Featured Services</h2>
        <div className="service-grid">
          <div className="service-card">
            <h3>Cleaning Services</h3>
            <p>Professional house cleaning and maintenance</p>
            <a href="/cleaning" className="service-link">Learn More</a>
          </div>
          <div className="service-card">
            <h3>Catering Services</h3>
            <p>Delicious food for any occasion</p>
            <a href="/catering" className="service-link">Learn More</a>
          </div>
          <div className="service-card">
            <h3>Tutoring Services</h3>
            <p>Expert academic support and guidance</p>
            <a href="/tutoring" className="service-link">Learn More</a>
          </div>
          <div className="service-card">
            <h3>Design Services</h3>
            <p>Creative design solutions for your needs</p>
            <a href="/design" className="service-link">Learn More</a>
          </div>
        </div>
      </div>
      <button onClick={testNotification}>Test Notification</button>
    </div>
  );
};

export default HomePage;