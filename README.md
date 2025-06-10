# Amazon Marketplace App

### Account Abstraction DID (did:aa). Verifiable Credentials, Verifiable Presentation - leveraging EIP-1271.

A decentralized identity and verifiable credentials provider that supports EIP-1271 for smart contract-based signature verification.

Account Abstraction DID resolver that produces DID Document
Account Abstraction DID relationships/delegations published via on-chain DID attestations and Metamask Delegation

## Prerequisites

- `Node.js v20+`
- `pnpm v10+`

## Setup

### 1. Clone the Repo

```sh
cd amazon-marketplace-app
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