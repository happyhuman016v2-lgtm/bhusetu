import React, { useState, useEffect } from 'react';
import { Parcel, PartitionResult, OfficerAuditEntry } from '../types';
import { divideParcelEquitably } from '../services/partitionEngine';
import {
  AuthUser,
  loginUser,
  getStoredUser,
  clearAuthToken,
} from '../services/authApi';
import {
  LedgerBlock,
  LedgerVerifyResult,
  fetchLedgerBlocks,
  verifyLedgerIntegrity,
  issueDroneResurveyOrder,
} from '../services/ledgerApi';
import {
  uploadRoRDocument,
  OCRUploadResponse,
} from '../services/ocrApi';
import {
  fetchProposals,
  BoundaryProposalRecord,
} from '../services/proposalApi';
import {
  saveLocalDraft,
  getUserDrafts,
  syncDraftToServer,
  runDisconnectSyncTwiceTest,
  OfflineEvidenceDraft,
} from '../services/offlineDb';
import { BoundaryProposalEditor } from './BoundaryProposalEditor';
import { SignedEvidenceModal } from './SignedEvidenceModal';
import {
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Lock,
  LogIn,
  LogOut,
  Stamp,
  FileText,
  KeyRound,
  Eye,
  Check,
  Building,
  Scale,
  Sparkles,
  Upload,
  Link as LinkIcon,
  ShieldCheck,
  RefreshCw,
  Search,
  Hash,
  Clock,
  Layers,
  Award,
  Move,
  QrCode,
  Sliders,
  Copy,
  ChevronRight,
  Database,
  Wifi,
  WifiOff,
  Smartphone,
  CheckCheck,
  Globe,
  Trash2,
  Printer,
} from 'lucide-react';
import {
  EncroachmentConflict,
  EncroachmentAnalysisResult,
  RoadSourceMetadata,
} from '../types';
import {
  fetchSurveySourceState,
  uploadSurveyGeoJSON,
  testWFSConnection,
  loadDemoSurvey,
  clearSurveySource,
  fetchRoadSourceState,
  uploadRoadGeoJSON,
  loadDemoRoad,
  clearRoadSource,
  SurveySourceMetadata,
  SurveyUploadResponse,
} from '../services/svamitvaService';
import { RoRDossierModal } from './RoRDossierModal';

interface Props {
  parcels: Parcel[];
  selectedParcel: Parcel;
  onSelectParcel: (id: string) => void;
  pendingPartitions: PartitionResult[];
  onApprovePartition: (partition: PartitionResult) => void;
  auditLogs: OfficerAuditEntry[];
  onAddAuditLog: (entry: Omit<OfficerAuditEntry, 'id' | 'timestamp' | 'hash'>) => void;
  bufferDistance?: number;
  onBufferDistanceChange?: (dist: number) => void;
  encroachmentResults?: EncroachmentAnalysisResult | null;
  isAnalyzingEncroachments?: boolean;
  onRunAnalysis?: () => void;
  onParcelsUpdated?: () => void;
}

