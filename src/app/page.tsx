"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudy, listStudies } from "@/lib/api";
import type { L3Metrics, StudyDetail, UploadResponse } from "@/types";
import StudyList from "@/components/dashboard/StudyList";
import UploadZone from "@/components/dashboard/UploadZone";
import StudyActions from "@/components/dashboard/StudyActions";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import SliceViewer from "@/components/viewer/SliceViewer";
import Toast from "@/components/layout/Toast";

const LS_KEY = "fatscope_last_study";

export default function HomePage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [studyDetail, setStudyDetail] = useState<StudyDetail | null>(null);
  const [viewerKey, setViewerKey] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Studies list ────────────────────────────────────────────────────────
  const {
    data: studies = [],
    isLoading: studiesLoading,
    refetch: refetchStudies,
  } = useQuery({ queryKey: ["studies"], queryFn: listStudies });

  // ── Load study detail ───────────────────────────────────────────────────
  const loadStudy = useCallback(async (id: string, silent = false) => {
    setActiveId(id);
    localStorage.setItem(LS_KEY, id);
    try {
      const detail = await getStudy(id);
      setStudyDetail(detail);
    } catch {
      if (!silent) setStudyDetail(null);
    }
  }, []);

  // ── Restore last study on mount ─────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) loadStudy(saved, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleUploaded = useCallback(
    (upload: UploadResponse) => {
      refetchStudies();
      loadStudy(upload.id);
      showToast(`"${upload.file_name}" uploaded — ${upload.num_slices} slices`);
    },
    [refetchStudies, loadStudy, showToast]
  );

  const handleModelsComplete = useCallback(async () => {
    if (activeId) {
      await loadStudy(activeId); // wait so availableModels prop is updated BEFORE remount
      setViewerKey((k) => k + 1);
    }
    refetchStudies();
    showToast("Models completed — segmentations loaded");
  }, [activeId, loadStudy, refetchStudies, showToast]);

  const handleSegsUploaded = useCallback(async () => {
    if (activeId) {
      await loadStudy(activeId);
      setViewerKey((k) => k + 1);
    }
    refetchStudies();
    showToast("Segmentations loaded");
  }, [activeId, loadStudy, refetchStudies, showToast]);

  const handleDeleted = useCallback(
    (id: string) => {
      if (activeId === id) {
        setActiveId(null);
        setStudyDetail(null);
        localStorage.removeItem(LS_KEY);
      }
      refetchStudies();
      showToast("Study deleted", "error");
    },
    [activeId, refetchStudies, showToast]
  );

  const handleL3Computed = useCallback(
    (metrics: L3Metrics) => {
      if (!studyDetail) return;
      setStudyDetail({ ...studyDetail, l3_metrics: metrics });
      refetchStudies();
      showToast("L3 sarcopenia metrics computed");
    },
    [studyDetail, refetchStudies, showToast]
  );

  return (
    <>
      <div className="grid h-full grid-cols-[260px_1fr_300px] overflow-hidden">
        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 overflow-hidden border-r border-surface-border bg-surface-card p-4">
          <UploadZone onUploaded={handleUploaded} />
          <div className="flex-1 overflow-hidden rounded-xl border border-surface-border bg-surface">
            <StudyList
              studies={studies}
              activeId={activeId}
              loading={studiesLoading}
              onSelect={loadStudy}
              onRefresh={() => refetchStudies()}
              onDeleted={handleDeleted}
            />
          </div>
        </aside>

        {/* ── CENTER VIEWER ──────────────────────────────────────────────── */}
        <section className="flex flex-col overflow-hidden bg-surface">
          {studyDetail ? (
            <SliceViewer
              key={viewerKey}
              studyId={studyDetail.id}
              numSlices={studyDetail.num_slices}
              availableModels={studyDetail.segmentations.map((s) => ({
                model_key: s.model_key,
                display_name: s.display_name,
              }))}
            />
          ) : (
            <EmptyViewer />
          )}
        </section>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 overflow-y-auto border-l border-surface-border bg-surface-card p-4">
          {studyDetail ? (
            <>
              <StudyActions
                studyId={studyDetail.id}
                onModelsComplete={handleModelsComplete}
                onSegsUploaded={handleSegsUploaded}
              />
              <MetricsPanel
                study={studyDetail}
                onL3Computed={handleL3Computed}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-600">
              Select or upload a study
            </div>
          )}
        </aside>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

function EmptyViewer() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-grid">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6 text-center">
        <div className="mb-3 grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-sm bg-surface-border"
              style={{ opacity: 0.1 + i * 0.08 }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-zinc-400">No study selected</p>
        <p className="mt-1 text-xs text-zinc-600">
          Upload a CT scan or select a study from the left panel
        </p>
      </div>
    </div>
  );
}
