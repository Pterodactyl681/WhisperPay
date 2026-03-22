"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AlertTriangle, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { appConfig, getExplorerTxUrl } from "@/lib/app-config";
import { useLocale } from "@/components/providers/locale-provider";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatAmount, formatDate, formatPaylinkDisplayName, shortenAddress, shortenSignature } from "@/lib/format";
import { getMagicRouterBlockhashForTransaction } from "@/lib/magicblock-router";
import { useWhisperPayStore } from "@/store/whisperpay-store";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runtimeCopy = {
  en: {
    providerMissing: "Wallet provider is unavailable. Install Phantom or choose a wallet.",
    sameWallet: "Sender and receiver wallet cannot be the same.",
    rejected: "Transaction was rejected in wallet.",
    network: "Network or wallet is not responding. Please retry.",
    unknown: "Transaction failed. Please try again.",
    realSolHint: "Real transfer currently supports SOL only. Private note stays in app-level confidential layer.",
    erDesc: "Public payment intent, tx status, sender/receiver, and tx signature are tracked here.",
    privacyHint: "On-chain transfer metadata is public. Note reveal remains app-level in this MVP.",
    txSignature: "txSignature",
    copySignature: "Copy signature",
    openExplorer: "Open explorer",
    paymentLinkFallback: "Payment link",
    receiptTitle: "Payment receipt",
    receiptHint: "Real SOL transfer sent. Public metadata is visible on-chain, private note stays in app-level confidential layer.",
    recipient: "recipient",
    sentAt: "sentAt",
    demoMode: "Demo mode",
    liveMode: "Live mode",
    demoModeHint: "Showcase only: no wallet connection required and no on-chain transaction is sent.",
    demoSender: "Demo sender",
    demoTransferHint: "This simulation demonstrates the paylink UX and private-note narrative for judges.",
    demoSending: "Simulating...",
    demoSubmit: "Run demo send",
    demoReceiptTitle: "Demo receipt",
    demoReceiptHint: "This is a showcase result. No real SOL transaction was sent.",
    demoStatus: "demo-simulated",
    demoPublicCreated: "Demo payment intent created in showcase mode.",
    demoPrivateSaved: "Demo private note displayed as app-level confidential concept."
  },
  ru: {
    providerMissing: "Провайдер кошелька недоступен. Установите Phantom или выберите другой кошелек.",
    sameWallet: "Кошелек отправителя и получателя не может совпадать.",
    rejected: "Транзакция была отклонена в кошельке.",
    network: "Сеть или кошелек не отвечают. Повторите попытку.",
    unknown: "Транзакция не выполнена. Попробуйте еще раз.",
    realSolHint: "Сейчас поддерживаются только реальные переводы SOL. Приватная заметка хранится отдельно в конфиденциальном слое приложения.",
    erDesc: "Здесь фиксируются публичный intent-платеж, статус транзакции, кошельки отправителя и получателя, а также подпись tx.",
    privacyHint: "Метаданные перевода on-chain публичны. Reveal заметки в этом MVP выполняется на уровне приложения.",
    txSignature: "txSignature",
    copySignature: "Копировать подпись",
    openExplorer: "Открыть Explorer",
    paymentLinkFallback: "Платежная ссылка",
    receiptTitle: "Квитанция платежа",
    receiptHint: "Реальный SOL-перевод отправлен. Публичные метаданные видны on-chain, приватная заметка остается в конфиденциальном слое приложения.",
    recipient: "получатель",
    sentAt: "время отправки",
    demoMode: "Demo mode",
    liveMode: "Live mode",
    demoModeHint: "Только showcase: кошелек подключать не нужно, on-chain транзакция не отправляется.",
    demoSender: "Демо-отправитель",
    demoTransferHint: "Эта симуляция показывает UX paylink и концепт приватной заметки для демонстрации.",
    demoSending: "Симулируем...",
    demoSubmit: "Запустить демо-отправку",
    demoReceiptTitle: "Демо-квитанция",
    demoReceiptHint: "Это showcase-результат. Реальная SOL-транзакция не отправлялась.",
    demoStatus: "demo-simulated",
    demoPublicCreated: "Демо intent-платеж создан в showcase-режиме.",
    demoPrivateSaved: "Демо приватная заметка показана как app-level конфиденциальный концепт."
  },
  de: {
    providerMissing: "Wallet-Provider ist nicht verfuegbar. Installiere Phantom oder waehle ein Wallet.",
    sameWallet: "Sender- und Empfaenger-Wallet duerfen nicht identisch sein.",
    rejected: "Transaktion wurde im Wallet abgelehnt.",
    network: "Netzwerk oder Wallet antwortet nicht. Bitte erneut versuchen.",
    unknown: "Transaktion fehlgeschlagen. Bitte erneut versuchen.",
    realSolHint: "Echte Transfers unterstuetzen aktuell nur SOL. Die private Notiz bleibt in einem vertraulichen App-Layer.",
    erDesc: "Hier werden der oeffentliche Payment-Intent, tx-Status, Sender/Empfaenger und die tx-Signatur verfolgt.",
    privacyHint: "On-chain Transfer-Metadaten sind oeffentlich. Das Note-Reveal bleibt in diesem MVP auf App-Ebene.",
    txSignature: "txSignature",
    copySignature: "Signatur kopieren",
    openExplorer: "Explorer oeffnen",
    paymentLinkFallback: "Payment-Link",
    receiptTitle: "Zahlungsbeleg",
    receiptHint: "Echter SOL-Transfer wurde gesendet. Oeffentliche Metadaten sind on-chain sichtbar, die private Notiz bleibt im vertraulichen App-Layer.",
    recipient: "Empfaenger",
    sentAt: "gesendet um",
    demoMode: "Demo mode",
    liveMode: "Live mode",
    demoModeHint: "Nur Showcase: kein Wallet-Connect noetig und keine On-Chain-Transaktion wird gesendet.",
    demoSender: "Demo-Sender",
    demoTransferHint: "Diese Simulation zeigt den Paylink-UX und das Private-Note-Konzept fuer die Demo.",
    demoSending: "Simuliere...",
    demoSubmit: "Demo-Send ausfuehren",
    demoReceiptTitle: "Demo-Beleg",
    demoReceiptHint: "Dies ist ein Showcase-Ergebnis. Es wurde keine echte SOL-Transaktion gesendet.",
    demoStatus: "demo-simulated",
    demoPublicCreated: "Demo-Payment-Intent im Showcase-Modus erstellt.",
    demoPrivateSaved: "Demo-Notiz als vertrauliches App-Layer-Konzept dargestellt."
  },
  zh: {
    providerMissing: "钱包提供器不可用。请安装 Phantom 或选择其他钱包。",
    sameWallet: "发送方和接收方钱包不能相同。",
    rejected: "交易已在钱包中被拒绝。",
    network: "网络或钱包无响应，请重试。",
    unknown: "交易失败，请重试。",
    realSolHint: "当前仅支持真实 SOL 转账。私密备注会单独保存在应用层机密层。",
    erDesc: "这里会记录公共支付 intent、交易状态、发送方/接收方钱包和 tx 签名。",
    privacyHint: "链上转账元数据是公开的。备注 reveal 在此 MVP 中仍由应用层处理。",
    txSignature: "txSignature",
    copySignature: "复制签名",
    openExplorer: "打开 Explorer",
    paymentLinkFallback: "支付链接",
    receiptTitle: "支付回执",
    receiptHint: "真实 SOL 转账已发送。公共元数据会在链上可见，私密备注仍保留在应用层机密层。",
    recipient: "收款人",
    sentAt: "发送时间",
    demoMode: "Demo mode",
    liveMode: "Live mode",
    demoModeHint: "仅用于展示：无需连接钱包，也不会发送链上交易。",
    demoSender: "演示发送方",
    demoTransferHint: "这个模拟用于展示 paylink 体验和私密备注概念。",
    demoSending: "模拟中...",
    demoSubmit: "运行演示发送",
    demoReceiptTitle: "演示回执",
    demoReceiptHint: "这是展示结果，不会发送真实 SOL 交易。",
    demoStatus: "demo-simulated",
    demoPublicCreated: "演示支付意图已在 showcase 模式创建。",
    demoPrivateSaved: "演示私密备注仅作为应用层机密概念展示。"
  }
} as const;

