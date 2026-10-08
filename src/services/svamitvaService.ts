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
