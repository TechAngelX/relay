// src/app/services/polkadot.ts
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { encodeAddress } from '@polkadot/util-crypto';

const PASSET_HUB_WS_ENDPOINT = 'wss://passet-hub-paseo.ibp.network';
const PASEO_SS58_PREFIX = 42;

let api: ApiPromise | null = null;

export const connectToPolkadot = async (): Promise<ApiPromise | null> => {
  if (api) return api;

  try {
    const provider = new WsProvider(PASSET_HUB_WS_ENDPOINT, false);

    provider.on('error', () => {});

    api = await ApiPromise.create({
      provider,
      noInitWarn: true,
    });

    return api;
  } catch (error) {
    return null;
  }
};

export const connectWallet = async (): Promise<InjectedAccountWithMeta[]> => {
  const extensions = await web3Enable('Relay');

  if (extensions.length === 0) {
    throw new Error('No Polkadot extension found. Please install Polkadot.js extension.');
  }

  await new Promise(resolve => setTimeout(resolve, 300));

  const accounts = await web3Accounts();

  if (accounts.length === 0) {
    throw new Error('No accounts found. Please authorise this website in the Polkadot.js extension (click the extension icon, then click the gear icon and ensure "Relay" is in the allowed list), then refresh the page.');
  }

  return accounts.map(account => ({
    ...account,
    address: encodeAddress(account.address, PASEO_SS58_PREFIX),
  }));
};

export const getApi = () => api;
