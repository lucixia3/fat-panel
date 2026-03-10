"use client";

import { Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-surface-border bg-surface/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/20 ring-1 ring-brand/40">
          <Activity className="h-4 w-4 text-brand-light" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight text-white">
            FatScope
          </span>
          <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-medium text-brand-light ring-1 ring-brand/30">
            beta
          </span>
        </div>
      </div>
      <div className="mx-4 h-5 w-px bg-surface-border" />
      <p className="text-xs text-zinc-400">
        CT Muscle &amp; Fat Segmentation Dashboard
      </p>
    </header>
  );
}
