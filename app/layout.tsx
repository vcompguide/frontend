import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Roboto, Roboto_Condensed, Roboto_Flex } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})

const robotoFont = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"]
})

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Computational Thinking - Tour Guide",
  description: "Us",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoCondensed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
