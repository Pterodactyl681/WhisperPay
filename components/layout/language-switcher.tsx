"use client";

import { Globe } from "lucide-react";
import { localeOptions } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-card/65 p-1 backdrop-blur">
      <span className="px-2 text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
      </span>
      {localeOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setLocale(item.value)}
          className={cn(
            "rounded-lg px-2 py-1 text-xs font-medium transition-colors",
            locale === item.value
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
