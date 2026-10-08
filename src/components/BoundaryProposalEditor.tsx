import React, { useState, useEffect, useRef } from 'react';
import {
  calculateProposalDiff,
  saveBoundaryProposal,
  fetchDemoShiftedFixture,
  ProposalDiffResult,
  BoundaryProposalRecord,
  DemoShiftedFixture,
} from '../services/proposalApi';
import {
  Scale,
  Sparkles,
  RotateCcw,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Move,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  HelpCircle,
} from 'lucide-react';

interface Props {
  parcelId: string;
  ulpin: string;
  originalGeometry: any;
  onClose: () => void;
  onProposalSaved?: (proposal: BoundaryProposalRecord) => void;
  onUpdatePreviewGeometry?: (proposedGeom: any, symmDiffGeom: any) => void;
}

export const BoundaryProposalEditor: React.FC<Props> = ({
  parcelId,
  ulpin,
  originalGeometry,
  onClose,
  onProposalSaved,
  onUpdatePreviewGeometry,
}) => {
  // Cloned proposed geometry (separate from legal/stored geometry)
  const [proposedGeometry, setProposedGeometry] = useState<any>(() =>
    JSON.parse(JSON.stringify(originalGeometry))
  );

  // Proposal difference calculation state
  const [diffResult, setDiffResult] = useState<ProposalDiffResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [sequenceCounter, setSequenceCounter] = useState<number>(0);
  const latestSequenceRef = useRef<number>(0);

  // Shift offset controls (in approximate meters)
  const [shiftEastMeters, setShiftEastMeters] = useState<number>(0);
  const [shiftNorthMeters, setShiftNorthMeters] = useState<number>(0);

  // Selected vertex for editing
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number>(0);

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [proposalReason, setProposalReason] = useState<string>(
    'Rectification of eastern boundary alignment based on sub-3cm UAV orthomosaic demarcation.'
  );
  const [evidenceVersion, setEvidenceVersion] = useState<string>('UAV-DEMARCATION-v2.1');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Benchmark demo fixture state
  const [fixtureActive, setFixtureActive] = useState<boolean>(false);
  const [fixtureData, setFixtureData] = useState<DemoShiftedFixture | null>(null);

  // Extract coordinates ring
  const coordsRing: [number, number][] =
    proposedGeometry?.coordinates?.[0] || proposedGeometry?.geometry?.coordinates?.[0] || [];

  // Recalculate diff whenever proposedGeometry changes
  useEffect(() => {
    if (!originalGeometry || !proposedGeometry) return;

    const nextSeq = sequenceCounter + 1;
    setSequenceCounter(nextSeq);
    latestSequenceRef.current = nextSeq;
    setIsCalculating(true);

    calculateProposalDiff({
      parcel_id: parcelId,
      original_geometry: originalGeometry,
      proposed_geometry: proposedGeometry,
      sequence_id: nextSeq,
    })
      .then((res) => {
        // Ignore superseded responses during rapid dragging / shifting
        if (res.sequence_id === latestSequenceRef.current) {
          setDiffResult(res);
          if (onUpdatePreviewGeometry) {
            onUpdatePreviewGeometry(proposedGeometry, res.symmetric_difference_geometry);
          }
        }
      })
      .catch((err) => {
        console.warn('Proposal diff error:', err);
      })
      .finally(() => {
        if (latestSequenceRef.current === nextSeq) {
          setIsCalculating(false);
        }
      });
  }, [proposedGeometry]);

  // Handle vertex coordinate tweak
  const handleVertexChange = (index: number, newLng: number, newLat: number) => {
    const updated = JSON.parse(JSON.stringify(proposedGeometry));
    const ring = updated.coordinates?.[0] || updated.geometry?.coordinates?.[0];
    if (ring && ring[index]) {
      ring[index] = [newLng, newLat];
      // Keep closed ring consistent
      if (index === 0 && ring.length > 1) {
        ring[ring.length - 1] = [newLng, newLat];
      } else if (index === ring.length - 1 && ring.length > 1) {
        ring[0] = [newLng, newLat];
      }
      setProposedGeometry(updated);
    }
  };

  // Shift whole polygon by metric offsets
  const applyMetricShift = (deltaEastM: number, deltaNorthM: number) => {
    // Approx degree conversion at ~27 deg latitude
    // 1 deg lat ≈ 111,320m; 1 deg lon ≈ 111,320 * cos(lat) ≈ 99,000m
    const degLon = deltaEastM / 99000.0;
    const degLat = deltaNorthM / 111320.0;

    const baseRing =
      originalGeometry.coordinates?.[0] || originalGeometry.geometry?.coordinates?.[0] || [];
    const shiftedRing = baseRing.map(([lng, lat]: [number, number]) => [
      lng + degLon,
      lat + degLat,
    ]);

    const updated = JSON.parse(JSON.stringify(originalGeometry));
    if (updated.coordinates) updated.coordinates[0] = shiftedRing;
    else if (updated.geometry?.coordinates) updated.geometry.coordinates[0] = shiftedRing;

    setProposedGeometry(updated);
  };

  // Load genuine 20m x 20m benchmark fixture
  const handleLoadDemoFixture = async () => {
    try {
      const fix = await fetchDemoShiftedFixture();
      setFixtureData(fix);
      setFixtureActive(true);
      setProposedGeometry(fix.proposed_shifted_square.geometry);

      // Force diff calculation with fixture original
      const res = await calculateProposalDiff({
        parcel_id: 'demo-fixture-20m',
        original_geometry: fix.original_square.geometry,
        proposed_geometry: fix.proposed_shifted_square.geometry,
        sequence_id: 9999,
      });
      setDiffResult(res);
      if (onUpdatePreviewGeometry) {
        onUpdatePreviewGeometry(
          fix.proposed_shifted_square.geometry,
          res.symmetric_difference_geometry
        );
      }
    } catch (err: any) {
      alert(`Failed to load demo fixture: ${err.message}`);
    }
  };

  // Reset to original stored geometry
  const handleReset = () => {
    setProposedGeometry(JSON.parse(JSON.stringify(originalGeometry)));
    setShiftEastMeters(0);
    setShiftNorthMeters(0);
    setFixtureActive(false);
  };

  // Save review proposal
  const handleSaveProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const saved = await saveBoundaryProposal({
        parcel_id: parcelId,
        ulpin: ulpin,
        original_geometry: fixtureActive && fixtureData ? fixtureData.original_square.geometry : originalGeometry,
        proposed_geometry: proposedGeometry,
        reason: proposalReason,
        evidence_version: evidenceVersion,
        author_badge_id: 'REV-OFF-UP-042',
        author_name: 'Thiru M. Shanmugavel, M.A.',
      });

      setSaveSuccessMsg(`Proposal ${saved.proposal_id} created for review. Legal parcel unmodified.`);
      if (onProposalSaved) onProposalSaved(saved);

      setTimeout(() => {
        setShowSaveModal(false);
        setSaveSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      alert(`Save proposal error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#C85A32] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 animate-in fade-in duration-150">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#C85A32]/10 rounded-xl text-[#C85A32]">
            <Move className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#C85A32] text-white font-bold px-2 py-0.5 rounded uppercase">
                Officer Boundary Editor
              </span>
              <span className="text-xs text-gray-400 font-mono">
                ULPIN: {ulpin}
              </span>
            </div>
            <h3 className="text-sm font-black text-[#23201F] mt-0.5">
              Interactive Boundary Proposal & Symmetric Difference Engine
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Close editor"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Benchmark Demo Fixture Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5] text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-[#23201F]">
            Hackathon Benchmark Demo Fixture:
          </span>
          <span className="text-[11px] text-gray-600">
            20m × 20m Squares (3m East Shift = 120m² Symmetric Difference)
          </span>
        </div>
        <button
          onClick={handleLoadDemoFixture}
          className="px-2.5 py-1 bg-[#23201F] hover:bg-black text-white font-bold rounded-lg text-[11px] transition-colors shadow-2xs"
        >
          {fixtureActive ? '✓ Benchmark Fixture Loaded' : 'Load Benchmark Fixture'}
        </button>
      </div>

      {/* Real-time Metric Difference Ribbon */}
      {diffResult && (
        <div className="space-y-2">
          {!diffResult.is_valid ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong>Geometry Rejected:</strong> {diffResult.validation_error}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                  Original Area
                </span>
                <span className="font-mono font-bold text-sm text-[#23201F]">
                  {diffResult.original_area_sqm} m²
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                  Proposed Area
                </span>
                <span className="font-mono font-bold text-sm text-[#C85A32]">
                  {diffResult.proposed_area_sqm} m²
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                  Area Delta
                </span>
                <span
                  className={`font-mono font-bold text-sm ${
                    (diffResult.area_change_sqm ?? 0) === 0
                      ? 'text-emerald-700'
                      : (diffResult.area_change_sqm ?? 0) > 0
                      ? 'text-amber-700'
                      : 'text-blue-700'
                  }`}
                >
                  {(diffResult.area_change_sqm ?? 0) > 0 ? '+' : ''}
                  {diffResult.area_change_sqm ?? 0} m² ({diffResult.area_change_pct ?? 0}%)
                </span>
              </div>

              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-700 uppercase block font-bold">
                  Symmetric Difference
                </span>
                <span className="font-mono font-black text-sm text-purple-900">
                  {diffResult.symmetric_difference_area_sqm} m²
                </span>
              </div>
            </div>
          )}

          {diffResult.is_valid && diffResult.causes_encroachment && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Warning:</strong> Proposed boundary extends {diffResult.road_buffer_overlap_sqm} m² into public road corridor buffer!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Metric Offset Shifter Controls */}
      <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E7DFD5] space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#23201F] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#C85A32]" />
            Metric Boundary Translation Controls
          </span>
          <span className="text-[10px] text-gray-500 font-mono">UTM Metric Math</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">East / West Offset:</span>
              <span className="font-mono font-bold text-[#23201F]">
                {shiftEastMeters > 0 ? `+${shiftEastMeters}m (East)` : shiftEastMeters < 0 ? `${shiftEastMeters}m (West)` : '0m'}
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={shiftEastMeters}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setShiftEastMeters(val);
                applyMetricShift(val, shiftNorthMeters);
              }}
              className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">North / South Offset:</span>
              <span className="font-mono font-bold text-[#23201F]">
                {shiftNorthMeters > 0 ? `+${shiftNorthMeters}m (North)` : shiftNorthMeters < 0 ? `${shiftNorthMeters}m (South)` : '0m'}
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={shiftNorthMeters}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setShiftNorthMeters(val);
                applyMetricShift(shiftEastMeters, val);
              }}
              className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
            />
          </div>
        </div>
      </div>

      {/* Vertex Coordinates Inspector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#23201F]">
            Polygon Vertex Handles ({coordsRing.length} points)
          </span>
          <span className="text-[10px] text-gray-500">Edit coordinate values directly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-200 text-[10px] font-mono">
          {coordsRing.slice(0, 8).map(([lng, lat], idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVertexIndex(idx)}
              className={`p-1.5 rounded-lg border text-left transition-colors ${
                selectedVertexIndex === idx
                  ? 'bg-[#C85A32] text-white border-[#C85A32]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="font-bold">Point #{idx + 1}</div>
              <div className="truncate">{lng.toFixed(5)}, {lat.toFixed(5)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Stored</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={() => setShowSaveModal(true)}
          disabled={!diffResult?.is_valid}
          className="px-4 py-2 bg-[#C85A32] hover:bg-[#a64420] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Save Boundary Proposal</span>
        </button>
      </div>

      {/* SAVE PROPOSAL MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-sm text-[#23201F]">
                Save Boundary Proposal for Review
              </h4>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Proposal Successfully Recorded</span>
                </p>
                <p className="text-[11px]">{saveSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProposal} className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Statutory Reason / Demarcation Justification
                  </label>
                  <textarea
                    rows={3}
                    value={proposalReason}
                    onChange={(e) => setProposalReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-[#23201F]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Evidence Version / Survey Epoch
                  </label>
                  <input
                    type="text"
                    value={evidenceVersion}
                    onChange={(e) => setEvidenceVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-[#23201F] font-mono"
                    required
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Statutory Immutability Guarantee:</span>
                  </p>
                  <p>
                    Saving creates an independent review proposal. The legal registered parcel in the official cadastre remains completely untouched until formal Tahsildar approval.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-[#C85A32] text-white font-bold hover:bg-[#a64420] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Submitting...' : 'Submit Proposal for Review'}</span>
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
