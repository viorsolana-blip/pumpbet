import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terminal - Prediction Market OS",
  description: "Trade every platform. Research faster. Move first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
