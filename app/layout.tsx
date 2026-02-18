import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SheetAPI - Transform Google Sheets to REST API",
  description: "No-code API Gateway that transforms Google Sheets into RESTful JSON API instantly",
  verification: {
    google: "tRKW6HukNLg9Md0ZkE19uE5Pjy1uKyostsBEMQIRp7M",
  },
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
