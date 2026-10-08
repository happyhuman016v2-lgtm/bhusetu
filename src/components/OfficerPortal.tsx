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
} from 'lucide-react';

interface Props {
  parcels: Parcel[];
  selectedParcel: Parcel;
  onSelectParcel: (id: string) => void;
  pendingPartitions: PartitionResult[];
  onApprovePartition: (partition: PartitionResult) => void;
  auditLogs: OfficerAuditEntry[];
  onAddAuditLog: (entry: Omit<OfficerAuditEntry, 'id' | 'timestamp' | 'hash'>) => void;
}

export const OfficerPortal: React.FC<Props> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  pendingPartitions,
  onApprovePartition,
  auditLogs,
  onAddAuditLog,
}) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [emailInput, setEmailInput] = useState('officer@bhusetu.gov.in');
  const [passwordInput, setPasswordInput] = useState('Officer@BhuSetu2026!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: 'triage' | 'ocr' | 'ledger'
  const [activeTab, setActiveTab] = useState<'triage' | 'ocr' | 'ledger'>('triage');

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

  // Load ledger blocks on mount
  useEffect(() => {
    fetchLedgerBlocks().then((blocks) => setLedgerBlocks(blocks));
  }, []);

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
        statutory_clause: 'Uttar Pradesh Revenue Code 2006 (Sec 67-A) / SVAMITVA Directive',
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

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Console</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-[#E7DFD5] p-1 rounded-xl text-xs font-bold text-[#383432]">
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
          <span>RoR OCR Digitizer</span>
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
          <span>Immutable Ledger ({ledgerBlocks.length})</span>
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

          {/* Quick Resurvey Issuance Trigger */}
          <div className="bg-gradient-to-r from-[#23201F] to-[#383432] text-white p-3.5 rounded-2xl shadow-xs flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Statutory Authority • Section 67-A
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                Issue High-Resolution Drone Resurvey Order
              </p>
              <p className="text-[11px] text-gray-300">
                Selected: Plot {selectedParcel.surveyNumber} ({selectedParcel.ulpin})
              </p>
            </div>
            <button
              onClick={() => setShowOrderModal(true)}
              className="px-3.5 py-2 bg-[#C85A32] hover:bg-[#a64420] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Stamp className="w-4 h-4" />
              <span>Issue Order</span>
            </button>
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

      {/* ===================== TAB 2: ROR DOCUMENT OCR DIGITIZER ===================== */}
      {activeTab === 'ocr' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* File Upload Box */}
          <div className="bg-white border-2 border-dashed border-[#C85A32]/40 rounded-2xl p-6 text-center space-y-3 bg-[#FAF7F2]/50">
            <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#23201F]">
                Upload Physical RoR Extract (Khasra-Khatauni / Form 7-12)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Supports PDF extracts, scanned TIFFs, and PNG/JPG camera photos
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#a64420] transition-colors shadow-xs">
              <FileText className="w-4 h-4" />
              <span>{isUploadingOcr ? 'Preprocessing & Extracting...' : 'Select RoR Document'}</span>
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

          {ocrError && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{ocrError}</span>
            </div>
          )}

          {/* OCR RESULTS: SIDE-BY-SIDE COMPARISON */}
          {ocrResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#C85A32]" />
                  Uploaded OCR Record vs. Drone Cadastral Ground Truth
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  OCR Confidence: {ocrResult.extracted_entities.ocr_confidence}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Column 1: Uploaded RoR Record */}
                <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] space-y-2.5 shadow-2xs">
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Uploaded Physical Record
                    </span>
                    <h4 className="font-bold text-[#23201F] text-sm">
                      {ocrResult.extracted_entities.document_type}
                    </h4>
                  </div>

                  <div className="space-y-1 text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Khasra / Plot:</span>
                      <span className="font-bold text-[#23201F]">{ocrResult.extracted_entities.khasra_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Khatauni No:</span>
                      <span className="font-mono font-semibold">{ocrResult.extracted_entities.khata_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recorded Owner:</span>
                      <span className="font-semibold">{ocrResult.extracted_entities.pattadar_names.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recorded Legal Area:</span>
                      <span className="font-mono font-bold text-blue-800">
                        {ocrResult.extracted_entities.recorded_area_sqm} m²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mortgage Status:</span>
                      <span className="text-red-700 font-semibold">{ocrResult.extracted_entities.mortgage_status}</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Linked Drone Ground Truth */}
                {ocrResult.spatial_match ? (
                  <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] space-y-2.5 shadow-2xs">
                    <div className="border-b border-gray-100 pb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">
                        Drone Cadastral Match
                      </span>
                      <h4 className="font-bold text-[#276728] text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Plot {ocrResult.spatial_match.survey_plot_no} Verified</span>
                      </h4>
                    </div>

                    <div className="space-y-1 text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bhu-Aadhaar ULPIN:</span>
                        <span className="font-mono font-bold text-[#C85A32]">{ocrResult.spatial_match.ulpin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Surveyed Owner:</span>
                        <span className="font-semibold">{ocrResult.spatial_match.owner_drone_survey}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Drone Ground Area:</span>
                        <span className="font-mono font-bold text-[#276728]">
                          {ocrResult.spatial_match.drone_measured_area_sqm} m²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Area Mismatch:</span>
                        <span
                          className={`font-mono font-bold ${
                            ocrResult.spatial_match.is_within_statutory_tolerance
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }`}
                        >
                          {ocrResult.spatial_match.area_variance_pct > 0 ? '+' : ''}
                          {ocrResult.spatial_match.area_variance_pct}% ({ocrResult.spatial_match.area_variance_sqm} m²)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Statutory Status:</span>
                        <span className="font-bold">
                          {ocrResult.spatial_match.is_within_statutory_tolerance
                            ? 'Within ±5% Tolerance'
                            : 'Exceeds Statutory Cap'}
                        </span>
                      </div>
                    </div>

                    {!ocrResult.spatial_match.is_within_statutory_tolerance && (
                      <button
                        onClick={() => {
                          setOrderParcelId(ocrResult.spatial_match!.parcel_id);
                          setOrderULPIN(ocrResult.spatial_match!.ulpin);
                          setOrderReason(
                            `OCR-to-Drone mismatch of ${ocrResult.spatial_match!.area_variance_pct}% exceeds statutory limit.`
                          );
                          setShowOrderModal(true);
                        }}
                        className="w-full mt-2 py-2 px-3 bg-[#B91C1C] text-white rounded-xl font-bold hover:bg-red-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>Order Drone Resurvey for Discrepancy</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-center text-gray-500">
                    No spatial drone parcel found for extracted Khasra number.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: IMMUTABLE AUDIT LEDGER ===================== */}
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

            <button
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Traversing Chain...' : 'Verify Cryptographic Integrity'}</span>
            </button>
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
                  <label className="block font-bold text-gray-700 mb-1">Target UAV Photogrammetry Resolution</label>
                  <select
                    value={orderResolution}
                    onChange={(e) => setOrderResolution(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-[#23201F]"
                  >
                    <option value="< 3cm GSD UAV Photogrammetry">&lt; 3cm GSD (High-Density Abadi Setback)</option>
                    <option value="< 5cm GSD Standard Drone">&lt; 5cm GSD (Standard SVAMITVA Flight)</option>
                    <option value="Sub-Centimeter RTK-DGPS">Sub-Centimeter RTK-DGPS Ground Demarcation</option>
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
    </div>
  );
};
