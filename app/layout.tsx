import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Roboto, Roboto_Condensed, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoCondensed.variable} antialiased`}
      >
        <div className="relative flex flex-row left-0 top-0 z-1000 h-15 items-center justify-end gap-10 md:gap-5 bg-cerulean-300 pr-10">
          <div className="flex flex-row items-center  gap-30">
            <NavigationButton Text="Home" link = "/"/>
            <NavigationButton Text="Navigation" link = "/navigation"/>
            <NavigationButton Text="Local Search" link = ""/>
          <Button className=" right-2 top-1/2  size-10 rounded border-2 border-b-blue-400 bg-transparent hover:bg-black/50">
            
          </Button>
          </div>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-[Inter] text-cream-100">
            Virtual Companion
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
