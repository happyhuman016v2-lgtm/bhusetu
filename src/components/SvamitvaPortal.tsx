import React, { useState, useEffect } from 'react';
import {
  SvamitvaParcel,
  EncroachmentConflict,
  EncroachmentAnalysisResult,
  RoRDossier,
  PropertyCardCertificate,
} from '../types';
import {
  fetchRoRDossier,
  fetchPropertyCard,
} from '../services/svamitvaService';
import { RoRDossierModal } from './RoRDossierModal';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  FileText,
  MapPin,
  Search,
  Building2,
  AlertTriangle,
  QrCode,
  Printer,
  Sparkles,
  Scale,
  Compass,
  Users,
  Copy,
  Check,
  Maximize2,
  Landmark,
  ChevronRight,
} from 'lucide-react';

interface Props {
  parcels: SvamitvaParcel[];
  selectedParcel: SvamitvaParcel;
  onSelectParcel: (parcelId: string) => void;
  bufferDistance: number;
  onBufferDistanceChange: (distance: number) => void;
  encroachmentResults: EncroachmentAnalysisResult | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

export const SvamitvaPortal: React.FC<Props> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  bufferDistance,
  onBufferDistanceChange,
  encroachmentResults,
  isAnalyzing,
  onRunAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [landTypeFilter, setLandTypeFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'parcels' | 'ror' | 'disputes' | 'card'>('parcels');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<EncroachmentConflict | null>(null);

  // RoR state
  const [dossier, setDossier] = useState<RoRDossier | null>(null);
  const [loadingRoR, setLoadingRoR] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [copiedULPIN, setCopiedULPIN] = useState<boolean>(false);

  // Load RoR dossier whenever selectedParcel changes
  useEffect(() => {
    if (!selectedParcel) return;
    let isMounted = true;
    setLoadingRoR(true);

    fetchRoRDossier(selectedParcel.id)
      .then((data) => {
        if (isMounted && data) {
          setDossier(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load RoR for selected parcel:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingRoR(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedParcel.id]);

  // Filter parcels
  const filteredParcels = parcels.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const props = p.properties;
    const matchesQuery =
      !q ||
      props.owner_name.toLowerCase().includes(q) ||
      props.survey_plot_no.toLowerCase().includes(q) ||
      props.property_id.toLowerCase().includes(q) ||
      props.gharouni_card_no.toLowerCase().includes(q);

    const matchesType =
      landTypeFilter === 'ALL' ||
      props.land_type.toLowerCase() === landTypeFilter.toLowerCase();

    return matchesQuery && matchesType;
  });

  const conflicts = encroachmentResults?.features || [];

  const handleOpenNotice = (conflict: EncroachmentConflict) => {
    setSelectedConflict(conflict);
    setShowNoticeModal(true);
  };

  const handleCopyULPIN = (ulpin: string) => {
    navigator.clipboard.writeText(ulpin);
    setCopiedULPIN(true);
    setTimeout(() => setCopiedULPIN(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Village Banner */}
      <div className="bg-[#23201F] text-white p-4 rounded-2xl shadow-sm border border-[#383432]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#C85A32] text-[10px] font-bold uppercase tracking-wider">
                SVAMITVA Scheme
              </span>
              <span className="text-gray-400 text-xs font-mono">
                LGD Code: {selectedParcel.properties.village_lgd_code}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FBF9F5] mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C85A32]" />
              {selectedParcel.properties.village}
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Tehsil {selectedParcel.properties.tehsil}, Dist. {selectedParcel.properties.district}, {selectedParcel.properties.state}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-gray-400 block">Resolution</span>
            <span className="text-xs font-mono font-bold text-emerald-400">GSD &lt; 5cm UAV</span>
          </div>
        </div>

        {/* Metric Buffer Slider Card */}
        <div className="mt-3.5 pt-3 border-t border-gray-700/60 bg-white/5 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#C85A32]" />
              Metric Buffer Distance
            </span>
            <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/30 text-xs">
              {bufferDistance.toFixed(1)} Metres (UTM EPSG:32644)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="20.0"
              step="0.5"
              value={bufferDistance}
              onChange={(e) => onBufferDistanceChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>0.5m (Min setback)</span>
            <span>5.0m (Standard Abadi Gali)</span>
            <span>20.0m (Arterial Road)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#E7DFD5] p-1 rounded-xl text-xs font-bold text-[#383432]">
        <button
          onClick={() => setActiveTab('parcels')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
            activeTab === 'parcels'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40'
          }`}
        >
          Parcels ({parcels.length})
        </button>

        <button
          onClick={() => setActiveTab('ror')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ror'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40 text-[#C85A32]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>RoR Title</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'disputes'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40 text-red-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          <span>Disputes ({conflicts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'card'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Gharouni</span>
        </button>
      </div>

      {/* TAB 1: PARCELS BROWSER */}
      {activeTab === 'parcels' && (
        <div className="space-y-3">
          {/* Search & Filters */}
          <div className="bg-white p-3 rounded-xl border border-[#E7DFD5] shadow-2xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search owner, Gharouni No, Plot No..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs text-[#23201F] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-1">
              {['ALL', 'Residential', 'Open Land', 'Community Asset', 'Public Road'].map((type) => (
                <button
                  key={type}
                  onClick={() => setLandTypeFilter(type)}
                  className={`px-2 py-0.5 rounded-full font-semibold transition-colors shrink-0 ${
                    landTypeFilter === type
                      ? 'bg-[#23201F] text-white'
                      : 'bg-[#FAF7F2] text-[#383432] hover:bg-[#E7DFD5] border border-[#E7DFD5]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Parcel Cards List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredParcels.map((p) => {
              const isSelected = p.id === selectedParcel.id;
              const props = p.properties;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectParcel(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#C85A32]/10 border-[#C85A32] shadow-sm'
                      : 'bg-white border-[#E7DFD5] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#23201F]">
                          Plot {props.survey_plot_no}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            props.land_type === 'Residential'
                              ? 'bg-blue-100 text-blue-800'
                              : props.land_type === 'Public Road'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {props.land_type}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#23201F] mt-0.5">{props.owner_name}</p>
                      <p className="text-[11px] text-[#6B6360]">{props.father_husband_name}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#276728] block">
                        {props.area_sq_mtr} m²
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        {props.gharouni_card_no}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-[#C85A32]/20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('ror');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#C85A32] hover:bg-[#C85A32]/10 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>View RoR Dossier</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDossierModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#23201F] hover:bg-black rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Open Modal</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ROR LAND TITLE DOSSIER SIDE PANE */}
      {activeTab === 'ror' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {loadingRoR ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E7DFD5] text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#23201F]">
                Computing ULPIN & reconciling Record of Rights...
              </p>
            </div>
          ) : dossier ? (
            <div className="space-y-3">
              {/* ULPIN Header Box */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Bhu-Aadhaar / ULPIN (DoLR Standard)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-black text-white ${
                        dossier.title_confidence.grade === 'A'
                          ? 'bg-emerald-600'
                          : dossier.title_confidence.grade === 'B'
                          ? 'bg-blue-600'
                          : dossier.title_confidence.grade === 'C'
                          ? 'bg-amber-500'
                          : 'bg-red-600'
                      }`}
                    >
                      Grade {dossier.title_confidence.grade} • {dossier.title_confidence.score}/100
                    </span>
                    <button
                      onClick={() => setIsDossierModalOpen(true)}
                      className="p-1 text-gray-400 hover:text-[#23201F] rounded transition-colors"
                      title="Enlarge RoR Dossier"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
                  <span className="font-mono text-base font-black text-[#23201F] tracking-wide">
                    {dossier.ulpin}
                  </span>
                  <button
                    onClick={() => handleCopyULPIN(dossier.ulpin)}
                    className="p-1 rounded-md hover:bg-white text-gray-600 transition-colors"
                    title="Copy ULPIN"
                  >
                    {copiedULPIN ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-gray-500 block">Khasra / Plot:</span>
                    <span className="font-bold text-[#23201F]">{dossier.khasra_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Khatauni Family No:</span>
                    <span className="font-bold text-[#23201F]">{dossier.khata_number}</span>
                  </div>
                </div>
              </div>

              {/* AREA COMPARISON BADGE & RECONCILIATION */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#C85A32]" />
                    Area Discrepancy Reconciliation
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      Math.abs(dossier.variance_analysis.variance_pct) <= 3.0
                        ? 'bg-emerald-100 text-emerald-800'
                        : Math.abs(dossier.variance_analysis.variance_pct) <= 6.0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {Math.abs(dossier.variance_analysis.variance_pct) <= 3.0
                      ? 'Verified'
                      : Math.abs(dossier.variance_analysis.variance_pct) <= 6.0
                      ? 'Minor Deviation'
                      : 'High Dispute Risk'}
                  </span>
                </div>

                {/* Prominent Comparison Badge */}
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold space-y-1 ${
                    Math.abs(dossier.variance_analysis.variance_pct) <= 3.0
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : Math.abs(dossier.variance_analysis.variance_pct) <= 6.0
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>
                      Drone Area: <strong>{dossier.spatial.actual_drone_area_sqm} m²</strong>
                    </span>
                    <span>
                      Registry Area: <strong>{dossier.legal_registry.recorded_legal_area_sqm} m²</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-black/10 text-xs">
                    <span>Variance Mismatch:</span>
                    <span className="font-mono font-bold">
                      {dossier.variance_analysis.variance_pct > 0 ? '+' : ''}
                      {dossier.variance_analysis.variance_pct.toFixed(1)}% ({dossier.variance_analysis.variance_sqm > 0 ? '+' : ''}{dossier.variance_analysis.variance_sqm} m²)
                    </span>
                  </div>
                </div>
              </div>

              {/* CO-OWNERS WITH SPLIT EQUITY BARS */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                  Pattadar Co-Owners & Equity Split
                </span>

                <div className="space-y-2">
                  {dossier.pattadars.map((p, idx) => (
                    <div key={idx} className="bg-[#FAF7F2] p-2 rounded-xl border border-[#E7DFD5] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#23201F]">{p.name}</span>
                          <span className="text-[10px] text-gray-500 ml-1">({p.relation})</span>
                        </div>
                        <span className="font-mono font-bold text-[#C85A32]">
                          {p.share_pct}% ({p.equity_area_sqm} m²)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#C85A32] h-1.5 rounded-full"
                          style={{ width: `${p.share_pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHAUHADDI 4-POINT NEIGHBORS */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
                  Chauhaddi Adjoining Neighbors
                </span>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200">
                    <span className="text-[9px] font-bold text-blue-900 uppercase block">North</span>
                    <span className="font-semibold text-[#23201F] truncate block">
                      {dossier.chauhaddi.north.owner}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {dossier.chauhaddi.north.plot_no}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                    <span className="text-[9px] font-bold text-amber-900 uppercase block">South</span>
                    <span className="font-semibold text-[#23201F] truncate block">
                      {dossier.chauhaddi.south.owner}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {dossier.chauhaddi.south.plot_no}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200">
                    <span className="text-[9px] font-bold text-purple-900 uppercase block">East</span>
                    <span className="font-semibold text-[#23201F] truncate block">
                      {dossier.chauhaddi.east.owner}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {dossier.chauhaddi.east.plot_no}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-200">
                    <span className="text-[9px] font-bold text-teal-900 uppercase block">West</span>
                    <span className="font-semibold text-[#23201F] truncate block">
                      {dossier.chauhaddi.west.owner}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {dossier.chauhaddi.west.plot_no}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION: EXPORT DIGITAL PROPERTY CARD */}
              <div className="pt-1">
                <button
                  onClick={() => setIsDossierModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-[#C85A32] text-white rounded-xl text-xs font-bold hover:bg-[#a64420] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export RoR Title Certificate / Gharouni Card</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-gray-500">
              Select a parcel to inspect its Record of Rights dossier.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ROAD RIGHT-OF-WAY ENCROACHMENTS & DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-3">
          <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-900 flex items-center justify-between">
            <div>
              <p className="font-bold">Public Right-of-Way Buffer Conflicts</p>
              <p className="text-[11px] text-red-700">
                {conflicts.length} parcels encroaching onto public village corridors
              </p>
            </div>
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="px-3 py-1.5 bg-[#B91C1C] text-white rounded-lg text-xs font-bold hover:bg-red-800 transition-colors shrink-0 shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {conflicts.map((c) => {
              const cp = c.properties;
              return (
                <div
                  key={c.id}
                  className="bg-white border border-red-200 rounded-xl p-3 shadow-2xs space-y-2 hover:border-red-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#23201F]">
                          Plot {cp.survey_plot_no}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            cp.dispute_severity === 'CRITICAL'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {cp.dispute_severity}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#23201F] mt-0.5">{cp.owner_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{cp.gharouni_card_no}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-red-600 block">
                        +{cp.overlap_area_sqm} m²
                      </span>
                      <span className="text-[10px] text-gray-500">Overlap Area</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#6B6360] bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <strong>Statutory Clause:</strong> {cp.statutory_clause}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => onSelectParcel(cp.encroaching_parcel_id)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#23201F] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-[#C85A32]" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => handleOpenNotice(c)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-[#B91C1C] hover:bg-red-800 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Issue Notice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: GHAROUNI DIGITAL PROPERTY CARD */}
      {activeTab === 'card' && (
        <div className="space-y-3">
          <div className="bg-white border-2 border-[#C85A32] rounded-2xl p-4 shadow-sm space-y-3.5 relative overflow-hidden">
            {/* Header / Emblem */}
            <div className="border-b border-gray-200 pb-3 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C85A32] block">
                Government of India • Ministry of Panchayati Raj
              </span>
              <h3 className="text-sm font-extrabold text-[#23201F] uppercase mt-0.5">
                SVAMITVA Property Card (Gharouni)
              </h3>
              <p className="text-[10px] text-[#6B6360]">
                Survey of Villages and Mapping with Improvised Technology in Village Areas
              </p>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#E7DFD5]">
                <span className="text-[10px] text-gray-500 block">Gharouni Card Number</span>
                <span className="font-mono font-bold text-[#C85A32]">
                  {selectedParcel.properties.gharouni_card_no}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#E7DFD5]">
                <span className="text-[10px] text-gray-500 block">Survey Plot / Abadi No.</span>
                <span className="font-mono font-bold text-[#23201F]">
                  {selectedParcel.properties.survey_plot_no}
                </span>
              </div>
            </div>

            <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E7DFD5] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Registered Owner:</span>
                <span className="font-bold text-[#23201F]">{selectedParcel.properties.owner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Father/Spouse Name:</span>
                <span className="font-medium text-[#23201F]">{selectedParcel.properties.father_husband_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Drone Surveyed Area:</span>
                <span className="font-mono font-bold text-[#276728]">{selectedParcel.properties.area_sq_mtr} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Land Use Category:</span>
                <span className="font-semibold text-[#23201F]">{selectedParcel.properties.land_type}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B6360] pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-6 h-6 text-gray-700" />
                <span className="text-[9px]">Verified on National SDI Geoportal</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#276728]" />
                <span className="text-[#276728] font-bold">Drone Survey Certified</span>
              </div>
            </div>

            <button
              onClick={() => setIsDossierModalOpen(true)}
              className="w-full mt-2 py-2 px-3 bg-[#23201F] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Gharouni Title</span>
            </button>
          </div>
        </div>
      )}

      {/* STATUTORY NOTICE MODAL */}
      {showNoticeModal && selectedConflict && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-200 space-y-3.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-[#23201F]">
                  Statutory Encroachment Notice (Form-67 / SVAMITVA)
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
                <strong>To:</strong> {selectedConflict.properties.owner_name} (Plot No. {selectedConflict.properties.survey_plot_no})
              </p>
              <p>
                <strong>Gharouni No:</strong> {selectedConflict.properties.gharouni_card_no}
              </p>
              <p>
                <strong>Subject:</strong> Immediate Notice regarding unauthorized buffer expansion and right-of-way intrusion into {selectedConflict.properties.affected_asset}.
              </p>
              <p className="text-red-700 font-semibold">
                Overlap Area Detected by UAV Drone Photogrammetry: {selectedConflict.properties.overlap_area_sqm} m²
              </p>
              <p className="text-[11px] text-gray-600">
                Under {selectedConflict.properties.statutory_clause}, you are directed to present records before the Tahsildar / Revenue Inspector within 15 days of notice publication.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Statutory Notice successfully dispatched for Plot ${selectedConflict.properties.survey_plot_no} (${selectedConflict.properties.owner_name}). Reference: SVAM-NOT-${Date.now()}`);
                  setShowNoticeModal(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#B91C1C] text-white text-xs font-bold hover:bg-red-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Issue & Print Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL ROR LAND TITLE DOSSIER MODAL */}
      <RoRDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        parcelId={selectedParcel.id}
        fallbackParcel={selectedParcel}
      />
    </div>
  );
};
