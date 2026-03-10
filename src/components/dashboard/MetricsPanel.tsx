"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn, formatArea, formatVolume, riskBg, riskColor } from "@/lib/utils";
import { computeL3 } from "@/lib/api";
import type { L3Metrics, SegmentationInfo, StudyDetail } from "@/types";

interface Props {
  study: StudyDetail;
  onL3Computed: (metrics: L3Metrics) => void;
}

export default function MetricsPanel({ study, onL3Computed }: Props) {
  const [computing, setComputing] = useState(false);
  const [l3Error, setL3Error] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState("");

  const handleComputeL3 = async () => {
    setComputing(true);
    setL3Error(null);
    try {
      const h = heightCm ? parseFloat(heightCm) : undefined;
      const metrics = await computeL3(study.id, h);
      onL3Computed(metrics);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "L3 computation failed";
      setL3Error(msg);
    } finally {
      setComputing(false);
    }
  };

  const hasAbdomen = study.segmentations.some((s) => s.model_key === "abdomen");

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Volume tables */}
      {study.segmentations.map((seg) => (
        <SegmentationMetrics key={seg.model_key} seg={seg} />
      ))}

      {study.segmentations.length === 0 && (
        <p className="py-4 text-center text-xs text-zinc-600">
          Run models or upload segmentations to see metrics.
        </p>
      )}

      {/* L3 Sarcopenia section */}
      <div className="rounded-xl border border-surface-border bg-surface-card">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h3 className="text-sm font-semibold text-zinc-200">L3 Sarcopenia</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Height cm"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-24 rounded-lg border border-surface-border bg-surface px-2 py-1 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-brand/50"
            />
            <button
              onClick={handleComputeL3}
              disabled={!hasAbdomen || computing}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                hasAbdomen && !computing
                  ? "bg-brand hover:bg-brand-dark text-white"
                  : "cursor-not-allowed bg-surface-border text-zinc-600"
              )}
            >
              {computing && <Loader2 className="h-3 w-3 animate-spin" />}
              Compute L3
            </button>
          </div>
        </div>

        <div className="p-4">
          {!hasAbdomen && (
            <p className="text-xs text-zinc-600">
              Abdomen segmentation required.
            </p>
          )}
          {l3Error && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {l3Error}
            </div>
          )}
          {study.l3_metrics && <L3Table metrics={study.l3_metrics} />}
        </div>
      </div>
    </div>
  );
}

function SegmentationMetrics({ seg }: { seg: SegmentationInfo }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card">
      <div className="border-b border-surface-border px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-200">
          {seg.display_name}
        </h3>
        <p className="text-[10px] text-zinc-500">Volume (mL)</p>
      </div>
      <div className="divide-y divide-surface-border">
        {seg.metrics.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.colors[getLabelId(seg, row.label)] }}
              />
              <span className="text-xs text-zinc-300">{row.label}</span>
            </div>
            <span className="text-xs font-medium tabular-nums text-zinc-200">
              {formatVolume(row.volume_ml)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLabelId(seg: SegmentationInfo, label: string): number {
  const entry = Object.entries(seg.labels).find(([, v]) => v === label);
  return entry ? parseInt(entry[0]) : 0;
}

function L3Table({ metrics }: { metrics: L3Metrics }) {
  const vertebra = metrics.vertebra_used?.replace("vertebrae_", "") ?? "L3";
  const isL3 = vertebra === "L3";

  const rows: { label: string; value: string }[] = [
    { label: `${vertebra} slice index`, value: String(metrics.l3_slice_index) },
    { label: "SMA", value: formatArea(metrics.sma_cm2) },
    { label: "SMI", value: metrics.smi_cm2_m2 !== null ? `${metrics.smi_cm2_m2.toFixed(2)} cm²/m²` : "—" },
    { label: "SAT area", value: formatArea(metrics.sat_area_cm2) },
    { label: "VAT area", value: formatArea(metrics.vat_area_cm2) },
    { label: "IMAT area", value: formatArea(metrics.imat_area_cm2) },
  ];

  return (
    <div className="space-y-1">
      {!isL3 && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
          ⚠ L3 mask empty — using {vertebra} as reference
        </div>
      )}
      {metrics.sarcopenia_risk && (
        <div className={cn("mb-3 flex items-center gap-2 rounded-lg border px-3 py-2", riskBg(metrics.sarcopenia_risk))}>
          <span className={cn("text-xs font-semibold", riskColor(metrics.sarcopenia_risk))}>
            Sarcopenia risk: {metrics.sarcopenia_risk.toUpperCase()}
          </span>
        </div>
      )}
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between py-1">
          <span className="text-xs text-zinc-500">{r.label}</span>
          <span className="text-xs font-medium tabular-nums text-zinc-200">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
