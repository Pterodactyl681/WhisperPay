"use client";

import { Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandGlyphProps {
  className?: string;
}

export function BrandGlyph({ className }: BrandGlyphProps) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/45 bg-primary/15 text-primary shadow-soft",
        className
      )}
      aria-hidden="true"
    >
      <Waypoints className="h-4 w-4" />
    </span>
  );
}
