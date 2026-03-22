"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { getExplorerTxUrl } from "@/lib/app-config";
import { useLocale } from "@/components/providers/locale-provider";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmount, formatDate, shortenAddress, shortenSignature } from "@/lib/format";
import { useWhisperPayStore } from "@/store/whisperpay-store";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runtimeCopy = {
  en: {
    txSignature: "txSignature",
    copySignature: "Copy signature",
    openExplorer: "Open explorer",
    accessDenied: "Private details are unavailable for this wallet in current session",
    privacyHint: "On-chain metadata is public. Private note reveal remains app-level in this MVP.",
    publicMeta: "Public payment metadata",
    privateMeta: "Private transfer details",
    demoMode: "Demo mode",
    demoHint: "Showcase inbox preview. This screen does not use live wallet or on-chain state.",
    demoStatus: "demo-simulated",
    demoReveal: "Reveal demo details",
    demoRevealed: "Demo details revealed",
    demoNoteFallback: "Private note for Nurarihyon (demo)."
  },
  ru: {
    txSignature: "txSignature",
    copySignature: "Копировать подпись",
    openExplorer: "Открыть Explorer",
    accessDenied: "Приватные детали недоступны для этого кошелька в текущей сессии",
    privacyHint: "On-chain метаданные публичны. Reveal приватной заметки в этом MVP выполняется на уровне приложения.",
    publicMeta: "Публичные метаданные платежа",
    privateMeta: "Приватные детали перевода",
    demoMode: "Demo mode",
    demoHint: "Showcase inbox preview. Этот экран не использует live wallet и on-chain состояние.",
    demoStatus: "demo-simulated",
    demoReveal: "Reveal demo details",
    demoRevealed: "Demo details revealed",
    demoNoteFallback: "Приватная заметка для Nurarihyon (demo)."
  },
  de: {
    txSignature: "txSignature",
    copySignature: "Signatur kopieren",
    openExplorer: "Explorer oeffnen",
    accessDenied: "Private Details sind fuer dieses Wallet in der aktuellen Sitzung nicht verfuegbar",
    privacyHint: "On-chain Metadaten sind oeffentlich. Das Note-Reveal bleibt in diesem MVP auf App-Ebene.",
    publicMeta: "Oeffentliche Zahlungsmetadaten",
    privateMeta: "Private Transferdetails",
    demoMode: "Demo mode",
    demoHint: "Showcase inbox preview. Dieser Screen nutzt kein live Wallet und keinen on-chain Zustand.",
    demoStatus: "demo-simulated",
    demoReveal: "Reveal demo details",
    demoRevealed: "Demo details revealed",
    demoNoteFallback: "Private Notiz fuer Nurarihyon (demo)."
  },
  zh: {
    txSignature: "txSignature",
    copySignature: "复制签名",
    openExplorer: "打开 Explorer",
    accessDenied: "当前会话中该钱包无法查看私密详情",
    privacyHint: "链上元数据是公开的。私密备注 reveal 在这个 MVP 中仍由应用层处理。",
    publicMeta: "公共支付元数据",
    privateMeta: "私密转账详情",
    demoMode: "Demo mode",
    demoHint: "Showcase inbox preview。此页面不使用 live wallet 或链上状态。",
    demoStatus: "demo-simulated",
    demoReveal: "Reveal demo details",
    demoRevealed: "Demo details revealed",
    demoNoteFallback: "给 Nurarihyon 的私密备注（demo）。"
  }
} as const;

