"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Upload, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJob, runModels, uploadSegmentations } from "@/lib/api";
import type { Job } from "@/types";

interface Props {
  studyId: string;
  onModelsComplete: () => void;
  onSegsUploaded: () => void;
}

export default function StudyActions({ studyId, onModelsComplete, onSegsUploaded }: Props) {
  const [job, setJob] = useState<Job | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [segError, setSegError] = useState<string | null>(null);
  const [segDone, setSegDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startPolling = useCallback(
    (jobId: string) => {
      stopAll();
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      pollRef.current = setInterval(async () => {
        try {
          const j = await getJob(jobId);
          setJob(j);
          if (j.status === "completed" || j.status === "failed") {
            stopAll();
            if (j.status === "completed") onModelsComplete();
          }
        } catch {
          stopAll();
        }
      }, 2000);
    },
    [onModelsComplete]
  );

  useEffect(() => stopAll, []);

  const handleRun = async () => {
    setJob(null);
    setElapsed(0);
    try {
      const j = await runModels(studyId);
      setJob(j);
      startPolling(j.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start job";
      setJob({ id: "", study_id: studyId, status: "failed", error: msg, created_at: "", updated_at: "" });
    }
  };

  const handleSegUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSegError(null);
    setSegDone(false);
    try {
      await uploadSegmentations(studyId, files);
      setSegDone(true);
      onSegsUploaded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setSegError(msg);
    }
    e.target.value = "";
  };

  const isRunning = job?.status === "running";
  const isFailed = job?.status === "failed";
  const isCompleted = job?.status === "completed";

  const fmtElapsed = (s: number) =>
    s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Actions
      </h3>

      {/* Run models */}
      <button
        onClick={handleRun}
        disabled={isRunning}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition",
          isRunning
            ? "cursor-not-allowed bg-surface-border text-zinc-500"
            : "bg-brand hover:bg-brand-dark text-white"
        )}
      >
        {isRunning ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Running models…</>
        ) : (
          <><Play className="h-4 w-4" />Run models</>
        )}
      </button>

      {/* Job status */}
      {isRunning && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Processing… {fmtElapsed(elapsed)}
        </div>
      )}
      {isCompleted && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-300">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Completed in {fmtElapsed(elapsed)}
        </div>
      )}
      {isFailed && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {job?.error || "Job failed"}
        </div>
      )}
      {job?.warning && (
        <p className="text-xs text-yellow-400">{job.warning}</p>
      )}

      {/* Upload segmentations */}
      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-brand/50 hover:bg-brand/5 hover:text-white">
        <input type="file" accept=".nii,.nii.gz" multiple className="sr-only" onChange={handleSegUpload} />
        <Upload className="h-4 w-4" />
        Load segmentations
      </label>
      {segDone && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Segmentations loaded
        </div>
      )}
      {segError && <p className="text-xs text-red-400">{segError}</p>}
    </div>
  );
}
