import React, { useState } from 'react';
import { Parcel, PartitionResult } from '../types';
import { NearestOfficeCard } from './NearestOfficeCard';
import { LandDivisionAssistant } from './LandDivisionAssistant';
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
  const [showPropertyCardModal, setShowPropertyCardModal] = useState(false);

  // Search filter
  const filteredParcels = parcels.filter(
    (p) =>
      p.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.coOwners && p.coOwners.some((co) => co.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

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
        return <CheckCircle className="w-4 h-4 text-[#276728]" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-[#D97706]" />;
      case 'CRITICAL':
        return <XCircle className="w-4 h-4 text-[#B91C1C]" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Quick Selector */}
      <div className="bg-white border border-[#E7DFD5] rounded-xl p-3 shadow-xs">
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Bhu-Aadhaar ULPIN, Survey No, Village, or Co-owner..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg text-xs text-[#23201F] focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        {/* Quick Demo Parcel Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {parcels.map((p) => {
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
                <span className="truncate max-w-[120px]">{p.surveyNumber}</span>
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
            onClick={() => setShowPropertyCardModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E7DFD5] text-[#C85A32] hover:bg-[#C85A32]/10 transition-colors text-xs font-semibold shrink-0"
          >
            <FileBadge className="w-4 h-4" />
            <span>Property Card</span>
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

      {/* 🌟 LAND PARTITION & FAIR DIVISION ASSISTANT */}
      <LandDivisionAssistant
        parcel={selectedParcel}
        activePartition={activePartition}
        onPartitionChange={onPartitionChange}
        onSubmitToOfficer={onSubmitToOfficer}
      />

      {/* Property Card Modal */}
      {showPropertyCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#E7DFD5]">
            <div className="bg-[#C85A32] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-sm">Official Digital Bhu-Aadhaar Property Card</h3>
                  <p className="text-[10px] text-white/80">Government of India • Survey of India • DoLR</p>
                </div>
              </div>
              <button
                onClick={() => setShowPropertyCardModal(false)}
                className="text-white/80 hover:text-white text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-[#23201F]">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[#6B6360]">Bhu-Aadhaar ULPIN:</span>
                <span className="font-mono font-bold">{selectedParcel.ulpin}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[#6B6360]">Cadastral Survey No:</span>
                <span className="font-bold">{selectedParcel.surveyNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[#6B6360]">Deeded Landowner:</span>
                <span className="font-bold">{selectedParcel.owner.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[#6B6360]">Title RoR Area:</span>
                <span className="font-bold">{selectedParcel.area.rorSqm} m² ({selectedParcel.area.regionalValue})</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[#6B6360]">Public Trust Score:</span>
                <span className="font-bold text-[#276728]">{selectedParcel.trustScore}/100 (Grade {selectedParcel.trustGrade})</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-[#6B6360]">Competent Land Office:</span>
                <span className="font-bold">{selectedParcel.nearestOffice.officeName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B6360]">Designated Officer:</span>
                <span className="font-bold">{selectedParcel.nearestOffice.officerName} ({selectedParcel.nearestOffice.phone})</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] border-t border-[#E7DFD5] flex items-center justify-between">
              <span className="text-[10px] text-[#6B6360]">Cryptographically verified by BhuSetu Engine</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23201F] text-white text-xs font-semibold hover:bg-black"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
