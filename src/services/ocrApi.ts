/**
 * RoR Document OCR & Auto-Digitization API Client
 */

export interface OCRExtractedEntities {
  khasra_no: string;
  khata_no: string;
  village_name: string;
  tehsil: string;
  district: string;
  state: string;
  pattadar_names: string[];
  recorded_area_sqm: number;
  recorded_area_acres: number;
  tenure_category: string;
  mortgage_status: string;
  is_encumbered: boolean;
  document_type: string;
  ocr_confidence: number;
}

export interface OCRSpatialMatch {
  parcel_id: string;
  property_id: string;
  ulpin: string;
  survey_plot_no: string;
  owner_drone_survey: string;
  owner_ocr_registry: string;
  drone_measured_area_sqm: number;
  ocr_recorded_area_sqm: number;
  area_variance_sqm: number;
  area_variance_pct: number;
  is_within_statutory_tolerance: boolean;
  match_confidence: number;
  geometry: any;
  spatial_overlay_ready: boolean;
}

export interface OCRUploadResponse {
  filename: string;
  extracted_entities: OCRExtractedEntities;
  spatial_match: OCRSpatialMatch | null;
  raw_text_preview: string;
  has_preprocessed_preview: boolean;
}

const API_BASE = '/api';

export async function uploadRoRDocument(file: File): Promise<OCRUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/documents/upload-ror`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload & OCR processing failed (HTTP ${res.status})`);
  }

  const result = await res.json();
  return result.data;
}
