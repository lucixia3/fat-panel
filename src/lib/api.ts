import axios from "axios";
import type {
  Job,
  L3Metrics,
  SlicePayload,
  StudyDetail,
  StudySummary,
  UploadResponse,
} from "@/types";

// In the browser, calls go to /api/... which Next.js rewrites to the FastAPI backend.
// In server components / API routes the rewrite also applies.
const BASE = "/api";

const http = axios.create({ baseURL: BASE });

// ─── Studies ──────────────────────────────────────────────────────────────────

export async function listStudies(): Promise<StudySummary[]> {
  const { data } = await http.get<StudySummary[]>("/studies");
  return data;
}

export async function getStudy(id: string): Promise<StudyDetail> {
  const { data } = await http.get<StudyDetail>(`/studies/${id}`);
  return data;
}

export async function deleteStudy(id: string): Promise<void> {
  await http.delete(`/studies/${id}`);
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadCT(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post<UploadResponse>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}

export async function uploadSegmentations(
  studyId: string,
  files: File[]
): Promise<{ registered: { model_key: string; display_name: string }[] }> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const { data } = await http.post(`/segmentations/upload/${studyId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ─── Run models ───────────────────────────────────────────────────────────────

export async function runModels(studyId: string): Promise<Job> {
  const { data } = await http.post<Job & { job_id?: string }>(`/run/${studyId}`);
  // Backend returns job_id, normalise to id
  if (data.job_id && !data.id) data.id = data.job_id;
  return data;
}

export async function getJob(jobId: string): Promise<Job> {
  const { data } = await http.get<Job>(`/jobs/${jobId}`);
  return data;
}

// ─── Slice viewer ─────────────────────────────────────────────────────────────

export async function getSlice(
  studyId: string,
  index: number,
  models?: string
): Promise<SlicePayload> {
  const params: Record<string, string | number> = { index };
  if (models) params.models = models;
  const { data } = await http.get<SlicePayload>(`/slices/${studyId}`, {
    params,
  });
  return data;
}

// ─── L3 ───────────────────────────────────────────────────────────────────────

export async function computeL3(
  studyId: string,
  heightCm?: number
): Promise<L3Metrics> {
  const params: Record<string, number | boolean> = {};
  if (heightCm) params.height_cm = heightCm;
  const { data } = await http.post<L3Metrics>(`/l3/${studyId}`, null, {
    params,
  });
  return data;
}
