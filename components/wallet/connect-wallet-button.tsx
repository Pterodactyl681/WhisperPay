"use client";

import { MouseEvent } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";

interface ConnectWalletButtonProps extends ButtonProps {
  label?: string;
}

export function ConnectWalletButton({ label, onClick, disabled, ...props }: ConnectWalletButtonProps) {
  const { setVisible } = useWalletModal();
  const { connecting, select } = useWallet();
  const { t } = useLocale();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      select(null);
      setVisible(true);
    }
  };

  return (
    <Button type="button" onClick={handleClick} disabled={disabled || connecting} {...props}>
      <Wallet className="h-4 w-4" />
      {label ?? (connecting ? t("common_connecting") : t("common_connect_wallet"))}
    </Button>
  );
}
