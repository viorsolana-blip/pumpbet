import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

const TransactionToast = dynamic(
  () => import("@/components/ui/TransactionToast"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "dumpbet.fun - Prediction Markets on Solana",
  description: "Trade on real-world events with SOL. Polymarket and Kalshi markets, powered by Solana.",
  keywords: ["prediction market", "solana", "crypto", "betting", "polymarket", "kalshi", "dumpbet"],
  authors: [{ name: "dumpbet.fun" }],
  openGraph: {
    title: "dumpbet.fun - Prediction Markets on Solana",
    description: "Trade on real-world events with SOL. Polymarket and Kalshi markets, powered by Solana.",
    url: "https://dumpbet.fun",
    siteName: "dumpbet.fun",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "dumpbet.fun - Prediction Markets on Solana",
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
        {children}
        <TransactionToast />
      </body>
    </html>
  );
}
