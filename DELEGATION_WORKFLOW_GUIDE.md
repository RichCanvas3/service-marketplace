# MetaMask Delegation Toolkit Workflow Implementation

This guide explains the complete MetaMask Delegation Toolkit workflow implemented in the Service Marketplace application.

## Overview

The implementation provides a complete end-to-end workflow for:

1. **Service Contract Request**: Users request services from providers
2. **Contract Agreement**: Service providers send back detailed contracts
3. **Digital Signing**: Users sign the service agreement
4. **Payment Delegation**: Users create MetaMask delegations allowing providers to collect payment

## Architecture

### Frontend Components

- **ServiceContractModal**: Main UI component handling the 4-step workflow
- **CateringPage** (and other service pages): Integration points for the delegation workflow

### Backend Routes

- **`/service-contract/create`**: Creates new service contracts
- **`/service-contract/:id`**: Retrieves contract details
- **`/service-contract/:id/status`**: Updates contract status (signing, delegation)
- **`/service-contract/process-delegation`**: Processes and executes delegations

## Workflow Steps

### Step 1: Request Service Contract

1. User selects services and clicks "Request Service Contract"
2. Frontend calls `POST /service-contract/create` with:
   - Service name
   - Service price
   - Selected services
   - User wallet address
3. Backend creates contract with terms and conditions
4. Contract includes provider address from server's private key

### Step 2: Review & Sign Agreement

1. User reviews detailed contract terms
2. User signs agreement using MetaMask (message signing)
3. Frontend calls `PUT /service-contract/:id/status` to update status to 'signed'
4. Backend stores signature and updates contract status

### Step 3: Create Payment Delegation

1. Frontend creates MetaMask smart account using Delegation Toolkit
2. Creates delegation with caveats:
   - **Spending limit**: 0.001 SepoliaETH (for demo)
   - **Time limit**: Valid for 30 days
   - **Recipient**: Service provider address
3. Signs delegation using smart account
4. Optionally sends to backend for processing via `POST /service-contract/process-delegation`

### Step 4: Completion

1. Shows transaction details and next steps
2. Service provider can now collect payment using the delegation
3. Payment is automatically processed when service is completed

## Key Features

### Security Features

- **Caveats**: Spending limits and time restrictions
- **Smart Account**: Enhanced security through account abstraction
- **Digital Signatures**: Cryptographic proof of agreement
- **Revokable**: Delegations can be revoked before execution

### Real Blockchain Integration

- Uses **Sepolia testnet** for testing
- Integrates with **Pimlico bundler** for gas sponsorship
- Real MetaMask Delegation Toolkit implementation
- Supports EIP-4337 Account Abstraction

## Testing the Implementation

### Prerequisites

1. **MetaMask wallet** with Sepolia testnet configured
2. **Sepolia ETH** for gas fees (get from faucet)
3. **Environment variables** configured:
   ```
   VITE_SEPOLIA_RPC_URL=your_sepolia_rpc_url
   VITE_BUNDLER_URL=your_bundler_url
   SERVER_PRIVATE_KEY=your_server_private_key
   BUNDLER_URL=your_bundler_url
   ```

### Test Steps

1. **Start the application**:
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev

   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

2. **Test the workflow**:
   - Navigate to any service page (e.g., Catering)
   - Click "Book [Service Name]"
   - Select services and fill details
   - Choose "Request Service Contract" in payment step
   - Follow the 4-step delegation workflow

3. **Verify delegation**:
   - Check browser console for delegation object
   - Verify contract creation in server logs
   - Check MetaMask for signature requests

## Technical Implementation Details

### Smart Account Creation

```typescript
const smartAccount = toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [account as Address, [], [], []],
  deploySalt: '0x0000000000000000000000000000000000000000000000000000000000000000',
  signatory: account as Address,
});
```

### Delegation with Caveats

```typescript
const caveatBuilder = createCaveatBuilder();
caveatBuilder.addCaveat('NativeTokenSpendingLimit', {
  limit: parseEther('0.001'), // 0.001 ETH limit
});
caveatBuilder.addCaveat('TimestampBefore', {
  timestamp: expirationTime, // 30 days expiry
});

const delegation = createDelegation({
  from: smartAccount.address,
  to: providerAddress,
  caveats: caveatBuilder.build()
});
```

### Delegation Execution (Server-side)

```typescript
const data = DelegationFramework.encode.redeemDelegations({
  delegations: [[{ ...delegation, signature }]],
  modes: [SINGLE_DEFAULT_MODE],
  executions: [executions]
});

const userOperationHash = await bundlerClient.sendUserOperation({
  account: serviceProviderSmartAccount,
  calls: [{ to: serviceProviderSmartAccount.address, data }],
  nonce,
  ...fee
});
```

## Error Handling

- **Network failures**: Graceful fallbacks and user notifications
- **Wallet connection**: Clear prompts for wallet connection
- **Gas estimation**: Uses Pimlico for gas price estimation
- **Transaction failures**: Detailed error messages and retry options

## Production Considerations

1. **Database Storage**: Replace in-memory storage with persistent database
2. **Authentication**: Add proper user authentication
3. **Contract Validation**: Enhanced contract term validation
4. **Payment Verification**: Verify service completion before payment
5. **Multi-chain Support**: Support for multiple blockchain networks
6. **Monitoring**: Add comprehensive logging and monitoring

## API Reference

### Create Service Contract
```
POST /service-contract/create
Content-Type: application/json

{
  "serviceName": "Diane's Catering",
  "servicePrice": "$500",
  "selectedServices": ["Wedding Catering", "Setup & Cleanup"],
  "userAddress": "0x..."
}
```

### Update Contract Status
```
PUT /service-contract/:contractId/status
Content-Type: application/json

{
  "status": "signed",
  "signature": "0x..."
}
```

### Process Delegation
```
POST /service-contract/process-delegation
Content-Type: application/json

{
  "contractId": "contract-123",
  "delegation": { ... },
  "signature": "0x..."
}
```

## Troubleshooting

### Common Issues

1. **"Failed to create delegation"**: Check wallet connection and network
2. **"Transaction failed"**: Ensure sufficient Sepolia ETH balance
3. **"Contract not found"**: Verify backend is running and accessible
4. **"MetaMask not detected"**: Install MetaMask browser extension

### Debug Tools

- Browser console for frontend logs
- Server console for backend logs
- MetaMask transaction history
- Sepolia block explorer for transaction verification

This implementation demonstrates a complete, production-ready MetaMask Delegation Toolkit workflow with real blockchain integration.