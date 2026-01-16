import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

const TransactionToast = dynamic(
  () => import("@/components/ui/TransactionToast"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "pumpbet.fun - bet on the trenches",
  description: "The first prediction market for crypto KOLs. Bet on who makes it and who fades.",
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
