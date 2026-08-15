import type { Metadata } from "next";
import "./globals.css";
import { ConvexProvider } from "@/components/ConvexProvider";
import { PostHogAnalytics } from "@/components/PostHogAnalytics";

export const metadata: Metadata = { title: "Kahaani — voices worth keeping", description: "A small private place for family stories." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=Tiro+Kannada:ital@0;1&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Sans+Kannada:wght@400;500;600&display=swap" rel="stylesheet"/></head><body><PostHogAnalytics/><ConvexProvider>{children}</ConvexProvider></body></html>;
}
