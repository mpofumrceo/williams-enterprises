import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/src/components/ui/ToasterProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Williams Enterprises | Building Today, Transforming Tomorrow",
    template: "%s | Williams Enterprises",
  },
  description:
    "Williams Enterprises delivers professional construction, renovation, infrastructure and engineering solutions in Zimbabwe.",
  openGraph: {
    siteName: "Williams Enterprises",
    locale: "en_ZW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
