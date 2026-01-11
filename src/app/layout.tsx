import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono, Mountains_of_Christmas } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Geist({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mountainsOfChristmas = Mountains_of_Christmas({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mountains-of-christmas",
});

export const metadata: Metadata = {
  title: "Pets Santa - AI Christmas Pet Portraits",
  description: "Upload a photo of your pet and let AI turn it into a festive holiday portrait.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${mountainsOfChristmas.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
