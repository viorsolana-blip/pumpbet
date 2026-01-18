import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

const TransactionToast = dynamic(
  () => import("@/components/ui/TransactionToast"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "PumpBet - Prediction Markets on Solana",
  description: "Trade on real-world events with SOL. Polymarket and Kalshi markets, powered by Solana.",
  keywords: ["prediction market", "solana", "crypto", "betting", "polymarket", "kalshi", "pumpbet"],
  authors: [{ name: "PumpBet" }],
  openGraph: {
    title: "PumpBet - Prediction Markets on Solana",
    description: "Trade on real-world events with SOL. Polymarket and Kalshi markets, powered by Solana.",
    url: "https://pumpbet.fun",
    siteName: "PumpBet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PumpBet - Prediction Markets on Solana",
    description: "Trade on real-world events with SOL.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Black screen overlay - remove this div to show the site */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          zIndex: 99999
        }} />
        {children}
        <TransactionToast />
      </body>
    </html>
  );
}
