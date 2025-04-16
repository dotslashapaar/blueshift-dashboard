import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import GlobalModals from "./components/Modals/GlobalModals";
import WalletProvider from "./contexts/WalletProvider";
import { Geist_Mono } from "next/font/google";

const GeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const Switzer = localFont({
  src: [
    {
      path: "./fonts/Switzer-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Switzer-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Switzer-Semibold.woff2",
      weight: "60",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const MontechV2 = localFont({
  src: "./fonts/MontechV2-Medium.ttf",
  weight: "500",
  style: "normal",
  variable: "--font-montech",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blueshift",
  description:
    "Learn how to write your own on-chain programs from the top instructors in the Solana ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Switzer.variable} ${MontechV2.variable} ${GeistMono.variable} antialiased`}
      >
        <WalletProvider>
          <GlobalModals />
          <Header />
          <div className="pt-[69px] min-h-[calc(100dvh-69px)]">{children}</div>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
