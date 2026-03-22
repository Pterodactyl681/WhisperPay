import type { Metadata } from "next";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { SolanaWalletProvider } from "@/components/providers/solana-wallet-provider";

export const metadata: Metadata = {
  title: "WhisperPay MVP",
  description: "Desktop-first MVP for private crypto transfers with MagicBlock ER + Private ER architecture"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_16%,rgba(140,95,255,0.22),transparent_34%),radial-gradient(circle_at_84%_3%,rgba(207,133,255,0.14),transparent_24%),linear-gradient(160deg,#0a0812_0%,#0f0b1d_46%,#090613_100%)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(118,96,172,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(118,96,172,0.11)_1px,transparent_1px)] [background-size:48px_48px]" />
        <LocaleProvider>
          <SolanaWalletProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-8 pb-10 pt-10">{children}</main>
            <Footer />
          </SolanaWalletProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
