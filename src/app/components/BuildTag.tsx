// src/app/components/BuildTag.tsx
'use client';
import React from "react";

export default function BuildTag() {
    const commit = process.env.NEXT_PUBLIC_BUILD_COMMIT ?? "unknown";
    const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString();

    const formattedDate = buildDate
        .replace("T", " ")
        .replace("Z", " UTC");

    const gradientStyle = {
        background: "linear-gradient(90deg, #7B2FF7 0%, #00BFFF 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    } as const;

    return (
        <div
            title={formattedDate}
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
            <span style={gradientStyle}>{commit}</span>
        </div>
    );
}
