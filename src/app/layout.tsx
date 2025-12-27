import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/SwRegister";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "iSquat | Auckland Toilet Reviews",
  description:
    "Community powered toilet ratings and verified locations across Auckland.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff7a45",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body className="app-body">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
