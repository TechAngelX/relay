// src/app/api/identity/link/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import { signatureVerify } from "@polkadot/util-crypto";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const NONCES_PATH = path.join(DATA_DIR, "nonces.json");
const IDENTITIES_PATH = path.join(DATA_DIR, "identities.json");

function readFileSafe(file: string): Record<string, any> {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeFileSafe(file: string, obj: any) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

export async function POST(req: Request) {
  const { substrate, evm, username, sigEvm, sigSub, nonce } = await req.json();

  if (!substrate || !evm || !sigEvm || !sigSub || !nonce) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const nonces = readFileSafe(NONCES_PATH);
  const key = `${substrate}::${evm.toLowerCase()}`;
  if (nonces[key] !== nonce) {
    return NextResponse.json({ error: "Invalid nonce" }, { status: 400 });
  }

  const message = [
    "Relay Identity Link",
    `substrate: ${substrate}`,
    `evm: ${evm}`,
    `nonce: ${nonce}`,
    username ? `username: ${username}` : null,
  ]
      .filter(Boolean)
      .join("\n");

  try {
    const recovered = ethers.verifyMessage(message, sigEvm);
    if (recovered.toLowerCase() !== evm.toLowerCase()) {
      return NextResponse.json({ error: "EVM signature mismatch" }, { status: 400 });
    }

    const subVerify = signatureVerify(message, sigSub, substrate);
    if (!subVerify.isValid) {
      return NextResponse.json({ error: "Invalid Substrate signature" }, { status: 400 });
    }

    const identities = readFileSafe(IDENTITIES_PATH);
    const record = {
      substrate,
      evm: ethers.getAddress(evm),
      username: username?.toLowerCase() || null,
      verifiedAt: new Date().toISOString(),
    };
    identities[key] = record;

    nonces[key] = Math.floor(Math.random() * 1e12).toString();
    writeFileSafe(NONCES_PATH, nonces);
    writeFileSafe(IDENTITIES_PATH, identities);

    return NextResponse.json({ ok: true, record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
