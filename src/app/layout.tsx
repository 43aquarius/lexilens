import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexiLens — AI Reading Assistant for Dyslexia & Low Literacy",
  description:
    "LexiLens turns dense, hard-to-read text into clear, calm, readable pages. AI simplification, dyslexia-friendly typography, focus mode, and read-aloud with karaoke highlighting — free and private.",
  keywords: [
    "dyslexia",
    "reading accessibility",
    "AI reading assistant",
    "text simplification",
    "read aloud",
    "a11y",
    "LexiLens",
  ],
  authors: [{ name: "LexiLens Team" }],
  openGraph: {
    title: "LexiLens — See words differently",
    description:
      "AI-powered reading accessibility suite: simplify any text, dyslexia-friendly typography, focus mode, and read-aloud highlighting.",
    siteName: "LexiLens",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
