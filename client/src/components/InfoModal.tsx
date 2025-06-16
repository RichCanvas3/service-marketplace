import React from 'react';
import '../custom-styles.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content info-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About MetaMask</h2>

          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p> MetaMask is a cryptocurrency wallet that allows you to make secure payments using Ethereum and other cryptocurrencies. </p>

          <p> Benefits of using MetaMask: </p>

          <ul>
            <li>Secure and decentralized payments</li>
            <li>No need to share credit card information</li>
            <li>Instant transaction confirmation</li>
            <li>Lower transaction fees</li>
          </ul>

          <p> To use MetaMask, you'll need to: </p>

          <ol>
            <li>Install the MetaMask browser extension</li>
            <li>Create a wallet or import an existing one</li>
            <li>Add funds to your wallet</li>
          </ol>

          <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="metamask-link">
            Learn more about MetaMask
          </a>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;