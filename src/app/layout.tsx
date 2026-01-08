import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Handover",
    description: "Dump multi-modal knowledge and query it via AI-powered chat and voice",
    icons: {
        icon: [
            { url: '/handover-logo.svg', type: 'image/svg+xml' },
        ],
        shortcut: ['/handover-logo.svg'],
        apple: [
            { url: '/handover-logo.svg', type: 'image/svg+xml' },
        ],
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
