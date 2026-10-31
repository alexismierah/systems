import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expensive Man Oy!",
  description: "Manage your expense.",
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