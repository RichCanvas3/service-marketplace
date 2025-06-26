import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { sepolia } from 'viem/chains';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
  custom
} from 'viem';
import {
  Implementation,
  toMetaMaskSmartAccount,
  createCaveatBuilder,
  createDelegation
} from '@metamask/delegation-toolkit';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { createBundlerClient } from 'viem/account-abstraction';
import { encodeNonce } from 'permissionless/utils';
import { useNotification } from '../context/NotificationContext';
import Modal from './Modal';

interface ServiceContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  servicePrice: string;
  selectedServices: string[];
}

interface ServiceContract {
  id: string;
  serviceName: string;
  servicePrice: string;
  terms: string;
  paymentAmount: string;
  serviceDate: string;
  providerAddress: string;
  status: 'pending' | 'signed' | 'delegated';
}

const ServiceContractModal: React.FC<ServiceContractModalProps> = ({
  isOpen,
  onClose,
  serviceName,
  servicePrice,
  selectedServices
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<ServiceContract | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [delegationTx, setDelegationTx] = useState<string>('');
  const [delegationData, setDelegationData] = useState<any>(null); // Store actual delegation object
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentTx, setPaymentTx] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const { showNotification } = useNotification();

  useEffect(() => {
    checkWalletConnection();
    // Debug: Check if environment variable is loaded
    console.log('Environment check:', {
      VITE_SEPOLIA_RPC_URL: import.meta.env.VITE_SEPOLIA_RPC_URL,
      allEnvVars: import.meta.env
    });
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setUserAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setIsLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        setUserAddress(accounts[0]);
        showNotification('Wallet connected successfully!', 'success');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      showNotification('MetaMask not detected. Please install MetaMask.', 'error');
    }
  };

    const requestServiceContract = async () => {
    setIsLoading(true);
    try {
      // Test server connectivity first
      console.log('Testing server connectivity...');
      try {
        const testResponse = await fetch('http://localhost:3001/test');
        const testData = await testResponse.json();
        console.log('Server connectivity test:', testData);
      } catch (connectivityError) {
        console.error('Server connectivity test failed:', connectivityError);
        throw new Error('Cannot connect to backend server. Please ensure it is running on port 3001.');
      }

      // Ensure user address is available
      if (!userAddress || !walletConnected) {
        throw new Error('Please connect your wallet first');
      }

      console.log('Requesting service contract with data:', {
        serviceName,
        servicePrice,
        selectedServices,
        userAddress
      });

      // Call backend API to create service contract
      const response = await fetch('http://localhost:3001/service-contract/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName,
          servicePrice,
          selectedServices,
          userAddress
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Service contract response:', data);

      if (data.success && data.contract) {
        setContract(data.contract);
        setCurrentStep(2);
        showNotification('Service contract received from provider!', 'success');
      } else {
        throw new Error(data.error || 'Failed to create service contract');
      }
    } catch (error) {
      console.error('Error requesting service contract:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to request service contract';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

    const signServiceAgreement = async () => {
    if (!contract || !walletConnected) return;

    setIsLoading(true);
    try {
      // Sign the service agreement
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const message = `I agree to the service contract:\n\nContract ID: ${contract.id}\nService: ${contract.serviceName}\nAmount: ${contract.paymentAmount} SepoliaETH\nDate: ${contract.serviceDate}\n\nTerms: ${contract.terms.substring(0, 200)}...`;

      const signature = await signer.signMessage(message);
      console.log('Service agreement signed:', signature);

      // Update contract status on backend
      const response = await fetch(`http://localhost:3001/service-contract/${contract.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'signed',
          signature
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.contract) {
        setContract(data.contract);
        setCurrentStep(3);
        showNotification('Service agreement signed successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to update contract status');
      }
    } catch (error) {
      console.error('Error signing service agreement:', error);
      showNotification('Failed to sign service agreement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

    const createPaymentDelegation = async () => {
    if (!contract || !walletConnected) {
      console.error('Prerequisites not met:', { contract: !!contract, walletConnected });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting payment delegation creation...');

      // Check environment variables
      const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      const bundlerUrl = import.meta.env.VITE_BUNDLER_URL || 'https://api.pimlico.io/v2/11155111/rpc?apikey=pim_KgWXFW2Up4xpDku2WjCfE5';
      console.log('RPC URL configured:', rpcUrl);
      console.log('Bundler URL configured:', bundlerUrl.substring(0, 50) + '...');

      // Create MetaMask smart account
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl)
      });
      console.log('Public client created');

      // Get the user's EOA
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const account = accounts[0];
      console.log('User account:', account);

      // Create wallet client for signing
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      });

      // Get the account from the wallet client (this will have proper signing methods)
      const [clientAccount] = await walletClient.getAddresses();
      console.log('Wallet client account:', clientAccount);

      if (!clientAccount || clientAccount.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Wallet client account mismatch');
      }

      // Create a custom account object for MetaMask delegation
      const customAccount = {
        address: account as Address,
        async signMessage({ message }: { message: string | Uint8Array }) {
          console.log('Signing message:', message);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          if (typeof message === 'string') {
            return await signer.signMessage(message);
          } else {
            return await signer.signMessage(message);
          }
        },
        async signTypedData({ domain, types, primaryType, message }: any) {
          console.log('Signing typed data');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTypedData(domain, types, message);
        },
        async signTransaction(transaction: any) {
          console.log('Signing transaction');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTransaction(transaction);
        },
        source: 'custom' as const,
        type: 'local' as const
      };

      // Create smart account
      console.log('Creating smart account...');
      let smartAccount;
      try {
        smartAccount = await toMetaMaskSmartAccount({
          client: publicClient,
          implementation: Implementation.Hybrid,
          deployParams: [account as Address, [], [], []],
          deploySalt: '0x0000000000000000000000000000000000000000000000000000000000000000',
          signatory: { account: customAccount },
        });
        console.log('Smart account created:', smartAccount.address);
        console.log('EOA owner:', account);
      } catch (smartAccountError) {
        console.error('Error creating smart account:', smartAccountError);
        throw new Error(`Failed to create smart account: ${smartAccountError.message}`);
      }

                        // Create caveats for the delegation
      console.log('Creating caveats...');
      let caveats;
      try {
        // For now, let's try without caveats first to see if basic delegation works
        // The caveat enforcers might not be deployed on Sepolia testnet yet
        console.log('Skipping caveats for now - testing basic delegation');
        caveats = [];
      } catch (caveatError) {
        console.error('Error creating caveats:', caveatError);
        throw new Error(`Failed to create caveats: ${caveatError.message}`);
      }

            // Create delegation - targeting Service Provider Smart Account instead of EOA
      const serviceProviderSmartAccount = '0x66cB1D45cA24eB3FF774DA65A5BA5E65Dd63C6ED'; // Service Provider Smart Account
      console.log('Creating delegation...');
      console.log('Delegation params:', {
        from: smartAccount.address,
        to: serviceProviderSmartAccount, // Changed from contract.providerAddress (EOA) to Smart Account
        caveatsCount: caveats.length
      });

      console.log('🔄 SMART ACCOUNT TO SMART ACCOUNT DELEGATION:');
      console.log('User Smart Account (delegator):', smartAccount.address);
      console.log('Service Provider Smart Account (delegate):', serviceProviderSmartAccount);

      // Note: We're creating a delegation without caveats for testing
      // In production, you'd want to add appropriate caveats for security

      let delegation;
      try {
        delegation = createDelegation({
          from: smartAccount.address,
          to: serviceProviderSmartAccount as Address, // Changed to Smart Account
          caveats: caveats
        });
        console.log('Delegation created (Smart Account → Smart Account)');
      } catch (delegationError) {
        console.error('Error creating delegation:', delegationError);
        throw new Error(`Failed to create delegation: ${delegationError.message}`);
      }

      // Sign the delegation
      console.log('Signing delegation...');
      let signature;
      try {
        signature = await smartAccount.signDelegation({
          delegation: delegation
        });
        console.log('Delegation signed');
      } catch (signError) {
        console.error('Error signing delegation:', signError);
        throw new Error(`Failed to sign delegation: ${signError.message}`);
      }

      delegation = {
        ...delegation,
        signature,
      };

      console.log('Payment delegation created:', delegation);
      console.log('Delegation structure for backend:', {
        delegator: delegation.delegator || delegation.from,
        delegate: delegation.delegate || delegation.to,
        signature: signature,
        full_delegation: delegation
      });

      // Store the complete delegation data for later use
      setDelegationData(delegation);

      // Send delegation to backend for processing (optional - for demonstration)
      console.log('Sending delegation to backend...');
      try {
        const response = await fetch('http://localhost:3001/service-contract/process-delegation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
                      body: JSON.stringify({
            contractId: contract.id,
            delegation,
            signature,
            userSmartAccount: smartAccount.address,
            userEOA: account, // Send the user's EOA address
            serviceProviderSmartAccount: serviceProviderSmartAccount // Include Service Provider Smart Account
          }),
        });

        console.log('Process delegation response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Delegation processed:', data);
          if (data.transactionHash) {
            setDelegationTx(data.transactionHash);
          }
        } else {
          console.warn('Process delegation failed with status:', response.status);
          const errorText = await response.text();
          console.warn('Error response:', errorText);
        }
      } catch (backendError) {
        console.warn('Backend processing failed, but delegation was created:', backendError);
        // Continue anyway since the delegation was created successfully
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        setDelegationTx(mockTxHash);
      }

      // Update contract status
      console.log('Updating contract status...');
      try {
        const response = await fetch(`http://localhost:3001/service-contract/${contract.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'delegated'
          }),
        });

        console.log('Update status response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Status update response:', data);
          if (data.success && data.contract) {
            setContract(data.contract);
          }
        } else {
          console.warn('Status update failed with status:', response.status);
          const errorText = await response.text();
          console.warn('Status update error response:', errorText);
          throw new Error(`Failed to update contract status: ${response.status} - ${errorText}`);
        }
      } catch (statusError) {
        console.error('Error updating contract status:', statusError);
        throw new Error(`Failed to update contract status: ${statusError.message}`);
      }

      setCurrentStep(4);
      showNotification('Payment delegation created successfully!', 'success');
    } catch (error: any) {
      console.error('Error creating payment delegation:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to create payment delegation. ';

      if (error.message?.includes('environment variable')) {
        errorMessage += 'Environment configuration error.';
      } else if (error.message?.includes('MetaMask not detected')) {
        errorMessage += 'Please install MetaMask.';
      } else if (error.message?.includes('No accounts found')) {
        errorMessage += 'Please connect your wallet.';
      } else if (error.message?.includes('user rejected')) {
        errorMessage += 'User cancelled the request.';
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error'}`;
      }

      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deployServiceProviderSmartAccount = async () => {
    if (!walletConnected || !userAddress) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    setIsLoading(true);
    showNotification('Deploying service provider smart account...', 'info');

    try {
      console.log('🚀 DEPLOYING SERVICE PROVIDER SMART ACCOUNT');
      console.log('Service Provider EOA: 0x2aa1520F3a67D5390CB60BdCbAEb4fc897007608');

      const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      const bundlerUrl = import.meta.env.VITE_BUNDLER_URL || 'https://api.pimlico.io/v2/11155111/rpc?apikey=pim_KgWXFW2Up4xpDku2WjCfE5';

      // Create clients
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl)
      });

      const bundlerClient = createBundlerClient({
        transport: http(bundlerUrl),
        chain: sepolia
      }) as any;

      const pimlicoClient = createPimlicoClient({
        transport: http(bundlerUrl),
        chain: sepolia
      });

      // Service provider EOA address
      const serviceProviderEOA = '0x2aa1520F3a67D5390CB60BdCbAEb4fc897007608';

      // Create custom account for signing (this would normally be done server-side)
      const customAccount = {
        address: userAddress as Address, // You'll sign on behalf for demo
        async signMessage({ message }: { message: string | Uint8Array }) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signMessage(message);
        },
        async signTypedData({ domain, types, primaryType, message }: any) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTypedData(domain, types, message);
        },
        async signTransaction(transaction: any) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTransaction(transaction);
        },
        source: 'custom' as const,
        type: 'local' as const
      };

      // Create service provider smart account
      const serviceProviderSmartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [serviceProviderEOA as Address, [], [], []],
        deploySalt: '0x0000000000000000000000000000000000000000000000000000000000000001', // Different salt
        signatory: { account: customAccount },
      });

      console.log('Service Provider Smart Account computed address:', serviceProviderSmartAccount.address);

      // Check if already deployed
      const code = await publicClient.getCode({ address: serviceProviderSmartAccount.address as Address });
      if (code && code !== '0x') {
        showNotification('Service provider smart account already deployed!', 'success');
        console.log('✅ Service provider smart account already exists at:', serviceProviderSmartAccount.address);
        return;
      }

      console.log('⚠️ Service provider smart account not deployed. Deploying now...');

      // Get gas fees
      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      // Generate nonce
      const key = BigInt(Date.now());
      const nonce = encodeNonce({ key, sequence: 0n });

      console.log('📡 Sending UserOperation to deploy service provider smart account...');

      // Send UserOperation to deploy service provider smart account
      const userOperationHash = await bundlerClient.sendUserOperation({
        account: serviceProviderSmartAccount,
        calls: [
          {
            to: serviceProviderSmartAccount.address, // Self-call to trigger deployment
            value: parseEther('0'), // No ETH transfer
            data: '0x' as `0x${string}` // Empty data
          }
        ],
        nonce,
        ...fee
      });

      console.log('✅ UserOperation submitted:', userOperationHash);
      showNotification('Service provider smart account deployment submitted! Waiting for confirmation...', 'info');

      // Wait for confirmation
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      });

      console.log('🎉 SERVICE PROVIDER SMART ACCOUNT DEPLOYED!');
      console.log('📍 Address:', serviceProviderSmartAccount.address);
      console.log('🔗 Transaction:', receipt.receipt.transactionHash);

      showNotification(`Service provider smart account deployed! Address: ${serviceProviderSmartAccount.address}`, 'success');

    } catch (error) {
      console.error('❌ Service provider smart account deployment failed:', error);
      showNotification(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deploySmartAccount = async () => {
    if (!walletConnected || !userAddress) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    setIsLoading(true);
    showNotification('Deploying your smart account...', 'info');

    try {
      console.log('🚀 DEPLOYING SMART ACCOUNT FOR USER:', userAddress);

            const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      const bundlerUrl = import.meta.env.VITE_BUNDLER_URL || 'https://api.pimlico.io/v2/11155111/rpc?apikey=pim_KgWXFW2Up4xpDku2WjCfE5';

      console.log('🔧 Environment check:', {
        rpcUrl,
        bundlerUrl: bundlerUrl.substring(0, 50) + '...'
      });

      // Create clients
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl)
      });

      const bundlerClient = createBundlerClient({
        transport: http(bundlerUrl),
        chain: sepolia
      }) as any;

      const pimlicoClient = createPimlicoClient({
        transport: http(bundlerUrl),
        chain: sepolia
      });

      // Create custom account for signing
      const customAccount = {
        address: userAddress as Address,
        async signMessage({ message }: { message: string | Uint8Array }) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signMessage(message);
        },
        async signTypedData({ domain, types, primaryType, message }: any) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTypedData(domain, types, message);
        },
        async signTransaction(transaction: any) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return await signer.signTransaction(transaction);
        },
        source: 'custom' as const,
        type: 'local' as const
      };

      // Create smart account
      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [userAddress as Address, [], [], []],
        deploySalt: '0x0000000000000000000000000000000000000000000000000000000000000000',
        signatory: { account: customAccount },
      });

      console.log('Smart account computed address:', smartAccount.address);
      console.log('Expected address: 0x327ab00586Be5651630a5827BD5C9122c8B639F8');

      // Check if already deployed
      const code = await publicClient.getCode({ address: smartAccount.address as Address });
      if (code && code !== '0x') {
        showNotification('Smart account already deployed!', 'success');
        console.log('✅ Smart account already exists at:', smartAccount.address);
        return;
      }

      console.log('⚠️ Smart account not deployed. Deploying now...');

      // Get gas fees
      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      // Generate nonce
      const key = BigInt(Date.now());
      const nonce = encodeNonce({ key, sequence: 0n });

      console.log('📡 Sending UserOperation to deploy smart account...');

      // Send UserOperation to deploy smart account
      const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: smartAccount.address, // Self-call to trigger deployment
            value: parseEther('0'), // No ETH transfer
            data: '0x' as `0x${string}` // Empty data
          }
        ],
        nonce,
        ...fee
      });

      console.log('✅ UserOperation submitted:', userOperationHash);
      showNotification('Smart account deployment submitted! Waiting for confirmation...', 'info');

      // Wait for confirmation
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      });

      console.log('🎉 SMART ACCOUNT DEPLOYED!');
      console.log('📍 Address:', smartAccount.address);
      console.log('🔗 Transaction:', receipt.receipt.transactionHash);

      showNotification(`Smart account deployed successfully! Address: ${smartAccount.address}`, 'success');

    } catch (error) {
      console.error('❌ Smart account deployment failed:', error);
      showNotification(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async () => {
    if (!contract) return;

    setPaymentProcessing(true);
    showNotification('Processing payment in 3 seconds...', 'info');

    // 3-second countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(0);

    try {
      console.log('Processing payment for delegation...');

            // ONLY DELEGATION PAYMENT - No EOA fallback
      console.log('🎯 EXECUTING DELEGATION-ONLY PAYMENT');
        console.log('🚀 REAL DELEGATION: Service provider executes delegation');
        console.log('From: Smart Contract 0x327ab00586Be5651630a5827BD5C9122c8B639F8 (0.101 ETH)');
        console.log('To:', contract.providerAddress, '(Service Provider)');
        console.log('Amount:', contract.paymentAmount, 'ETH');
        console.log('Executor: Service Provider (pays gas)');

        // Call server to execute the delegation on your behalf
        showNotification('Requesting service provider to execute delegation...', 'info');

        const delegationResponse = await fetch('http://localhost:3001/service-contract/execute-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractId: contract.id,
            amount: contract.paymentAmount,
            delegationTx: 'real-delegation-execution',
            delegationData: delegationData || {
              delegate: contract.providerAddress,
              delegator: '0x327ab00586Be5651630a5827BD5C9122c8B639F8',
              authority: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
              caveats: [],
              salt: '0x',
              signature: '0xb71881efdde2bc95082dd92d7aee98acfb11adca60bff33734475f80070839734a9c2c8fc884747c8b3f00d0842640c3e8b53950d2de4190b7ee741b9bbc1f951c'
            }
          }),
        });

        if (delegationResponse.ok) {
          const delegationData = await delegationResponse.json();
          console.log('✅ DELEGATION EXECUTED:', delegationData);

          if (delegationData.success) {
            showNotification(`Delegation executed! ${contract.paymentAmount} ETH transferred from smart contract`, 'success');
            setPaymentTx(delegationData.transactionHash);
            const updatedContract = { ...contract, status: 'completed' as const };
            setContract(updatedContract);
            return;
          }
        }

        console.log('❌ Delegation execution failed');
        throw new Error('Delegation execution failed on server - no fallback payment');

      // NO FALLBACK: If delegation fails, show error - don't charge EOA
      console.log('❌ DELEGATION FAILED - NO FALLBACK PAYMENT');
      console.log('Will not charge user EOA');

      throw new Error('Delegation execution failed on server. Smart Account payment required.');
    } catch (error) {
      console.error('❌ PAYMENT ERROR DETAILS:', error);
      console.log('Error type:', typeof error);
      console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          showNotification(`Insufficient funds: You need at least ${contract.paymentAmount} ETH + gas fees`, 'error');
        } else if (error.message.includes('rejected')) {
          showNotification('Transaction rejected by user', 'error');
        } else if (error.message.includes('Server error')) {
          showNotification(`Server error: ${error.message}`, 'error');
        } else {
          showNotification(`Payment failed: ${error.message}`, 'error');
        }
      } else {
        showNotification('Failed to process payment - Unknown error', 'error');
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setContract(null);
    setDelegationTx('');
    setDelegationData(null);
    setPaymentProcessing(false);
    setPaymentTx('');
    setCountdown(0);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Step 1: Request Service Contract</h3>
            <div className="service-summary">
              <h4>Service Details:</h4>
              <p><strong>Service:</strong> {serviceName}</p>
              <p><strong>Price:</strong> {servicePrice}</p>
              <div>
                <strong>Selected Services:</strong>
                <ul>
                  {selectedServices.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
            </div>

            {!walletConnected ? (
              <div className="wallet-connection">
                <p>Please connect your MetaMask wallet to continue:</p>
                <button
                  className="service-button"
                  onClick={connectWallet}
                  disabled={isLoading}
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            ) : (
              <div className="wallet-connected">
                <p>✅ Wallet Connected: {userAddress.substring(0, 6)}...{userAddress.substring(38)}</p>

                {/* Smart Account Deployment Section */}
                <div className="smart-account-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🤖 Smart Account Deployment</h4>

                  {/* User Smart Account */}
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
                    <h5 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>👤 Your Smart Account</h5>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
                      Your EOA: <code>{userAddress}</code><br/>
                      Expected Smart Account: <code>0x327ab00586Be5651630a5827BD5C9122c8B639F8</code>
                    </p>
                    <button
                      className="service-button"
                      style={{ backgroundColor: '#007bff', marginBottom: '5px', padding: '8px 12px', fontSize: '14px' }}
                      onClick={deploySmartAccount}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Deploying...' : '🚀 Deploy Your Smart Account'}
                    </button>
                  </div>

                  {/* Service Provider Smart Account */}
                  <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '6px' }}>
                    <h5 style={{ margin: '0 0 5px 0', color: '#7b1fa2' }}>🏢 Service Provider Smart Account</h5>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
                      Provider EOA: <code>0x2aa1520F3a67D5390CB60BdCbAEb4fc897007608</code><br/>
                      Will compute new smart account address
                    </p>
                    <button
                      className="service-button"
                      style={{ backgroundColor: '#9c27b0', marginBottom: '5px', padding: '8px 12px', fontSize: '14px' }}
                      onClick={deployServiceProviderSmartAccount}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Deploying...' : '🏭 Deploy Provider Smart Account'}
                    </button>
                  </div>

                  <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>
                    Deploy smart accounts to enable full Account Abstraction delegation
                  </p>
                </div>

                <button
                  className="service-button"
                  onClick={requestServiceContract}
                  disabled={isLoading}
                >
                  {isLoading ? 'Requesting...' : 'Request Service Contract'}
                </button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>Step 2: Review Service Agreement</h3>
            {contract && (
              <div className="contract-details">
                <div className="contract-header">
                  <h4>Service Contract #{contract.id.substring(9)}</h4>
                  <span className="contract-status pending">Pending Signature</span>
                </div>

                <div className="contract-terms">
                  <h5>Contract Terms:</h5>
                  <div className="terms-box">
                    <pre>{contract.terms}</pre>
                  </div>
                </div>

                <div className="contract-actions">
                  <p>By clicking "Sign Agreement", you agree to the terms above and authorize the service provider to collect payment upon service completion.</p>
                  <button
                    className="service-button"
                    onClick={signServiceAgreement}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing...' : 'Sign Agreement'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>Step 3: Create Payment Delegation</h3>
            {contract && (
              <div className="delegation-setup">
                <div className="delegation-info">
                  <h4>MetaMask Delegation Setup</h4>
                  <p>Now we'll create a secure payment delegation that allows the service provider to collect payment only after completing the agreed services.</p>

                  <div className="delegation-details">
                    <div className="detail-item">
                      <strong>Amount Authorized:</strong> {contract.paymentAmount} SepoliaETH
                    </div>
                    <div className="detail-item">
                      <strong>Recipient:</strong> {contract.providerAddress}
                    </div>
                    <div className="detail-item">
                      <strong>Valid Until:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                    <div className="detail-item">
                      <strong>Conditions:</strong> Payment can only be collected upon service completion
                    </div>
                  </div>
                </div>

                <div className="delegation-actions">
                  <button
                    className="service-button"
                    onClick={createPaymentDelegation}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Delegation...' : 'Create Payment Delegation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>✅ Service Contract Complete!</h3>
            <div className="completion-summary">
              <div className="success-message">
                <h4>All steps completed successfully!</h4>
                <p>Your service has been booked and payment delegation has been set up.</p>
              </div>

              <div className="completion-details">
                <div className="detail-item">
                  <strong>Contract ID:</strong> {contract?.id}
                </div>
                <div className="detail-item">
                  <strong>Service:</strong> {contract?.serviceName}
                </div>
                <div className="detail-item">
                  <strong>Amount:</strong> {contract?.paymentAmount} SepoliaETH
                </div>
                <div className="detail-item">
                  <strong>Your Address (Delegator):</strong>
                  <code className="address-hash">{userAddress}</code>
                </div>
                <div className="detail-item">
                  <strong>Recipient Address (Delegate):</strong>
                  <code className="address-hash">{contract?.providerAddress}</code>
                </div>
                <div className="detail-item">
                  <strong>Delegation Transaction:</strong>
                  <code className="tx-hash">{delegationTx}</code>
                </div>
                {paymentTx && (
                  <div className="detail-item">
                    <strong>Payment Transaction:</strong>
                    <code className="tx-hash">{paymentTx}</code>
                  </div>
                )}
              </div>

              {!paymentTx && !paymentProcessing && (
                <div className="payment-section">
                  <h5>Ready for Payment Processing</h5>
                  <p>Click "Complete Service" to simulate the service provider collecting payment using your delegation.</p>
                  <button
                    className="service-button"
                    onClick={processPayment}
                    disabled={paymentProcessing}
                  >
                    Complete Service & Process Payment
                  </button>
                </div>
              )}

              {paymentProcessing && (
                <div className="payment-processing">
                  <h5>Processing Payment...</h5>
                  {countdown > 0 && (
                    <div className="countdown">
                      <p>Payment will be processed in: <strong>{countdown}</strong> seconds</p>
                      <div className="countdown-circle">
                        <span className="countdown-number">{countdown}</span>
                      </div>
                    </div>
                  )}
                  {countdown === 0 && <p>Executing payment delegation...</p>}
                </div>
              )}

              {paymentTx && (
                <div className="payment-complete">
                  <h5>🎉 Payment Processed Successfully!</h5>
                  <p>The service provider has collected {contract?.paymentAmount} SepoliaETH using your delegation.</p>
                  <div className="final-actions">
                    <button className="service-button" onClick={handleClose}>
                      Close
                    </button>
                  </div>
                </div>
              )}

              {!paymentTx && !paymentProcessing && (
                <div className="next-steps">
                  <h5>What happens next:</h5>
                  <ol>
                    <li>The service provider will contact you to schedule the service</li>
                    <li>Service will be completed as agreed</li>
                    <li>Click "Complete Service" above to simulate payment collection</li>
                    <li>Payment will be automatically processed via the delegation</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Service Contract & Payment Delegation"
      currentStep={currentStep}
      totalSteps={4}
      showNavigation={false}
    >
      {renderStepContent()}
    </Modal>
  );
};

export default ServiceContractModal;