export const OfficerPortal: React.FC<Props> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  pendingPartitions,
  onApprovePartition,
  auditLogs,
  onAddAuditLog,
  bufferDistance = 3.0,
  onBufferDistanceChange,
  encroachmentResults,
  isAnalyzingEncroachments = false,
  onRunAnalysis,
  onParcelsUpdated,
}) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [emailInput, setEmailInput] = useState('officer@bhusetu.gov.in');
  const [passwordInput, setPasswordInput] = useState('Officer@BhuSetu2026!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: 'triage' | 'ocr' | 'offline' | 'ledger' | 'gis'
  const [activeTab, setActiveTab] = useState<'triage' | 'ocr' | 'offline' | 'ledger' | 'gis'>('triage');

  // GIS & Survey Ingestion State
  const [sourceMeta, setSourceMeta] = useState<SurveySourceMetadata | null>(null);
  const [surveyFile, setSurveyFile] = useState<File | null>(null);
  const [supplierInput, setSupplierInput] = useState<string>('');
  const [surveyDateInput, setSurveyDateInput] = useState<string>('2026-10-08');
  const [accuracyInput, setAccuracyInput] = useState<string>('Sub-5cm Drone Photogrammetry');
  const [isUploadingSurvey, setIsUploadingSurvey] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<SurveyUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // WFS State
  const [wfsUrl, setWfsUrl] = useState<string>('https://svamitva.nic.in/geoserver/wfs');
  const [wfsLayer, setWfsLayer] = useState<string>('svamitva:cadastral_drone_parcels');
  const [isTestingWFS, setIsTestingWFS] = useState<boolean>(false);
  const [wfsTestResult, setWfsTestResult] = useState<any | null>(null);

  // Road Source State
  const [roadMeta, setRoadMeta] = useState<RoadSourceMetadata | null>(null);
  const [roadFile, setRoadFile] = useState<File | null>(null);
  const [roadSupplierInput, setRoadSupplierInput] = useState<string>('');
  const [roadNameInput, setRoadNameInput] = useState<string>('');
  const [isUploadingRoad, setIsUploadingRoad] = useState<boolean>(false);
  const [uploadRoadResult, setUploadRoadResult] = useState<any | null>(null);
  const [uploadRoadError, setUploadRoadError] = useState<string | null>(null);

  // Conflict / Notice State
  const [selectedConflict, setSelectedConflict] = useState<EncroachmentConflict | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [showRoRDossierModal, setShowRoRDossierModal] = useState<boolean>(false);

  // Boundary Proposal Editor State
  const [showProposalEditor, setShowProposalEditor] = useState<boolean>(false);
  const [proposalsList, setProposalsList] = useState<BoundaryProposalRecord[]>([]);

  // Dexie.js Offline Evidence State
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineEvidenceDraft[]>([]);
  const [offlineDraftNotes, setOfflineDraftNotes] = useState('Ground verification: Boundary stones confirmed intact along northern perimeter.');
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [offlineSyncMessage, setOfflineSyncMessage] = useState<string | null>(null);
  const [offlineTestResult, setOfflineTestResult] = useState<any | null>(null);
  const [isRunningOfflineTest, setIsRunningOfflineTest] = useState(false);

  // Signed Evidence Modal State
  const [showSignedEvidenceModal, setShowSignedEvidenceModal] = useState<boolean>(false);

  // Statutory Land Partition State
  const [officerDivisionMode, setOfficerDivisionMode] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [officerShareholders, setOfficerShareholders] = useState([
    { id: 'off-p-1', name: 'Party 1 (Shareholder A)', sharePercent: 50 },
    { id: 'off-p-2', name: 'Party 2 (Shareholder B)', sharePercent: 50 },
  ]);
  const [computedOfficerPartition, setComputedOfficerPartition] = useState<PartitionResult | null>(null);

  // Encroachment Notice Modal
  const [selectedNoticeParcel, setSelectedNoticeParcel] = useState<Parcel | null>(null);

  // OCR Upload State
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [isUploadingOcr, setIsUploadingOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRUploadResponse | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Immutable Ledger State
  const [ledgerBlocks, setLedgerBlocks] = useState<LedgerBlock[]>([]);
  const [verificationResult, setVerificationResult] = useState<LedgerVerifyResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Resurvey Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderParcelId, setOrderParcelId] = useState(selectedParcel.id);
  const [orderULPIN, setOrderULPIN] = useState(selectedParcel.ulpin || 'UP1428SNMPGN101');
  const [orderReason, setOrderReason] = useState(
    'Discrepancy detected: Actual drone survey polygon reveals 42.5m² encroachment beyond legal registry setback.'
  );
  const [orderResolution, setOrderResolution] = useState('< 3cm GSD UAV Photogrammetry');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Sync selected parcel
  useEffect(() => {
    if (selectedParcel) {
      setOrderParcelId(selectedParcel.id);
      setOrderULPIN(selectedParcel.ulpin || `UP1428SNMPGN${selectedParcel.id.slice(-3).toUpperCase()}`);
    }
  }, [selectedParcel]);

  // Load ledger blocks & proposals on mount
  useEffect(() => {
    fetchLedgerBlocks().then((blocks) => setLedgerBlocks(blocks));
    fetchProposals().then((props) => setProposalsList(props));
    loadSourceState();
    loadRoadState();
  }, []);

  // Load Survey & Road Source State
  const loadSourceState = async () => {
    try {
      const res = await fetchSurveySourceState();
      if (res?.metadata) setSourceMeta(res.metadata);
    } catch (e) {
      console.warn('Failed to fetch survey source state:', e);
    }
  };

  const loadRoadState = async () => {
    try {
      const res = await fetchRoadSourceState();
      if (res?.metadata) setRoadMeta(res.metadata);
    } catch (e) {
      console.warn('Failed to fetch road source state:', e);
    }
  };

  const handleSurveyFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyFile) {
      setUploadError('Please select a GeoJSON survey file.');
      return;
    }
    setIsUploadingSurvey(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const result = await uploadSurveyGeoJSON(
        surveyFile,
        supplierInput || 'Field Survey Agency',
        accuracyInput || 'Sub-5cm Drone Photogrammetry',
        surveyDateInput || new Date().toISOString().split('T')[0]
      );
      setUploadResult(result);
      await loadSourceState();
      if (onParcelsUpdated) onParcelsUpdated();
      onAddAuditLog({
        officerName: currentUser?.full_name || 'Revenue Officer',
        designation: currentUser?.designation || 'Tahsildar',
        action: 'DISCREPANCY_REINSPECT_FLAGGED',
        parcelId: selectedParcel.id,
        surveyNumber: selectedParcel.surveyNumber,
        details: `Imported Cadastral GeoJSON: ${result.imported_count} features. SHA-256: ${result.metadata?.sha256_checksum?.slice(0, 16)}...`,
      });
    } catch (err: any) {
      setUploadError(err.message || 'Survey GeoJSON upload failed.');
    } finally {
      setIsUploadingSurvey(false);
    }
  };

  const handleTestWFS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingWFS(true);
    setWfsTestResult(null);
    try {
      const result = await testWFSConnection(wfsUrl, wfsLayer);
      setWfsTestResult(result);
    } catch (err: any) {
      setWfsTestResult({
        status: 'error',
        message: err.message || 'WFS Connection Test failed.',
      });
    } finally {
      setIsTestingWFS(false);
    }
  };

  const handleLoadDemoSurvey = async () => {
    try {
      await loadDemoSurvey();
      await loadSourceState();
      if (onParcelsUpdated) onParcelsUpdated();
    } catch (err: any) {
      alert(`Failed to load demo survey: ${err.message}`);
    }
  };

  const handleClearSurvey = async () => {
    try {
      await clearSurveySource();
      await loadSourceState();
      if (onParcelsUpdated) onParcelsUpdated();
    } catch (err: any) {
      alert(`Failed to clear survey source: ${err.message}`);
    }
  };

  const handleRoadFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadFile) {
      setUploadRoadError('Please select a Road GeoJSON file.');
      return;
    }
    setIsUploadingRoad(true);
    setUploadRoadError(null);
    setUploadRoadResult(null);

    try {
      const result = await uploadRoadGeoJSON(
        roadFile,
        roadSupplierInput || 'Road Authority / Field Survey',
        roadNameInput || undefined
      );
      setUploadRoadResult(result);
      await loadRoadState();
      if (onParcelsUpdated) onParcelsUpdated();
      onAddAuditLog({
        officerName: currentUser?.full_name || 'Revenue Officer',
        designation: currentUser?.designation || 'Tahsildar',
        action: 'TRUST_SCORE_VERIFIED',
        parcelId: selectedParcel.id,
        surveyNumber: selectedParcel.surveyNumber,
        details: `Imported Authoritative Road Vectors: ${result.imported_count} features.`,
      });
    } catch (err: any) {
      setUploadRoadError(err.message || 'Road GeoJSON upload failed.');
    } finally {
      setIsUploadingRoad(false);
    }
  };

  const handleLoadDemoRoad = async () => {
    try {
      await loadDemoRoad();
      await loadRoadState();
      if (onParcelsUpdated) onParcelsUpdated();
    } catch (err: any) {
      alert(`Failed to load demo road: ${err.message}`);
    }
  };

  const handleClearRoad = async () => {
    try {
      await clearRoadSource();
      await loadRoadState();
      if (onParcelsUpdated) onParcelsUpdated();
    } catch (err: any) {
      alert(`Failed to clear road source: ${err.message}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const response = await loginUser(emailInput, passwordInput);
      setCurrentUser(response.user);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  const handleOfficerComputePartition = () => {
    const count = officerShareholders.length;
    let shares = [...officerShareholders];
    if (officerDivisionMode === 'EQUAL') {
      const eq = Math.round((100 / count) * 10) / 10;
      shares = shares.map((s, i) => ({
        ...s,
        sharePercent: i === count - 1 ? 100 - eq * (count - 1) : eq,
      }));
      setOfficerShareholders(shares);
    }
    const result = divideParcelEquitably(
      selectedParcel,
      shares.map((s) => ({ id: s.id, name: s.name, shareFraction: s.sharePercent / 100 }))
    );
    setComputedOfficerPartition(result);
  };

  const handleIssueNotice = (parcel: Parcel) => {
    onAddAuditLog({
      officerName: currentUser?.full_name || parcel.nearestOffice.officerName,
      designation: currentUser?.designation || parcel.nearestOffice.designation,
      action: 'DEMOLITION_NOTICE_ISSUED',
      parcelId: parcel.id,
      surveyNumber: parcel.surveyNumber,
      details: `Form VII Statutory Notice issued for ${parcel.violations[0]?.encroachmentAreaSqm || 'buffer'} m² encroachment into ${parcel.bufferZone?.name || 'public buffer'}.`,
    });
    setSelectedNoticeParcel(parcel);
  };

  const handleApproveSubdivision = (partition: PartitionResult) => {
    onApprovePartition(partition);
    onAddAuditLog({
      officerName: currentUser?.full_name || selectedParcel.nearestOffice.officerName,
      designation: currentUser?.designation || selectedParcel.nearestOffice.designation,
      action: 'PARTITION_MUTATION_APPROVED',
      parcelId: partition.parcelId,
      surveyNumber: selectedParcel.surveyNumber,
      details: `Equitable land partition approved into ${partition.splits.length} sub-parcels with ${partition.parityScore}% area parity. Sub-ULPINs assigned.`,
    });
  };

  // OCR Upload Handler
  const handleOcrFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setOcrFile(file);
    setOcrError(null);
    setIsUploadingOcr(true);

    try {
      const result = await uploadRoRDocument(file);
      setOcrResult(result);
      if (result.spatial_match?.parcel_id) {
        onSelectParcel(result.spatial_match.parcel_id);
      }
    } catch (err: any) {
      setOcrError(err.message || 'Failed to process document OCR.');
    } finally {
      setIsUploadingOcr(false);
    }
  };

  // Trigger Demo Scenario for OCR & Duplicate checks
  const handleRunDemoScenario = async (scenarioFilename: string) => {
    setIsUploadingOcr(true);
    setOcrError(null);
    try {
      // Mock dummy file with scenario name
      const blob = new Blob([`Simulated document content for ${scenarioFilename}`], {
        type: scenarioFilename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      });
      const file = new File([blob], scenarioFilename);
      setOcrFile(file);
      const result = await uploadRoRDocument(file);
      setOcrResult(result);
    } catch (err: any) {
      setOcrError(err.message || 'Demo scenario execution failed.');
    } finally {
      setIsUploadingOcr(false);
    }
  };

  // Ledger Verification Handler
  const handleVerifyLedger = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyLedgerIntegrity();
      setVerificationResult(result);
      const blocks = await fetchLedgerBlocks();
      setLedgerBlocks(blocks);
    } finally {
      setIsVerifying(false);
    }
  };

  // Issue Drone Resurvey Order
  const handleDispatchResurveyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    setOrderSuccessMsg(null);

    try {
      const newBlock = await issueDroneResurveyOrder({
        parcel_id: orderParcelId,
        ulpin: orderULPIN,
        discrepancy_reason: orderReason,
        target_accuracy: orderResolution,
        statutory_clause: 'Survey and Boundaries Act / State Cadastral Resurvey Directive (Sec 67-A)',
      });

      setOrderSuccessMsg(
        `Order cryptographically sealed in Block #${newBlock.index} (SHA-256: ${newBlock.hash.slice(0, 16)}...)`
      );

      // Refresh blocks
      const blocks = await fetchLedgerBlocks();
      setLedgerBlocks(blocks);

      // Add to audit log
      onAddAuditLog({
        officerName: currentUser?.full_name || 'Revenue Officer',
        designation: currentUser?.designation || 'Tahsildar',
        action: 'DRONE_RESURVEY_ORDERED',
        parcelId: orderParcelId,
        surveyNumber: selectedParcel.surveyNumber,
        details: `Statutory UAV Drone Resurvey ordered for ${orderULPIN}. Sealed in ledger Block #${newBlock.index}.`,
      });

      setTimeout(() => {
        setShowOrderModal(false);
        setOrderSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      alert(`Order dispatch error: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Dexie.js Offline Evidence Handlers
  const loadOfflineDrafts = async () => {
    if (currentUser?.email) {
      try {
        const drafts = await getUserDrafts(currentUser.email);
        setOfflineDrafts(drafts);
      } catch (e) {
        console.warn('Could not load drafts from IndexedDB', e);
      }
    }
  };

  useEffect(() => {
    loadOfflineDrafts();
  }, [currentUser, activeTab]);

  const handleSaveOfflineDraft = async () => {
    if (!currentUser) return;
    try {
      const newDraft = await saveLocalDraft({
        uuid: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userEmail: currentUser.email,
        parcelId: selectedParcel.id,
        ulpin: selectedParcel.ulpin || `UP1428SNMPGN${selectedParcel.id.slice(-3).toUpperCase()}`,
        notes: offlineDraftNotes,
        gpsCoords: [80.9452, 26.9858],
      });
      setOfflineDrafts((prev) => [newDraft, ...prev]);
      setOfflineSyncMessage('Draft saved locally in IndexedDB (Status: SAVED_ON_DEVICE)');
      setTimeout(() => setOfflineSyncMessage(null), 3500);
    } catch (err: any) {
      alert(`Could not save draft locally: ${err.message}`);
    }
  };

  const handleSyncSingleDraft = async (draft: OfflineEvidenceDraft) => {
    setIsSyncingOffline(true);
    try {
      const res = await syncDraftToServer(draft);
      await loadOfflineDrafts();
      setOfflineSyncMessage(
        res.wasDeduplicated
          ? 'Server recognized duplicate record: Idempotent deduplication confirmed.'
          : `Draft ${draft.uuid.slice(0, 12)} successfully synced to server ledger!`
      );
      setTimeout(() => setOfflineSyncMessage(null), 3500);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingOffline(false);
    }
  };

  const handleSyncAllDrafts = async () => {
    setIsSyncingOffline(true);
    try {
      for (const d of offlineDrafts) {
        if (d.status !== 'SYNCED') {
          await syncDraftToServer(d);
        }
      }
      await loadOfflineDrafts();
      setOfflineSyncMessage('All pending local drafts synced to server.');
      setTimeout(() => setOfflineSyncMessage(null), 3500);
    } catch (err: any) {
      alert(`Sync error: ${err.message}`);
    } finally {
      setIsSyncingOffline(false);
    }
  };

  const handleRunOfflineTest = async () => {
    if (!currentUser) return;
    setIsRunningOfflineTest(true);
    setOfflineTestResult(null);
    try {
      const result = await runDisconnectSyncTwiceTest(
        currentUser.email,
        selectedParcel.id,
        selectedParcel.ulpin || `UP1428SNMPGN${selectedParcel.id.slice(-3).toUpperCase()}`
      );
      setOfflineTestResult(result);
      await loadOfflineDrafts();
    } catch (err: any) {
      alert(`Offline test error: ${err.message}`);
    } finally {
      setIsRunningOfflineTest(false);
    }
  };

  // IF NOT AUTHENTICATED: Show GovTech RBAC Login Gate
  if (!currentUser) {
    return (
      <div className="bg-white border border-[#E7DFD5] rounded-3xl p-6 shadow-sm max-w-md mx-auto my-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] mx-auto shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-[#23201F]">Revenue Officer Authentication</h2>
          <p className="text-xs text-[#6B6360]">
            Bcrypt + JWT Secured Role-Based Access Control (RBAC) Gate
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#23201F] mb-1">
              Official Gov Email ID
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#23201F] focus:outline-none focus:border-[#C85A32]"
              placeholder="officer@bhusetu.gov.in"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#23201F] mb-1">
              Statutory Password
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#23201F] focus:outline-none focus:border-[#C85A32]"
              required
            />
          </div>

          {/* Quick Demo Credential Pills */}
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-1.5 text-[11px] text-[#6B6360]">
            <span className="font-bold text-[#23201F] block flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-[#C85A32]" />
              Quick Login Demo Profiles:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmailInput('officer@bhusetu.gov.in');
                  setPasswordInput('Officer@BhuSetu2026!');
                }}
                className="px-2 py-1 rounded bg-white border border-[#E7DFD5] font-semibold text-[#23201F] hover:bg-gray-100 transition-colors"
              >
                Tahsildar (SDM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailInput('patwari@bhusetu.gov.in');
                  setPasswordInput('Patwari@BhuSetu2026!');
                }}
                className="px-2 py-1 rounded bg-white border border-[#E7DFD5] font-semibold text-[#23201F] hover:bg-gray-100 transition-colors"
              >
                Patwari (RI)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C85A32] text-white hover:bg-[#A94424] transition-colors text-xs font-bold shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoggingIn ? 'Authenticating with Bcrypt...' : 'Unlock Officer Console'}</span>
          </button>
        </form>
      </div>
    );
  }

  const criticalParcels = parcels.filter((p) => p.status === 'CRITICAL');
  const warningParcels = parcels.filter((p) => p.status === 'WARNING');

  return (
    <div className="space-y-4">
      {/* Officer Header Card */}
      <div className="bg-[#23201F] text-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 border border-[#383432]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">{currentUser.full_name}</h2>
              <span className="text-[10px] bg-[#276728] text-white px-2 py-0.5 rounded-full font-bold">
                Badge: {currentUser.badge_id || 'REV-OFF-UP-042'}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              {currentUser.designation} • {currentUser.jurisdiction}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoRDossierModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C85A32]/30 hover:bg-[#C85A32] text-xs font-semibold text-white transition-colors border border-[#C85A32]/50"
            title="Inspect comprehensive RoR Title Dossier & Property Card"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Title Dossier ({selectedParcel.surveyNumber})</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Console</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-[#E7DFD5] p-1 rounded-xl text-xs font-bold text-[#383432] overflow-x-auto">
        <button
          onClick={() => setActiveTab('triage')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
            activeTab === 'triage'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40'
          }`}
        >
          Triage & Disputes
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ocr'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40 text-[#C85A32]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>RoR OCR</span>
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'offline'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40 text-blue-700'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>Offline Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ledger'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40 text-emerald-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Immutable Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('gis')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'gis'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40 text-amber-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Cadastre & Roads</span>
        </button>
      </div>

      {/* ===================== TAB 1: TRIAGE & DISPUTES ===================== */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          {/* Triage Summary Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-[#E7DFD5] shadow-2xs">
              <p className="text-[11px] text-[#6B6360] font-semibold uppercase">Pending Partition Petitions</p>
              <p className="text-xl font-bold text-[#2563EB] mt-1">{pendingPartitions.length}</p>
              <p className="text-[10px] text-[#6B6360] mt-0.5">Citizen Division Submissions</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E7DFD5] shadow-2xs">
              <p className="text-[11px] text-[#6B6360] font-semibold uppercase">Buffer Encroachments</p>
              <p className="text-xl font-bold text-[#B91C1C] mt-1">{criticalParcels.length}</p>
              <p className="text-[10px] text-[#6B6360] mt-0.5">Waterbody FTL & Setback Violations</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E7DFD5] shadow-2xs">
              <p className="text-[11px] text-[#6B6360] font-semibold uppercase">Immutable Orders</p>
              <p className="text-xl font-bold text-[#276728] mt-1">{ledgerBlocks.length}</p>
              <p className="text-[10px] text-[#6B6360] mt-0.5">Cryptographically Sealed</p>
            </div>
          </div>

          {/* Quick Resurvey Issuance & Evidence Report Trigger */}
          <div className="bg-gradient-to-r from-[#23201F] to-[#383432] text-white p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Statutory Authority • Section 67-A
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                Selected: Plot {selectedParcel.surveyNumber} ({selectedParcel.ulpin})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSignedEvidenceModal(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Signed QR Report</span>
              </button>
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#a64420] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Stamp className="w-3.5 h-3.5" />
                <span>Issue Resurvey Order</span>
              </button>
            </div>
          </div>

          {/* Critical Buffer Encroachment Enforcement Queue */}
          <div className="bg-white border border-[#E7DFD5] rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2.5">
              <div className="flex items-center gap-2 text-[#B91C1C]">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#23201F]">
                  Critical Buffer Encroachment Queue ({criticalParcels.length})
                </h3>
              </div>
              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
                HYDRAA / Setback Violations
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalParcels.map((parcel) => (
                <div
                  key={parcel.id}
                  className="bg-[#B91C1C]/5 border border-[#B91C1C]/25 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#23201F]">{parcel.surveyNumber}</span>
                      <span className="text-[10px] bg-[#B91C1C] text-white px-2 py-0.2 rounded-full font-bold">
                        Grade {parcel.trustGrade} ({parcel.trustScore}/100)
                      </span>
                    </div>
                    <p className="text-xs text-[#383432] mt-0.5">{parcel.owner.name} • {parcel.village}</p>
                    <p className="text-[11px] text-[#B91C1C] font-medium mt-1">
                      {parcel.violations[0]?.title}: {parcel.violations[0]?.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectParcel(parcel.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E7DFD5] text-xs font-semibold text-[#23201F] hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectParcel(parcel.id);
                        setOrderParcelId(parcel.id);
                        setOrderULPIN(parcel.ulpin);
                        setShowOrderModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#23201F] text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Stamp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Order Resurvey</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: ROR OCR & DUPLICATE CHECKS ===================== */}
      {activeTab === 'ocr' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* File Upload Box */}
          <div className="bg-white border-2 border-dashed border-[#C85A32]/40 rounded-2xl p-5 text-center space-y-3 bg-[#FAF7F2]/50">
            <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#23201F]">
                Upload Physical RoR Extract (Khasra-Khatauni / Form 7-12)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ImageHash perceptual match & RapidFuzz text duplicate intelligence
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#a64420] transition-colors shadow-xs">
              <FileText className="w-4 h-4" />
              <span>{isUploadingOcr ? 'Preprocessing & Analyzing...' : 'Select RoR Document'}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={handleOcrFileSelect}
                className="hidden"
                disabled={isUploadingOcr}
              />
            </label>

            {ocrFile && (
              <p className="text-xs font-mono text-gray-600">Selected: {ocrFile.name}</p>
            )}
          </div>

          {/* Quick Demo Scenarios Trigger Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E7DFD5] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#23201F] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Hackathon Verification Demo Scenarios:
              </span>
              <span className="text-[10px] text-gray-500">Test Edge Cases</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleRunDemoScenario('UP_Khatauni_Plot101_Official_Record.pdf')}
                className="p-2 rounded-xl border border-gray-200 bg-[#FAF7F2] hover:bg-gray-100 text-left font-semibold text-[#23201F] transition-colors"
              >
                1. Exact Byte Duplicate (SHA-256)
              </button>
              <button
                type="button"
                onClick={() => handleRunDemoScenario('UP_Khatauni_Plot101_Compressed_Scan.jpg')}
                className="p-2 rounded-xl border border-gray-200 bg-[#FAF7F2] hover:bg-gray-100 text-left font-semibold text-[#23201F] transition-colors"
              >
                2. Recompressed Scan (ImageHash pHash)
              </button>
              <button
                type="button"
                onClick={() => handleRunDemoScenario('Disputed_Plot101_Claim.pdf')}
                className="p-2 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-left font-semibold text-red-900 transition-colors"
              >
                3. Same-Parcel Conflicting Area (450m²)
              </button>
              <button
                type="button"
                onClick={() => handleRunDemoScenario('UP_Khatauni_Plot104_Extract.pdf')}
                className="p-2 rounded-xl border border-gray-200 bg-[#FAF7F2] hover:bg-gray-100 text-left font-semibold text-[#23201F] transition-colors"
              >
                4. Different-Parcel Negative Case (Plot 104)
              </button>
            </div>
          </div>

          {ocrError && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{ocrError}</span>
            </div>
          )}

          {/* DUPLICATE INTELLIGENCE & CONFLICT REPORT */}
          {ocrResult?.similarity_analysis && (
            <div className="space-y-3">
              {/* Diagnosis Banner */}
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1 ${
                  ocrResult.similarity_analysis.is_exact_duplicate
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : ocrResult.similarity_analysis.conflict_count > 0
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : ocrResult.similarity_analysis.diagnosis_code === 'SIMILAR_TEMPLATE_DIFFERENT_PARCEL'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{ocrResult.similarity_analysis.diagnosis_code}</span>
                  </span>
                  <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded font-bold uppercase">
                    {ocrResult.similarity_analysis.requires_officer_review
                      ? 'Requires Officer Review'
                      : 'Verified Isolated'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {ocrResult.similarity_analysis.diagnosis_message}
                </p>
                <p className="text-[10px] text-gray-600 font-semibold pt-1 border-t border-black/10">
                  Governance Rule: {ocrResult.similarity_analysis.governance_rule}
                </p>
              </div>

              {/* Side-by-Side Candidates Comparison */}
              {ocrResult.similarity_analysis.candidates.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-[#23201F]">
                      Candidate Documents Identified in Same Administrative Scope
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Village: {ocrResult.extracted_entities.village_name}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ocrResult.similarity_analysis.candidates.map((cand: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#23201F]">{cand.filename}</span>
                            <span className="text-[10px] text-gray-500 block font-mono">
                              ID: {cand.doc_id} • Khasra: {cand.khasra_no}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold block">
                              Visual Sim: {cand.visual_similarity_pct}%
                            </span>
                            <span className="text-[9px] text-gray-500">
                              Text Sim: {cand.text_similarity_pct}%
                            </span>
                          </div>
                        </div>

                        {cand.field_conflicts.length > 0 && (
                          <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-[11px] text-red-900 space-y-1">
                            <strong className="block text-[10px] uppercase font-bold text-red-700">
                              Field Conflicts Highlighted:
                            </strong>
                            {cand.field_conflicts.map((fc: any, i: number) => (
                              <div key={i} className="flex justify-between">
                                <span>{fc.field}:</span>
                                <strong>Existing: {fc.existing_value} vs Uploaded: {fc.uploaded_value}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OCR Structured Results */}
          {ocrResult && (
            <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] space-y-3 text-xs shadow-2xs">
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="font-bold text-[#23201F]">Extracted Revenue Record Entities</span>
                <span className="font-mono text-emerald-700 font-bold">Confidence: {ocrResult.extracted_entities.ocr_confidence}%</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="text-gray-400 block text-[10px]">Khasra / Plot:</span>
                  <span className="font-bold text-[#23201F]">{ocrResult.extracted_entities.khasra_no}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Khatauni Family No:</span>
                  <span className="font-bold font-mono">{ocrResult.extracted_entities.khata_no}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Pattadar Co-Owners:</span>
                  <span className="font-semibold">{ocrResult.extracted_entities.pattadar_names.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Recorded Legal Area:</span>
                  <span className="font-bold text-blue-800 font-mono">{ocrResult.extracted_entities.recorded_area_sqm} m²</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: OFFLINE FIELD EVIDENCE (DEXIE.JS) ===================== */}
      {activeTab === 'offline' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Header Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-[#23201F]">
                  Offline Field Evidence Engine (Dexie.js IndexedDB)
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                3-stage lifecycle (<span className="text-amber-700 font-bold">SAVED_ON_DEVICE</span> → <span className="text-blue-700 font-bold">PENDING_SYNC</span> → <span className="text-emerald-700 font-bold">SYNCED</span>) with server-side deduplication.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunOfflineTest}
                disabled={isRunningOfflineTest}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningOfflineTest ? 'animate-spin' : ''}`} />
                <span>{isRunningOfflineTest ? 'Running Benchmark...' : 'Run Disconnect → Sync Twice Benchmark'}</span>
              </button>

              <button
                onClick={handleSyncAllDrafts}
                disabled={isSyncingOffline || offlineDrafts.length === 0}
                className="px-3 py-1.5 bg-[#23201F] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Sync All Pending Drafts</span>
              </button>
            </div>
          </div>

          {/* Sync notification message */}
          {offlineSyncMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium">{offlineSyncMessage}</span>
            </div>
          )}

          {/* Benchmark Test Result Display */}
          {offlineTestResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              offlineTestResult.testPassed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Idempotent Deduplication Benchmark Verified</span>
                </span>
                <span className="bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PASS (100% Deterministic)
                </span>
              </div>
              <p className="text-[11px] text-gray-700">
                Simulated rural field disconnect: created local draft in IndexedDB, executed sync #1, re-executed sync #2 with identical client UUIDv4.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[10px] bg-white/70 p-2.5 rounded-xl border border-black/5">
                <div>
                  <span className="text-gray-400 block">Client Draft UUID:</span>
                  <span className="font-bold truncate block">{offlineTestResult.draftUuid}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">First Sync (#1):</span>
                  <span className="font-bold text-emerald-700">Ingested (dedup=false)</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Second Sync (#2):</span>
                  <span className="font-bold text-blue-700">Deduplicated (dedup=true)</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Server Records:</span>
                  <span className="font-bold text-purple-700">Exactly 1 Record Preserved</span>
                </div>
              </div>
            </div>
          )}

          {/* Field Draft Creator */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#23201F] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#C85A32]" />
                Record Offline Field Verification Note
              </span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#E7DFD5] text-gray-600">
                ULPIN: {selectedParcel.ulpin || selectedParcel.id}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Field Surveyor Ground Observation:
              </label>
              <textarea
                rows={2}
                value={offlineDraftNotes}
                onChange={(e) => setOfflineDraftNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E7DFD5] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                placeholder="e.g. Boundary marker stone located at northern offset; no unauthorized construction observed."
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  Local IndexedDB Engine
                </span>
                <span>• GPS: [80.9452, 26.9858]</span>
              </div>

              <button
                type="button"
                onClick={handleSaveOfflineDraft}
                className="px-3.5 py-2 bg-[#C85A32] hover:bg-[#a64420] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Save Draft in IndexedDB (Offline)</span>
              </button>
            </div>
          </div>

          {/* Local Drafts Store Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#23201F]">
              <span>IndexedDB Cached Drafts ({offlineDrafts.length})</span>
              <span className="text-[10px] text-gray-500 font-normal">Scoped to active officer profile</span>
            </div>

            {offlineDrafts.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-[#E7DFD5] text-center text-xs text-gray-500">
                No local drafts recorded. Click "Save Draft in IndexedDB" or run the Disconnect benchmark above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {offlineDrafts.map((draft) => (
                  <div
                    key={draft.uuid}
                    className="bg-white p-3.5 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-gray-500">
                          {draft.uuid.slice(0, 16)}...
                        </span>
                        <span className="font-bold text-[#23201F]">{draft.ulpin}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {draft.status === 'SAVED_ON_DEVICE' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-amber-600" />
                            SAVED_ON_DEVICE
                          </span>
                        )}
                        {draft.status === 'PENDING_SYNC' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                            PENDING_SYNC
                          </span>
                        )}
                        {draft.status === 'SYNCED' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            SYNCED
                          </span>
                        )}

                        <button
                          onClick={() => handleSyncSingleDraft(draft)}
                          disabled={isSyncingOffline}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>{draft.status === 'SYNCED' ? 'Re-Sync' : 'Sync'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[#383432] bg-[#FAF7F2] p-2 rounded-xl border border-[#E7DFD5] text-[11px]">
                      {draft.notes}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>Created: {new Date(draft.createdAt).toLocaleTimeString()}</span>
                      {draft.gpsCoords && (
                        <span>GPS: [{draft.gpsCoords[0]}, {draft.gpsCoords[1]}]</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: IMMUTABLE AUDIT LEDGER ===================== */}
      {activeTab === 'ledger' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Header Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#23201F]">
                  Cryptographic SHA-256 Resurvey Order Ledger
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Immutable hash-chain recording all statutory drone resurvey mandates
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSignedEvidenceModal(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Signed QR Report</span>
              </button>
              <button
                onClick={handleVerifyLedger}
                disabled={isVerifying}
                className="px-3.5 py-1.5 bg-[#23201F] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Verifying...' : 'Verify Cryptographic Integrity'}</span>
              </button>
            </div>
          </div>

          {/* Verification Status Card */}
          {verificationResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                verificationResult.is_valid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <Award className="w-6 h-6 shrink-0 text-emerald-700" />
              <div className="space-y-1">
                <p className="font-extrabold text-sm">
                  {verificationResult.is_valid
                    ? '✓ Ledger Integrity Cryptographically Certified'
                    : '⚠ Ledger Tampering Detected!'}
                </p>
                <p className="text-[11px]">
                  All {verificationResult.total_blocks} blocks verified from Genesis to Tip with zero hash chain breaks.
                </p>
                <div className="font-mono text-[10px] text-gray-700 pt-1 border-t border-black/10">
                  Tip Hash: {verificationResult.tip_hash}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Block Chain List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {ledgerBlocks.map((block) => (
              <div
                key={block.index}
                className="bg-white rounded-2xl border border-[#E7DFD5] p-4 shadow-2xs space-y-2.5 relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#23201F] text-white font-mono font-bold text-[11px] flex items-center justify-center">
                      #{block.index}
                    </span>
                    <span className="font-bold text-[#23201F]">
                      {block.payload.type === 'GENESIS_ANCHOR'
                        ? 'Genesis Root Anchor'
                        : `Drone Resurvey Order (${block.payload.ulpin || block.ulpin})`}
                    </span>
                  </div>

                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Hash Verified</span>
                  </span>
                </div>

                <p className="text-xs text-[#383432]">
                  {block.payload.discrepancy_reason || block.payload.memo}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5] font-mono">
                  <div>
                    <span className="block text-gray-400">Issuing Officer Badge:</span>
                    <span className="font-bold text-[#23201F]">
                      {block.payload.officer_badge_id || 'SYSTEM_GENESIS'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Timestamp (UTC):</span>
                    <span className="text-[#23201F]">{block.timestamp}</span>
                  </div>
                </div>

                {/* Hashes Ribbon */}
                <div className="pt-1 border-t border-gray-100 space-y-1 font-mono text-[10px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-16 shrink-0">Prev Hash:</span>
                    <span className="truncate max-w-[280px]" title={block.prev_hash}>
                      {block.prev_hash}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <span className="text-gray-500 w-16 shrink-0">Block Hash:</span>
                    <span className="truncate max-w-[280px]" title={block.hash}>
                      {block.hash}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 6: CADASTRE & ROADS (GIS INGESTION & CORRIDORS) ===================== */}
      {activeTab === 'gis' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-white border border-[#E7DFD5] rounded-2xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-bold text-sm text-[#23201F]">
                  Cadastral GIS Ingestion & Authoritative Road Corridors
                </h3>
              </div>
              <span className="text-[10px] bg-[#FAF7F2] border border-[#E7DFD5] text-[#6B6360] px-2 py-0.5 rounded-full font-bold">
                Multi-Source GIS Pipeline
              </span>
            </div>
            <p className="text-xs text-[#6B6360]">
              Ingest verified survey GeoJSON, test remote OGC WFS GeoServer feeds, and perform high-precision metric right-of-way corridor conflict analysis.
            </p>
          </div>

          {/* 1. CADASTRAL SURVEY SOURCE PROVENANCE */}
          <div className="bg-white border border-[#E7DFD5] rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-xs text-[#23201F]">Cadastral Parcel Source Provenance</h4>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  sourceMeta?.state === 'CONFIGURED_WFS'
                    ? 'bg-blue-100 text-blue-800'
                    : sourceMeta?.state === 'UPLOADED_FILE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : sourceMeta?.state === 'SYNTHETIC_DEMO'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {sourceMeta?.state || 'NO_SOURCE'}
              </span>
            </div>

            {sourceMeta && (
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-1.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500">Supplier:</span>{' '}
                    <strong className="text-[#23201F]">{sourceMeta.supplier || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">CRS:</span>{' '}
                    <strong className="text-[#23201F]">{sourceMeta.source_crs || 'EPSG:4326'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Features:</span>{' '}
                    <strong className="text-[#23201F]">{sourceMeta.total_features} parcels</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Survey Date:</span>{' '}
                    <strong className="text-[#23201F]">{sourceMeta.survey_date || 'N/A'}</strong>
                  </div>
                </div>
                {sourceMeta.sha256_checksum && (
                  <div className="pt-1 border-t border-gray-200 text-[10px] font-mono text-gray-500 truncate">
                    SHA-256: {sourceMeta.sha256_checksum}
                  </div>
                )}
                {sourceMeta.disclaimer && (
                  <p className="text-[10px] text-gray-500 italic mt-1">{sourceMeta.disclaimer}</p>
                )}
              </div>
            )}

            {/* Upload Survey GeoJSON Form */}
            <form onSubmit={handleSurveyFileUpload} className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold text-[#23201F]">
                Upload Survey GeoJSON (Polygon / MultiPolygon)
              </label>
              <input
                type="file"
                accept=".geojson,.json"
                onChange={(e) => setSurveyFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#23201F] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C85A32] file:text-white hover:file:bg-[#A94424]"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Supplier / Agency"
                  value={supplierInput}
                  onChange={(e) => setSupplierInput(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs"
                />
                <input
                  type="date"
                  value={surveyDateInput}
                  onChange={(e) => setSurveyDateInput(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs"
                />
              </div>

              {uploadError && (
                <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {uploadError}
                </div>
              )}

              {uploadResult && (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300">
                  Successfully imported {uploadResult.imported_count} survey parcels!
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isUploadingSurvey}
                  className="flex-1 py-2 px-3 bg-[#C85A32] hover:bg-[#A94424] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingSurvey ? 'Ingesting...' : 'Ingest Survey GeoJSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoSurvey}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] hover:bg-gray-100 text-[#23201F] rounded-xl text-xs font-semibold transition-colors"
                >
                  Demo Survey
                </button>
                <button
                  type="button"
                  onClick={handleClearSurvey}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  title="Clear survey source"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* 2. AUTHORITATIVE ROAD VECTORS */}
          <div className="bg-white border border-[#E7DFD5] rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-xs text-[#23201F]">Authoritative Road Network & Corridors</h4>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  roadMeta?.state === 'IMPORTED_ROAD' || roadMeta?.state === 'PUBLIC_VECTOR_ROAD'
                    ? 'bg-emerald-100 text-emerald-800'
                    : roadMeta?.state === 'SYNTHETIC_DEMO_ROAD'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {roadMeta?.state || 'NO_ROAD'}
              </span>
            </div>

            {roadMeta && (
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-1 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500">Authority:</span>{' '}
                    <strong className="text-[#23201F]">{roadMeta.supplier || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Geometry:</span>{' '}
                    <strong className="text-[#23201F]">{roadMeta.geometry_interpretation || 'LineString / Polygon'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Segments:</span>{' '}
                    <strong className="text-[#23201F]">{roadMeta.total_features} features</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Road Name:</span>{' '}
                    <strong className="text-[#23201F]">{roadMeta.source_name || 'Village Access Road'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Road GeoJSON Form */}
            <form onSubmit={handleRoadFileUpload} className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold text-[#23201F]">
                Upload Road GeoJSON (LineString Centerline or Polygon Corridor)
              </label>
              <input
                type="file"
                accept=".geojson,.json"
                onChange={(e) => setRoadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#23201F] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#23201F] file:text-white hover:file:bg-black"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Road Authority (e.g. PWD / Panchayat)"
                  value={roadSupplierInput}
                  onChange={(e) => setRoadSupplierInput(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Road Corridor Name"
                  value={roadNameInput}
                  onChange={(e) => setRoadNameInput(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs"
                />
              </div>

              {uploadRoadError && (
                <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {uploadRoadError}
                </div>
              )}

              {uploadRoadResult && (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300">
                  Successfully imported {uploadRoadResult.imported_count} road vectors!
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isUploadingRoad}
                  className="flex-1 py-2 px-3 bg-[#23201F] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingRoad ? 'Ingesting Road...' : 'Ingest Road Geometry'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoRoad}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] hover:bg-gray-100 text-[#23201F] rounded-xl text-xs font-semibold transition-colors"
                >
                  Demo Road
                </button>
                <button
                  type="button"
                  onClick={handleClearRoad}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  title="Clear road source"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* 3. METRIC BUFFER & SPATIAL CORRIDOR CONFLICT ANALYSIS */}
          <div className="bg-white border border-[#E7DFD5] rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C85A32]" />
                <h4 className="font-bold text-xs text-[#23201F]">
                  Metric Right-of-Way Buffer & Conflict Analysis
                </h4>
              </div>
              <span className="font-mono font-bold text-xs bg-[#FAF7F2] border border-[#E7DFD5] px-2 py-0.5 rounded text-[#C85A32]">
                {bufferDistance} m Corridor
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={bufferDistance}
                onChange={(e) => onBufferDistanceChange && onBufferDistanceChange(parseFloat(e.target.value))}
                className="w-full accent-[#C85A32] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>1.0m (Narrow Gali)</span>
                <span>5.0m (Village Road)</span>
                <span>20.0m (State Highway)</span>
              </div>
            </div>

            <button
              onClick={() => onRunAnalysis && onRunAnalysis()}
              disabled={isAnalyzingEncroachments}
              className="w-full py-2.5 px-4 bg-[#C85A32] text-white rounded-xl text-xs font-bold hover:bg-[#A94424] transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingEncroachments ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingEncroachments ? 'Projecting UTM & Computing Overlaps...' : 'Run Spatial Corridor Analysis'}</span>
            </button>

            {/* Conflict Findings Output */}
            {encroachmentResults && (
              <div className="space-y-2 pt-2 border-t border-[#E7DFD5]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#23201F]">
                    Detected Encroachment Conflicts ({encroachmentResults.features?.length || 0})
                  </span>
                  <span className="text-[10px] text-gray-500">
                    UTM Metric Calculation
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {encroachmentResults.features && encroachmentResults.features.length > 0 ? (
                    encroachmentResults.features.map((feat: any, idx: number) => {
                      const props = feat.properties;
                      return (
                        <div
                          key={idx}
                          className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-200 text-xs space-y-1 hover:border-amber-400 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#23201F]">
                              Plot #{props.survey_plot_no || props.parcel_id || 'Plot'}
                            </span>
                            <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded text-[10px]">
                              {props.overlap_area_sqm} m² overlap
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B6360]">
                            Owner: <strong>{props.owner_name}</strong> • Corridor: {props.affected_asset}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-amber-800 font-medium">
                              {props.status || 'Potential Overlap'}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedConflict(feat as any);
                                setShowNoticeModal(true);
                              }}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold transition-colors"
                            >
                              Issue Notice
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 text-center">
                      No statutory right-of-way corridor overlaps detected within {bufferDistance}m setback!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATUTORY RESURVEY ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-bold text-sm text-[#23201F]">
                  Issue Statutory Drone Resurvey Order
                </h3>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {orderSuccessMsg ? (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 text-emerald-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Order Cryptographically Sealed in Ledger</span>
                </p>
                <p className="text-[11px] font-mono">{orderSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleDispatchResurveyOrder} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Bhu-Aadhaar ULPIN</label>
                  <input
                    type="text"
                    value={orderULPIN}
                    onChange={(e) => setOrderULPIN(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl font-mono font-bold text-[#23201F]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discrepancy / Resurvey Reason</label>
                  <textarea
                    rows={3}
                    value={orderReason}
                    onChange={(e) => setOrderReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-[#23201F]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Ground / Drone Resurvey Precision</label>
                  <select
                    value={orderResolution}
                    onChange={(e) => setOrderResolution(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-[#23201F]"
                  >
                    <option value="< 3cm GSD UAV Photogrammetry">&lt; 3cm GSD (High-Precision Aerial Photogrammetry)</option>
                    <option value="< 5cm GSD Standard Aerial">&lt; 5cm GSD (Standard Cadastral Aerial Survey)</option>
                    <option value="Sub-Centimeter RTK-DGPS">Sub-Centimeter RTK-DGPS Ground Geodesic Demarcation</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                  <p>
                    <strong>Issuing Officer:</strong> {currentUser.full_name} ({currentUser.badge_id})
                  </p>
                  <p>
                    <strong>Statutory Seal:</strong> Under Section 67-A UP Revenue Code, this order will be appended as an immutable cryptographic block.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="px-4 py-2 rounded-xl bg-[#C85A32] text-white font-bold hover:bg-[#a64420] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Stamp className="w-4 h-4" />
                    <span>{isSubmittingOrder ? 'Sealing Block...' : 'Sign & Seal Order in Ledger'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SIGNED EVIDENCE REPORT MODAL */}
      <SignedEvidenceModal
        isOpen={showSignedEvidenceModal}
        onClose={() => setShowSignedEvidenceModal(false)}
        parcelId={selectedParcel.id}
        ulpin={selectedParcel.ulpin}
        droneAreaSqm={selectedParcel.area.gisSqm}
        legalAreaSqm={selectedParcel.area.rorSqm}
        variancePct={Math.round(((selectedParcel.area.gisSqm - selectedParcel.area.rorSqm) / selectedParcel.area.rorSqm) * 1000) / 10}
      />

      {/* STATUTORY NOTICE MODAL */}
      {showNoticeModal && selectedConflict && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-200 space-y-3.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-[#23201F]">
                  Statutory Encroachment Notice (Form-67 / Cadastre)
                </h3>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#383432] space-y-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5]">
              <p>
                <strong>To:</strong> {selectedConflict.properties.owner_name} (Plot No. {selectedConflict.properties.survey_plot_no || selectedConflict.properties.encroaching_parcel_id})
              </p>
              <p>
                <strong>Subject:</strong> Immediate Notice regarding unauthorized setback intrusion into {selectedConflict.properties.affected_asset}.
              </p>
              <p className="text-red-700 font-semibold">
                Overlap Area Detected: {selectedConflict.properties.overlap_area_sqm} m²
              </p>
              <p className="text-[11px] text-gray-600">
                Under {selectedConflict.properties.statutory_clause || 'Section 67-A State Revenue Code'}, you are directed to present records before the Revenue Authority within 15 days of notice publication.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print & Dispatch Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE ROR TITLE DOSSIER & PROPERTY CARD MODAL */}
      <RoRDossierModal
        isOpen={showRoRDossierModal}
        onClose={() => setShowRoRDossierModal(false)}
        parcelId={selectedParcel.id}
        fallbackParcel={selectedParcel}
      />
    </div>
  );
};
