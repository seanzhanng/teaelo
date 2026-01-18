import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import Navigation from "@/components/navigation";
import FlowingLiquid from "@/components/FlowingLiquid";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import "../styles/globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TeaElo - Rank Global Boba Chains",
  description: "A platform for ranking global boba chains using an Elo-based A/B voting system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${fredoka.variable} antialiased h-full flex flex-col overflow-hidden`}
      >
        <BackgroundBlobs />
        <Navigation />
        <main className="flex-1 overflow-hidden pt-20">
          {children}
        </main>
        <FlowingLiquid />
      </body>
    </html>
  );
}
