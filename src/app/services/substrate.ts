// src/app/services/substrate.ts
import { web3Enable, web3Accounts, web3FromAddress } from "@polkadot/extension-dapp";

export async function connectPolkadot(): Promise<string> {
    const extensions = await web3Enable("Relay Identity Link");
    if (!extensions.length) throw new Error("Polkadot.js extension not found");
    const accounts = await web3Accounts();
    if (!accounts.length) throw new Error("No Polkadot accounts found");
    return accounts[0].address;
}
export async function signSubstrate(address: string, message: string): Promise<string> {
    const injector = await web3FromAddress(address);
    if (!injector?.signer?.signRaw) {
        throw new Error("No signer available from Polkadot.js extension");
    }

    const result = await injector.signer.signRaw({
        address,
        data: message,
        type: "bytes",
    });
    return result.signature;
}
