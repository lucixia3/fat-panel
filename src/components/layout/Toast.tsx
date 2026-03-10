"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  msg: string;
  type: "success" | "error";
}

export default function Toast({ msg, type }: Props) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl animate-slide-up",
        type === "success"
          ? "border-green-500/30 bg-green-500/15 text-green-300"
          : "border-red-500/30 bg-red-500/15 text-red-300"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      {msg}
    </div>
  );
}
