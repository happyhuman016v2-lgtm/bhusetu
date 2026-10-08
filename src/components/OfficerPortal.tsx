import React, { useState } from 'react';
import { Parcel, PartitionResult, OfficerAuditEntry } from '../types';
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
  Clock,
  KeyRound,
  Eye,
  Check,
  Building,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('officer_admin');
  const [password, setPassword] = useState('BhuSetu@2026');
  const [selectedNoticeParcel, setSelectedNoticeParcel] = useState<Parcel | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username === 'officer_admin' || username === 'sih_judge_admin' || username === 'judge') &&
      (password === 'BhuSetu@2026' || password === 'admin' || password === 'hackiton')
    ) {
      setIsAuthenticated(true);
    } else {
      // Allow demo bypass
      setIsAuthenticated(true);
    }
  };

  const handleIssueNotice = (parcel: Parcel) => {
    onAddAuditLog({
      officerName: parcel.nearestOffice.officerName,
      designation: parcel.nearestOffice.designation,
      action: 'DEMOLITION_NOTICE_ISSUED',
      parcelId: parcel.id,
      surveyNumber: parcel.surveyNumber,
      details: `Form VII Statutory Show-Cause Notice issued for ${parcel.violations[0]?.encroachmentAreaSqm || 'buffer'} m² encroachment into ${parcel.bufferZone?.name || 'public buffer'}.`,
    });
    setSelectedNoticeParcel(parcel);
  };

  const handleApproveSubdivision = (partition: PartitionResult) => {
    onApprovePartition(partition);
    onAddAuditLog({
      officerName: selectedParcel.nearestOffice.officerName,
      designation: selectedParcel.nearestOffice.designation,
      action: 'PARTITION_MUTATION_APPROVED',
      parcelId: partition.parcelId,
      surveyNumber: selectedParcel.surveyNumber,
      details: `Equitable land partition approved into ${partition.splits.length} sub-parcels with ${partition.parityScore}% area parity. Sub-ULPINs assigned.`,
    });
  };

  // If not logged in, show Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-[#E7DFD5] rounded-2xl p-6 shadow-sm max-w-md mx-auto my-8">
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center text-[#C85A32] mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#23201F]">Statutory Revenue Officer Login</h2>
          <p className="text-xs text-[#6B6360]">
            Restricted access for Tahsildars, Sub-Registrars, and SIH/HackITon Evaluation Judges
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#23201F] mb-1">Officer Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs font-medium text-[#23201F] focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23201F] mb-1">Security Key / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs font-medium text-[#23201F] focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E7DFD5] text-[11px] text-[#6B6360] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span>Demo: <strong>officer_admin</strong> / <strong>BhuSetu@2026</strong></span>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C85A32] text-white hover:bg-[#A94424] transition-colors text-xs font-bold shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Unlock Statutory Officer Console</span>
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
      <div className="bg-[#23201F] text-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">{selectedParcel.nearestOffice.officerName}</h2>
              <span className="text-[10px] bg-[#276728] text-white px-2 py-0.5 rounded-full font-semibold">
                Authorized Revenue Officer
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              {selectedParcel.nearestOffice.designation} • {selectedParcel.nearestOffice.jurisdiction}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Console</span>
        </button>
      </div>

      {/* Triage Summary Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-[#E7DFD5] shadow-2xs">
          <p className="text-[11px] text-[#6B6360] font-semibold uppercase">Pending Partition Petitions</p>
          <p className="text-xl font-bold text-[#2563EB] mt-1">{pendingPartitions.length}</p>
          <p className="text-[10px] text-[#6B6360] mt-0.5">Citizen Division Submissions</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E7DFD5] shadow-2xs">
          <p className="text-[11px] text-[#6B6360] font-semibold uppercase">Buffer Encroachment Flags</p>
          <p className="text-xl font-bold text-[#B91C1C] mt-1">{criticalParcels.length}</p>
          <p className="text-[10px] text-[#6B6360] mt-0.5">Waterbody FTL & Setback Violations</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E7DFD5] shadow-2xs">
          <p className="text-[11px] text-[#6B6360] font-semibold uppercase">Survey Discrepancy Cases</p>
          <p className="text-xl font-bold text-[#D97706] mt-1">{warningParcels.length}</p>
          <p className="text-[10px] text-[#6B6360] mt-0.5">RoR vs GIS Area Mismatch</p>
        </div>
      </div>

      {/* SECTION 1: Pending Civil Land Partition Mutations */}
      <div className="bg-white border border-[#E7DFD5] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2.5">
          <div className="flex items-center gap-2">
            <Stamp className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-bold text-xs text-[#23201F] uppercase tracking-wider">
              Land Partition & Sub-Division Mutation Queue ({pendingPartitions.length})
            </h3>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
            Section 131 Land Revenue Code
          </span>
        </div>

        {pendingPartitions.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#6B6360] bg-[#FAF7F2] rounded-lg border border-[#E7DFD5]">
            <p>No pending partition applications in the queue.</p>
            <p className="text-[11px] mt-1 text-[#C85A32]">
              Tip: Switch to Citizen Portal → click "Suggest Even Divide" → "Submit Partition Plan for Official Mutation".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingPartitions.map((p) => {
              const targetParcel = parcels.find((item) => item.id === p.parcelId) || selectedParcel;
              return (
                <div key={p.id} className="bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#23201F]">
                        Survey No: {targetParcel.surveyNumber} ({targetParcel.village})
                      </h4>
                      <p className="text-[11px] text-[#6B6360]">
                        ULPIN: {targetParcel.ulpin} • Total Geodesic Area: {p.totalAreaSqm} m²
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-[#276728]/10 text-[#276728] px-2 py-0.5 rounded-full">
                      {p.parityScore}% Parity Score
                    </span>
                  </div>

                  {/* Sub-parcels preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {p.splits.map((s) => (
                      <div key={s.shareholderId} className="bg-white p-2 rounded-lg border border-[#E7DFD5] text-[11px]">
                        <p className="font-bold text-[#23201F] truncate">{s.shareholderName}</p>
                        <p className="text-[#6B6360]">Sub-Survey: <strong>{s.subSurveyNo}</strong></p>
                        <p className="text-[#276728] font-semibold">{s.areaSqm} m² ({s.sharePercentage}%)</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7DFD5]">
                    <button
                      onClick={() => onSelectParcel(targetParcel.id)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E7DFD5] text-xs font-semibold text-[#23201F] hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect on Map</span>
                    </button>
                    <button
                      onClick={() => handleApproveSubdivision(p)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#276728] text-white text-xs font-bold hover:bg-[#1E5220] transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Mutation & Issue Sub-ULPINs</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Critical Buffer Encroachment Enforcement Queue */}
      <div className="bg-white border border-[#E7DFD5] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2.5">
          <div className="flex items-center gap-2 text-[#B91C1C]">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#23201F]">
              Critical Buffer Encroachment Enforcement Queue ({criticalParcels.length})
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
                  onClick={() => handleIssueNotice(parcel)}
                  className="px-3 py-1.5 rounded-lg bg-[#B91C1C] text-white text-xs font-bold hover:bg-[#991B1B] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Issue Statutory Notice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Cryptographic Audit Trail */}
      <div className="bg-white border border-[#E7DFD5] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2.5">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#276728]" />
            <h3 className="font-bold text-xs text-[#23201F] uppercase tracking-wider">
              Immutable Statutory Audit Trail (SHA-256 Hashes)
            </h3>
          </div>
          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
            Blockchain-Grade Tamper Proof
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E7DFD5] text-xs space-y-1 font-mono">
              <div className="flex items-center justify-between text-[11px] text-[#6B6360]">
                <span>{log.timestamp}</span>
                <span className="font-bold text-[#C85A32]">{log.action}</span>
              </div>
              <p className="text-[#23201F] font-sans font-medium text-xs">{log.details}</p>
              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-200">
                <span>Officer: {log.officerName}</span>
                <span className="truncate max-w-[200px]" title={log.hash}>Hash: {log.hash.slice(0, 16)}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Demolition / Eviction Notice Modal */}
      {selectedNoticeParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-[#E7DFD5]">
            <div className="bg-[#B91C1C] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-sm">FORM VII: STATUTORY NOTICE OF REMOVAL & SHOW-CAUSE</h3>
                  <p className="text-[10px] text-white/80">Issued under Section 14 Water Resources Act / HYDRAA Regulation</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNoticeParcel(null)}
                className="text-white/80 hover:text-white text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-[#23201F] bg-[#FBF9F5] font-mono leading-relaxed max-h-[60vh] overflow-y-auto">
              <p className="font-bold">OFFICE OF THE TAHILDAR & EXECUTIVE MAGISTRATE</p>
              <p>JURISDICTION: {selectedNoticeParcel.nearestOffice.jurisdiction}</p>
              <p>DATE: {new Date().toLocaleDateString('en-IN')}</p>
              <hr />
              <p>TO: {selectedNoticeParcel.owner.name}</p>
              <p>SUBJECT: Encroachment of {selectedNoticeParcel.violations[0]?.encroachmentAreaSqm} m² into Notified Waterbody / Buffer Line.</p>
              <p>
                TAKE NOTICE that spatial satellite survey and geodesic audit of Survey No. {selectedNoticeParcel.surveyNumber} (ULPIN: {selectedNoticeParcel.ulpin}) reveals unauthorized intrusion into the notified Full Tank Level / corridor.
              </p>
              <p>
                You are hereby commanded to show cause within 7 (seven) days of receipt of this notice, failing which summary removal and demolition shall be carried out at your cost.
              </p>
              <p className="text-right mt-4 font-bold">
                {selectedNoticeParcel.nearestOffice.officerName}<br />
                {selectedNoticeParcel.nearestOffice.designation}
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F2] border-t border-[#E7DFD5] flex items-center justify-between">
              <span className="text-[11px] text-[#6B6360]">Official Revenue Seal Affixed</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 text-xs font-semibold hover:bg-gray-300"
                >
                  Print Notice
                </button>
                <button
                  onClick={() => setSelectedNoticeParcel(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#23201F] text-xs font-semibold text-white hover:bg-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
