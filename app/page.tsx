"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandGlyph } from "@/components/layout/brand-glyph";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    titleKey: "home_fast_title",
    textKey: "home_fast_text"
  },
  {
    titleKey: "home_private_lane_title",
    textKey: "home_private_lane_text"
  },
  {
    titleKey: "home_shareable_title",
    textKey: "home_shareable_text"
  }
] as const;

const architectureNotes = [
  {
    labelKey: "common_er",
    titleKey: "home_er_title",
    textKey: "home_er_text"
  },
  {
    labelKey: "common_private_er",
    titleKey: "home_private_title",
    textKey: "home_private_text"
  }
] as const;

export default function HomePage() {
  const { t, locale } = useLocale();
  const narrativeByLocale = {
    en: "Real SOL transfers run in the wallet flow. Private notes are handled separately in an app-level confidential layer (MVP).",
    ru: "Реальные SOL-переводы проходят через кошелек. Приватные заметки хранятся отдельно в конфиденциальном слое приложения (MVP).",
    de: "Echte SOL-Transfers laufen im Wallet-Flow. Private Notizen werden getrennt in einem vertraulichen App-Layer (MVP) gespeichert.",
    zh: "真实 SOL 转账通过钱包流程执行。私密备注会单独保存在应用层的机密层（MVP）。"
  } as const;
  const entryCopyByLocale = {
    en: {
      demoMode: "Demo mode",
      liveMode: "Live mode",
      demoDescription:
        "See the full paylink experience instantly with a seeded showcase. No wallet connect required, no on-chain transaction is sent.",
      liveDescription:
        "Use the real app flow with wallet connect, live SOL transfer, and inbox reveal behavior."
    },
    ru: {
      demoMode: "Demo mode",
      liveMode: "Live mode",
      demoDescription:
        "Посмотрите полный paylink-сценарий на готовом showcase. Без подключения кошелька и без отправки on-chain транзакции.",
      liveDescription:
        "Используйте реальный flow приложения: подключение кошелька, live SOL перевод и reveal в inbox."
    },
    de: {
      demoMode: "Demo mode",
      liveMode: "Live mode",
      demoDescription:
        "Teste den kompletten Paylink-Flow sofort mit einem Seed-Showcase. Kein Wallet-Connect erforderlich, keine On-Chain-Transaktion wird gesendet.",
      liveDescription:
        "Nutze den echten App-Flow mit Wallet-Connect, live SOL-Transfer und Inbox-Reveal."
    },
    zh: {
      demoMode: "Demo mode",
      liveMode: "Live mode",
      demoDescription: "使用预置 showcase 立即体验完整 paylink 流程。无需连接钱包，也不会发送链上交易。",
      liveDescription: "使用真实应用流程：连接钱包、实时 SOL 转账和 inbox reveal。"
    }
  } as const;
  const modeCopy = entryCopyByLocale[locale];

  return (
    <section className="space-y-10">
      <div className="surface-premium surface-grid relative overflow-hidden rounded-2xl p-10">
        <div className="mb-4 inline-flex items-center gap-3">
          <BrandGlyph />
          <span className="text-xs font-semibold tracking-[0.16em] text-primary/90">WHISPERPAY</span>
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{t("common_er")}</Badge>
          <Badge variant="outline">{t("common_private_er")}</Badge>
        </div>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance xl:text-5xl">{t("home_hero_title")}</h1>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground text-pretty xl:text-lg">{t("home_hero_description")}</p>
        <div className="mt-6 max-w-3xl rounded-2xl border border-border/80 bg-secondary/45 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {narrativeByLocale[locale]}
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-border/75 bg-secondary/45 p-5 backdrop-blur">
            <Badge variant="outline" className="mb-3">
              {modeCopy.demoMode}
            </Badge>
            <p className="text-sm leading-relaxed text-muted-foreground">{modeCopy.demoDescription}</p>
            <Button asChild variant="outline" className="mt-4 w-full justify-center">
              <Link href="/pay/pl_seed_001?mode=demo">{t("home_cta_open_demo_pay")}</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 backdrop-blur">
            <Badge className="mb-3">{modeCopy.liveMode}</Badge>
            <p className="text-sm leading-relaxed text-muted-foreground">{modeCopy.liveDescription}</p>
            <Button asChild className="mt-4 w-full justify-center">
              <Link href="/create">
                {t("home_cta_create_paylink")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {architectureNotes.map((item) => (
          <Card key={item.labelKey}>
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit">
                {t(item.labelKey)}
              </Badge>
              <CardTitle className="text-2xl">{t(item.titleKey)}</CardTitle>
              <CardDescription>{t(item.textKey)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {highlights.map((item, index) => (
          <Card key={item.titleKey} className="animate-fade-up">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary/75">0{index + 1}</p>
              <CardTitle className="text-2xl">{t(item.titleKey)}</CardTitle>
              <CardDescription>{t(item.textKey)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
