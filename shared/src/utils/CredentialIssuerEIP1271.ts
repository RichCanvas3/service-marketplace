import {

  type ICredentialIssuer,
  type ICreateVerifiableCredentialArgs,
  type ICreateVerifiablePresentationArgs,
  type IVerifyPresentationArgs,
  type IVerifyCredentialArgs,
} from '@veramo/core'

import {
  type CredentialPayload,
  type IAgentPlugin,
  type IIdentifier,
  type IKey,
  type PresentationPayload,
  type VerifiableCredential,
  type VerifiablePresentation,
} from '@veramo/core-types'



import { 
  type ICredentialIssuerEIP1271,
  type ICreateVerifiableCredentialEIP1271Args,
  type ICreateVerifiablePresentationEIP1271Args,
  type IVerifyCredentialEIP1271Args,
  type IVerifyPresentationEIP1271Args,
  type IRequiredContext,
 } from './ICredentialEIP1271.js'

 import {
  extractIssuer,
  getChainId,
  getEthereumAddress,
  intersect,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  //mapIdentifierKeysToDoc,
  processEntryToArray,
  removeDIDParameters,
  resolveDidOrThrow,
} from '@veramo/utils'



import { TypedDataEncoder,  } from 'ethers'
import { createPublicClient, http,  encodeFunctionData,  } from "viem";
import { optimism, mainnet, sepolia } from "viem/chains";

import { getEthTypesFromInputDoc } from 'eip-712-types-generation'

export type AADidParts = {
    did: string;
    method: string;
    namespace: string;
    chainId: string;
    address: string;
    fragment?: string;
  };

export class CredentialIssuerEIP1271 implements IAgentPlugin {
  readonly methods: ICredentialIssuerEIP1271

  constructor() {
    this.methods = {

      createVerifiableCredentialEIP1271: this.createVerifiableCredentialEIP1271.bind(this),
      createVerifiablePresentationEIP1271: this.createVerifiablePresentationEIP1271.bind(this),
      verifyCredentialEIP1271: this.verifyCredentialEIP1271.bind(this),
      verifyPresentationEIP1271: this.verifyPresentationEIP1271.bind(this),

    }

  }




  parseAADid(didUrl: string): AADidParts {
      const [baseDid, fragment] = didUrl.split("#");
      const parts = baseDid.split(":");

      if (parts.length !== 5 || parts[0] !== "did" || parts[1] !== "aa") {
        throw new Error(`Invalid did:aa format: ${didUrl}`);
      }

      const [, method, namespace, chainId, address] = parts;

      return {
        did: baseDid,
        method,
        namespace,
        chainId,
        address,
        fragment,
      };
    }



  async createVerifiableCredentialEIP1271(
    args: ICreateVerifiableCredentialEIP1271Args,
    context: IRequiredContext
  ) : Promise<VerifiableCredential> {

    const credentialContext = processEntryToArray(
      args?.credential?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )

    const credentialType = processEntryToArray(args?.credential?.type, 'VerifiableCredential')
    let issuanceDate = args?.credential?.issuanceDate || new Date().toISOString()
    if (issuanceDate instanceof Date) {
      issuanceDate = issuanceDate.toISOString()
    }

    const issuer = args.credential.issuer

    if (!issuer || typeof issuer === 'string') {
      throw new Error('Issuer must be an object with an "id" and "did" signer')
    }

    console.info("Creating Verifiable Credential EIP1271 with issuer:", issuer)
    const identifier = await context.agent.didManagerGet({ did: issuer.id })

    const aaDidParts = this.parseAADid(identifier.did);

    let chainId
    try {
      chainId = aaDidParts.chainId
    } catch (e) {
      chainId = 11155111
    }

    // point to a DID controller that supports smart contract-based signature verification

    const credential: CredentialPayload = {
      ...args?.credential,
      '@context': credentialContext,
      type: credentialType,
      issuanceDate,
      proof: {
        verificationMethod: identifier.did + "#ethereumAddress",
        created: issuanceDate,
        proofPurpose: 'assertionMethod',
        type: 'EthereumEip712Signature2021',
      },
    }

    const message = credential
    const domain = {
      chainId,
      name: 'VerifiableCredential',
      version: '1',
    }

    const primaryType = 'VerifiableCredential' 
    const allTypes = getEthTypesFromInputDoc(credential, primaryType)
    const types = { ...allTypes }

    const signature = await args?.signer?.signTypedData(domain, types, message)

    credential['proof']['proofValue'] = signature
    credential['proof']['eip712'] = {
      domain,
      types: allTypes,
      primaryType,
    }

    return credential as VerifiableCredential
  }

