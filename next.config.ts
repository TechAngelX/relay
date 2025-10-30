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
};

export default nextConfig;
