import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers"
import { Toaster } from "sonner";
import MobileRestriction from "@/components/MobileRestriction";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prime Logic Solutions",
  description: "A platform for freelancers and clients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          <MobileRestriction>{children}</MobileRestriction>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