  async createVerifiablePresentationEIP1271(
    args: ICreateVerifiablePresentationEIP1271Args,
    context: IRequiredContext
  ) : Promise<VerifiablePresentation> {

    console.info("Creating Verifiable Presentation EIP1271 with args:", args)


    const presentationContext = processEntryToArray(
      args?.presentation?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )
    const presentationType = processEntryToArray(args?.presentation?.type, 'VerifiablePresentation')
    let issuanceDate = args?.presentation?.issuanceDate || new Date().toISOString()
    if (issuanceDate instanceof Date) {
      issuanceDate = issuanceDate.toISOString()
    }

    const presentation: PresentationPayload = {
      ...args?.presentation,
      '@context': presentationContext,
      type: presentationType,
      issuanceDate,
    }

    if (!isDefined(args.presentation.holder)) {
      throw new Error('invalid_argument: presentation.holder must not be empty')
    }

    if (args.presentation.verifiableCredential) {

      presentation.verifiableCredential = args.presentation.verifiableCredential.map((cred) => {
        // map JWT credentials to their canonical form
        if (typeof cred === 'string') {
          return cred
        } else if (cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return JSON.stringify(cred)
        }
      })
    }

    const holder = removeDIDParameters(presentation.holder)

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: holder })
    } catch (e) {
      throw new Error('invalid_argument: presentation.holder must be a DID managed by this agent')
    }

    console.info("identifier: ", identifier)

    const aaDidParts = this.parseAADid(identifier.did);

    let chainId
    try {
      chainId = aaDidParts.chainId
    } catch (e) {
      chainId = 11155111
    }



    presentation['proof'] = {
      verificationMethod: aaDidParts.address + "#ethereumAddress",
      created: issuanceDate,
      proofPurpose: 'assertionMethod',
      type: 'EthereumEip712Signature2021',
    }

    const message = presentation
    const domain = {
      chainId,
      name: 'VerifiablePresentation',
      version: '1',
    }

    const primaryType = 'VerifiablePresentation'
    const allTypes = getEthTypesFromInputDoc(presentation, primaryType)
    const types = { ...allTypes }

    const signature = await args?.signer?.signTypedData(domain, types, message)

    presentation.proof.proofValue = signature

    presentation.proof.eip712 = {
      domain,
      types: allTypes,
      primaryType,
    }

    return presentation as VerifiablePresentation
  }

  async verifyCredentialEIP1271(args: IVerifyCredentialEIP1271Args, context: IRequiredContext) : Promise<boolean> {

    console.info("verifyCredentialEIP1271 called with args: ", args)

    // check that proof exists
    const { credential } = args
    if (!credential.proof || !credential.proof.proofValue)
      throw new Error('invalid_argument: proof is undefined')

    const { proof, ...signingInput } = credential
    const { proofValue, eip712, ...verifyInputProof } = proof
    const verificationMessage = {
      ...signingInput,
      proof: verifyInputProof,
    }

    const compat = {
      ...eip712,
    }
    compat.types = compat.types || compat.messageSchema
    if (!compat.primaryType || !compat.types || !compat.domain) {
      throw new Error('invalid_argument: proof is missing expected properties')
    }
      

    const filteredTypes = { ...compat.types };
    delete filteredTypes.EIP712Domain;

    const digest  = TypedDataEncoder.hash(compat.domain, filteredTypes, verificationMessage);
    const signature = proofValue
    
    const isValidSignatureData = encodeFunctionData({
          abi: [
            {
              name: "isValidSignature",
              type: "function",
              inputs: [
                { name: "_hash", type: "bytes32" },
                { name: "_signature", type: "bytes" },
              ],
              outputs: [{ type: "bytes4" }],
              stateMutability: "view",
            },
          ],
          functionName: "isValidSignature",
          args: [digest as `0x${string}`, signature],
        });
    
    const publicClient = createPublicClient({
              chain: sepolia,
              transport: http(),
            });


    const did = (credential.issuer as any).id
    console.info(">>>>>>>>>>>> credential issuer did: ", did)
    
    const address = this.parseAADid(did as `0x${string}`).address;
    console.info("address used to validate signature: ", address)

    // validate signature using contract EIP-1271
    const { data: isValidSignature } = await publicClient.call({
        account: address as `0x${string}`,
        data: isValidSignatureData,
        to: address as `0x${string}`,
    });

    console.info("isValidSignature: ", isValidSignature)
    if (!isValidSignature?.startsWith('0x1626ba7e')) {
      console.info("********** Verifiable Credential Signature is not valid according to EIP-1271")
      return false
    }
    console.info("signature is valid according to EIP-1271")

    // verify the issuer did
    const issuer = extractIssuer(credential)
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: credential.issuer must not be empty')
    }

    const aa = await context.agent.resolveDid({ didUrl: issuer, options: args.resolutionOptions })
    const didDocument = await resolveDidOrThrow(issuer, context, args.resolutionOptions)

    if (didDocument.verificationMethod && address) {
      for (const verificationMethod of didDocument.verificationMethod) {
        const ethAddress = getEthereumAddress(verificationMethod)?.toLowerCase()
        if (ethAddress === address.toLowerCase()) {
          return true
        }
      }
    } else {
      throw new Error('resolver_error: issuer DIDDocument does not contain any verificationMethods')
    }

    return false
  }

  async verifyPresentationEIP1271(args: IVerifyPresentationEIP1271Args, context: IRequiredContext) : Promise<boolean> {
    // check that proof exists
    const { presentation } = args
    if (!presentation.proof || !presentation.proof.proofValue)
      throw new Error('invalid_argument: proof is undefined')

    const { proof, ...signingInput } = presentation
    const { proofValue, eip712, ...verifyInputProof } = proof
    const verificationMessage = {
      ...signingInput,
      proof: verifyInputProof,
    }

    const compat = {
      ...eip712,
    }
    compat.types = compat.types || compat.messageSchema
    if (!compat.primaryType || !compat.types || !compat.domain)
      throw new Error('invalid_argument: proof is missing expected properties')

    const filteredTypes = { ...compat.types };
    delete filteredTypes.EIP712Domain;

    const digest  = TypedDataEncoder.hash(compat.domain, filteredTypes, verificationMessage);
    const signature = proofValue
    
    const isValidSignatureData = encodeFunctionData({
          abi: [
            {
              name: "isValidSignature",
              type: "function",
              inputs: [
                { name: "_hash", type: "bytes32" },
                { name: "_signature", type: "bytes" },
              ],
              outputs: [{ type: "bytes4" }],
              stateMutability: "view",
            },
          ],
          functionName: "isValidSignature",
          args: [digest as `0x${string}`, signature],
        });
    
    const publicClient = createPublicClient({
              chain: sepolia,
              transport: http(),
            });



    const clientAddress = this.parseAADid(presentation.holder).address;

    // validate signature using contract EIP-1271
    const { data: isValidSignature } = await publicClient.call({
        account: clientAddress as `0x${string}`,
        data: isValidSignatureData,
        to: clientAddress as `0x${string}`,
    });

    if (!isValidSignature?.startsWith('0x1626ba7e')) {
      console.info("*********** Verifiable Presentation Signature is not valid according to EIP-1271")
      console.info("isValidSignature: ", isValidSignature)
      return false
    }

    // verify the client did
    const clientDid = extractIssuer(presentation)
    if (!clientDid || typeof clientDid === 'undefined') {
      throw new Error('invalid_argument: presentation.holder must not be empty')
    }

    console.info("gator client AA Did: ", clientDid)
    const clientDidDocument = await resolveDidOrThrow(clientDid, context, args.resolutionOptions)

    if (clientDidDocument.verificationMethod && clientAddress) {
      console.info("gator client didDocument.verificationMethod: ", clientDidDocument.verificationMethod)
      for (const verificationMethod of clientDidDocument.verificationMethod) {
        console.info("verificationMethod: ", verificationMethod)
        const ethAddress = getEthereumAddress(verificationMethod)?.toLowerCase()
        console.info("ethAddress: ", ethAddress)
        if (getEthereumAddress(verificationMethod)?.toLowerCase() === clientAddress.toLowerCase()) {
          return true
        }
      }
    } else {
      throw new Error('resolver_error: holder DIDDocument does not contain any verificationMethods')
    }

    return false
  }
}
