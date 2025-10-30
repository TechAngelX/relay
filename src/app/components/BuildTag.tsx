// src/app/components/BuildTag.tsx
'use client';
import React from "react";

export default function BuildTag() {
    const commit = process.env.NEXT_PUBLIC_BUILD_COMMIT ?? "local";
    const version = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "v-local";
    const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString();

    // ✅ locale-safe date string for hydration consistency
    const formattedDate = new Date(buildDate)
        .toISOString()
        .replace("T", " ")
        .replace("Z", " UTC");

    const gradientStyle = {
        background: "linear-gradient(90deg, #7B2FF7 0%, #00BFFF 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    } as const;

    const tooltip = `Built from commit ${commit}\n${formattedDate}`;

    return (
        <div
            title={tooltip}
            style={{
                position: "fixed",
                bottom: 60,
                left: 12,
                fontSize: "11px",
                color: "#bfbfbf",
                padding: "3px 7px",
                borderRadius: "8px",
                zIndex: 9999,
                fontFamily: "monospace",
                background: "rgba(18, 18, 26, 0.7)",
                border: "1px solid rgba(125, 90, 255, 0.25)",
                boxShadow: "0 0 6px rgba(125, 90, 255, 0.15)",
                backdropFilter: "blur(4px)",
                cursor: "help",
                userSelect: "none",
                opacity: 0.9,
            }}
        >
            <span style={gradientStyle}>{version}</span>
        </div>
    );
}
