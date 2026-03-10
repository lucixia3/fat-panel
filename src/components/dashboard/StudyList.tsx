"use client";

import { useState } from "react";
import { RefreshCw, FileImage, ChevronRight, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { deleteStudy } from "@/lib/api";
import type { StudySummary } from "@/types";

interface Props {
  studies: StudySummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onDeleted: (id: string) => void;
}

const MODEL_BADGE: Record<string, { label: string; color: string }> = {
  epimedi: { label: "EPI/MEDI", color: "bg-orange-500/20 text-orange-300 ring-orange-500/30" },
  abdomen: { label: "ABD", color: "bg-teal-500/20 text-teal-300 ring-teal-500/30" },
};

export default function StudyList({
  studies, activeId, loading, onSelect, onRefresh, onDeleted,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmId !== id) { setConfirmId(id); return; }
    setDeletingId(id);
    setConfirmId(null);
    try {
      await deleteStudy(id);
      onDeleted(id);
      onRefresh();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Studies
        </h2>
        <button
          onClick={onRefresh}
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-surface-border hover:text-zinc-300"
          title="Refresh"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {studies.length === 0 && !loading && (
          <li className="px-2 py-8 text-center text-xs text-zinc-600">
            No studies yet. Upload a CT scan to start.
          </li>
        )}
        {studies.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => { setConfirmId(null); onSelect(s.id); }}
              className={cn(
                "group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition",
                s.id === activeId ? "bg-brand/15 ring-1 ring-brand/30" : "hover:bg-surface-border/50"
              )}
            >
              <FileImage className={cn("mt-0.5 h-4 w-4 shrink-0", s.id === activeId ? "text-brand-light" : "text-zinc-500")} />

              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", s.id === activeId ? "text-white" : "text-zinc-300")}>
                  {s.file_name}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {s.num_slices} slices · {formatDate(s.uploaded_at)}
                </p>
                {s.segmentations.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {s.segmentations.map((m) => {
                      const badge = MODEL_BADGE[m];
                      return badge ? (
                        <span key={m} className={cn("rounded-full px-1.5 py-0.5 text-[10px] ring-1", badge.color)}>
                          {badge.label}
                        </span>
                      ) : null;
                    })}
                    {s.has_l3_metrics && (
                      <span className="rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[10px] text-yellow-300 ring-1 ring-yellow-500/30">
                        L3
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, s.id)}
                disabled={deletingId === s.id}
                title={confirmId === s.id ? "Click again to confirm" : "Delete study"}
                className={cn(
                  "mt-0.5 shrink-0 rounded p-1 transition",
                  confirmId === s.id
                    ? "text-red-400 bg-red-500/15"
                    : "text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
