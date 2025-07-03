<img src='./client/public/graphics/sm_banner.png' width='auto'>

# Service Marketplace & Loyalty Program

### Spend crypto, earn points, redeem for everyday rewards.

<b>Service Marketplace</b> is a decentralized service marketplace that connects users with local service providers and allows them to purchase a variety of everyday services. Service Marketplace bridges the gap between traditional and decentralized finance by allowing payment for services via credit/debit card, as well as with the MetaMask Card (which is only available through the Service Marketplace Loyalty program).

The <b>Service Marketplace Loyalty Program</b> is a rewards program that drives on-chain spending by offering a way to accumulate loyalty points that can be redeemed for exclusive perks and rewards. Loyalty Members have tiered membership access that gives them special discounts and rewards.

### Main Features

- **Find & Compare Local Service Providers**: Discover, compare, and purchase services from local service providers.
- **Pay with Circle's USDC**: Purchase services using real USDC and see transaction details on Etherscan.
- **Join the Loyalty Program & Gain Rewards**: Opt-in to the Service Marketplace Loyalty Program and earn points for on-chain spending. Redeem points for rewards and increase on-chain reputation.
- **Use the MetaMask Card & Delegation Toolkit**: Pay for services using a MetaMask Card and set up delegations using the MetaMask Delegation Toolkit (DTK), allowing service providers to pull USDC from the user's smart contract account based on the signed service agreement.

# MetaMask Card Dev Cook-Off

## Alignment with Track #3: Identity & On-Chain Reputation

<b>Service Marketplace</b> uses on-chain identity and behavioral data to power the Service Marketplace Loyalty Program, giving users tiered access and special perks and rewards from service providers.

### Loyalty Score (0-100)

Each user receives a Loyalty Score after connecting their MetaMask wallet to the application and joining the Service Marketplace Loyalty Program. Users can increase their loyalty scores through on-chain spending, writing reviews, and completing services.

### Accumulated Points from USDC Payments

Every point spent using the MetaMask Card and USDC equates to one point earned with the rewards program. These points can be accumulated and redeemed for many different types rewards - complete service payment, discounts, and cash back, to name a few.

### Tiered Membership Access

When a user opts-in to the Service Marketplace Loyalty Program, they are automatically placed in the bronze tier and get access to basic perks. They can move up tiers by accumulating points throughout the year, giving them access to rewards, discounts, and special perks offered by service providers, as well as access to premium service providers.

**Note on Tier Discounts:** This loyalty ladder with discount percentages is a work in progress and subject to change.

| Tier      | Points Range       | Points to Next Tier | Discount     |
|-----------|--------------------|---------------------|--------------|
| Bronze    | 0 - 499            | 500 to Silver       | 5% off       |
| Silver    | 500 - 999          | 500 to Gold         | 10% off      |
| Gold      | 1000 - 1999        | 1000 to Platinum    | 15% off      |
| Platinum  | 2000+              | —                   | 20% off      |

### Special On-Chain Rewards

On-chain transactions allows users to do a lot of fun things and get rewarded for them:

- <b>Reviews:</b> A user can only write a review if they have a transaction to the service provider. If they had a great experience or bad experience, they can leave a review since they have an on-chain transaction.
- <b>Referrals:</b> A user can refer a friend to use a service provider, and if this friend purchases from the service provider, they can get a special reward. This is easily trackable via blockchain technology.
- <b>Special Rewards:</b>
  - Earn a special reward for writing a review ($5 off coupon for example).
  - Earn a special reward for writing a review AND referring a friend who purchases a service (20% off for example).
  - Earn a special reward from a service provider for choosing them to be the first purchase on the platform (one-time opportunity).
  - Earn a special reward for being a repeat customer x number of times (3, 5, 10 etc).
  - Earn a special reward for spending a certain $ amount for one transaction (spend $100, get $10 off).
  - Get a special shout out or mention for a service provider after they reach a certain number of reviews (10, 25, 50 etc).

The list goes on and on - there are endless creative opportunities to reward users for purchasing services.

