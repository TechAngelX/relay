// src/app/layout.tsx
import "./globals.css";
import BuildTag from "./components/BuildTag";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
        {children}
        <BuildTag /> {/* ✅ Appears on all screens */}
        </body>
        </html>
    );
}
