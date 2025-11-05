// next.config.ts
import { execSync } from "child_process";

let commit = "unknown";
try {
    commit = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
    console.warn("⚠️ Could not read git commit hash");
}

const buildDate = new Date().toISOString();

const nextConfig = {
    env: {
        NEXT_PUBLIC_BUILD_COMMIT: commit,
        NEXT_PUBLIC_BUILD_DATE: buildDate,
    },
};

export default nextConfig;
