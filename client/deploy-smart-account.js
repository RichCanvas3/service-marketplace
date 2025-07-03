const { ethers } = require('ethers');
const { createPublicClient, createWalletClient, http, custom, parseEther } = require('viem');
const { sepolia } = require('viem/chains');
const { createBundlerClient, createPimlicoClient } = require('permissionless/clients');
const { toMetaMaskSmartAccount, Implementation } = require('@metamask/delegation-framework');

async function deploySmartAccount() {
  console.log('🚀 DEPLOYING METAMASK SMART ACCOUNT');
  console.log('=====================================\n');

  // Your addresses
  const userEOA = '0x470C5eD6dF37D0cA079802393363bA30da25D68C';
  const expectedSmartAccount = '0x327ab00586Be5651630a5827BD5C9122c8B639F8';

  console.log('👤 Your EOA:', userEOA);
  console.log('🤖 Expected Smart Account:', expectedSmartAccount);
  console.log('');

  // Environment setup
  const rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
  const pimlicoApiKey = process.env.PIMLICO_API_KEY || 'pim_12345678910';
  const bundlerUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${pimlicoApiKey}`;

  try {
    // Create clients
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl)
    });

    const bundlerClient = createBundlerClient({
      transport: http(bundlerUrl),
      chain: sepolia
    });

    const pimlicoClient = createPimlicoClient({
      transport: http(bundlerUrl),
      chain: sepolia
    });

    // Check if MetaMask is available (for browser) or use manual signing
    let walletClient;
    let userAccount;

    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('🦊 Using MetaMask for signing...');
      walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      userAccount = {
        address: accounts[0],
        async signMessage({ message }) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signMessage(message);
        },
        async signTypedData({ domain, types, primaryType, message }) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTypedData(domain, types, message);
        },
        async signTransaction(transaction) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTransaction(transaction);
        },
        source: 'custom',
        type: 'local'
      };
    } else {
      console.log('❌ MetaMask not detected. Run this in browser or provide private key.');
      console.log('📝 Instructions:');
      console.log('1. Open browser console on http://localhost:5175');
      console.log('2. Connect MetaMask');
      console.log('3. Run this script in the console');
      return;
    }

    console.log('🔄 Creating smart account instance...');

    // Create the smart account instance (same parameters as before)
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [userEOA, [], [], []], // Using your actual EOA
      deploySalt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      signatory: { account: userAccount },
    });

    console.log('✅ Smart account instance created!');
    console.log('📍 Computed address:', smartAccount.address);
    console.log('🔍 Expected address:', expectedSmartAccount);
    console.log('✅ Address match:', smartAccount.address === expectedSmartAccount ? 'YES' : 'NO');

    if (smartAccount.address !== expectedSmartAccount) {
      console.log('❌ Address mismatch! Check parameters.');
      return;
    }

    // Check if already deployed
    const code = await publicClient.getCode({ address: smartAccount.address });
    if (code && code !== '0x') {
      console.log('✅ Smart account already deployed!');
      console.log('🎉 Contract code exists at:', smartAccount.address);
      return;
    }

    console.log('⚠️  Smart account not deployed yet. Deploying...');

    // Get gas fees
    const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

    // Generate nonce
    const nonce = BigInt(Date.now());

    console.log('📡 Sending UserOperation to deploy smart account...');

    // Send UserOperation that will deploy the smart account
    const userOperationHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls: [
        {
          to: smartAccount.address, // Self-call to trigger deployment
          value: parseEther('0'), // No ETH transfer
          data: '0x' // Empty data
        }
      ],
      nonce,
      ...fee
    });

    console.log('✅ UserOperation submitted!');
    console.log('🔗 UserOperation hash:', userOperationHash);
    console.log('⏳ Waiting for confirmation...');

    // Wait for confirmation
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOperationHash,
    });

    console.log('🎉 SMART ACCOUNT DEPLOYED SUCCESSFULLY!');
    console.log('📍 Contract address:', smartAccount.address);
    console.log('🔗 Transaction hash:', receipt.receipt.transactionHash);
    console.log('⛽ Gas used:', receipt.receipt.gasUsed?.toString());

    // Verify deployment
    const newCode = await publicClient.getCode({ address: smartAccount.address });
    console.log('✅ Deployment verified:', newCode !== '0x' ? 'SUCCESS' : 'FAILED');

    return {
      success: true,
      smartAccountAddress: smartAccount.address,
      transactionHash: receipt.receipt.transactionHash,
      userOperationHash
    };

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.log('🔍 Error details:', error.message);

    if (error.message.includes('AA24')) {
      console.log('💡 AA24 error means signature validation failed');
      console.log('🔧 Try these solutions:');
      console.log('1. Make sure MetaMask is connected to Sepolia');
      console.log('2. Ensure you have enough ETH for gas');
      console.log('3. Check that you\'re using the correct EOA address');
    }

    return { success: false, error: error.message };
  }
}

// Export for use in browser or run directly
if (typeof module !== 'undefined') {
  module.exports = { deploySmartAccount };
} else {
  // Browser environment - attach to window
  window.deploySmartAccount = deploySmartAccount;
}

console.log('📝 Smart Account Deployment Script Loaded');
console.log('🌐 Run deploySmartAccount() to deploy your smart contract');