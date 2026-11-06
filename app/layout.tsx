import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi/satoshi-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-900.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koda AI Studio - Playground",
  description: "Playground for AI models and workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#131314] text-[#f1f3f4] font-sans selection:bg-[#3c4043]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}


