// src/app/services/polkadot.ts
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

let api: ApiPromise | null = null;

export const connectToPolkadot = async (): Promise<ApiPromise> => {
  if (api) return api;
  
  const provider = new WsProvider('wss://westend-rpc.polkadot.io');
  api = await ApiPromise.create({ provider });
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
  return accounts;
};

export const getApi = () => api;
