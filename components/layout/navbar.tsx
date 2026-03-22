"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LogOut, RefreshCcw } from "lucide-react";
import { BrandGlyph } from "@/components/layout/brand-glyph";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLocale } from "@/components/providers/locale-provider";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/format";

export function Navbar() {
  const pathname = usePathname();
  const { connected, disconnect, disconnecting, publicKey, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const walletAddress = publicKey?.toBase58() ?? null;
  const { t } = useLocale();

  const navItems = [
    { href: "/", label: t("common_overview") },
    { href: "/create", label: t("common_create") },
    { href: "/inbox", label: t("common_inbox") }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/78 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <BrandGlyph />
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-primary/90">WHISPERPAY</p>
              <p className="text-xs leading-snug text-muted-foreground">{t("common_magicblock_tagline")}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm transition-all",
                    active
                      ? "border-primary/40 bg-primary/15 text-foreground shadow-soft"
                      : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-secondary/55 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {connected && walletAddress ? (
            <>
              <div className="rounded-xl border border-border/80 bg-card/72 px-3 py-2 text-right backdrop-blur">
                <p className="text-xs text-muted-foreground">{wallet?.adapter.name ?? t("common_solana_wallet")}</p>
                <p className="text-sm font-medium">{shortenAddress(walletAddress)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setVisible(true)}>
                <RefreshCcw className="h-4 w-4" />
                {t("common_change_wallet")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => void disconnect()} disabled={disconnecting}>
                <LogOut className="h-4 w-4" />
                {disconnecting ? t("common_disconnecting") : t("common_disconnect")}
              </Button>
            </>
          ) : (
            <ConnectWalletButton size="sm" />
          )}
        </div>
      </div>
    </header>
  );
}
