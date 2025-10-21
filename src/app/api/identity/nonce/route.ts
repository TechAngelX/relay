// src/app/api/identity/nonce/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const NONCES_PATH = path.join(DATA_DIR, "nonces.json");

function readFileSafe(file: string): Record<string, string> {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeFileSafe(file: string, obj: any) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const substrate = searchParams.get("substrate");
    const evm = searchParams.get("evm");

    if (!substrate || !evm || !/^0x[0-9a-fA-F]{40}$/.test(evm)) {
        return NextResponse.json({ error: "Bad addresses" }, { status: 400 });
    }

    const nonces = readFileSafe(NONCES_PATH);
    const key = `${substrate}::${evm.toLowerCase()}`;
    if (!nonces[key]) {
        nonces[key] = Math.floor(Math.random() * 1e12).toString();
        writeFileSafe(NONCES_PATH, nonces);
    }

    return NextResponse.json({ nonce: nonces[key] });
}
