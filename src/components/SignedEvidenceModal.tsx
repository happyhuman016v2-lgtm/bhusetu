import React, { useState, useEffect } from 'react';
import {
  SignedEvidenceReport,
  VerifyReportResult,
  createSignedEvidenceReport,
  verifyEvidenceReport,
  fetchDemoTamperTest,
} from '../services/evidenceApi';
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Printer,
  X,
  CheckCircle2,
  RefreshCw,
  Award,
  Scale,
  Sparkles,
  Lock,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parcelId: string;
  ulpin: string;
  droneAreaSqm: number;
  legalAreaSqm: number;
  variancePct: number;
}

export const SignedEvidenceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  parcelId,
  ulpin,
  droneAreaSqm,
  legalAreaSqm,
  variancePct,
}) => {
  const [report, setReport] = useState<SignedEvidenceReport | null>(null);
  const [verification, setVerification] = useState<VerifyReportResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isTamperingSimulated, setIsTamperingSimulated] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setIsTamperingSimulated(false);
    setVerification(null);

    createSignedEvidenceReport({
      parcel_id: parcelId,
      ulpin: ulpin,
      geometry_revision: 'rev-1.0',
      drone_area_sqm: droneAreaSqm,
      legal_area_sqm: legalAreaSqm,
      variance_pct: variancePct,
      issuer_badge: 'REV-OFF-UP-042',
      issuer_name: 'Thiru M. Shanmugavel, M.A.',
    })
      .then((rep) => {
        setReport(rep);
        // Automatically verify authentic snapshot on creation
        return verifyEvidenceReport({
          snapshot_payload: rep.snapshot,
          signature_b64: rep.signature_b64,
          current_active_revision: 'rev-1.0',
        });
      })
      .then((ver) => {
        setVerification(ver);
      })
      .catch((err) => {
        console.warn('Evidence report generation error:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, parcelId, ulpin, droneAreaSqm, legalAreaSqm, variancePct]);

  if (!isOpen) return null;

  // Simulate tampering attack: alter signed area from 412.0 to 450.0
  const handleSimulateTamperAttack = async () => {
    if (!report) return;
    setIsVerifying(true);
    setIsTamperingSimulated(true);

    try {
      const tamperedSnapshot = JSON.parse(JSON.stringify(report.snapshot));
      tamperedSnapshot.drone_area_sqm = Math.round((droneAreaSqm + 38.0) * 10) / 10; // Modified area!

      const result = await verifyEvidenceReport({
        snapshot_payload: tamperedSnapshot,
        signature_b64: report.signature_b64,
        current_active_revision: 'rev-1.0',
      });
      setVerification(result);
    } finally {
      setIsVerifying(false);
    }
  };

  // Restore untampered verification
  const handleRestoreUntampered = async () => {
    if (!report) return;
    setIsVerifying(true);
    setIsTamperingSimulated(false);

    try {
      const result = await verifyEvidenceReport({
        snapshot_payload: report.snapshot,
        signature_b64: report.signature_b64,
        current_active_revision: 'rev-1.0',
      });
      setVerification(result);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E7DFD5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#23201F] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#383432]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-[10px] font-bold uppercase tracking-wider text-white">
                  RSA-2048 Cryptographic Proof
                </span>
                <span className="text-gray-400 text-xs font-mono">
                  RSASSA-PKCS1-v1_5-SHA256
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#FBF9F5] mt-0.5">
                Signed QR Evidence Report & Verification Certificate
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#23201F]">
                Signing canonical evidence snapshot with server RSA-2048 key...
              </p>
            </div>
          ) : !report ? (
            <div className="text-center py-10 text-gray-500 text-xs">
              Failed to generate evidence report.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Prototype Disclaimer Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <strong>STATUTORY NOTICE:</strong> This is a <strong>BhuSetu Prototype Evidence Report</strong> generated for administrative reconciliation and cadastral dispute audit. It is <strong>NOT</strong> a government-issued title certificate.
                </div>
              </div>

              {/* Cryptographic Verification Status Banner */}
              {verification && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                    verification.is_authentic && !isTamperingSimulated
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  {verification.is_authentic && !isTamperingSimulated ? (
                    <Award className="w-6 h-6 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-700 shrink-0" />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">
                        {verification.status_code === 'VERIFIED_AUTHENTIC'
                          ? '✓ Digital Signature Verified Untampered'
                          : '⚠ Cryptographic Signature Verification Failed!'}
                      </span>
                      <span className="font-mono text-[10px] bg-white/60 px-2 py-0.5 rounded font-bold">
                        {verification.status_code}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{verification.message}</p>

                    {verification.tampered_fields.length > 0 && (
                      <div className="mt-2 p-2 bg-white rounded-xl border border-red-200 text-[11px] space-y-1 font-mono text-red-800">
                        <strong>Tampered Field Detected:</strong>
                        {verification.tampered_fields.map((tf, i) => (
                          <div key={i} className="flex justify-between">
                            <span>Field: {tf.field}</span>
                            <span>Stored: {tf.stored_original_value} vs Submitted: {tf.submitted_value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Report Snapshot Card & QR Code */}
              <div className="bg-white border-2 border-emerald-700/40 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Evidence Report ID
                    </span>
                    <h3 className="font-mono text-lg font-black text-[#23201F]">
                      {report.report_id}
                    </h3>
                    <p className="text-xs text-gray-600">
                      Bhu-Aadhaar ULPIN: <strong className="text-[#C85A32]">{report.snapshot.ulpin}</strong> (Rev: {report.snapshot.geometry_revision})
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="text-center shrink-0">
                    <img
                      src={report.qr_code_data_uri}
                      alt="Evidence QR Verification Code"
                      className="w-24 h-24 border rounded-xl shadow-2xs mx-auto"
                    />
                    <span className="text-[9px] font-mono text-gray-400 mt-1 block">
                      Scan to Verify Proof
                    </span>
                  </div>
                </div>

                {/* Evidence Metrics Table */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">
                      Drone Ground Area
                    </span>
                    <span className="font-mono font-bold text-sm text-[#276728]">
                      {report.snapshot.drone_area_sqm} m²
                    </span>
                  </div>

                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">
                      Registry Legal Area
                    </span>
                    <span className="font-mono font-bold text-sm text-[#23201F]">
                      {report.snapshot.legal_area_sqm} m²
                    </span>
                  </div>

                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">
                      Variance Mismatch
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-800">
                      {report.snapshot.variance_pct > 0 ? '+' : ''}
                      {report.snapshot.variance_pct}%
                    </span>
                  </div>
                </div>

                {/* Cryptographic Signature Ribbon */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[10px] font-mono space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Algorithm: {report.algorithm}</span>
                    <span>Issuer: {report.snapshot.issuer_name} ({report.snapshot.issuer_badge})</span>
                  </div>
                  <div className="truncate" title={report.signature_b64}>
                    RSA-2048 Sig: {report.signature_b64}
                  </div>
                </div>
              </div>

              {/* Tamper Simulation Interactive Sandbox */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7DFD5] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#23201F] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Hackathon Tamper Detection Sandbox:
                  </span>
                  <span className="text-[10px] text-gray-500">Live Cryptographic Challenge</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSimulateTamperAttack}
                    disabled={isVerifying}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Simulate Area Tampering Attack (412m² → 450m²)</span>
                  </button>

                  <button
                    onClick={handleRestoreUntampered}
                    disabled={isVerifying}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Untampered Original Snapshot</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#23201F] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Signed Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