type RuntimeCopy = (typeof runtimeCopy)[keyof typeof runtimeCopy];

const resolveTxError = (error: unknown, copy: RuntimeCopy): string => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("reject") ||
    message.includes("decline") ||
    message.includes("denied") ||
    message.includes("cancel")
  ) {
    return copy.rejected;
  }

  if (
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("blockhash") ||
    message.includes("rpc")
  ) {
    return copy.network;
  }

  return copy.unknown;
};

export default function PayPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const paylinkId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isDemoMode = searchParams.get("mode") === "demo";
  const { connection } = useConnection();
  const {
    connected: walletConnected,
    publicKey: walletPublicKey,
    sendTransaction,
    wallet: walletProvider
  } = useWallet();

  const wallet = useWhisperPayStore((state) => state.wallet);
  const paylinks = useWhisperPayStore((state) => state.paylinks);
  const publicPayments = useWhisperPayStore((state) => state.publicPayments);
  const createPublicPaymentIntent = useWhisperPayStore((state) => state.createPublicPaymentIntent);
  const updatePublicPaymentStatus = useWhisperPayStore((state) => state.updatePublicPaymentStatus);
  const storePrivatePaymentDetails = useWhisperPayStore((state) => state.storePrivatePaymentDetails);
  const { t, locale } = useLocale();
  const copy = runtimeCopy[locale];

  const paylink = useMemo(
    () => paylinks.find((item) => item.id === paylinkId && item.isActive),
    [paylinks, paylinkId]
  );

  const [amount, setAmount] = useState("15");
  const [note, setNote] = useState("Private note for recipient only");
  const [result, setResult] = useState<{
    paymentId: string;
    createdAt: string;
    txSignature: string | null;
    amount: number;
    recipientName: string;
    recipientWallet: string;
    isDemo: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);
  const [copiedSignature, setCopiedSignature] = useState(false);

  const senderWallet = walletPublicKey?.toBase58() ?? wallet.address ?? "";

  const latestPublicStatus = useMemo(() => {
    if (!result || result.isDemo) {
      return null;
    }

    return publicPayments.find((item) => item.id === result.paymentId)?.status ?? null;
  }, [publicPayments, result]);

  const recipientDisplayName = paylink
    ? formatPaylinkDisplayName(paylink.nickname, paylink.ownerWallet, copy.paymentLinkFallback)
    : copy.paymentLinkFallback;

  const demoInboxHref = useMemo(() => {
    if (!result?.isDemo) {
      return "/inbox";
    }

    const params = new URLSearchParams({
      mode: "demo",
      paymentId: result.paymentId,
      createdAt: result.createdAt,
      amount: String(result.amount),
      note: note.trim() || "Private note for Nurarihyon (demo).",
      fromWallet: "demo_sender_wallet",
      toWallet: result.recipientWallet,
      recipient: result.recipientName,
      status: copy.demoStatus
    });

    return `/inbox?${params.toString()}`;
  }, [copy.demoStatus, note, result]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!paylink || submitting) {
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t("pay_error_amount"));
      return;
    }

    const lamports = Math.round(parsedAmount * LAMPORTS_PER_SOL);
    if (lamports <= 0) {
      setError(t("pay_error_amount"));
      return;
    }

    if (isDemoMode) {
      setSubmitting(true);
      setError(null);
      await wait(240);
      setResult({
        paymentId: `demo_${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        txSignature: null,
        amount: parsedAmount,
        recipientName: recipientDisplayName,
        recipientWallet: paylink.ownerWallet,
        isDemo: true
      });
      setSubmitting(false);
      return;
    }

    if (!walletConnected || !walletPublicKey) {
      setError(t("pay_error_connect_wallet"));
      return;
    }

    if (!walletProvider) {
      setError(copy.providerMissing);
      return;
    }

    if (walletPublicKey.toBase58() === paylink.ownerWallet) {
      setError(copy.sameWallet);
      return;
    }

    setSubmitting(true);
    setError(null);

    const publicIntent = createPublicPaymentIntent({
      paylinkId: paylink.id,
      fromWallet: senderWallet
    });

    if (!publicIntent) {
      setError(t("pay_error_public"));
      setSubmitting(false);
      return;
    }

    try {
      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletPublicKey,
          toPubkey: new PublicKey(paylink.ownerWallet),
          lamports
        })
      );

      transferTransaction.feePayer = walletPublicKey;
      const routerBlockhash = await getMagicRouterBlockhashForTransaction(appConfig.solana.rpcUrl, transferTransaction);
      const latestBlockhash = routerBlockhash ?? (await connection.getLatestBlockhash("confirmed"));
      transferTransaction.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(transferTransaction, connection, {
        preflightCommitment: "confirmed"
      });

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      updatePublicPaymentStatus(publicIntent.id, "sent", signature);

      const privateDetails = storePrivatePaymentDetails({
        paymentId: publicIntent.id,
        amount: parsedAmount,
        note,
        canRevealWallets: [paylink.ownerWallet]
      });

      if (!privateDetails) {
        setError(t("pay_error_private"));
        setSubmitting(false);
        return;
      }

      setResult({
        paymentId: publicIntent.id,
        createdAt: publicIntent.createdAt,
        txSignature: signature,
        amount: parsedAmount,
        recipientName: recipientDisplayName,
        recipientWallet: paylink.ownerWallet,
        isDemo: false
      });
    } catch (txError) {
      updatePublicPaymentStatus(publicIntent.id, "failed", null);
      setError(resolveTxError(txError, copy));
    } finally {
      setSubmitting(false);
    }
  };

  const copyPaymentId = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.paymentId);
    setCopiedPaymentId(true);
    setTimeout(() => setCopiedPaymentId(false), 1200);
  };

  const copyTxSignature = async () => {
    if (!result?.txSignature) {
      return;
    }

    await navigator.clipboard.writeText(result.txSignature);
    setCopiedSignature(true);
    setTimeout(() => setCopiedSignature(false), 1200);
  };

  if (!paylink) {
    return (
      <Card className="mx-auto mt-8 max-w-3xl">
        <CardHeader>
          <Badge variant="outline" className="mb-3 w-fit">
            {t("pay_invalid_link")}
          </Badge>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <AlertTriangle className="h-6 w-6 text-accent" />
            {t("pay_not_found_title")}
          </CardTitle>
          <CardDescription>{t("pay_not_found_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/">{t("pay_go_home")}</Link>
          </Button>
          <Button asChild>
            <Link href="/create">{t("pay_create_paylink")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card>
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>{t("common_er")}</Badge>
            <Badge variant="outline">{t("common_private_er")}</Badge>
            <Badge variant="outline">SOL</Badge>
            <Badge variant="outline">{isDemoMode ? copy.demoMode : copy.liveMode}</Badge>
          </div>
          <CardTitle className="break-words text-3xl">
            {t("pay_title_prefix")} {recipientDisplayName}
          </CardTitle>
          <CardDescription>{t("pay_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isDemoMode ? (
            <div className="mb-4 rounded-2xl border border-border/75 bg-secondary/55 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground">{copy.demoModeHint}</p>
            </div>
          ) : (
            !walletConnected && (
              <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-border/75 bg-secondary/55 p-4 backdrop-blur">
                <p className="text-sm text-muted-foreground">{t("pay_connect_prompt")}</p>
                <ConnectWalletButton size="sm" />
              </div>
            )
          )}

          <div className="mb-4 rounded-2xl border border-border/75 bg-secondary/45 p-4 text-xs text-muted-foreground backdrop-blur">
            <p>
              {t("pay_from_wallet")}:{" "}
              {isDemoMode
                ? copy.demoSender
                : senderWallet
                  ? shortenAddress(senderWallet)
                  : t("pay_connect_required")}
            </p>
            <p className="mt-1">
              {t("pay_to_wallet")}: {shortenAddress(paylink.ownerWallet)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/90">{isDemoMode ? copy.demoTransferHint : copy.realSolHint}</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {t("pay_amount")} (SOL)
              </label>
              <Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0.01" step="0.01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("pay_private_note")}</label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting || (!isDemoMode && !walletConnected)}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? (isDemoMode ? copy.demoSending : t("pay_sending")) : isDemoMode ? copy.demoSubmit : t("pay_send_privately")}
            </Button>
          </form>

          {result && (
            <div className="mt-5 space-y-4 rounded-2xl border border-primary/35 bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">{result.isDemo ? copy.demoReceiptTitle : copy.receiptTitle}</p>
              </div>
              <p className="text-sm text-muted-foreground">{result.isDemo ? copy.demoReceiptHint : copy.receiptHint}</p>
              <div className="grid gap-2 rounded-xl border border-border/70 bg-background/20 p-3 text-xs text-muted-foreground">
                <p className="break-words">
                  {copy.recipient}: {result.recipientName} ({shortenAddress(result.recipientWallet)})
                </p>
                <p>
                  {t("pay_amount")}: {formatAmount(result.amount, "SOL")}
                </p>
                <p>
                  {copy.sentAt}: {formatDate(result.createdAt, locale)}
                </p>
                <p className="break-words">
                  {copy.txSignature}: {result.txSignature ? shortenSignature(result.txSignature) : "N/A"}
                </p>
                <p>
                  {t("pay_public_status")}: {result.isDemo ? copy.demoStatus : latestPublicStatus ?? "pending"}
                </p>
                <p className="break-all">
                  {t("pay_payment_id")}: {result.paymentId}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={copyPaymentId}>
                  <Copy className="h-4 w-4" />
                  {copiedPaymentId ? t("common_copied") : t("pay_copy_payment_id")}
                </Button>
                <Button variant="secondary" onClick={copyTxSignature} disabled={!result.txSignature}>
                  <Copy className="h-4 w-4" />
                  {copiedSignature ? t("common_copied") : copy.copySignature}
                </Button>
                {result.txSignature && (
                  <Button asChild variant="outline">
                    <Link href={getExplorerTxUrl(result.txSignature)} target="_blank" rel="noreferrer">
                      {copy.openExplorer}
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href={result.isDemo ? demoInboxHref : "/inbox"}>{t("pay_open_inbox")}</Link>
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {result.isDemo ? (
                  <>
                    <p>{copy.demoPublicCreated}</p>
                    <p>{copy.demoPrivateSaved}</p>
                  </>
                ) : (
                  <>
                    <p>{t("pay_public_created")}</p>
                    <p>{t("pay_private_saved")}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge variant="outline" className="mb-2 w-fit">
            {t("pay_architecture")}
          </Badge>
          <CardTitle className="text-2xl">{t("pay_flow_map")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-2xl border border-border/75 bg-secondary/45 p-4 backdrop-blur">
            <div className="mb-1 flex items-center gap-2">
              <Badge>{t("common_er")}</Badge>
            </div>
            <p className="text-muted-foreground">{copy.erDesc}</p>
          </div>
          <div className="rounded-2xl border border-border/75 bg-secondary/45 p-4 backdrop-blur">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline">{t("common_private_er")}</Badge>
            </div>
            <p className="text-muted-foreground">{copy.privacyHint}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
