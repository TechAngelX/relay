// src/app/services/polkadot.ts
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { encodeAddress } from '@polkadot/util-crypto';

// CORRECTED: Using the Substrate Native WSS Endpoint for API Initialization.
// The Polkadot.js ApiPromise MUST connect to a Substrate RPC.
const PASSET_HUB_WS_ENDPOINT = 'wss://passet-hub-paseo.ibp.network'; 
// Paseo/Generic Substrate prefix
const PASEO_SS58_PREFIX = 42; 

let api: ApiPromise | null = null;

export const connectToPolkadot = async (): Promise<ApiPromise> => {
  if (api) return api;
  
  const provider = new WsProvider(PASSET_HUB_WS_ENDPOINT);
  api = await ApiPromise.create({ 
    provider,
    noInitWarn: true,
  });
  return api;
};

export const connectWallet = async (): Promise<InjectedAccountWithMeta[]> => {
  const extensions = await web3Enable('Relay');
  if (extensions.length === 0) {
    throw new Error('No Polkadot extension found. Please install Polkadot.js extension.');
  }
  const accounts = await web3Accounts();
  if (accounts.length === 0) {
    throw new Error('No accounts found. Please create an account in Polkadot.js extension.');
  }
  
  // Format addresses to the Paseo's SS58 prefix (42) for display consistency
  return accounts.map(account => ({
    ...account,
    address: encodeAddress(account.address, PASEO_SS58_PREFIX),
  }));
};

export const getApi = () => api;
