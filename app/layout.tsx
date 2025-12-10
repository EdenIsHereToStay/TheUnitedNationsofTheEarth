import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundation Protocol - United Nations of the Earth",
  description: "A minimal social internet with cryptographic identity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

