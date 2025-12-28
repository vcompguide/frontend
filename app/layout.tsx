import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Roboto, Roboto_Condensed, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthProvider } from "./navigation/AuthContext";

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

function NavigationButton({Text, link}:
  {
    Text: string
    link: string
  }
){
  return <Link href={link} className="bg-transparent border-0 text-cream-100 hover:bg-transparent w-fit h-fit p-0 hover:underline" >
    {Text}
    </Link>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoCondensed.variable} antialiased relative`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
