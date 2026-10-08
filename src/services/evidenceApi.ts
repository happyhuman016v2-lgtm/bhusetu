/**
 * Cryptographically Signed Evidence Report API Client
 */

export interface SignedEvidenceReport {
  report_id: string;
  snapshot: {
    report_id: string;
    parcel_id: string;
    ulpin: string;
    geometry_revision: string;
    drone_area_sqm: number;
    legal_area_sqm: number;
    variance_pct: number;
    analysis_digest: string;
    issuer_badge: string;
    issuer_name: string;
    issued_at: string;
    prototype_disclaimer: string;
  };
  signature_b64: string;
  algorithm: string;
  qr_code_data_uri: string;
  public_key_fingerprint: string;
  verification_status: string;
  prototype_disclaimer: string;
}

export interface VerifyReportResult {
  is_authentic: boolean;
  status_code: string;
  message: string;
  report_id: string;
  verified_snapshot: any;
  stored_original_snapshot?: any;
  tampered_fields: Array<{
    field: string;
    stored_original_value: any;
    submitted_value: any;
    description: string;
  }>;
  is_superseded_revision: boolean;
  algorithm: string;
  prototype_disclaimer: string;
}

export interface DemoTamperTestResult {
  report_id: string;
  qr_code_data_uri: string;
  demo_results: Array<{
    case: string;
    status: string;
    is_authentic: boolean;
    message: string;
    tampered_fields?: any[];
  }>;
}

const API_BASE = '/api';

export async function createSignedEvidenceReport(params: {
  parcel_id: string;
  ulpin: string;
  geometry_revision?: string;
  drone_area_sqm: number;
  legal_area_sqm: number;
  variance_pct: number;
  analysis_digest?: string;
  issuer_badge?: string;
  issuer_name?: string;
}): Promise<SignedEvidenceReport> {
  const res = await fetch(`${API_BASE}/evidence/sign-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Signing report failed (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.report;
}

export async function verifyEvidenceReport(params: {
  snapshot_payload: any;
  signature_b64: string;
  current_active_revision?: string;
}): Promise<VerifyReportResult> {
  const res = await fetch(`${API_BASE}/evidence/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Verification request failed (HTTP ${res.status})`);
  }

  return await res.json();
}

export async function fetchDemoTamperTest(parcel_id: string = 'svamitva-101'): Promise<DemoTamperTestResult> {
  const res = await fetch(`${API_BASE}/evidence/demo-tamper-test?parcel_id=${encodeURIComponent(parcel_id)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
