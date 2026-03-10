import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatVolume(ml: number): string {
  return `${ml.toFixed(1)} mL`;
}

export function formatArea(cm2: number | null): string {
  if (cm2 === null) return "—";
  return `${cm2.toFixed(2)} cm²`;
}

export function riskColor(risk: string | null): string {
  if (risk === "high") return "text-red-400";
  if (risk === "moderate") return "text-yellow-400";
  if (risk === "low") return "text-green-400";
  return "text-zinc-500";
}

export function riskBg(risk: string | null): string {
  if (risk === "high") return "bg-red-500/15 border-red-500/30";
  if (risk === "moderate") return "bg-yellow-500/15 border-yellow-500/30";
  if (risk === "low") return "bg-green-500/15 border-green-500/30";
  return "bg-zinc-800/50 border-zinc-700";
}
