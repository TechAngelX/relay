// src/app/identity/page.tsx
"use client";

import dynamic from "next/dynamic";

const LinkIdentity = dynamic(() => import("../components/LinkIdentity"), {
    ssr: false,
});

export default function IdentityPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[var(--color-darkbg)] p-8">
            <LinkIdentity />
        </main>
    );
}
