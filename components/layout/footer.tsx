"use client";

import Link from "next/link";
import { BookOpenText, Github, Sparkles, Twitter } from "lucide-react";
import { BrandGlyph } from "@/components/layout/brand-glyph";
import { appConfig } from "@/lib/app-config";

export function Footer() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-7xl px-8 pb-10">
      <div className="rounded-2xl border border-border/80 bg-[linear-gradient(160deg,hsl(var(--card)/0.8),hsl(var(--card)/0.58))] p-6 shadow-premium backdrop-blur-xl">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BrandGlyph className="h-8 w-8" />
              <p className="text-sm font-semibold tracking-[0.12em] text-primary/95">{appConfig.site.name}</p>
            </div>
            <p className="text-sm text-foreground/95">{appConfig.site.description}</p>
            <p className="text-xs text-muted-foreground">Built for MagicBlock Blitz</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={appConfig.site.links.twitterX}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/85 bg-secondary/65 px-3 py-2 text-xs text-foreground/90 transition-colors hover:border-primary/45 hover:bg-primary/10"
              >
                <Twitter className="h-3.5 w-3.5" />
                Twitter / X
              </Link>
              <Link
                href={appConfig.site.links.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/85 bg-secondary/65 px-3 py-2 text-xs text-foreground/90 transition-colors hover:border-primary/45 hover:bg-primary/10"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </Link>
              <Link
                href={appConfig.site.links.docs}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/85 bg-secondary/65 px-3 py-2 text-xs text-foreground/90 transition-colors hover:border-primary/45 hover:bg-primary/10"
              >
                <BookOpenText className="h-3.5 w-3.5" />
                README / Docs
              </Link>
            </div>
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Solana + MagicBlock
            </p>
            <p className="text-xs text-muted-foreground/90">Hackathon MVP. Not production-ready.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
