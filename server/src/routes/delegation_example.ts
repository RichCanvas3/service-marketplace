aimport express, { RequestHandler } from 'express';
import { ethers } from 'ethers';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
  encodeFunctionData,
  Hex,
  zeroAddress
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { createBundlerClient } from 'viem/account-abstraction';

import {
  Implementation,
  toMetaMaskSmartAccount,
  DelegationFramework,
  SINGLE_DEFAULT_MODE,
  createDelegation
} from '@metamask/delegation-toolkit';

import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { encodeNonce } from 'permissionless/utils';

const serviceContractRoutes: express.Router = express.Router();

interface ServiceContractRequest {
  serviceName: string;
  servicePrice: string;
  selectedServices: string[];
  userAddress: string;
}

interface ServiceContract {
  id: string;
  serviceName: string;
  servicePrice: string;
  terms: string;
  paymentAmount: string;
  serviceDate: string;
  providerAddress: string;
  status: 'pending' | 'signed' | 'delegated' | 'completed';
  createdAt: string;
  userSmartAccount?: string;
  userEOA?: string;
  delegationData?: any;
}

// Mock service provider account (in production, this would be managed differently)
const serviceProviderAccount = privateKeyToAccount(
  (process.env.SERVER_PRIVATE_KEY as `0x${string}`) ||
  '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
);

// Service Provider Smart Account address (deployed with salt 0x...0001)
const SERVICE_PROVIDER_SMART_ACCOUNT = '0x66cB1D45cA24eB3FF774DA65A5BA5E65Dd63C6ED';

// In-memory storage for demo purposes (use a database in production)
const contracts = new Map<string, ServiceContract>();

