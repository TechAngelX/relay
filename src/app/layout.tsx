// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
        {children}
        </body>
        </html>
    );
}
