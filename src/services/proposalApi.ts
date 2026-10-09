/**
 * Interactive Boundary Proposal API Client
 */

export interface ProposalDiffResult {
  is_valid: boolean;
  validation_error?: string;
  parcel_id?: string;
  sequence_id: number;
  utm_epsg?: number;
  original_area_sqm?: number;
  proposed_area_sqm?: number;
  area_change_sqm?: number;
  area_change_pct?: number;
  symmetric_difference_area_sqm?: number;
  symmetric_difference_geometry?: any;
  road_buffer_overlap_sqm?: number;
  causes_encroachment?: boolean;
}

export interface BoundaryProposalRecord {
  proposal_id: string;
  parcel_id: string;
  ulpin: string;
  status: string;
  reason: string;
  evidence_version: string;
  author_badge_id: string;
  author_name: string;
  created_at: string;
  metrics: {
    original_area_sqm: number;
    proposed_area_sqm: number;
    area_change_sqm: number;
    area_change_pct: number;
    symmetric_difference_area_sqm: number;
    road_buffer_overlap_sqm: number;
  };
  original_geometry: any;
  proposed_geometry: any;
  symmetric_difference_geometry?: any;
}

export interface DemoShiftedFixture {
  fixture_label: string;
  square_side_meters: number;
  shift_meters_east: number;
  original_square: {
    area_sqm: number;
    geometry: any;
  };
  proposed_shifted_square: {
    area_sqm: number;
    geometry: any;
  };
  symmetric_difference: {
    area_sqm: number;
    geometry: any;
    mathematical_formula: string;
  };
  verification_status: string;
}

import { API_BASE } from './apiConfig';

export async function calculateProposalDiff(params: {
  parcel_id: string;
  original_geometry: any;
  proposed_geometry: any;
  sequence_id: number;
}): Promise<ProposalDiffResult> {
  const res = await fetch(`${API_BASE}/proposals/calculate-diff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Diff calculation failed (HTTP ${res.status})`);
  }

  return await res.json();
}

export async function saveBoundaryProposal(params: {
  parcel_id: string;
  ulpin: string;
  original_geometry: any;
  proposed_geometry: any;
  reason: string;
  evidence_version?: string;
  author_badge_id?: string;
  author_name?: string;
}): Promise<BoundaryProposalRecord> {
  const res = await fetch(`${API_BASE}/proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Saving proposal failed (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.proposal;
}

export async function fetchProposals(parcel_id?: string): Promise<BoundaryProposalRecord[]> {
  const url = parcel_id ? `${API_BASE}/proposals?parcel_id=${encodeURIComponent(parcel_id)}` : `${API_BASE}/proposals`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.proposals || [];
}

export async function fetchDemoShiftedFixture(origin_lon?: number, origin_lat?: number): Promise<DemoShiftedFixture> {
  const q = origin_lon && origin_lat ? `?origin_lon=${origin_lon}&origin_lat=${origin_lat}` : '';
  const res = await fetch(`${API_BASE}/proposals/demo-fixture${q}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
