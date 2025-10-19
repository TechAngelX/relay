// src/app/services/usernameContract.ts
// Handles MetaMask connection and username registry contract interaction.
import { ethers } from 'ethers';

// --- CONFIGURATION (Based on your README) ---
const REGISTRY_CONTRACT_ADDRESS = '0x0E4716Dc8b9c6a6DC32867b50042d71C181B87C2';

// Minimal ABI for the registerUsername function
const REGISTRY_ABI = [
  "function registerUsername(string memory username)",
  "function getAddress(string memory username) view returns (address)"
];

// Utility to get the connected MetaMask signer/provider (Ethers v5)
const getEVMProvider = async () => {
  if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or EVM wallet not found. Please install MetaMask.');
  }
  
  // Request accounts to trigger MetaMask pop-up and connect
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  // Use Web3Provider for ethers v5
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  return { provider, signer };
};

export const registerUsernameOnChain = async (username: string) => {
  if (!username) throw new Error("Username cannot be empty.");
  
  const { signer } = await getEVMProvider();
  
  // Create a contract instance connected to the MetaMask signer
  const registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_ABI, signer);
  console.log(`Registering username "${username}" via MetaMask...`);
  
  // Call the registerUsername function on the smart contract
  const tx = await registryContract.registerUsername(username, {
      gasLimit: 300000
  });
  
  console.log('Transaction sent:', tx.hash);
  await tx.wait();
  console.log('Username registration transaction confirmed.');
  
  return tx.hash;
};
