/**
 * Immutable Audit Ledger API Client
 */

import { getAuthToken } from './authApi';

export interface LedgerBlockPayload {
  index: number;
  order_id: string;
  timestamp: string;
  type: string;
  parcel_id?: string;
  ulpin?: string;
  officer_badge_id?: string;
  officer_name?: string;
  discrepancy_reason?: string;
  target_accuracy?: string;
  statutory_clause?: string;
  status?: string;
  memo?: string;
  [key: string]: any;
}

export interface LedgerBlock {
  index: number;
  timestamp: string;
  order_id?: string;
  parcel_id?: string;
  ulpin?: string;
  officer_badge_id?: string;
  prev_hash: string;
  hash: string;
  payload: LedgerBlockPayload;
}

export interface LedgerVerifyResult {
  is_valid: boolean;
  total_blocks: number;
  genesis_hash: string;
  tip_hash: string;
  tampered_blocks: Array<{ index: number; reason: string }>;
  verified_at: string;
  status: string;
}

const API_BASE = '/api';

export async function fetchLedgerBlocks(): Promise<LedgerBlock[]> {
  try {
    const res = await fetch(`${API_BASE}/ledger/blocks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.blocks || [];
  } catch (err) {
    console.warn('Failed to fetch ledger blocks:', err);
    return [];
  }
}

export async function verifyLedgerIntegrity(): Promise<LedgerVerifyResult | null> {
  try {
    const res = await fetch(`${API_BASE}/ledger/verify`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to verify ledger integrity:', err);
    return null;
  }
}

export async function issueDroneResurveyOrder(params: {
  parcel_id: string;
  ulpin: string;
  discrepancy_reason: string;
  target_accuracy?: string;
  statutory_clause?: string;
}): Promise<LedgerBlock> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/officer/orders/drone-resurvey`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Order issuance failed (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.block;
}
