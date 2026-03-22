"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Link2, Loader2, Sparkles } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate, formatPaylinkDisplayName, shortenAddress } from "@/lib/format";
import { useWhisperPayStore } from "@/store/whisperpay-store";
import { type TokenSymbol } from "@/types/whisperpay";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function CreatePage() {
  const wallet = useWhisperPayStore((state) => state.wallet);
  const paylinks = useWhisperPayStore((state) => state.paylinks);
  const createPaylink = useWhisperPayStore((state) => state.createPaylink);
  const { t, locale } = useLocale();
  const privateHintByLocale = {
    en: "Private note is stored in an app-level confidential layer. SOL transfer metadata remains public on-chain.",
    ru: "Приватная заметка хранится в конфиденциальном слое приложения. Метаданные SOL-перевода остаются публичными on-chain.",
    de: "Die private Notiz liegt in einem vertraulichen App-Layer. Die SOL-Transfermetadaten bleiben on-chain oeffentlich.",
    zh: "私密备注保存在应用层机密层。SOL 转账元数据仍然会在链上公开。"
  } as const;

  const [nickname, setNickname] = useState("private sponsor lane");
  const [defaultToken, setDefaultToken] = useState<TokenSymbol>("USDC");
  const [origin, setOrigin] = useState("");
  const [createdPaylinkId, setCreatedPaylinkId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fullLink = createdPaylinkId ? `${origin}/pay/${createdPaylinkId}` : "";

  const myPaylinks = useMemo(() => {
    if (!wallet.address) {
      return [];
    }

    return paylinks.filter((item) => item.ownerWallet === wallet.address);
  }, [paylinks, wallet.address]);

  const handleCreate = async () => {
    setSubmitError(null);
    setCreating(true);
    await wait(260);

    const created = createPaylink(nickname, defaultToken);

    if (!created) {
      setSubmitError(t("create_submit_error_wallet"));
      setCreating(false);
      return;
    }

    setCreatedPaylinkId(created.id);
    setCreating(false);
  };

  const copyLink = async () => {
    if (!fullLink) {
      return;
    }

    await navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>{t("common_er")}</Badge>
            <Badge variant="outline">{t("common_private_er")}</Badge>
          </div>
          <CardTitle className="text-3xl">{t("create_title")}</CardTitle>
          <CardDescription>{t("create_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!wallet.connected ? (
            <div className="rounded-2xl border border-border/75 bg-secondary/55 p-4 backdrop-blur">
              <p className="mb-3 text-sm text-muted-foreground">{t("create_connect_prompt")}</p>
              <ConnectWalletButton />
            </div>
          ) : (
            <div className="rounded-2xl border border-border/75 bg-secondary/55 p-4 text-sm backdrop-blur">
              <p className="text-muted-foreground">{t("create_connected_wallet")}</p>
              <p className="mt-1 font-semibold">{wallet.label ?? t("common_solana_wallet")}</p>
              <p>{shortenAddress(wallet.address)}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("create_nickname")}</label>
            <Input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="creator-private-lane" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("create_default_token")}</label>
            <select
              value={defaultToken}
              onChange={(event) => setDefaultToken(event.target.value as TokenSymbol)}
              className="flex h-11 w-full rounded-xl border border-input/80 bg-secondary/35 px-3 py-2 text-sm transition-colors focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
            </select>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <Button onClick={handleCreate} className="w-full" disabled={!nickname.trim() || creating || !wallet.connected}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {creating ? t("create_generating") : t("create_generate_paylink")}
          </Button>

          {createdPaylinkId && (
            <div className="space-y-4 rounded-2xl border border-primary/35 bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">{t("create_paylink_created")}</p>
              </div>
              <Input readOnly value={fullLink} />
              <p className="text-xs text-muted-foreground">{privateHintByLocale[locale]}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={copyLink}>
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t("common_copied") : t("create_copy_link")}
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/pay/${createdPaylinkId}`}>
                    <Link2 className="h-4 w-4" />
                    {t("create_open_pay_page")}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline">{t("common_er")}</Badge>
          </div>
          <CardTitle className="text-2xl">{t("create_my_paylinks")}</CardTitle>
          <CardDescription>{t("create_my_paylinks_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {myPaylinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("create_no_paylinks")}</p>
          ) : (
            myPaylinks.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/75 bg-secondary/45 p-4 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{formatPaylinkDisplayName(item.nickname, item.ownerWallet)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("create_paylink_id")}: {item.id}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("create_created_at")}: {formatDate(item.createdAt, locale)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("create_owner")}: {shortenAddress(item.ownerWallet)}
                    </p>
                  </div>
                  <Badge variant="outline">{item.defaultToken}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

