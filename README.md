# Service Marketplace Web App

A **decentralized service marketplace** built with React/TypeScript that leverages blockchain technology, specifically MetaMask's Delegation Toolkit (DTK) for Account Abstraction and on-chain reputation systems.

## **Core Architecture**
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js server with blockchain integration
- **Blockchain**: Ethereum Sepolia testnet with MetaMask DTK
- **Storage**: LocalStorage for demo data, designed for on-chain storage in production

## **Main Features**

### **1. Service Booking & Payment System**
- **7 Service Categories**: Cleaning, Tax Services, Athletic Training, Catering, Design, Mobile Garage, Tutoring
- **Smart Contract Integration**: Each service booking creates an on-chain service contract
- **Account Abstraction**: Uses MetaMask DTK for gasless transactions and delegation
- **Payment Methods**:
  - USDC payments (1 USDC per service)
  - ETH payments (0.00005 ETH per service)
  - Delegation-based payments for enhanced security

### **2. On-Chain Reputation System**
- **Credibility Score**: 0-100 scale based on service completion and ratings
- **Reputation History**: Tracks score changes with event descriptions
- **Provider Ratings**: Service providers also have reputation scores
- **Verification Levels**: KYC-style verification system

### **3. Loyalty & Rewards Program**
- **Points System**: Earn points for completed services and reviews
- **Membership Tiers**: Bronze, Silver, Gold, Platinum with increasing benefits
- **Discounts**: Automatic discounts based on membership level (5-20%)
- **Behavioral Rewards**: Streak bonuses, quality reviewer rewards, milestone achievements

### **4. Premium Services (Reputation-Gated)**
- **Access Control**: Premium services require minimum reputation scores
- **Exclusive Features**: Higher-tier services only available to verified customers
- **Reputation Requirements**: Different services require different credibility scores (85-95+)

### **5. Account Abstraction Features**
- **Smart Account Deployment**: Automatic deployment of user smart accounts
- **Delegation Framework**: Secure delegation for service payments
- **Gasless Transactions**: Paymaster integration for sponsored transactions
- **Multi-Signature Support**: Enhanced security through smart account features

### **6. Service Contract Management**
- **Digital Contracts**: Each booking creates a legally-structured service agreement
- **Contract Signing**: Digital signature integration with MetaMask
- **Payment Execution**: Automated payment processing upon service completion
- **Contract History**: Complete audit trail of all signed contracts

### **7. Behavioral Analytics**
- **Service Patterns**: Tracks user service preferences and frequency
- **Risk Assessment**: Calculates user risk scores based on behavior
- **Predictive Features**: Identifies preferred services and usage patterns

### **8. User Experience Features**
- **Zip Code Integration**: Location-based service filtering
- **Real-time Notifications**: Toast notifications for all actions
- **Responsive Design**: Mobile-friendly interface
- **Dark Theme**: Modern UI with dark color scheme

### **9. Blockchain Integration**
- **MetaMask Integration**: Seamless wallet connection
- **Multi-Network Support**: Sepolia testnet with mainnet readiness
- **Transaction Tracking**: Real-time transaction status updates
- **Block Explorer Links**: Direct links to transaction verification

### **10. Demo & Development Features**
- **Mock Data System**: Comprehensive demo data for testing
- **LocalStorage Persistence**: Data persistence across sessions
- **Reset Functions**: Easy data clearing for testing
- **Migration System**: Automatic data structure updates

## **Technical Highlights**

### **Security Features**
- **Delegation Security**: Caveats for spending limits and time restrictions
- **Signature Verification**: EIP-712 compliant signature verification
- **Smart Account Security**: Enhanced security through account abstraction

### **Scalability Features**
- **Modular Architecture**: Separate components for different features
- **Context Management**: React Context for state management
- **Service Worker Ready**: Designed for PWA capabilities

### **Blockchain Innovation**
- **MetaMask DTK Integration**: Cutting-edge Account Abstraction implementation
- **Delegation Framework**: Advanced delegation patterns for service payments
- **On-Chain Reputation**: Decentralized reputation system

## **Getting Started**

### Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Sepolia testnet ETH for gas fees

### Installation
```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Start the backend server
cd server && pnpm dev
```

### Environment Variables
Create a `.env` file in the client directory:
```
VITE_SEPOLIA_RPC_URL=your_sepolia_rpc_url
VITE_BUNDLER_URL=your_bundler_url
```

## **Usage**

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Browse Services**: Explore the 7 different service categories
3. **Book Services**: Select services and complete the booking process
4. **Sign Contracts**: Digitally sign service agreements using MetaMask
5. **Complete Payments**: Execute payments through delegation framework
6. **Build Reputation**: Earn reputation points through service completion
7. **Access Premium Services**: Unlock premium services with high reputation scores

## **Technology Stack**

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Blockchain**: Ethereum, MetaMask DTK, Viem
- **Account Abstraction**: @metamask/delegation-toolkit
- **Payments**: Pimlico Paymaster, USDC, ETH
- **State Management**: React Context, LocalStorage

This web app represents a **next-generation service marketplace** that combines traditional e-commerce functionality with advanced blockchain features, creating a secure, transparent, and user-friendly platform for service transactions with built-in reputation and loyalty systems.