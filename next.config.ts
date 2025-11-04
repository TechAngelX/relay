// /next.config.ts

import type { NextConfig } from "next";
import { execSync } from "child_process";

const commit = execSync("git rev-parse --short HEAD").toString().trim();
const version = execSync("git describe --tags --always").toString().trim();
const buildDate = new Date().toISOString();

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_BUILD_COMMIT: commit,
        NEXT_PUBLIC_BUILD_VERSION: version,
        NEXT_PUBLIC_BUILD_DATE: buildDate,
    },
    experimental: {
        // @ts-expect-error — not yet in Next.js types
        allowedDevOrigins: ["192.168.0.10"],
    },
};

export default nextConfig;