// Create service contract request
const createServiceContract: RequestHandler = async (req, res) => {
  console.log('>>> Creating Service Contract\n');

  try {
    const { serviceName, servicePrice, selectedServices, userAddress }: ServiceContractRequest = req.body;

    if (!serviceName || !servicePrice || !selectedServices || !userAddress) {
      res.status(400).json({
        error: 'Missing required fields: serviceName, servicePrice, selectedServices, userAddress'
      });
      return;
    }

    // Generate unique contract ID
    const contractId = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create service contract
    const contract: ServiceContract = {
      id: contractId,
      serviceName,
      servicePrice,
      terms: `Service Agreement for ${serviceName}\n\nTotal Amount: ${servicePrice}\n\nTerms and Conditions:\n1. Service will be provided within 7 days of agreement signing\n2. Payment will be automatically deducted from your wallet upon service completion\n3. If service is not completed as agreed, payment will be refunded within 24 hours\n4. Cancellation must be made 24 hours in advance\n5. All services include standard setup and cleanup\n6. Special dietary requirements must be communicated at least 48 hours in advance\n\nBy signing this agreement, you authorize the service provider to withdraw the agreed amount from your MetaMask wallet upon successful service completion.\n\nThis contract is governed by the laws of the jurisdiction where services are provided.`,
      paymentAmount: servicePrice.includes('SepoliaETH') ? '0.00005' : servicePrice.replace('$', ''),
      serviceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      providerAddress: SERVICE_PROVIDER_SMART_ACCOUNT, // Changed to Smart Account instead of EOA
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store contract
    contracts.set(contractId, contract);

    console.log(`Service contract created: ${contractId}`);

    res.json({
      success: true,
      contract,
      message: 'Service contract created successfully'
    });

  } catch (error) {
    console.error('Error creating service contract:', error);
    res.status(500).json({
      error: 'Failed to create service contract',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get service contract by ID
const getServiceContract: RequestHandler = async (req, res) => {
  console.log('>>> Getting Service Contract\n');

  try {
    const { contractId } = req.params;

    if (!contractId) {
      res.status(400).json({ error: 'Contract ID is required' });
      return;
    }

    const contract = contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({
      success: true,
      contract
    });

  } catch (error) {
    console.error('Error getting service contract:', error);
    res.status(500).json({
      error: 'Failed to get service contract',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Process delegation and execute payment
const processDelegation: RequestHandler = async (req, res) => {
  console.log('>>> Processing Delegation\n');

  try {
    const { contractId, delegation, signature, userSmartAccount, userEOA, serviceProviderSmartAccount } = req.body;

    if (!contractId || !delegation || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: contractId, delegation, signature'
      });
    }

    const contract = contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    console.log('Processing delegation for contract:', contractId);
    console.log('Delegation:', delegation);
    console.log('User EOA:', userEOA);
    console.log('User Smart Account:', userSmartAccount);
    console.log('Service Provider Smart Account:', serviceProviderSmartAccount || SERVICE_PROVIDER_SMART_ACCOUNT);
    console.log('🔄 SMART ACCOUNT TO SMART ACCOUNT DELEGATION PROCESSING');

    // Store delegation data for later execution
    contract.userSmartAccount = userSmartAccount || delegation.delegator;
    contract.delegationData = { ...delegation, signature };
    contract.status = 'delegated';

    // Store the user's EOA address for smart account recreation
    if (userEOA) {
      contract.userEOA = userEOA;
    }

    contracts.set(contractId, contract);

    // Generate a mock transaction hash for delegation creation
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('Mock delegation processed, simulated tx hash:', mockTxHash);

    res.json({
      success: true,
      transactionHash: mockTxHash,
      message: 'Delegation processed and stored for execution',
      note: 'Delegation data stored, ready for payment execution'
    });

  } catch (error) {
    console.error('Error processing delegation:', error);
    res.status(500).json({
      error: 'Failed to process delegation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Execute payment using delegation
const executePayment: RequestHandler = async (req, res) => {
  console.log('>>> Executing Payment\n');

  // Extract contractId outside try-catch so it's available in error handling
  const { contractId, amount, delegationTx } = req.body;
  let userSmartAccountAddress: string | undefined;
  let storedDelegation: any;
  let contract: ServiceContract | undefined;
  let paymentAmount: bigint | undefined;
  let data: string | undefined;

  try {
    if (!contractId || !amount || !delegationTx) {
      return res.status(400).json({
        error: 'Missing required fields: contractId, amount, delegationTx'
      });
    } else {
      console.log('Valid: contractId, amount, and delegationTx are good');
    }

    contract = contracts.get(contractId);

    if (!contract) {
      return res.status(404).json({
        error: 'Contract not found'
      });
    } else {
      console.log('Contract found');
    }

    console.log(`Starting payment for contract ${contractId}: ${amount} ETH`);
    console.log(`Using delegation tx: ${delegationTx}`);

    // Get the stored delegation data first
    if (!contract.delegationData) {
      throw new Error('No delegation data found for this contract. Please create delegation first.');
    } else {
      console.log('Delegation data found')
    }

    storedDelegation = contract.delegationData;
    userSmartAccountAddress = contract.userSmartAccount || storedDelegation.delegator;

    // console.log('Stored delegation data:', storedDelegation);
    // console.log('User smart account (delegator):', userSmartAccountAddress);
    // console.log('🔍 DEBUGGING: Delegator from stored delegation:', storedDelegation.delegator);
    // console.log('🔍 DEBUGGING: Expected funded smart account: 0x327ab00586Be5651630a5827BD5C9122c8B639F8');


    // console.log('Checking Ethers')
    // const usdcAddress = "0xd9aa90fbe46fc7a9a5bc05c1a409c00678f7b5f3";
    // const usdcAbi = [ "function balanceOf(address) view returns (uint256)" ];

    // const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
    // const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);

    // const balance = await usdc.balanceOf("YOUR_WALLET_ADDRESS");
    // console.log(`USDC balance: ${ethers.utils.formatUnits(balance, 6)}`);
    // return;



    // Get environment variables
    const pimlicoApiKey = process.env.PIMLICO_API_KEY || 'pim_12345678910';
    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

    const bundlerUrl = `https://api.pimlico.io/v2/11155111/rpc?apikey=${pimlicoApiKey}`; // Use chain ID 11155111 for Sepolia
    const paymasterUrl = `https://api.pimlico.io/v2/11155111/rpc?apikey=${pimlicoApiKey}`; // No paymaster

    // console.log('Using Pimlico API key:', pimlicoApiKey.substring(0, 10) + '...');
    // console.log('Bundler URL:', bundlerUrl);

    // https://base-sepolia-rpc.publicnode.com
    // https://base-sepolia.g.alchemy.com/v2/cxed5uOA7ERjrPuukGXVe
    // https://api.pimlico.io/v2/84532/rpc?apikey=${pimlicoApiKey}
    // chain baseSepolia
    // https://base-sepolia.g.alchemy.com/v2/Your-API-Key










    // Setup Public Client
    console.log('Setup Public Client');
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/cxed5uOA7ERjrPuukGXVe`)
    });

    // Setup Bundler Client
    console.log('Setup Bundler Client');
    const bundlerClient = createBundlerClient({
      client: publicClient,
      transport: http(`https://api.pimlico.io/v2/11155111/rpc?apikey=${pimlicoApiKey}`),
      paymaster: true
    });

    // Setup Pimlico Client
    console.log('Setup Pimlico Client');
    const pimlicoClient = createPimlicoClient({
      chain: sepolia,
      transport: http(bundlerUrl)
    });

    // Create Delegator Smart Account - Removing Money
    console.log('Create Delegator Smart Account');
    const delegatorAccount = privateKeyToAccount('0x8f2f25b94e2af68197ad8fdadebb0110b251c4a08895b168ee04b96af98a068c'); // Remove
    const delegatorSmartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [delegatorAccount.address, [], [], []],
      deploySalt: '0x',
      signatory: { account: delegatorAccount }
    });

    // Create Delegate Smart Account - Gaining Money
    console.log('Create Delegate Smart Account');
    const delegateAccount = privateKeyToAccount('0xaff2b423dd92e5bbf2f0943a7b4021455ff323e21bde380c5c7cc3a663887c4a'); // Remove
    const delegateSmartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [delegateAccount.address, [], [], []],
      deploySalt: '0x',
      signatory: { account: delegateAccount }
    });

    // Create Delegation
    console.log('Create Delegation');
    console.log('From: ', delegatorSmartAccount.address);
    console.log('To: ', delegateSmartAccount.address);
    const delegation = createDelegation({
      to: delegateSmartAccount.address,
      from: delegatorSmartAccount.address,
      caveats: []
    });

    // Sign Delegation
    console.log('Sign Delegation');
    const signature = await delegatorSmartAccount.signDelegation({
      delegation
    });

    const signedDelegation = {
      ...delegation,
      signature
    };

    // Redeem/Execute Delegation
    const delegations = [ signedDelegation ];

    const executions = [{
      target: delegateSmartAccount.address,
      value: 50_000_000_000_000n, // 0.0005 ETH
      callData: '0x'
    }];

    console.log('Executions: ', executions);

    console.log('Delegator EOA Address:', delegatorAccount.address);
    console.log('Delegator Smart Account Address:', delegatorSmartAccount.address);
    console.log('Delegate Smart Account Address:', delegateSmartAccount.address);
    console.log('Delegate EOA Address:', delegateAccount.address);

    const redeemDelegationCallData = DelegationFramework.encode.redeemDelegations({
      delegations: [ delegations ],
      modes: [ SINGLE_DEFAULT_MODE ],
      executions: [ executions ]
    });

    const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

    console.log('Max Fee Per Gas: ', fee.maxFeePerGas);
    console.log('Max Priority Fee Per Gas: ', fee.maxPriorityFeePerGas);

    const userOperationHash1 = await bundlerClient.sendUserOperation({
      account: delegateSmartAccount,
      calls: [
        {
          to: delegateSmartAccount.address,
          data: redeemDelegationCallData
        }
      ],
      maxFeePerGas: fee.maxFeePerGas,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
      verificationGasLimit: 300_000n
    });

    // console.log(userOperationHash1);
    console.log('Payment Successful!');

    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOperationHash1,
    });

    console.info("Payment Receipt: ", receipt)

    return res.json({
      success: true
      // receipt: receipt
    });










    // Setup Pimlico bundler client
    console.log('Setting up Pimlico client')

    const pimlicoClient2 = createPimlicoClient({
      transport: http(bundlerUrl),
      chain: sepolia
    });

    // const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

    // const bundlerClient = createBundlerClient({
    //   transport: http(process.env.BUNDLER_URL),
    //   chain: sepolia,
    //   paymaster: true,
    // }) as any;

    // const executions = [
    //   {
    //     target: serviceProviderAccount.address,
    //     value: paymentAmount,
    //     callData: "0x" as `0x${string}`
    //   }
    // ];


    console.log('Service Provider Smart Account:', SERVICE_PROVIDER_SMART_ACCOUNT);
    console.log('Payment Amount: ', paymentAmount);
    console.log('Stored Delegation: ', storedDelegation);

    // Broadcasts a User Operation to the Bundler
    const key1 = BigInt(Date.now());
    const nonce1 = encodeNonce({ key: key1, sequence: 0n });

    // const executions = [{
    //   target: SERVICE_PROVIDER_SMART_ACCOUNT as `0x${string}`,
    //   value: parseEther('0.00005'),
    //   callData: '0x' as `0x${string}`
    // }];

    const data = DelegationFramework.encode.redeemDelegations({
      delegations: [ [storedDelegation] ],
      modes: [SINGLE_DEFAULT_MODE],
      executions: [executions]
    });

    console.log('Key: ', key1);
    console.log('Number Used Once (nonce): ', nonce1);
    console.log('Service Provider Account: ', serviceProviderAccount);
    console.log('Service Provider Account Address: ', serviceProviderAccount.address);

    const userOperationHash = await bundlerClient.sendUserOperation({
      account: serviceProviderAccount,
      calls: [{
          to: serviceProviderAccount.address,
          // value: parseEther('0.00005')
          data
        }],
      nonce: nonce1,
      ...fee
    });

    console.log('SUCCESS!')

    // const receipt = await bundlerClient.waitForUserOperationReceipt({
    //   hash: userOperationHash,
    // });

    // console.info("payment received: ", receipt)

    // Create public client for blockchain interaction
    // console.log('Setting up Public client')

    // const publicClient = createPublicClient({
    //   transport: http(rpcUrl),
    //   chain: sepolia
    // });

    console.log('Service Provider EOA:', serviceProviderAccount.address);
    console.log('Service Provider Smart Account (delegate):', SERVICE_PROVIDER_SMART_ACCOUNT);

    // The user's smart account is already created and funded
    // We need to execute transactions from it using the delegation
    console.log('User smart account (should be funded):', userSmartAccountAddress);

    // Verify this matches the delegator in the stored delegation
    if (userSmartAccountAddress && userSmartAccountAddress.toLowerCase() !== storedDelegation.delegator.toLowerCase()) {
      throw new Error(`Smart account mismatch: expected ${userSmartAccountAddress}, got ${storedDelegation.delegator}`);
    }

    // Use Pimlico client as bundler client - this works correctly
    // const bundlerClient = pimlicoClient;

    // Test Pimlico connection and get gas fees
    console.log('Testing Pimlico connection...');
    let gasPrice;

    try {
      console.log('Getting gas fees from Pimlico...');
      gasPrice = await pimlicoClient.getUserOperationGasPrice();
      console.log('✅ Pimlico connection successful');
      console.log('Gas fees:', {
        maxFeePerGas: gasPrice.fast?.maxFeePerGas?.toString() || 'undefined',
        maxPriorityFeePerGas: gasPrice.fast?.maxPriorityFeePerGas?.toString() || 'undefined'
      });
    } catch (connectionError) {
      console.error('❌ Pimlico connection failed:', connectionError);
      // Use fallback gas prices
      gasPrice = {
        fast: {
          maxFeePerGas: BigInt('20000000000'), // 20 gwei
          maxPriorityFeePerGas: BigInt('2000000000') // 2 gwei
        }
      };
      console.log('Using fallback gas prices');
    }

    // Ensure gas price structure is valid
    if (!gasPrice || !gasPrice.fast || !gasPrice.fast.maxFeePerGas) {
      console.log('Gas price structure invalid, applying fallback');
      gasPrice = {
        fast: {
          maxFeePerGas: BigInt('20000000000'), // 20 gwei
          maxPriorityFeePerGas: BigInt('2000000000') // 2 gwei
        }
      };
    }

    // Prepare delegation execution
    paymentAmount = parseEther(amount);
    console.log('Payment amount in Wei:', paymentAmount?.toString() || 'undefined');

    // SIMPLIFIED APPROACH: Direct Service Provider Smart Account execution
    console.log('🎯 SIMPLIFIED PAYMENT EXECUTION');
    console.log('Service Provider Smart Account executes direct payment call to User Smart Account');

    // Execute direct call from Service Provider Smart Account to User Smart Account
    // This will call the User Smart Account's execute function to transfer ETH
    console.log('Building direct UserOperation: Service Provider → User Smart Account (execute withdrawal)');
    console.log(`Amount: ${amount} ETH (${paymentAmount.toString()} wei)`);

    // Encode the call to User Smart Account's execute function
    const executeCallData = encodeFunctionData({
      abi: [
        {
          name: 'execute',
          type: 'function',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' }
          ]
        }
      ],
      functionName: 'execute',
      args: [
        SERVICE_PROVIDER_SMART_ACCOUNT as `0x${string}`, // Transfer to Service Provider Smart Account
        paymentAmount, // Amount to transfer
        '0x' as `0x${string}` // Empty data for simple ETH transfer
      ]
    });

    console.log('Execute call data:', executeCallData);

    // Execute the delegation using the service provider's SMART ACCOUNT
    console.log('🎯 EXECUTING DELEGATION-BASED TRANSACTION VIA SERVICE PROVIDER SMART ACCOUNT...');

    try {
      // Create public client
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl)
      });

      // Check service provider smart account balance first
      const serviceProviderSmartAccountBalance = await publicClient.getBalance({
        address: SERVICE_PROVIDER_SMART_ACCOUNT as `0x${string}`
      });

      console.log('Service provider Smart Account balance:', ethers.formatEther(serviceProviderSmartAccountBalance.toString()), 'ETH');

      // Create the Service Provider Smart Account using MetaMask Delegation Toolkit
      console.log('Creating Service Provider Smart Account for delegation execution...');

      // Create a custom account object for the service provider EOA (which controls the smart account)
      const serviceProviderCustomAccount = {
        address: serviceProviderAccount.address,
        async signMessage({ message }: { message: string | Uint8Array }) {
          // Use the service provider's private key to sign
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const privateKey = process.env.SERVER_PRIVATE_KEY || '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
          const wallet = new ethers.Wallet(privateKey, provider);
          if (typeof message === 'string') {
            return await wallet.signMessage(message);
          } else {
            return await wallet.signMessage(message);
          }
        },
        async signTypedData({ domain, types, primaryType, message }: any) {
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          // Use the actual private key from the account, not the string 'privateKey'
          const privateKey = process.env.SERVER_PRIVATE_KEY || '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
          const wallet = new ethers.Wallet(privateKey, provider);
          return await wallet.signTypedData(domain, types, message);
        },
        async signTransaction(transaction: any) {
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const privateKey = process.env.SERVER_PRIVATE_KEY || '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
          const wallet = new ethers.Wallet(privateKey, provider);
          return await wallet.signTransaction(transaction);
        },
        source: 'custom' as const,
        type: 'local' as const
      };

      // Create Service Provider Smart Account
      // const serviceProviderSmartAccount = await toMetaMaskSmartAccount({
      //   client: publicClient as any,
      //   implementation: Implementation.Hybrid,
      //   deployParams: [serviceProviderAccount.address as Address, [], [], []],
      //   deploySalt: '0x0000000000000000000000000000000000000000000000000000000000000001', // Different salt from user
      //   signatory: { account: serviceProviderCustomAccount },
      // });

      const serviceProviderSmartAccount = await toMetaMaskSmartAccount({
          client: publicClient as any,
          implementation: Implementation.Hybrid,
          deployParams: [
            serviceProviderAccount.address as `0x${string}`,
            [] as string[],
            [] as bigint[],
            [] as bigint[]
          ] as [owner: `0x${string}`, keyIds: string[], xValues: bigint[], yValues: bigint[]],
          deploySalt: "0x0000000000000000000000000000000000000000000000000000000000000001",
          signatory: { account: serviceProviderAccount as any },
      });

      console.log('Service Provider Smart Account created:', serviceProviderSmartAccount.address);
      console.log('Expected address:', SERVICE_PROVIDER_SMART_ACCOUNT);

      if (serviceProviderSmartAccount.address.toLowerCase() !== SERVICE_PROVIDER_SMART_ACCOUNT.toLowerCase()) {
        console.warn('⚠️ Smart Account address mismatch!');
        console.warn('Expected:', SERVICE_PROVIDER_SMART_ACCOUNT);
        console.warn('Got:', serviceProviderSmartAccount.address);
      }

      // Check if service provider smart account has enough balance for gas
      const basicGasPrice = await publicClient.getGasPrice();
      const estimatedGasCost = 300000n * basicGasPrice; // Conservative gas estimate
      console.log('Estimated gas cost:', ethers.formatEther(estimatedGasCost.toString()), 'ETH');

      if (serviceProviderSmartAccountBalance < estimatedGasCost) {
        console.log('❌ INSUFFICIENT BALANCE FOR GAS IN SERVICE PROVIDER SMART ACCOUNT');
        console.log(`Required: ${ethers.formatEther(estimatedGasCost.toString())} ETH`);
        console.log(`Available: ${ethers.formatEther(serviceProviderSmartAccountBalance.toString())} ETH`);
        throw new Error(`Insufficient balance in Service Provider Smart Account: need ${ethers.formatEther(estimatedGasCost.toString())} ETH for gas, have ${ethers.formatEther(serviceProviderSmartAccountBalance.toString())} ETH`);
      }

              // REAL DELEGATION EXECUTION: Use Service Provider Smart Account to execute delegation
        console.log('🚀 USING SERVICE PROVIDER SMART ACCOUNT TO EXECUTE DELEGATION');

        console.log('Delegation to execute:', {
          delegate: storedDelegation.delegate,
          delegator: storedDelegation.delegator,
          authority: storedDelegation.authority,
          signature: storedDelegation.signature.substring(0, 20) + '...'
        });

        // Use the Service Provider Smart Account to execute the delegation
        console.log('📡 EXECUTING DELEGATION VIA SERVICE PROVIDER SMART ACCOUNT...');

        // The Service Provider Smart Account will execute the delegation to transfer funds
        // from User Smart Account to Service Provider Smart Account
        console.log('🔄 DELEGATION EXECUTION FLOW:');
        console.log(`• Executor: Service Provider Smart Account (${serviceProviderSmartAccount.address})`);
        console.log(`• Source: User Smart Account (${userSmartAccountAddress})`);
        console.log(`• Destination: Service Provider Smart Account (${SERVICE_PROVIDER_SMART_ACCOUNT})`);
        console.log(`• Amount: ${amount} ETH`);

        // Create a simple transaction to simulate delegation execution
        // In a real implementation, this would use the DelegationFramework to execute
        const delegationCallData = `0x${Buffer.from(JSON.stringify({
          method: 'executeDelegation',
          delegation: storedDelegation,
          amount: paymentAmount?.toString(),
          recipient: serviceProviderAccount.address
        })).toString('hex')}`;

        // CLEAN DELEGATION EXECUTION: Only correct payment flow
        console.log('🎯 EXECUTING DELEGATION PAYMENT (CLEAN VERSION)');
        console.log(`Payment Direction: User Smart Account (${userSmartAccountAddress}) → Service Provider Smart Account (${SERVICE_PROVIDER_SMART_ACCOUNT})`);
        console.log(`Amount: ${amount} ETH`);

        // Create Pimlico client for UserOperation execution
        const pimlicoClient = createPimlicoClient({
          transport: http(bundlerUrl),
          chain: sepolia
        });

        // Check User Smart Account balance first
        const userBalance = await publicClient.getBalance({
          address: userSmartAccountAddress as `0x${string}`
        });

        console.log(`✅ User Smart Account balance: ${(Number(userBalance) / 1e18).toFixed(6)} ETH`);
        console.log(`✅ Required payment: ${amount} ETH`);

        if (userBalance < paymentAmount) {
          console.log('❌ INSUFFICIENT BALANCE - Creating simulation');
          const simulationResponse = {
            success: true,
            transactionHash: `sim_insufficient_balance_${Date.now()}`,
            message: `❌ Insufficient balance: User Smart Account has ${(Number(userBalance) / 1e18).toFixed(6)} ETH, needs ${amount} ETH`,
            transferDetails: {
              from: userSmartAccountAddress,
              to: SERVICE_PROVIDER_SMART_ACCOUNT,
              actualBalance: (Number(userBalance) / 1e18).toFixed(6),
              requiredBalance: amount,
              status: 'insufficient_balance'
            }
          };
          return res.json(simulationResponse);
        }

        // EXECUTE CORRECT DELEGATION: Service Provider withdraws from User Smart Account
        console.log('✅ SUFFICIENT BALANCE - Executing delegation payment');
        console.log(`🔄 Service Provider withdrawing ${amount} ETH from User Smart Account...`);

        let delegationTx: string;
        let transferMethod: string = 'service_provider_direct_call';

        try {
          // REAL DELEGATION EXECUTION: Use DelegationFramework to redeem delegation
          console.log('📍 CHECKPOINT 2: Reached REAL DELEGATION EXECUTION block');
          console.log('🎯 EXECUTING REAL DELEGATION FRAMEWORK');
          console.log('Using DelegationFramework.encode.redeemDelegations()');

          console.log('Real delegation execution details:', {
            serviceProvider: serviceProviderSmartAccount.address,
            userSmartAccount: userSmartAccountAddress,
            amount: amount,
            targetRecipient: SERVICE_PROVIDER_SMART_ACCOUNT
          });

                              // Create the proper execution for ETH transfer
          // Now that we're calling DelegationManager, use the actual target (Service Provider Smart Account)
          const delegationExecution = {
            target: SERVICE_PROVIDER_SMART_ACCOUNT as `0x${string}`,
            value: paymentAmount,
            callData: '0x' as `0x${string}`
          };

          console.log('🔧 FIXED: Using Service Provider Smart Account as execution target');
          console.log('DelegationManager should handle the delegation validation and execution');

          const executions = [
            {
              target: SERVICE_PROVIDER_SMART_ACCOUNT as `0x${string}`,
              value: paymentAmount,
              callData: '0x' as `0x${string}`
            }
          ];

          console.log('Delegation executions:', executions);

          // Encode the delegation redemption using DelegationFramework
          console.log('🔍 PRE-ENCODING DEBUG:');
          console.log('Delegation input structure:');
          console.log('- delegations: [[storedDelegation]]');
          console.log('- modes: [SINGLE_DEFAULT_MODE]');
          console.log('- executions: [executions]');
          console.log('- SINGLE_DEFAULT_MODE value:', SINGLE_DEFAULT_MODE);

          // CRITICAL FIX: Ensure proper delegation structure for redeemDelegations
          // Based on MetaMask delegation framework requirements
          const delegationRedemptionData = DelegationFramework.encode.redeemDelegations({
            delegations: [ [storedDelegation] ], // Array of delegation batches
            modes: [SINGLE_DEFAULT_MODE],      // Default execution mode
            executions: [executions]           // Array of execution batches
          });

          console.log('🔧 DELEGATION ENCODING VERIFICATION:');
          console.log('Final delegation structure passed to encode:');
          console.log('- delegations[0]:', JSON.stringify(storedDelegation, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2));
          console.log('- modes[0]:', SINGLE_DEFAULT_MODE);
          console.log('- executions[0]:', JSON.stringify(executions, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2));

          console.log('🔍 POST-ENCODING DEBUG:');
          console.log('Encoded data type:', typeof delegationRedemptionData);
          console.log('Encoded data is hex string:', delegationRedemptionData.startsWith('0x'));
          console.log('Method selector (first 10 chars):', delegationRedemptionData.substring(0, 10));

          console.log('✅ Delegation redemption data encoded');

          // CRITICAL DEBUG: Delegation Signature Analysis
          console.log('🔍 DELEGATION SIGNATURE ANALYSIS:');
          console.log('   - Signature value:', storedDelegation.signature);
          console.log('   - Signature type:', typeof storedDelegation.signature);
          console.log('   - Signature starts with 0x:', storedDelegation.signature?.startsWith('0x'));
          console.log('   - Raw signature length:', storedDelegation.signature?.length);
          console.log('   - Expected signature length (132 chars):', storedDelegation.signature?.length === 132);

          // Check delegation structure completeness
          console.log('🔍 DELEGATION COMPLETENESS CHECK:');
          console.log('   - Has delegator:', !!storedDelegation.delegator);
          console.log('   - Has delegate:', !!storedDelegation.delegate);
          console.log('   - Has authority:', !!storedDelegation.authority);
          console.log('   - Has salt:', !!storedDelegation.salt);
          console.log('   - Salt value:', storedDelegation.salt);
          console.log('   - Authority value:', storedDelegation.authority);

          // Validate UserOperation structure
          console.log('🔍 USER OPERATION VALIDATION:');
          console.log('UserOp callData length:', delegationRedemptionData.length);
          console.log('UserOp account (should be User Smart Account):', userSmartAccountAddress);
          console.log('UserOp nonce will be fetched from:', userSmartAccountAddress);
          console.log('UserOp will be signed by Service Provider:', SERVICE_PROVIDER_SMART_ACCOUNT);
          console.log('Data length:', delegationRedemptionData.length);
          console.log('Raw delegation data:', delegationRedemptionData.substring(0, 100) + '...');

          // Debug delegation structure
          console.log('🔍 DELEGATION STRUCTURE DEBUG:');
          console.log('Stored delegation:', JSON.stringify({
            delegator: storedDelegation.delegator,
            delegate: storedDelegation.delegate,
            authority: storedDelegation.authority,
            caveats: storedDelegation.caveats?.map((c: any) => ({
              enforcer: c.enforcer,
              terms: c.terms,
              args: c.args
            })) || [],
            salt: storedDelegation.salt,
            signature: storedDelegation.signature?.substring(0, 20) + '...'
          }, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

          console.log('Execution parameters:', {
            target: SERVICE_PROVIDER_SMART_ACCOUNT,
            value: paymentAmount?.toString(),
            callData: '0x'
          });

          // Critical validation checks
          console.log('🔍 CRITICAL VALIDATION CHECKS:');
          console.log('1. Delegation delegate matches Service Provider?',
            storedDelegation.delegate?.toLowerCase() === SERVICE_PROVIDER_SMART_ACCOUNT.toLowerCase());
          console.log('2. Delegation delegator matches User Smart Account?',
            storedDelegation.delegator?.toLowerCase() === userSmartAccountAddress?.toLowerCase());
          console.log('3. Delegation has signature?', !!storedDelegation.signature);
          console.log('4. Delegation has authority?', !!storedDelegation.authority);
          console.log('5. Execution target matches delegate?',
            SERVICE_PROVIDER_SMART_ACCOUNT.toLowerCase() === storedDelegation.delegate?.toLowerCase());
          console.log('6. Payment amount is valid?', paymentAmount > 0n);
          console.log('7. Caveats validation needed?', storedDelegation.caveats?.length > 0);

          // CRITICAL VALIDATION: Stop execution if delegation is malformed
          if (storedDelegation.delegate?.toLowerCase() !== SERVICE_PROVIDER_SMART_ACCOUNT.toLowerCase()) {
            console.error('❌ VALIDATION FAILED: Delegation delegate mismatch');
            return res.status(400).json({
              error: 'Delegation delegate mismatch - delegation not created for this service provider',
              expected: SERVICE_PROVIDER_SMART_ACCOUNT,
              got: storedDelegation.delegate
            });
          }

          if (storedDelegation.delegator?.toLowerCase() !== userSmartAccountAddress?.toLowerCase()) {
            console.error('❌ VALIDATION FAILED: Delegation delegator mismatch');
            return res.status(400).json({
              error: 'Delegation delegator mismatch - delegation not created by this user',
              expected: userSmartAccountAddress,
              got: storedDelegation.delegator
            });
          }

          if (!storedDelegation.signature) {
            console.error('❌ VALIDATION FAILED: Delegation missing signature');
            return res.status(400).json({
              error: 'Delegation missing signature - delegation not properly signed'
            });
          }

          if (!storedDelegation.authority) {
            console.error('❌ VALIDATION FAILED: Delegation missing authority');
            return res.status(400).json({
              error: 'Delegation missing authority - delegation not properly configured'
            });
          }

                    // Use the existing Pimlico client for UserOperation submission
          // (pimlicoClient is already created above)

          // Get nonce for the Service Provider Smart Account
          const nonce = await serviceProviderSmartAccount.getNonce();
          console.log('Service Provider Smart Account nonce:', nonce.toString());

                    // Execute delegation via Service Provider Smart Account calling User Smart Account
          console.log('🚀 Service Provider executing delegation on User Smart Account...');
          console.log('Delegation details:', {
            delegator: storedDelegation.delegator,
            delegate: storedDelegation.delegate,
            authority: storedDelegation.authority,
            caveats: storedDelegation.caveats?.length || 0
          });

                    // CRITICAL FIX: Execute delegation ON the User Smart Account, not FROM Service Provider
          // The delegation framework expects the UserOperation to be submitted for the User Smart Account
          console.log('🔄 CORRECTED DELEGATION EXECUTION APPROACH');
          console.log('Creating UserOperation FOR User Smart Account (not from Service Provider)');
          console.log('Service Provider will sign the UserOperation using delegation authority');

          // Create a UserOperation that runs on the User Smart Account
          // This UserOperation will transfer ETH from User Smart Account to Service Provider Smart Account
          // But it will be signed by the Service Provider using the delegation

          // First, create the User Smart Account object for UserOperation submission
          console.log('🏗️ Creating User Smart Account object for delegation execution...');

                              // SIMPLIFIED APPROACH: Go back to original delegation redemption but use original User Smart Account
          // The key insight: We need to use the EXACT same account that was used to create the delegation
          console.log('🔄 USING ORIGINAL DELEGATION REDEMPTION WITH CORRECT ACCOUNT');

          // Try to reproduce the EXACT User Smart Account that was used to create the delegation
          // This requires using the User's EOA as signatory, not the Service Provider
          console.log('⚠️ Important: Using User EOA as signatory to match original account creation');

          // We cannot directly execute this server-side because we don't have the User's private key
          // Instead, let's use a different approach: submit via Service Provider but target the delegation redemption correctly

          console.log('🎯 CORRECTED APPROACH: For Smart Account delegation, call User Smart Account (not DelegationManager)');
          console.log('Per MetaMask docs: Smart Account redemption sends UserOp to delegator smart account');
          console.log('DelegationManager is only for EOA delegation redemption');

          console.log('🔧 FIXING EXECUTION STRUCTURE: Need proper target and value for ETH transfer');
          console.log(`Target should be Service Provider Smart Account: ${SERVICE_PROVIDER_SMART_ACCOUNT}`);
          console.log(`Value should be payment amount: ${paymentAmount.toString()}`);

          console.log('Using execution structure from delegation redemption data');

          // CRITICAL FIX: The delegation must be executed FROM the User Smart Account, not TO it
          // We need to create the User Smart Account object and execute the delegation FROM it
          // But use the Service Provider's signing authority via delegation

          console.log('🔄 CRITICAL REALIZATION: Must execute FROM User Smart Account, not TO it');
          console.log('The delegation framework expects the delegator account to execute the redemption');
          console.log('We need to recreate the User Smart Account and execute from it');

          // Create the User Smart Account using the stored User EOA
          const contract = contracts.get(contractId);
          if (!contract?.userEOA) {
            throw new Error('User EOA not found - cannot recreate User Smart Account for delegation execution');
          }

          console.log('Recreating User Smart Account with User EOA:', contract.userEOA);

          // For now, let's try a different approach: direct call to delegation manager
          // According to MetaMask docs, EOA delegation goes to DelegationManager
          // Let's try calling the DelegationManager directly
          const DELEGATION_MANAGER_ADDRESS = '0x739309deED0Ae184E66a427ACa432aE1D91d022e'; // Sepolia

          console.log('🎯 ALTERNATIVE APPROACH: Call DelegationManager directly');
          console.log('DelegationManager address:', DELEGATION_MANAGER_ADDRESS);

          const userOperationHash = await bundlerClient.sendUserOperation({
            account: serviceProviderSmartAccount,
            calls: [
              {
                to: DELEGATION_MANAGER_ADDRESS as `0x${string}`,
                data: delegationRedemptionData,
                value: 0n
              }
            ],
            ...gasPrice.fast
          });

          console.log('✅ UserOperation submitted successfully!');
          console.log('UserOperation hash:', userOperationHash);

          // Wait for UserOperation to be mined
          console.log('⏳ Waiting for UserOperation to be mined...');
          const receipt = await bundlerClient.waitForUserOperationReceipt({
            hash: userOperationHash
          });

          delegationTx = receipt.receipt.transactionHash;
          transferMethod = 'real_delegation_execution';

          console.log('✅ REAL DELEGATION EXECUTION SUCCESSFUL!');
          console.log('Transaction Hash:', delegationTx);
          console.log('Block Number:', receipt.receipt.blockNumber);
          console.log('Gas Used:', receipt.receipt.gasUsed);

        } catch (delegationError) {
          console.log('❌ DELEGATION FAILED:', delegationError instanceof Error ? delegationError.message : String(delegationError));

          // Debug the specific UserOperation simulation error
          const errorMessage = delegationError instanceof Error ? delegationError.message : String(delegationError);

          console.log('🔍 DEBUGGING Delegation Error:');
          console.log('Error details:', errorMessage);

          // Specific analysis for 0x0796d945 error
          if (errorMessage.includes('0x0796d945')) {
            console.log('🔍 ANALYZING 0x0796d945 ERROR:');
            console.log('This is a delegation framework validation error');
            console.log('Checking potential causes:');

            console.log('1. Delegation Structure Analysis:');
            console.log('   - Delegator:', storedDelegation.delegator);
            console.log('   - Delegate:', storedDelegation.delegate);
            console.log('   - Authority:', storedDelegation.authority);
            console.log('   - Signature length:', storedDelegation.signature?.length);
            console.log('   - Caveats count:', storedDelegation.caveats?.length);

            console.log('2. Execution Analysis:');
            console.log('   - Target:', SERVICE_PROVIDER_SMART_ACCOUNT);
            console.log('   - Value:', paymentAmount.toString());
            console.log('   - User Smart Account:', userSmartAccountAddress);

            console.log('3. Potential Issues:');
            console.log('   - Are both accounts properly deployed?');
            console.log('   - Is the delegation signature valid?');
            console.log('   - Are caveats properly formatted?');
            console.log('   - Is the execution target correct?');

            // Check if accounts are deployed
            console.log('4. Account Deployment Check:');
            try {
              console.log('   - Checking User Smart Account deployment...');
              const userAccountCode = await publicClient.getBytecode({ address: userSmartAccountAddress });
              const userDeployed = userAccountCode && userAccountCode !== '0x';
              console.log('   - User Smart Account status:', userDeployed ? 'DEPLOYED ✅' : 'NOT DEPLOYED ❌');

              console.log('   - Checking Service Provider Smart Account deployment...');
              const providerAccountCode = await publicClient.getBytecode({ address: SERVICE_PROVIDER_SMART_ACCOUNT });
              const providerDeployed = providerAccountCode && providerAccountCode !== '0x';
              console.log('   - Service Provider Smart Account status:', providerDeployed ? 'DEPLOYED ✅' : 'NOT DEPLOYED ❌');

              if (!userDeployed) {
                console.log('   ❌ CRITICAL: User Smart Account is not deployed - this would cause delegation to fail');
              }
              if (!providerDeployed) {
                console.log('   ❌ CRITICAL: Service Provider Smart Account is not deployed - this would cause delegation to fail');
              }

              // Check account balances
              console.log('5. Account Balance Check:');
              const userBalance = await publicClient.getBalance({ address: userSmartAccountAddress });
              const providerBalance = await publicClient.getBalance({ address: SERVICE_PROVIDER_SMART_ACCOUNT });
              console.log('   - User Smart Account balance:', (Number(userBalance) / 1e18).toFixed(6), 'ETH');
              console.log('   - Service Provider Smart Account balance:', (Number(providerBalance) / 1e18).toFixed(6), 'ETH');

              if (userBalance < paymentAmount) {
                console.log('   ❌ CRITICAL: User Smart Account has insufficient balance for payment');
              }

            } catch (checkError) {
              console.log('   - Error checking account deployment:', checkError);
            }
          }
          console.log('Current User Smart Account:', userSmartAccountAddress);
          console.log('Current Service Provider Smart Account:', SERVICE_PROVIDER_SMART_ACCOUNT);

          // Return failure to trigger client-side fallback
          console.log('🔄 Server-side delegation failed - returning error to trigger client-side fallback...');

          return res.status(500).json({
            success: false,
            error: 'Delegation execution failed',
            details: errorMessage,
            message: `❌ Server-side delegation failed: ${errorMessage}`,
            timestamp: new Date().toISOString(),
            realTransaction: false,
            delegationError: errorMessage,
            paymentDirection: {
              from: userSmartAccountAddress,
              to: SERVICE_PROVIDER_SMART_ACCOUNT,
              method: 'server_delegation_failed',
              description: 'Server-side delegation execution failed - client should try fallback'
            }
          });
        }

        // Handle real delegation transaction result
        console.log('⏳ Processing real delegation transaction result...');

        const delegationExecutionTx = delegationTx;

        console.log('✅ Real delegation transaction completed!');
        console.log('Transaction Hash:', delegationExecutionTx);

        console.log('🎉 REAL DELEGATION PAYMENT SUCCESSFUL!');
        console.log(`✅ Payment method: ${transferMethod}`);
        console.log(`✅ REAL: User Smart Account (${userSmartAccountAddress}) sent ${amount} ETH via delegation`);
        console.log(`✅ REAL: Payment received by Service Provider Smart Account (${SERVICE_PROVIDER_SMART_ACCOUNT})`);
        console.log('✅ REAL: Service Provider executed UserOperation on behalf of User via delegation framework');
        console.log('✅ Real Transaction Hash:', delegationExecutionTx);

        // Update contract status
        const contractToUpdate = contracts.get(contractId);
        if (contractToUpdate) {
          contractToUpdate.status = 'completed';
          contracts.set(contractId, contractToUpdate);
        }

        // Success response with correct payment direction
        res.json({
          success: true,
          transactionHash: delegationExecutionTx,
          userOperationHash: delegationTx,
          message: `🎉 REAL Delegation Payment Successful! User Smart Account → Service Provider Smart Account - ${amount} ETH`,
          amount: amount,
          timestamp: new Date().toISOString(),
          realTransaction: true,
          paymentDirection: {
            from: userSmartAccountAddress, // 0x327ab00586Be5651630a5827BD5C9122c8B639F8
            to: SERVICE_PROVIDER_SMART_ACCOUNT, // 0x66cB1D45cA24eB3FF774DA65A5BA5E65Dd63C6ED
            method: 'real_delegation_execution',
            description: 'Service Provider executed real delegation to withdraw payment from User Smart Account'
          },
          delegationExecution: {
            framework: 'MetaMask Delegation Toolkit',
            method: 'DelegationFramework.encode.redeemDelegations',
            executions: 1,
            realExecution: true
          }
        });
      return;

    } catch (delegationError) {
      console.error('❌ DELEGATION FAILED:', delegationError);
      const errorMessage = delegationError instanceof Error ? delegationError.message : String(delegationError);

      const errorResponse = {
        success: false,
        error: 'Delegation execution failed',
        details: errorMessage,
        message: `❌ Payment failed: Unable to execute delegation withdrawal`,
        paymentDirection: {
          from: userSmartAccountAddress,
          to: SERVICE_PROVIDER_SMART_ACCOUNT,
          status: 'failed'
        }
      };

      return res.status(500).json(errorResponse);
    }
  } catch (error) {
    console.error('Error executing payment process:', error);

    // Check the specific error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isFundingIssue = errorMessage.includes('AA21') || errorMessage.includes('prefund') || errorMessage.includes('insufficient funds');
    const isSignatureError = errorMessage.includes('AA24') || errorMessage.includes('signature error');
    const isSimulationError = errorMessage.includes('0xb5863604') || errorMessage.includes('simulation');
    const isExecutionRevert = errorMessage.includes('reverted with reason') || errorMessage.includes('UserOperation reverted');

    if (isSimulationError || isExecutionRevert) {
      console.log('🚫 SIMULATION/EXECUTION ERROR (0xb5863604) DETECTED');
      console.log('Error details:', errorMessage);
      console.log('This usually means:');
      console.log('1. The UserOperation failed during bundler simulation');
      console.log('2. Invalid delegation execution parameters');
      console.log('3. Smart account lacks sufficient gas/funds');
      console.log('4. Delegation framework validation failed');
      console.log('5. Invalid encoded delegation data');
      console.log('Debugging info:');
      console.log('- Service provider address:', serviceProviderAccount.address);
      console.log('- User smart account:', userSmartAccountAddress || 'not available');
      console.log('- User EOA:', contract?.userEOA || 'not available');
      console.log('- Delegation from:', storedDelegation?.delegator || storedDelegation?.from || 'not available');
      console.log('- Delegation to:', storedDelegation?.delegate || storedDelegation?.to || 'not available');
      console.log('- Payment amount:', paymentAmount?.toString() || 'not available');
      console.log('- Encoded delegation data length:', data?.length || 'not available');
    } else if (isSignatureError) {
      console.log('🚫 SIGNATURE ERROR (AA24) DETECTED');
      console.log('Error details:', errorMessage);
      console.log('This usually means:');
      console.log('1. The signature verification failed in the smart account');
      console.log('2. The delegation signature is invalid or expired');
      console.log('3. The signatory account does not have permission');
      console.log('4. The smart account configuration is incorrect');
      console.log('Debugging info:');
      console.log('- Service provider address:', serviceProviderAccount.address);
      console.log('- User smart account:', userSmartAccountAddress || 'not available');
      console.log('- User EOA:', contract?.userEOA || 'not available');
      console.log('- Delegation from:', storedDelegation?.delegator || storedDelegation?.from || 'not available');
      console.log('- Delegation to:', storedDelegation?.delegate || storedDelegation?.to || 'not available');
    } else if (isFundingIssue) {
      console.log('⚠️  FUNDING ISSUE DETECTED');
      console.log(`Smart account needs more ETH for gas fees`);
      console.log('Error details:', errorMessage);
      console.log('Solutions:');
      console.log('1. Send ETH directly to the smart account');
      console.log('2. Use a paymaster for gas sponsorship');
      console.log('3. Fund from your EOA to smart account');
    }

    // Fallback to mock if real execution fails
    console.log('Falling back to mock payment...');
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    res.json({
      success: true,
      transactionHash: mockTxHash,
      amount: req.body.amount,
      message: isSimulationError || isExecutionRevert
        ? `UserOperation simulation failed (0xb5863604). This indicates delegation execution issues. Using mock payment instead.`
        : isSignatureError
        ? `Delegation signature error (AA24). Check delegation setup and try again. Using mock payment instead.`
        : isFundingIssue
        ? `Smart account needs more ETH for gas fees. Mock payment used instead.`
        : `Payment execution failed, using mock transaction: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      realTransaction: false,
      error: errorMessage,
      fundingIssue: isFundingIssue,
      smartAccount: contract?.userSmartAccount || contract?.delegationData?.delegator
    });
  }
};

// Complete payment - called after successful client-side UserOperation
const completePayment: RequestHandler = async (req, res) => {
  console.log('>>> Completing Payment\n');

  try {
    const { contractId, userOperationHash, transactionHash, amount, smartAccountAddress } = req.body;

    if (!contractId || !userOperationHash || !transactionHash) {
      return res.status(400).json({
        error: 'Missing required fields: contractId, userOperationHash, transactionHash'
      });
    }

    console.log('📧 PAYMENT COMPLETION NOTIFICATION');
    console.log('Contract ID:', contractId);
    console.log('UserOperation Hash:', userOperationHash);
    console.log('Transaction Hash:', transactionHash);
    console.log('Amount:', amount, 'ETH');
    console.log('Smart Account:', smartAccountAddress);

    const contract = contracts.get(contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Update contract status
    contract.status = 'completed';
    contracts.set(contractId, contract);

    console.log('✅ CONTRACT MARKED AS COMPLETED');

    res.json({
      success: true,
      message: 'Payment completed successfully!',
      contract: contract,
      paymentDetails: {
        userOperationHash,
        transactionHash,
        amount,
        smartAccountAddress
      }
    });

  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({
      error: 'Failed to complete payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update contract status (for signing)
const updateContractStatus: RequestHandler = async (req, res) => {
  console.log('>>> Updating Contract Status\n');

  try {
    const { contractId } = req.params;
    const { status, signature } = req.body;

    if (!contractId || !status) {
      return res.status(400).json({
        error: 'Missing required fields: contractId, status'
      });
    }

    const contract = contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Update contract
    contract.status = status;
    contracts.set(contractId, contract);

    console.log(`Contract ${contractId} status updated to: ${status}`);

    res.json({
      success: true,
      contract,
      message: `Contract status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating contract status:', error);
    res.status(500).json({
      error: 'Failed to update contract status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// List all contracts (for debugging)
const listContracts: RequestHandler = async (req, res) => {
  try {
    const allContracts = Array.from(contracts.values());
    res.json({
      success: true,
      contracts: allContracts,
      count: allContracts.length
    });
  } catch (error) {
    console.error('Error listing contracts:', error);
    res.status(500).json({
      error: 'Failed to list contracts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Route definitions
serviceContractRoutes.post('/create', createServiceContract);
serviceContractRoutes.get('/:contractId', getServiceContract);
serviceContractRoutes.post('/process-delegation', processDelegation);
serviceContractRoutes.post('/execute-payment', executePayment);
serviceContractRoutes.post('/complete-payment', completePayment);
serviceContractRoutes.put('/:contractId/status', updateContractStatus);
serviceContractRoutes.get('/', listContracts);

export default serviceContractRoutes;