// src/app/services/evm.ts
export async function connectMetaMask(): Promise<string> {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not found");
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts?.[0]) throw new Error("No MetaMask accounts found");
    return accounts[0];
}

export async function signEvm(address: string, message: string): Promise<string> {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not found");
    return await eth.request({ method: "personal_sign", params: [message, address] });
}
