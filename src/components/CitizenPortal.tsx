import React, { useState } from 'react';
import { Parcel, PartitionResult } from '../types';
import { NearestOfficeCard } from './NearestOfficeCard';
import { RoRDossierModal } from './RoRDossierModal';
import { computeChauhaddiNeighbors } from '../services/gisEngine';
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileBadge,
  Layers,
  Copy,
  Check,
  Printer,
  ChevronRight,
  Info,
  Compass,
  Users,
  FileText,
  Sparkles,
} from 'lucide-react';

interface Props {
  parcels: Parcel[];
  selectedParcel: Parcel;
  onSelectParcel: (id: string) => void;
  activePartition?: PartitionResult;
  onPartitionChange: (partition: PartitionResult | undefined) => void;
  onSubmitToOfficer: (partition: PartitionResult) => void;
}

export const CitizenPortal: React.FC<Props> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  activePartition,
  onPartitionChange,
  onSubmitToOfficer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedULPIN, setCopiedULPIN] = useState(false);
  const [showRoRDossierModal, setShowRoRDossierModal] = useState(false);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CLEAN' | 'WARNING' | 'CRITICAL'>('ALL');

  // Search and status filter with strict de-duplication
  const uniqueParcels = React.useMemo(() => {
    const seen = new Set<string>();
    return parcels.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [parcels]);

  const filteredParcels = uniqueParcels.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.ulpin.toLowerCase().includes(q) ||
      p.surveyNumber.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.owner.name.toLowerCase().includes(q) ||
      (p.coOwners && p.coOwners.some((co) => co.name.toLowerCase().includes(q)));
    return matchesStatus && matchesQuery;
  });

  // Dynamically compute authentic 4-Point Boundary Cadastral Neighbors (Chauhaddi) for this parcel
  const dynamicChauhaddi = React.useMemo(() => {
    return computeChauhaddiNeighbors(selectedParcel, parcels);
  }, [selectedParcel, parcels]);

  // Genuine Co-owners (filter out synthetic placeholder co-owners like 'Co-owner 30')
  const validCoOwners = React.useMemo(() => {
    if (!selectedParcel.coOwners) return [];
    return selectedParcel.coOwners.filter(
      (co) =>
        co.name &&
        !/^Co-owner \d+$/i.test(co.name.trim()) &&
        !co.name.toLowerCase().includes('placeholder')
    );
  }, [selectedParcel]);

  const handleCopyULPIN = () => {
    navigator.clipboard.writeText(selectedParcel.ulpin);
    setCopiedULPIN(true);
    setTimeout(() => setCopiedULPIN(false), 2000);
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-[#276728] text-white';
      case 'B':
        return 'bg-[#276728]/80 text-white';
      case 'C':
        return 'bg-[#D97706] text-white';
      case 'D':
        return 'bg-[#D97706]/90 text-white';
      default:
        return 'bg-[#B91C1C] text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CLEAN':
        return <CheckCircle className="w-3.5 h-3.5 text-[#276728]" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />;
      case 'CRITICAL':
        return <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Quick Selector */}
      <div className="bg-white border border-[#E7DFD5] rounded-xl p-3 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 36 TRACGIS parcels by Survey No, Village, ULPIN..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs text-[#23201F] focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 text-[11px] pb-1 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-[#23201F] text-white'
                : 'bg-[#FAF7F2] text-[#383432] hover:bg-[#E7DFD5] border border-[#E7DFD5]'
            }`}
          >
            All ({parcels.length})
          </button>
          <button
            onClick={() => setStatusFilter('CLEAN')}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors shrink-0 ${
              statusFilter === 'CLEAN'
                ? 'bg-[#276728] text-white'
                : 'bg-[#276728]/10 text-[#276728] hover:bg-[#276728]/20 border border-[#276728]/30'
            }`}
          >
            Clean ({parcels.filter((p) => p.status === 'CLEAN').length})
          </button>
          <button
            onClick={() => setStatusFilter('WARNING')}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors shrink-0 ${
              statusFilter === 'WARNING'
                ? 'bg-[#D97706] text-white'
                : 'bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20 border border-[#D97706]/30'
            }`}
          >
            Mismatch ({parcels.filter((p) => p.status === 'WARNING').length})
          </button>
          <button
            onClick={() => setStatusFilter('CRITICAL')}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors shrink-0 ${
              statusFilter === 'CRITICAL'
                ? 'bg-[#B91C1C] text-white'
                : 'bg-[#B91C1C]/10 text-[#B91C1C] hover:bg-[#B91C1C]/20 border border-[#B91C1C]/30'
            }`}
          >
            Encroachment ({parcels.filter((p) => p.status === 'CRITICAL').length})
          </button>
        </div>

        {/* Scrollable Parcels Grid */}
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {filteredParcels.map((p) => {
            const isSelected = p.id === selectedParcel.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectParcel(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#383432] hover:bg-[#E7DFD5] border border-[#E7DFD5]'
                }`}
              >
                {getStatusIcon(p.status)}
                <span className="truncate max-w-[130px]">{p.surveyNumber}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${getGradeBadge(p.trustGrade)}`}>
                  {p.trustGrade}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Parcel Overview Card */}
      <div className="bg-white border border-[#E7DFD5] rounded-xl p-4 shadow-xs space-y-3.5">
        {/* Title Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E7DFD5] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#FAF7F2] border border-[#E7DFD5] px-2 py-0.5 rounded text-[#23201F] flex items-center gap-1">
                <span>ULPIN: {selectedParcel.ulpin}</span>
                <button
                  onClick={handleCopyULPIN}
                  className="text-gray-400 hover:text-[#C85A32]"
                  title="Copy Bhu-Aadhaar ULPIN"
                >
                  {copiedULPIN ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getGradeBadge(selectedParcel.trustGrade)}`}>
                Trust Grade {selectedParcel.trustGrade} ({selectedParcel.trustScore}/100)
              </span>
            </div>
            <h2 className="text-base font-bold text-[#23201F] mt-1.5">
              Survey No: {selectedParcel.surveyNumber}
            </h2>
            <p className="text-xs text-[#6B6360]">
              {selectedParcel.village}, {selectedParcel.taluk}, {selectedParcel.district}, {selectedParcel.state}
            </p>
          </div>

          <button
            onClick={() => setShowRoRDossierModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#23201F] text-white hover:bg-black transition-all text-xs font-bold shrink-0 shadow-xs border border-black/20"
            title="Open comprehensive Record of Rights (RoR) Title Dossier & Official Property Card"
          >
            <FileBadge className="w-4 h-4 text-[#C85A32]" />
            <span>Title Dossier & Card</span>
          </button>
        </div>

        {/* Ownership & Land Use Row */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E7DFD5]">
            <p className="text-[#6B6360] text-[11px] font-medium">Registered Landowner / Holding</p>
            <p className="font-bold text-[#23201F] mt-0.5">{selectedParcel.owner.name}</p>
            <p className="text-[11px] text-[#276728] mt-0.5 font-medium">{selectedParcel.owner.type}</p>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E7DFD5]">
            <p className="text-[#6B6360] text-[11px] font-medium">Land Use & Zoning</p>
            <p className="font-bold text-[#23201F] mt-0.5">{selectedParcel.landUse}</p>
            <p className="text-[11px] text-[#6B6360] mt-0.5">
              Tax: <strong className={selectedParcel.tax.status === 'Paid' ? 'text-green-700' : 'text-amber-700'}>
                {selectedParcel.tax.status}
              </strong> ({selectedParcel.tax.lastPaidDate})
            </p>
          </div>
        </div>

        {/* RoR vs Satellite Geodesic Area Comparison */}
        <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#E7DFD5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#23201F] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Area Reconciliation (Title vs Satellite)</span>
            </span>
            <span className="text-[11px] text-[#6B6360]">
              Discrepancy: <strong className="text-[#23201F]">
                {Math.abs(selectedParcel.area.rorSqm - selectedParcel.area.gisSqm).toFixed(1)} m² (
                {((Math.abs(selectedParcel.area.rorSqm - selectedParcel.area.gisSqm) / selectedParcel.area.rorSqm) * 100).toFixed(1)}%)
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded border border-[#E7DFD5]">
              <p className="text-[10px] text-[#6B6360] uppercase tracking-wider font-semibold">RoR Registry Title Area</p>
              <p className="font-bold text-sm text-[#23201F]">{selectedParcel.area.rorSqm} m²</p>
              <p className="text-[11px] text-[#6B6360]">{selectedParcel.area.regionalValue}</p>
            </div>
            <div className="bg-white p-2 rounded border border-[#E7DFD5]">
              <p className="text-[10px] text-[#6B6360] uppercase tracking-wider font-semibold">Geodesic Satellite GIS Area</p>
              <p className="font-bold text-sm text-[#276728]">{selectedParcel.area.gisSqm} m²</p>
              <p className="text-[11px] text-[#276728] font-medium">Turf.js WGS84 Geodesic</p>
            </div>
          </div>
        </div>

        {/* Chauhaddi (4-Point Boundary Cadastral Neighbors - Dynamically Computed) */}
        <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Chauhaddi (4-Point Boundary Neighbors)</span>
            </span>
            <span className="text-[10px] bg-white border border-[#E7DFD5] text-[#6B6360] px-2 py-0.5 rounded-full font-semibold">
              Legal Cadastral Abuttal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-[#E7DFD5]/80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#C85A32]">North (उत्तर)</span>
                <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                  {dynamicChauhaddi.north.tag}
                </span>
              </div>
              <p className="font-semibold text-[#23201F] mt-0.5 truncate">{dynamicChauhaddi.north.label}</p>
              <p className="text-[10px] text-[#6B6360] truncate">{dynamicChauhaddi.north.subtext}</p>
            </div>

            <div className="bg-white p-2 rounded-lg border border-[#E7DFD5]/80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-700">South (दक्षिण)</span>
                <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-bold">
                  {dynamicChauhaddi.south.tag}
                </span>
              </div>
              <p className="font-semibold text-[#23201F] mt-0.5 truncate">{dynamicChauhaddi.south.label}</p>
              <p className="text-[10px] text-[#6B6360] truncate">{dynamicChauhaddi.south.subtext}</p>
            </div>

            <div className="bg-white p-2 rounded-lg border border-[#E7DFD5]/80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#276728]">East (पूर्व)</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                  {dynamicChauhaddi.east.tag}
                </span>
              </div>
              <p className="font-semibold text-[#23201F] mt-0.5 truncate">{dynamicChauhaddi.east.label}</p>
              <p className="text-[10px] text-[#6B6360] truncate">{dynamicChauhaddi.east.subtext}</p>
            </div>

            <div className="bg-white p-2 rounded-lg border border-[#E7DFD5]/80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-700">West (पश्चिम)</span>
                <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                  {dynamicChauhaddi.west.tag}
                </span>
              </div>
              <p className="font-semibold text-[#23201F] mt-0.5 truncate">{dynamicChauhaddi.west.label}</p>
              <p className="text-[10px] text-[#6B6360] truncate">{dynamicChauhaddi.west.subtext}</p>
            </div>
          </div>
        </div>

        {/* Pattadar Co-Owners & Title Equity (Rendered ONLY when multiple legitimate co-owners exist) */}
        {validCoOwners.length > 1 && (
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Pattadar Co-Owners & Equity Split</span>
              </span>
              <span className="text-[10px] text-[#6B6360]">
                Total Holding: <strong>{selectedParcel.area.gisSqm} m²</strong> (100% Equity)
              </span>
            </div>

            <div className="space-y-1.5">
              {validCoOwners.map((co, idx) => {
                const pct = Math.round((co.shareFraction || (1 / validCoOwners.length)) * 100);
                return (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-[#E7DFD5] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#23201F]">{co.name}</span>
                      <span className="text-[10px] text-[#6B6360] ml-2">({co.relationship || 'Co-Owner'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#276728]">{pct}%</span>
                      <span className="text-[10px] text-[#6B6360]">
                        ({Math.round((selectedParcel.area.gisSqm * pct) / 100)} m²)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Violations / Encroachments Alert (if any) */}
        {selectedParcel.violations.length > 0 && (
          <div className="bg-[#B91C1C]/10 border border-[#B91C1C]/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-[#B91C1C] text-xs font-bold">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Statutory Spatial Conflict Detected</span>
            </div>
            {selectedParcel.violations.map((vio) => (
              <div key={vio.id} className="text-xs text-[#23201F] bg-white/80 p-2.5 rounded-lg border border-[#B91C1C]/20">
                <p className="font-bold text-[#B91C1C]">{vio.title}</p>
                <p className="text-[#383432] mt-0.5 leading-relaxed">{vio.description}</p>
                {vio.statutoryClause && (
                  <p className="text-[10px] text-[#6B6360] mt-1 font-mono">
                    Statutory Rule: {vio.statutoryClause}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 NEAREST REVENUE OFFICE & OFFICER CONTACT CARD */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6360]">
            Nearest Land Revenue Office & Designated Officer
          </h3>
          <span className="text-[11px] text-[#C85A32] font-semibold">Direct Citizen Contact</span>
        </div>
        <NearestOfficeCard
          office={selectedParcel.nearestOffice}
          parcelLocation={`${selectedParcel.village}, ${selectedParcel.surveyNumber}`}
        />
      </div>



      {/* Official RoR Land Title Dossier & Digital Property Card Modal */}
      <RoRDossierModal
        isOpen={showRoRDossierModal}
        onClose={() => setShowRoRDossierModal(false)}
        parcelId={selectedParcel.id}
        fallbackParcel={selectedParcel}
      />
    </div>
  );
};