All data remains saved locally (either in local storage or a Masca Snap in the user's EOA), enabling personalized perks without exposing unnecessary information.

## Utilization of MetaMask's Delegation Toolkit (DTK)

<img src='./client/public/graphics/mmdtk_overview.png' width='auto'>

<b>MetaMask's Delegation Toolkit (DTK)</b> is paramount for allowing service providers to pull funds from a user's smart contract account upon successful service completion. The scope of what can be pulled by the service provider is determined through caveats (spending limits and time restriction) and agreed upon in the service contract, signed by both the user and service provider.

**Note on Failure to Provide Service**: If the service provider failed to show up for the service appointment and violate the contract, any payment taken out would immediately be refunded back to the user.

### Key Hackathon Goals

- **Check** - Explore a real-world use cases of the MetaMask Card.
- **Check** - Use USDC for stablecoin payments.
- **Check** - README with project details and a short recorded demo video is required.
- **In Progress** - Live hosted demo or working prototype. Will update when live.

## Future Improvements

There are many areas of improvements for this project. Some future improvements include:

### Key Areas of Improvement

- Add functionality for service providers to connect their wallets and list company details and services on the All Services page.
- Build a messaging system that sends a message to both the user and service provider when a service is requested, accepted, when a service agreement is signed, and when a delegation payment is made.
- Add more flexibility when choosing a preferred time when purchasing a service.
- Add functionality to easily transfer other cryptocurrency to USDC using LI.FI.

</details>

# Application Setup & Tech Stack

### Important Links & Documentation

- [MetaMask's Website](https://metamask.io/)
- [MetaMask Delegation Toolkit (DTK) Docs](https://docs.metamask.io/delegation-toolkit/)
- [Circle USDC Contract Addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses)
- [Circle USDC Ethereum Sepolia USDC Faucet](https://faucet.circle.com/)
- [Ethereum Sepolia ETH Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

### Project Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js server with blockchain integration
- **Blockchain**: Ethereum Sepolia testnet with MetaMask's Delegation Toolkit (DTK), Viem
- **Payments**: Pimlico Paymaster, USDC, ETH
- **Storage**: Local Storage (temporary for demo data) and Masca Snaps (for production application).

### Prerequisites

- `Node.js v20+`
- `pnpm v10+`
- [MetaMask's Browser Extension](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)

## Setup

### 1. Clone the Repo

```sh
cd service-marketplace
```

### 2. Create & Populate Environment Variables

```sh
touch client/.env
touch server/.env

# Add necessary environment variables
```

**Required Client Environment Variables**

```
VITE_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=pim_...
VITE_PAYMASTER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=pim_...
VITE_DEBUG=@veramo/*
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/cxed5uOA7ERjrPuukGXVe
VITE_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/cxed5uOA7ERjrPuukGXVe
PIMLICO_API_KEY=pim_...
```

**Required Server Environment Variables**

```
OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/cxed5uOA7ERjrPuukGXVe
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/cxed5uOA7ERjrPuukGXVe
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/cxed5uOA7ERjrPuukGXVe
BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=pim_...
PIMLICO_API_KEY=pim_...
SERVER_PRIVATE_KEY=0x...
DELEGATE_PRIVATE_KEY=0x...
```

### 3. Install Dependencies & Run Build

```sh
pnpm install
pnpm run build
```

### 4. Run Client & Server

```sh
open http:localhost:5173
cd client
pnpm run dev
```

```sh
open http:localhost:3001
cd server
npx tsx src/index.ts
```

## Getting Started

**Note on Application Functionality**: In order to properly use the application locally and deploy their smart contract account (SCA), users must first drip SepoliaETH into their EOA using the **Ethereum Sepolia ETH Faucet** above. Once the SCA is deployed, they must then drip USDC into their SCA using the **Circle USDC Ethereum Sepolia USDC Faucet** above. This order is critical.

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask EOA
2. **Browse Services**: Explore the 7 different service providers on the application
3. **Book Services**: Select services and complete the booking process
4. **Sign Contracts**: Digitally sign service agreements using MetaMask
5. **Complete Payments**: Execute payments through the MetaMask Delegation Toolkit (DTK)
6. **Build Reputation**: Earn reputation points through service and payment completion
7. **Access Premium Services**: Unlock premium services with high reputation scores

## Project EIPs and ERCs Used

- **ERC-20** - USDC Token Transfer
- **EIP-712** - Typed-Structured Data Signing
- **EIP 1271** - Contract-Based Signature Validation
- **EIP/ERC-4337** - Account Abstraction

## Project Structure

```
.
├── client/           # Frontend application
├── server/           # Backend server
└── shared/           # Shared TypeScript code
    ├── src/
    │   ├── agents/  # Veramo agent configuration
    │   └── utils/   # Shared utilities and types
```

## License

MIT