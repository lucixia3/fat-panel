"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSlice } from "@/lib/api";
import type { OverlayData, SlicePayload } from "@/types";

interface Props {
  studyId: string;
  numSlices: number;
  availableModels: { model_key: string; display_name: string }[];
}

export default function SliceViewer({
  studyId,
  numSlices,
  availableModels,
}: Props) {
  const [index, setIndex] = useState(0);
  const [payload, setPayload] = useState<SlicePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [hiddenModels, setHiddenModels] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSlice = useCallback(
    async (idx: number) => {
      setLoading(true);
      try {
        const visibleModels = availableModels
          .filter((m) => !hiddenModels.has(m.model_key))
          .map((m) => m.model_key)
          .join(",");
        const data = await getSlice(studyId, idx, visibleModels || undefined);
        setPayload(data);
      } catch {
        // ignore transient errors during scrubbing
      } finally {
        setLoading(false);
      }
    },
    [studyId, availableModels, hiddenModels]
  );

  // Run on mount (component is re-keyed externally when segmentations change)
  // fetchSlice is stable per render so this captures the correct availableModels
  useEffect(() => {
    setIndex(0);
    fetchSlice(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setIndex(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSlice(v), 60);
  };

  const toggleModel = (key: string) => {
    setHiddenModels((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Re-fetch when visibility changes
  useEffect(() => {
    fetchSlice(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenModels]);

  return (
    <div className="flex h-full flex-col">
      {/* viewer header */}
      <div className="flex items-center gap-4 border-b border-surface-border px-4 py-2.5">
        <div className="flex-1 text-xs text-zinc-400">
          Slice{" "}
          <span className="font-semibold text-zinc-200">{index + 1}</span> /{" "}
          {numSlices}
        </div>
        <input
          type="range"
          min={0}
          max={numSlices - 1}
          value={index}
          onChange={handleSlider}
          className="w-48 accent-brand"
        />
      </div>

      {/* canvas */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
        {payload ? (
          <div className="rotate-90 max-h-full max-w-full">
            {/* base CT */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={payload.base_image}
              alt="CT slice"
              className="max-h-full max-w-full object-contain"
            />
            {/* overlays */}
            {payload.overlays
              .filter((o) => !hiddenModels.has(o.model_key))
              .map((o: OverlayData) => (
                <img
                  key={o.model_key}
                  src={o.image}
                  alt={o.display_name}
                  className="absolute inset-0 max-h-full max-w-full object-contain opacity-60"
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-600">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="text-xs">Loading slice…</span>
            )}
          </div>
        )}
        {loading && payload && (
          <div className="absolute right-2 top-2">
            <Loader2 className="h-4 w-4 animate-spin text-brand-light" />
          </div>
        )}
      </div>

      {/* overlay toggles */}
      {availableModels.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-surface-border px-4 py-2.5">
          {availableModels.map((m) => {
            const hidden = hiddenModels.has(m.model_key);
            return (
              <button
                key={m.model_key}
                onClick={() => toggleModel(m.model_key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition",
                  hidden
                    ? "bg-transparent text-zinc-600 ring-zinc-700"
                    : "bg-brand/15 text-brand-light ring-brand/30"
                )}
              >
                {hidden ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                {m.display_name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