export default function InboxPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get("mode") === "demo";

  const wallet = useWhisperPayStore((state) => state.wallet);
  const publicPayments = useWhisperPayStore((state) => state.publicPayments);
  const privatePaymentDetailsByPaymentId = useWhisperPayStore((state) => state.privatePaymentDetailsByPaymentId);
  const revealedPrivatePaymentIds = useWhisperPayStore((state) => state.revealedPrivatePaymentIds);
  const revealPrivatePaymentDetails = useWhisperPayStore((state) => state.revealPrivatePaymentDetails);
  const { t, locale } = useLocale();
  const copy = runtimeCopy[locale];

  const [revealErrors, setRevealErrors] = useState<Record<string, string>>({});
  const [revealingPaymentId, setRevealingPaymentId] = useState<string | null>(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null);
  const [copiedSignatureByPaymentId, setCopiedSignatureByPaymentId] = useState<Record<string, boolean>>({});
  const [demoRevealed, setDemoRevealed] = useState(false);

  const demoPayment = useMemo(() => {
    if (!isDemoMode) {
      return null;
    }

    const amountRaw = Number(searchParams.get("amount"));

    return {
      paymentId: searchParams.get("paymentId")?.trim() || "demo_seed_payment",
      fromWallet: searchParams.get("fromWallet")?.trim() || "demo_sender_wallet",
      toWallet: searchParams.get("toWallet")?.trim() || "9f8Qa8z9wSe9YqM7hK7ivB2xE8a4u6pJmN3tYv4dR2q",
      createdAt: searchParams.get("createdAt")?.trim() || new Date().toISOString(),
      status: searchParams.get("status")?.trim() || copy.demoStatus,
      recipient: searchParams.get("recipient")?.trim() || "Nurarihyon",
      note: searchParams.get("note")?.trim() || copy.demoNoteFallback,
      amount: Number.isFinite(amountRaw) && amountRaw > 0 ? amountRaw : 15
    };
  }, [copy.demoNoteFallback, copy.demoStatus, isDemoMode, searchParams]);

  const copyId = async (paymentId: string) => {
    await navigator.clipboard.writeText(paymentId);
    setCopiedPaymentId(paymentId);
    setTimeout(() => setCopiedPaymentId(null), 1200);
  };

  const copySignature = async (paymentId: string, signature: string | null) => {
    if (!signature) {
      return;
    }

    await navigator.clipboard.writeText(signature);
    setCopiedSignatureByPaymentId((prev) => ({
      ...prev,
      [paymentId]: true
    }));

    setTimeout(() => {
      setCopiedSignatureByPaymentId((prev) => ({
        ...prev,
        [paymentId]: false
      }));
    }, 1200);
  };

  if (isDemoMode && demoPayment) {
    return (
      <section className="space-y-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge>{t("common_er")}</Badge>
            <Badge variant="outline">{t("common_private_er")}</Badge>
            <Badge variant="outline">{copy.demoMode}</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">{t("inbox_title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("inbox_description")} {copy.demoHint}
          </p>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t("common_er")}</Badge>
              </div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground/85">{copy.publicMeta}</p>
              <p className="text-sm text-muted-foreground">
                {t("inbox_from_wallet")}: {demoPayment.fromWallet}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("inbox_to_wallet")}: {shortenAddress(demoPayment.toWallet)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("inbox_status")}: {demoPayment.status}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("inbox_created_at")}: {formatDate(demoPayment.createdAt, locale)}
              </p>
              <p className="text-sm text-muted-foreground">
                {copy.txSignature}: {shortenSignature(null)}
              </p>
              <p className="text-sm text-muted-foreground">recipient: {demoPayment.recipient}</p>
              <Button variant="outline" size="sm" onClick={() => copyId(demoPayment.paymentId)}>
                <Copy className="h-3.5 w-3.5" />
                {copiedPaymentId === demoPayment.paymentId ? t("common_copied") : t("inbox_copy_payment_id")}
              </Button>
            </div>

            <div className="rounded-2xl border border-border/75 bg-secondary/45 p-4 backdrop-blur">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">{t("common_private_er")}</Badge>
                <Badge variant="outline">SOL</Badge>
              </div>
              <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground/85">{copy.privateMeta}</p>
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  {t("inbox_amount")}: {demoRevealed ? formatAmount(demoPayment.amount, "SOL") : "****"}
                </p>
                <p className="break-words text-sm text-foreground">
                  {t("inbox_private_note")}: {demoRevealed ? demoPayment.note : "**********"}
                </p>
              </div>
              {!demoRevealed && <p className="mt-2 text-xs text-muted-foreground">{t("inbox_reveal_hint")}</p>}
              {demoRevealed && (
                <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {copy.demoRevealed}
                </div>
              )}

              <Button
                className="mt-4"
                variant={demoRevealed ? "outline" : "secondary"}
                disabled={demoRevealed}
                onClick={() => setDemoRevealed(true)}
              >
                {demoRevealed ? copy.demoRevealed : copy.demoReveal}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!wallet.connected || !wallet.address) {
    return (
      <Card className="mx-auto mt-8 max-w-2xl">
        <CardHeader>
          <CardTitle>{t("inbox_locked_title")}</CardTitle>
          <CardDescription>{t("inbox_locked_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectWalletButton />
        </CardContent>
      </Card>
    );
  }

  const inbox = publicPayments.filter((item) => item.toWallet === wallet.address);

  const handleReveal = async (paymentId: string) => {
    setRevealingPaymentId(paymentId);
    await wait(240);
    const result = revealPrivatePaymentDetails(paymentId);

    if (!result) {
      setRevealErrors((prev) => ({
        ...prev,
        [paymentId]: t("inbox_reveal_error")
      }));
      setRevealingPaymentId(null);
      return;
    }

    setRevealErrors((prev) => ({
      ...prev,
      [paymentId]: ""
    }));
    setRevealingPaymentId(null);
  };

  return (
    <section className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>{t("common_er")}</Badge>
          <Badge variant="outline">{t("common_private_er")}</Badge>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">{t("inbox_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("inbox_description")}</p>
        <p className="mt-2 text-xs text-muted-foreground/90">{copy.privacyHint}</p>
      </div>

      {inbox.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("inbox_no_incoming")}</CardTitle>
            <CardDescription>{t("inbox_no_incoming_desc")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {inbox.map((payment) => {
            const privateDetails = privatePaymentDetailsByPaymentId[payment.id];
            const isRevealed = revealedPrivatePaymentIds.includes(payment.id);
            const canViewPrivateForCurrentWallet =
              !!wallet.address && !!privateDetails && privateDetails.canRevealWallets.includes(wallet.address);
            const isPrivateVisible = isRevealed && canViewPrivateForCurrentWallet;
            const token = "SOL";
            const isLoadingReveal = revealingPaymentId === payment.id;

            return (
              <Card key={payment.id}>
                <CardContent className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t("common_er")}</Badge>
                    </div>
                    <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground/85">{copy.publicMeta}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("inbox_from_wallet")}: {shortenAddress(payment.fromWallet)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("inbox_to_wallet")}: {shortenAddress(payment.toWallet)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("inbox_status")}: {payment.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("inbox_created_at")}: {formatDate(payment.createdAt, locale)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {copy.txSignature}: {shortenSignature(payment.txSignature)}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => copyId(payment.id)}>
                      <Copy className="h-3.5 w-3.5" />
                      {copiedPaymentId === payment.id ? t("common_copied") : t("inbox_copy_payment_id")}
                    </Button>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => copySignature(payment.id, payment.txSignature)} disabled={!payment.txSignature}>
                        <Copy className="h-3.5 w-3.5" />
                        {copiedSignatureByPaymentId[payment.id] ? t("common_copied") : copy.copySignature}
                      </Button>
                      {payment.txSignature && (
                        <Button asChild variant="outline" size="sm">
                          <a href={getExplorerTxUrl(payment.txSignature)} target="_blank" rel="noreferrer">
                            {copy.openExplorer}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/75 bg-secondary/45 p-4 backdrop-blur">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">{t("common_private_er")}</Badge>
                      <Badge variant="outline">{token}</Badge>
                    </div>
                    <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground/85">{copy.privateMeta}</p>
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">
                        {t("inbox_amount")}: {isPrivateVisible && privateDetails ? formatAmount(privateDetails.amount, token) : "****"}
                      </p>
                      <p className="break-words text-sm text-foreground">
                        {t("inbox_private_note")}: {isPrivateVisible && privateDetails ? privateDetails.note : "**********"}
                      </p>
                    </div>
                    {!isPrivateVisible && <p className="mt-2 text-xs text-muted-foreground">{t("inbox_reveal_hint")}</p>}
                    {isPrivateVisible && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("inbox_revealed_from_private")}
                      </div>
                    )}

                    <Button
                      className="mt-4"
                      variant={isPrivateVisible ? "outline" : "secondary"}
                      disabled={isPrivateVisible || isLoadingReveal}
                      onClick={() => handleReveal(payment.id)}
                    >
                      {isLoadingReveal ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isLoadingReveal
                        ? t("inbox_revealing")
                        : isPrivateVisible
                          ? t("inbox_details_revealed")
                          : t("inbox_reveal_details")}
                    </Button>

                    {revealErrors[payment.id] && <p className="mt-2 text-xs text-destructive">{revealErrors[payment.id]}</p>}
                    {!isPrivateVisible && revealErrors[payment.id] && (
                      <p className="mt-1 text-xs text-muted-foreground">{copy.accessDenied}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
