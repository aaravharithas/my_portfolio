import type { Metadata } from "next";
import { Cinzel, Geist_Mono, Inter, League_Spartan } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spartan = League_Spartan({ subsets: ["latin"], weight: "700", variable: "--font-spartan", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Portfolio | aaravharithas",
  description: "The development portfolio of aaravharithas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spartan.variable} ${cinzel.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main" className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-lg bg-muted3 px-4 py-2 focus:translate-y-0">Skip to content</a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
