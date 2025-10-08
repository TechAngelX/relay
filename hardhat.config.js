import "@nomicfoundation/hardhat-toolbox";
import "@parity/hardhat-polkadot";
import { vars } from "hardhat/config.js";

export default {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    passetHub: {
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      chainId: 420420422,
      accounts: [vars.get("PRIVATE_KEY")],
      gasPrice: 1000000000,
      gas: 6000000
    }
  }
};
