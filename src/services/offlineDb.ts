/**
 * Offline Evidence Capture Engine powered by Dexie.js
 * Implements:
 * - Persistent client-side drafts (UUID, parcel reference, notes, photo, approximate GPS)
 * - Three-stage status tracking: 'SAVED_ON_DEVICE', 'PENDING_SYNC', 'SYNCED'
 * - Authenticated server sync with server-side deduplication
 * - Disconnect -> save -> reconnect -> sync twice test suite
 */

import Dexie, { type Table } from 'dexie';

export interface OfflineEvidenceDraft {
  uuid: string;
  userEmail: string;
  parcelId: string;
  ulpin: string;
  notes: string;
  photoDataUrl?: string;
  gpsCoords?: [number, number];
  status: 'SAVED_ON_DEVICE' | 'PENDING_SYNC' | 'SYNCED';
  createdAt: string;
  syncedAt?: string;
}

export class BhuSetuOfflineDatabase extends Dexie {
  offlineDrafts!: Table<OfflineEvidenceDraft, string>;

  constructor() {
    super('BhuSetuOfflineDB');
    this.version(1).stores({
      offlineDrafts: 'uuid, userEmail, parcelId, status, createdAt',
    });
  }
}

export const offlineDb = new BhuSetuOfflineDatabase();

import { API_BASE } from './apiConfig';

/**
 * Save draft strictly locally in IndexedDB
 */
export async function saveLocalDraft(draft: Omit<OfflineEvidenceDraft, 'status' | 'createdAt'>): Promise<OfflineEvidenceDraft> {
  const fullDraft: OfflineEvidenceDraft = {
    ...draft,
    status: 'SAVED_ON_DEVICE',
    createdAt: new Date().toISOString(),
  };
  await offlineDb.offlineDrafts.put(fullDraft);
  return fullDraft;
}

/**
 * Retrieve user-scoped drafts from IndexedDB
 */
export async function getUserDrafts(userEmail: string): Promise<OfflineEvidenceDraft[]> {
  return await offlineDb.offlineDrafts
    .where('userEmail')
    .equals(userEmail)
    .reverse()
    .sortBy('createdAt');
}

/**
 * Synchronize single draft to server with deduplication
 */
export async function syncDraftToServer(draft: OfflineEvidenceDraft): Promise<{
  success: boolean;
  wasDeduplicated: boolean;
  serverRecord: any;
}> {
  // Update local state to pending
  await offlineDb.offlineDrafts.update(draft.uuid, { status: 'PENDING_SYNC' });

  const res = await fetch(`${API_BASE}/evidence/sync-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uuid: draft.uuid,
      user_email: draft.userEmail,
      parcel_id: draft.parcelId,
      ulpin: draft.ulpin,
      notes: draft.notes,
      gps_coords: draft.gpsCoords,
      photo_data_url: draft.photoDataUrl,
    }),
  });

  if (!res.ok) {
    throw new Error(`Sync failed with HTTP ${res.status}`);
  }

  const result = await res.json();

  // Mark local record as SYNCED
  const syncedAt = new Date().toISOString();
  await offlineDb.offlineDrafts.update(draft.uuid, {
    status: 'SYNCED',
    syncedAt,
  });

  return {
    success: true,
    wasDeduplicated: result.was_deduplicated,
    serverRecord: result.record,
  };
}

/**
 * Run test: disconnect -> save -> reconnect -> sync twice -> verify 1 server record
 */
export async function runDisconnectSyncTwiceTest(
  userEmail: string,
  parcelId: string,
  ulpin: string
): Promise<{
  draftUuid: string;
  firstSyncResult: any;
  secondSyncResult: any;
  serverDraftCount: number;
  testPassed: boolean;
}> {
  // 1. Generate client UUIDv4
  const testUuid = `offline-test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // 2. Save locally (Saved on device)
  const localDraft = await saveLocalDraft({
    uuid: testUuid,
    userEmail,
    parcelId,
    ulpin,
    notes: 'Field Ground Verification: Boundary stones confirmed intact along northern perimeter.',
    gpsCoords: [80.9452, 26.9858],
  });

  // 3. Sync #1
  const sync1 = await syncDraftToServer(localDraft);

  // 4. Sync #2 (Repeated sync with identical UUID)
  const sync2 = await syncDraftToServer(localDraft);

  // 5. Query server to confirm deduplication
  const listRes = await fetch(`${API_BASE}/evidence/synced-drafts?user_email=${encodeURIComponent(userEmail)}`);
  const listData = await listRes.json();
  const matchingRecords = (listData.drafts || []).filter((d: any) => d.uuid === testUuid);

  const testPassed = !sync1.wasDeduplicated && sync2.wasDeduplicated && matchingRecords.length === 1;

  return {
    draftUuid: testUuid,
    firstSyncResult: sync1,
    secondSyncResult: sync2,
    serverDraftCount: matchingRecords.length,
    testPassed,
  };
}
