import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import ReactQueryProvider from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";
// import { Toaster } from "@/components/ui/toaster";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StockMaster - Professional Inventory Management",
  description:
    "Comprehensive inventory management system with warehouse tracking, product management, and real-time stock monitoring",
  generator: "v0.app",
  keywords:
    "inventory management, warehouse management, stock tracking, supply chain",
  authors: [{ name: "StockMaster" }]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StoreProvider>
              {children}
              <Toaster />
              <Analytics />
            </StoreProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
