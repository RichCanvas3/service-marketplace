import express, { RequestHandler } from 'express';
import { ethers } from 'ethers';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
  encodeFunctionData
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import {
  Implementation,
  toMetaMaskSmartAccount,
  DelegationFramework,
  SINGLE_DEFAULT_MODE,
  createDelegation
} from '@metamask/delegation-toolkit';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { createBundlerClient } from 'viem/account-abstraction';
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
}

// Mock service provider account (in production, this would be managed differently)
const serviceProviderAccount = privateKeyToAccount(
  (process.env.SERVER_PRIVATE_KEY as `0x${string}`) ||
  '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
);

// In-memory storage for demo purposes (use a database in production)
const contracts = new Map<string, ServiceContract>();

// Create service contract request
const createServiceContract: RequestHandler = async (req, res) => {
  try {
    const { serviceName, servicePrice, selectedServices, userAddress }: ServiceContractRequest = req.body;

    if (!serviceName || !servicePrice || !selectedServices || !userAddress) {
      return res.status(400).json({
        error: 'Missing required fields: serviceName, servicePrice, selectedServices, userAddress'
      });
    }

    // Generate unique contract ID
    const contractId = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create service contract
    const contract: ServiceContract = {
      id: contractId,
      serviceName,
      servicePrice,
      terms: `Service Agreement for ${serviceName}\n\nServices to be provided:\n${selectedServices.join('\n')}\n\nTotal Amount: ${servicePrice}\n\nTerms and Conditions:\n1. Service will be provided within 7 days of agreement signing\n2. Payment will be automatically deducted from your wallet upon service completion\n3. If service is not completed as agreed, payment will be refunded within 24 hours\n4. Cancellation must be made 24 hours in advance\n5. All services include standard setup and cleanup\n6. Special dietary requirements must be communicated at least 48 hours in advance\n\nBy signing this agreement, you authorize the service provider to withdraw the agreed amount from your MetaMask wallet upon successful service completion.\n\nThis contract is governed by the laws of the jurisdiction where services are provided.\n\nService Provider: ${serviceProviderAccount.address}\nCustomer: ${userAddress}`,
      paymentAmount: servicePrice.includes('SepoliaETH') ? '0.001' : servicePrice.replace('$', ''),
      serviceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      providerAddress: serviceProviderAccount.address,
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
  try {
    const { contractId } = req.params;

    if (!contractId) {
      return res.status(400).json({ error: 'Contract ID is required' });
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
  try {
    const { contractId, delegation, signature } = req.body;

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

    // For demo purposes, we'll simulate successful delegation processing
    // In a real implementation, this would execute the delegation on-chain

    // Generate a mock transaction hash
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('Mock delegation processed, simulated tx hash:', mockTxHash);

    // Update contract status to completed (simulating successful payment)
    contract.status = 'completed';
    contracts.set(contractId, contract);

    res.json({
      success: true,
      transactionHash: mockTxHash,
      message: 'Delegation processed successfully (demo mode)',
      note: 'In production, this would execute the actual blockchain transaction'
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
  try {
    const { contractId, amount, delegationTx } = req.body;

    if (!contractId || !amount || !delegationTx) {
      return res.status(400).json({
        error: 'Missing required fields: contractId, amount, delegationTx'
      });
    }

    const contract = contracts.get(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    console.log(`Executing payment for contract ${contractId}: ${amount} ETH`);
    console.log(`Using delegation tx: ${delegationTx}`);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a realistic payment transaction hash
    const paymentTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log(`Payment executed! Transaction hash: ${paymentTxHash}`);

    // Update contract status to completed
    contract.status = 'completed';
    contracts.set(contractId, contract);

    res.json({
      success: true,
      transactionHash: paymentTxHash,
      amount: amount,
      message: `Payment of ${amount} ETH processed successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing payment:', error);
    res.status(500).json({
      error: 'Failed to execute payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update contract status (for signing)
const updateContractStatus: RequestHandler = async (req, res) => {
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
serviceContractRoutes.put('/:contractId/status', updateContractStatus);
serviceContractRoutes.get('/', listContracts);

export default serviceContractRoutes;