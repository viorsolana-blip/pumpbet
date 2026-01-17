import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

const TransactionToast = dynamic(
  () => import("@/components/ui/TransactionToast"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Apella - Prediction Markets on Solana",
  description: "Trade on real-world events with SOL. Polymarket and Kalshi markets, powered by Solana.",
  keywords: ["prediction market", "solana", "crypto", "betting", "polymarket", "kalshi"],
  authors: [{ name: "Apella" }],
  openGraph: {
    title: "Apella - Prediction Markets on Solana",
    description: "Trade on real-world events with SOL. Polymarket and Kalshi markets, powered by Solana.",
    url: "https://apella.fun",
    siteName: "Apella",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apella - Prediction Markets on Solana",
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
