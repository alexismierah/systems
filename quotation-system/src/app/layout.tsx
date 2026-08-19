import type { Metadata } from "next";
import "./index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quotation System",
  description: "Quotation Management System",
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