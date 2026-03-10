// ─── Study ────────────────────────────────────────────────────────────────────

export interface StudySummary {
  id: string;
  file_name: string;
  num_slices: number;
  segmentations: string[];
  has_l3_metrics: boolean;
  uploaded_at: string;
  updated_at: string;
}

export interface SegmentationInfo {
  model_key: string;
  display_name: string;
  labels: Record<number, string>;
  colors: Record<number, string>;
  metrics: MetricRow[];
}

export interface StudyDetail {
  id: string;
  file_name: string;
  num_slices: number;
  segmentations: SegmentationInfo[];
  l3_metrics: L3Metrics | null;
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface MetricRow {
  label: string;
  volume_ml: number;
  voxel_count: number;
  percentage?: number;
}

export interface L3Metrics {
  l3_slice_index: number;
  vertebra_used?: string;
  sma_cm2: number | null;
  smi_cm2_m2: number | null;
  sat_area_cm2: number | null;
  vat_area_cm2: number | null;
  imat_area_cm2: number | null;
  height_cm: number | null;
  sarcopenia_risk: "low" | "moderate" | "high" | null;
  computed_at: string;
  case_id: string;
}

// ─── Slice viewer ─────────────────────────────────────────────────────────────

export interface OverlayData {
  model_key: string;
  display_name: string;
  colors: Record<number, string>;
  image: string; // full data URI: "data:image/png;base64,..."
}

export interface SlicePayload {
  index: number;
  total_slices: number;
  base_image: string; // full data URI: "data:image/png;base64,..."
  overlays: OverlayData[];
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export type JobStatus = "running" | "completed" | "failed";

export interface Job {
  id: string;
  study_id: string;
  status: JobStatus;
  error?: string;
  warning?: string;
  created_at: string;
  updated_at: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResponse {
  id: string;
  file_name: string;
  num_slices: number;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export type ModelKey = "epimedi" | "abdomen";

export const MODEL_DISPLAY: Record<ModelKey, string> = {
  epimedi: "Epicardial & Mediastinal Fat",
  abdomen: "Muscle & Adipose Tissue",
};

export const TISSUE_COLORS: Record<string, string> = {
  "Grasa epicardica": "#FF4F5E",
  "Grasa mediastinica": "#FFB347",
  "Músculo": "#00B5AD",
  SAT: "#F368A1",
  VAT: "#7C4DFF",
  "Grasa intramuscular": "#FFD166",
};
