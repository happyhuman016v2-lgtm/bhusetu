import * as turf from '@turf/turf';
import { SvamitvaParcel, EncroachmentAnalysisResult } from '../types';

const API_BASE = '/api';

/**
 * Fetch all SVAMITVA drone survey parcels from backend
 */
export async function fetchSvamitvaParcels(landType?: string): Promise<{
  features: SvamitvaParcel[];
  metadata: any;
}> {
  try {
    const url = landType
      ? `${API_BASE}/parcels?land_type=${encodeURIComponent(landType)}`
      : `${API_BASE}/parcels`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      features: data.features || [],
      metadata: data.metadata || {},
    };
  } catch (err) {
    console.warn('Backend API /api/parcels unreachable, loading embedded SVAMITVA village dataset...', err);
    // Dynamic import fallback or empty
    return { features: [], metadata: {} };
  }
}

/**
 * Fetch accurate metric buffer polygon for a given parcel from backend (UTM projected)
 */
export async function fetchParcelBuffer(
  parcelId: string,
  bufferMeters: number
): Promise<GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null> {
  try {
    const url = `${API_BASE}/parcels/${encodeURIComponent(parcelId)}/buffer?distance=${bufferMeters}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`Buffer API failed for ${parcelId}, generating client-side geodesic fallback:`, err);
    return null;
  }
}

/**
 * Run spatial encroachment analysis against public road right-of-way
 */
export async function runEncroachmentAnalysis(
  bufferMeters: number = 3.0,
  parcelIds?: string[]
): Promise<EncroachmentAnalysisResult | null> {
  try {
    const res = await fetch(`${API_BASE}/parcels/analyze-encroachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buffer_meters: bufferMeters,
        parcel_ids: parcelIds,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Encroachment analysis API failed:', err);
    return null;
  }
}

/**
 * Client-side fallback Turf buffer generator if backend is offline
 */
export function generateClientGeodesicBuffer(
  polygon: GeoJSON.Polygon,
  meters: number
): GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> {
  // Turf buffer expects distance in kilometers
  const km = meters / 1000.0;
  return turf.buffer(polygon, km, { units: 'kilometers', steps: 32 }) as any;
}

/**
 * Fetch comprehensive Record of Rights (RoR) title dossier for a parcel
 */
export async function fetchRoRDossier(parcelId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/ror/parcel/${encodeURIComponent(parcelId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`RoR dossier fetch failed for ${parcelId}:`, err);
    return null;
  }
}

/**
 * Fetch downloadable / printable SVAMITVA Digital Property Card (Gharouni)
 */
export async function fetchPropertyCard(parcelId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/ror/parcel/${encodeURIComponent(parcelId)}/property-card`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Property card fetch failed for ${parcelId}:`, err);
    return null;
  }
}

/**
 * Trigger batch derivation of RoR records from drone survey parcels
 */
export async function deriveVillageRoRs(parcelIds?: string[]): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/ror/derive-from-parcels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcel_ids: parcelIds }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('RoR derivation API failed:', err);
    return null;
  }
}

export interface SurveySourceMetadata {
  state: 'CONFIGURED_WFS' | 'UPLOADED_FILE' | 'SYNTHETIC_DEMO' | 'NO_SOURCE';
  source_type: string;
  dataset_id: string;
  original_filename: string;
  source_crs: string;
  survey_date: string;
  supplier: string;
  accuracy_metadata: string;
  geometry_version: string;
  sha256_checksum?: string | null;
  total_features: number;
  imported_at: string;
  disclaimer: string;
}

export interface SurveyUploadResponse {
  status: string;
  imported_count: number;
  rejected_count: number;
  rejected_features: Array<{ feature_index: number; reason: string }>;
  conflicting_ids: string[];
  metadata: SurveySourceMetadata;
  dataset_id: string;
  sha256_checksum: string;
}

export async function fetchSurveySourceState(): Promise<{
  state: string;
  total_parcels: number;
  metadata: SurveySourceMetadata;
}> {
  const res = await fetch(`${API_BASE}/survey/source-state`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function uploadSurveyGeoJSON(
  file: File,
  supplier?: string,
  surveyDate?: string,
  accuracy?: string
): Promise<SurveyUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (supplier) formData.append('supplier', supplier);
  if (surveyDate) formData.append('survey_date', surveyDate);
  if (accuracy) formData.append('accuracy_metadata', accuracy);

  const res = await fetch(`${API_BASE}/survey/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Upload error' }));
    throw new Error(errData.detail || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function testWFSConnection(
  wfsUrl: string,
  layerName?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/survey/wfs-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wfs_url: wfsUrl, layer_name: layerName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'WFS test error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function loadDemoSurvey(): Promise<any> {
  const res = await fetch(`${API_BASE}/survey/load-demo`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function clearSurveySource(): Promise<any> {
  const res = await fetch(`${API_BASE}/survey/clear`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Road Source Service API clients
 */
export async function fetchRoadSourceState(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/survey/road-source-state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Road source state fetch failed:', err);
    return null;
  }
}

export async function fetchRoadFeatures(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/survey/roads`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Road features fetch failed:', err);
    return null;
  }
}

export async function uploadRoadGeoJSON(
  file: File,
  supplier?: string,
  roadName?: string
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  if (supplier) formData.append('supplier', supplier);
  if (roadName) formData.append('road_name', roadName);

  const res = await fetch(`${API_BASE}/survey/upload-road`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Road upload error' }));
    throw new Error(errData.detail || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function loadDemoRoad(): Promise<any> {
  const res = await fetch(`${API_BASE}/survey/load-demo-road`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function clearRoadSource(): Promise<any> {
  const res = await fetch(`${API_BASE}/survey/clear-road`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}


