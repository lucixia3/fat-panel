"use client";

import { useCallback, useState } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadCT } from "@/lib/api";
import type { UploadResponse } from "@/types";

interface Props {
  onUploaded: (study: UploadResponse) => void;
}

export default function UploadZone({ onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.nii(\.gz)?$/)) {
        setError("Only .nii or .nii.gz files are accepted");
        return;
      }
      setError(null);
      setDone(false);
      setProgress(0);
      try {
        const result = await uploadCT(file, setProgress);
        setDone(true);
        setProgress(null);
        onUploaded(result);
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        const msg =
          status === 404
            ? "Backend not reachable (404). Is the FastAPI server running and API_BASE_URL set correctly?"
            : e instanceof Error
            ? e.message
            : "Upload failed";
        setError(msg);
        setProgress(null);
      }
    },
    [onUploaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-200",
        dragging
          ? "border-brand bg-brand/10"
          : "border-surface-border hover:border-brand/50 hover:bg-brand/5"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept=".nii,.nii.gz"
        className="sr-only"
        onChange={onInput}
      />

      {progress !== null ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-brand-light" />
          <p className="text-sm text-zinc-300">Uploading… {progress}%</p>
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-border">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : done ? (
        <>
          <CheckCircle2 className="h-8 w-8 text-green-400" />
          <p className="text-sm text-green-300">Upload complete</p>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-zinc-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-300">
              Drop CT scan here or click to browse
            </p>
            <p className="mt-1 text-xs text-zinc-500">.nii / .nii.gz accepted</p>
          </div>
        </>
      )}

      {error && (
        <p className="absolute bottom-2 text-xs text-red-400">{error}</p>
      )}
    </label>
  );
}
