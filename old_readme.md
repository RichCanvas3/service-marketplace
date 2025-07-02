<img src='./client/public/favicon.svg' width='50'>
<br>
<br>

# Service Marketplace & Loyalty Program

### Note: Some Service Marketplace functionality and features are currently mocked up for demonstration purposes.

## Service Marketplace

<b>Service Marketplace (SM)</b> is a decentralized application that connects users with local service providers and allows them to purchase a variety of everyday services through the SM platform - home cleaning, lawn care, auto repair, financial guidance, and more!

SM bridges the gap between traditional and decentralized finance by allowing payment for services via credit/debit card, as well as the MetaMask Card (but only through the SM loyalty program).

The goal of the SM loyalty program is to drive on-chain spending by offering a way to accumulate points that can be redeemed for exclusive perks and rewards.

## Loyalty Program & Card

To join the loyalty program and pay for services using the MetaMask Card and USDC, users must:

1. First create a MetaMask wallet (which they can do [here](https://metamask.io/))
2. Connect their MetaMask wallet to the application by clicking the "Connect Wallet" button in the top-right of the screen and following the steps.
3. Opt-in to the loyalty program by clicking the "Loyalty Program" button in the top-right of the screen on the home page, and clicking "Get the Loyalty Card."

That's it!

The loyalty program is a free rewards program that offers a variety of perks and benefits to users for making on-chain transactions.

The loyalty card is a card that links the loyalty program with the user's MetaMask Card, and accumulates points based on spending using the MetaMask Card - one point is earned for every dollar spent using the MetaMask Card and USDC.

## Benefits of Blockchain Transactions

Having transactions between two entities in a transparent ledger like a blockchain has many benefits, especially in a marketplace environment.

Perhaps the biggest benefit is immutable and verifiable transactions - transactions that cannot be changed, which reduces fraud, tampering, and corruption, making transaction histories auditable and trustworthy.

Some questions that can be answered via a transparent ledger like a blockchain include:

### For Individuals:

- Which company did I purchase my very first service from?
- How many times did I pay a particular business?
- How many different businesses did I purchase from over a given timeframe?
- What was the average transaction size I paid to a particular business? Highest? Lowest?
- How much have I paid a business total to-date?

### For Service Providers:

- Who was my very first customer?
- How many times did a specific customer purchase my services?
- How many transactions do I have over a given timeframe (week/month/year)?
- What was my total revenue over a given timeframe?
- Who is my highest paying customer?

## Service Marketplace On-Chain Benefits

Purchasing services using the MetaMask Card and opting-in for an on-chain experience offers a variety of perks that benefits the user, including:

### 1. Point Accumulation

Every point spent using the MetaMask Card and USDC equates to one point earned with the rewards program. These points can be accumulated and redeemed for many different types rewards - complete service payment, discounts, and cash back, to name a few.

### 2. Tiered Access & Rewards

When a user opts-in to the SM loyalty rewards program, they are automatically placed in the bronze tier and get access to basic perks. They can move up tiers by accumulating points throughout the year, giving them access to rewards, discounts, and special perks offered by service providers, as well as access to premium service providers. These points reset annually.

Note: Redeeming points for rewards does NOT affect the total points accrued throughout the year. Users should be rewarded for spending USDC and redeeming their points - that should not affect their loyalty tier.

- Tiered access (total points accrued annually)
  - Bronze: 0 - 499 points
  - Silver: 500 - 999 points
  - Gold: 1000 - 2499 points
  - Platinum: 2500+ points

- Tiered access (perks)
  - Bronze: 2% off all services
  - Silver: 4% off all services
  - Gold: 6% off all services, access to premium rewards
  - Platinum: 8% off all services, access to premium rewards

### 3. Unique On-Chain Rewards

Having on-chain transactions allows users to do a lot of fun things.

- <b>Reviews:</b> A user can only write a review if they have a transaction to the service provider. If they had a great experience or bad experience, they can leave a review since they have an on-chain transaction.
- <b>Referrals:</b> A user can refer a friend to use a service provider, and if this friend purchases from the service provider, they can get a special reward. This is easily trackable via blockchain technology.
- <b>Special Rewards:</b>
  - Earn a special reward for writing a review ($5 off coupon for example).
  - Earn a special reward for writing a review AND referring a friend who purchases a service (20% off for example).
  - Earn a special reward from a service provider for choosing them to be the first purchase on the platform (one-time opportunity).
  - Earn a special reward for being a repeat customer x number of times (3, 5, 10 etc).
  - Earn a special reward for spending a certain $ amount for one transaction (spend $100, get $10 off).
  - Get a special shout out or mention for a service provider after they reach a certain number of reviews (10, 25, 50 etc).

The list goes on and on - there are endless creative opportunities to reward users for purchasing services!

## Identity, Reputation, & Loyalty Score

To be written soon.

## Future Improvements

There are many future improvements that can be made to the Service Marketplace application. Some improvements include:

### Foundational Improvements

- Add functionality for service providers to connect their wallets and list company details and services on the services page.
- Enable smart contracts to automatically pull out currency from a user's account based on the verifiable contract signed by both parties.
- Build Messages system that sends a message to both the user and service provider when a service is requested and accepted.
- Add more flexibility when choosing a preferred time when purchasing a service.
- Add functionality to easily transfer other cryptocurrency to USDC using LI.FI.

## MetaMask Delegation Toolkit (DTK) Implementation

For recurring services purchased through Service Marketplace (house cleaning or lawn care for example), the MetaMask DTK would be utilized to allow recurring payments to be taken out of the user's wallet based on the signed contract between the two parties.

If the service provider failed to show up for the service appointment and violate the contract, any payment taken out would immediately be refunded back to the user.

Specific permissions, spending limits, and time-based access would be implemented using the MetaMask DTK.

## Submission Requirements

- [x] Must explore real-world use case of the MetaMask Card
- [x] Must use USDC as the stablecoin of choice
- [] Must have a live hosted demo or working prototype
- [] Must have a README with project details
- [] Must have a short recorded demo video

# Setup

## Prerequisites

- `Node.js v20+`
- `pnpm v10+`

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

## Features

- Support for `did:aa` (Account Abstraction) DID method
- EIP-1271 signature verification for smart contracts
- Verifiable Credentials and Presentations using EIP-712 typed data
- Integration with Veramo framework
- TypeScript/ESM support

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