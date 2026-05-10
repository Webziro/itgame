import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InstallBanner from "@/components/pwa/InstallBanner";

import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TriviaWin | Scalable Real-Money Trivia",
  description: "Win real cash by answering trivia questions. Join the pool and compete with others.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2B5292",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 antialiased`}>
        <Providers>
          {children}
          <InstallBanner />
        </Providers>
      </body>
    </html>
  );
}
