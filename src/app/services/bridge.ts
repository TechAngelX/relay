// src/app/services/bridge.ts
export async function fetchNonce(params: { substrate: string; evm: string }) {
    const q = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/identity/nonce?${q}`);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as { nonce: string };
}

export async function linkIdentity(payload: {
    substrate: string;
    evm: string;
    username?: string;
    sigEvm: string;
    sigSub: string;
    nonce: string;
}) {
    const res = await fetch(`/api/identity/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
}
