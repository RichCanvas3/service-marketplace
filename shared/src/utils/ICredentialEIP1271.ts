import {
  type CredentialPayload,
  type IAgentContext,
  type IDIDManager,
  type IKey,
  type IKeyManager,
  type IPluginMethodMap,
  type IResolver,
  type PresentationPayload,
  type UsingResolutionOptions,
  type VerifiableCredential,
  type VerifiablePresentation,
} from '@veramo/core-types'

import { type AAKmsSigner } from './AAKmsSigner.js'


export interface ICredentialIssuerEIP1271 extends IPluginMethodMap {

  createVerifiableCredentialEIP1271(
    args: ICreateVerifiableCredentialEIP1271Args,
    context: IRequiredContext,
  ): Promise<VerifiableCredential>


  verifyCredentialEIP1271(args: IVerifyCredentialEIP1271Args, context: IRequiredContext): Promise<boolean>

  createVerifiablePresentationEIP1271(
    args: ICreateVerifiablePresentationEIP1271Args,
    context: IRequiredContext,
  ): Promise<VerifiablePresentation>

  verifyPresentationEIP1271(args: IVerifyPresentationEIP1271Args, context: IRequiredContext): Promise<boolean>
}


export interface ICreateVerifiableCredentialEIP1271Args extends UsingResolutionOptions {
  credential: CredentialPayload
  keyRef?: string
  signer?: AAKmsSigner
}

export interface ICreateVerifiablePresentationEIP1271Args extends UsingResolutionOptions {
  presentation: PresentationPayload
  keyRef?: string
  signer?: AAKmsSigner
}

export interface IVerifyCredentialEIP1271Args extends UsingResolutionOptions {
  credential: VerifiableCredential
}

export interface IVerifyPresentationEIP1271Args extends UsingResolutionOptions {
  presentation: VerifiablePresentation
}

export type IRequiredContext = IAgentContext<IResolver & IKeyManager & IDIDManager>