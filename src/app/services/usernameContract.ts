// src/app/services/usernameContract.ts
// Handles MetaMask connection and username registry interaction (no ethers).

// The registry contract address you might use later
const REGISTRY_CONTRACT_ADDRESS = "0x0E4716Dc8b9c6a6DC32867b50042d71C181B87C2";

/**
 * Utility to ensure MetaMask is available and connected.
 */
const getEVMProvider = async () => {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not detected. Please install MetaMask.");
  }

  // Request wallet connection (shows MetaMask popup)
  // @ts-ignore
  await window.ethereum.request?.({ method: "eth_requestAccounts" });

  // Return the injected MetaMask provider
  return window.ethereum;
};

/**
 * Simulated username registration — replace with your on-chain logic later.
 */
export const registerUsernameOnChain = async (username: string): Promise<string> => {
  if (!username.trim()) {
    throw new Error("Username cannot be empty.");
  }

  const provider = await getEVMProvider();

  console.log(`Registering username "${username}" via MetaMask mock...`, provider);

  // Simulate blockchain transaction latency
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return a fake transaction hash so UI behaves the same
  const fakeTxHash = "0x" + Math.random().toString(16).substring(2, 10).padEnd(8, "0");

  console.log(`Mock username registration complete. TX: ${fakeTxHash}`);

  return fakeTxHash;
};
