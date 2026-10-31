import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liquidation Management System",
  description: "Manage your categories and liquidation records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}