import React, { useState, useEffect } from 'react';
import { Parcel, PartitionResult } from '../types';
import { divideParcelEquitably, generatePartitionDeedMemorandum, formatIndianLandUnits } from '../services/partitionEngine';
import { Users, Divide, CheckCircle2, FileText, Send, Sparkles, Scale, Info, RefreshCw } from 'lucide-react';

interface Props {
  parcel: Parcel;
  activePartition?: PartitionResult;
  onPartitionChange: (partition: PartitionResult | undefined) => void;
  onSubmitToOfficer?: (partition: PartitionResult) => void;
}

interface ShareholderInput {
  id: string;
  name: string;
  sharePercent: number;
}

export const LandDivisionAssistant: React.FC<Props> = ({
  parcel,
  activePartition,
  onPartitionChange,
  onSubmitToOfficer,
}) => {
  // Initialize shareholders based on coOwners if available, or default to 2
  const [shareholders, setShareholders] = useState<ShareholderInput[]>(() => {
    if (parcel.coOwners && parcel.coOwners.length >= 2) {
      return parcel.coOwners.map((c, i) => ({
        id: c.id || `p-${i + 1}`,
        name: c.name,
        sharePercent: Math.round((c.shareFraction || 1 / parcel.coOwners.length) * 100),
      }));
    }
    return [
      { id: 'p-1', name: 'Co-owner 1 (Shareholder A)', sharePercent: 50 },
      { id: 'p-2', name: 'Co-owner 2 (Shareholder B)', sharePercent: 50 },
    ];
  });

  const [showDeedModal, setShowDeedModal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Sync if parcel changes
  useEffect(() => {
    if (parcel.coOwners && parcel.coOwners.length >= 2) {
      setShareholders(
        parcel.coOwners.map((c, i) => ({
          id: c.id || `p-${i + 1}`,
          name: c.name,
          sharePercent: Math.round((c.shareFraction || 1 / parcel.coOwners.length) * 100),
        }))
      );
    } else {
      setShareholders([
        { id: 'p-1', name: 'Co-owner 1 (Shareholder A)', sharePercent: 50 },
        { id: 'p-2', name: 'Co-owner 2 (Shareholder B)', sharePercent: 50 },
      ]);
    }
    setSubmissionSuccess(false);
  }, [parcel.id]);

  // Compute Even / Equal Divide
  const handleSuggestEvenDivide = () => {
    const count = shareholders.length;
    const equalShare = Math.round((100 / count) * 10) / 10;
    const updated = shareholders.map((s, idx) => ({
      ...s,
      sharePercent: idx === count - 1 ? 100 - equalShare * (count - 1) : equalShare,
    }));
    setShareholders(updated);

    const partition = divideParcelEquitably(
      parcel,
      updated.map((s) => ({
        id: s.id,
        name: s.name,
        shareFraction: s.sharePercent / 100,
      }))
    );
    onPartitionChange(partition);
    setSubmissionSuccess(false);
  };

  const handleAddShareholder = () => {
    if (shareholders.length >= 5) return;
    const nextIdx = shareholders.length + 1;
    const updated = [...shareholders, { id: `p-${nextIdx}`, name: `Co-owner ${nextIdx}`, sharePercent: 0 }];
    const count = updated.length;
    const equalShare = Math.round((100 / count) * 10) / 10;
    const rebalanced = updated.map((s, idx) => ({
      ...s,
      sharePercent: idx === count - 1 ? 100 - equalShare * (count - 1) : equalShare,
    }));
    setShareholders(rebalanced);
  };

  const handleRemoveShareholder = (idx: number) => {
    if (shareholders.length <= 2) return;
    const updated = shareholders.filter((_, i) => i !== idx);
    const count = updated.length;
    const equalShare = Math.round((100 / count) * 10) / 10;
    const rebalanced = updated.map((s, i) => ({
      ...s,
      sharePercent: i === count - 1 ? 100 - equalShare * (count - 1) : equalShare,
    }));
    setShareholders(rebalanced);
    if (activePartition) {
      const partition = divideParcelEquitably(
        parcel,
        rebalanced.map((s) => ({ id: s.id, name: s.name, shareFraction: s.sharePercent / 100 }))
      );
      onPartitionChange(partition);
    }
  };

  const handleUpdateName = (idx: number, name: string) => {
    const updated = [...shareholders];
    updated[idx].name = name;
    setShareholders(updated);
  };

  const handleClearPartition = () => {
    onPartitionChange(undefined);
    setSubmissionSuccess(false);
  };

  const handleSubmitMutation = () => {
    if (activePartition && onSubmitToOfficer) {
      onSubmitToOfficer(activePartition);
      setSubmissionSuccess(true);
    }
  };

  const totalPercent = shareholders.reduce((acc, s) => acc + s.sharePercent, 0);

  return (
    <div className="bg-white border border-[#E7DFD5] rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#23201F] flex items-center gap-1.5">
              <span>Land Partition & Fair Division Assistant</span>
              <span className="text-[10px] bg-[#C85A32]/15 text-[#C85A32] px-2 py-0.5 rounded-full font-medium">
                AI Geodesic Split
              </span>
            </h3>
            <p className="text-xs text-[#6B6360]">
              Automate even & equitable spatial sub-division for co-owners and joint inheritance
            </p>
          </div>
        </div>

        {activePartition && (
          <button
            onClick={handleClearPartition}
            className="text-xs text-[#6B6360] hover:text-[#B91C1C] flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            title="Reset partition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Shareholder List */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs text-[#6B6360] px-1 font-medium">
          <span>Parties & Co-heirs ({shareholders.length})</span>
          <span>Target Share</span>
        </div>

        {shareholders.map((person, idx) => (
          <div key={person.id} className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-lg border border-[#E7DFD5]">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{
                backgroundColor:
                  activePartition?.splits[idx]?.color ||
                  ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#DC2626'][idx % 5],
              }}
            />
            <input
              type="text"
              value={person.name}
              onChange={(e) => handleUpdateName(idx, e.target.value)}
              className="flex-1 bg-white border border-[#E7DFD5] rounded px-2 py-1 text-xs text-[#23201F] font-medium focus:outline-none focus:border-[#C85A32]"
              placeholder={`Party ${idx + 1} Name`}
            />
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#23201F] w-12 text-right">
                {person.sharePercent}%
              </span>
              {shareholders.length > 2 && (
                <button
                  onClick={() => handleRemoveShareholder(idx)}
                  className="text-gray-400 hover:text-red-500 text-xs px-1"
                  title="Remove party"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleSuggestEvenDivide}
          className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#C85A32] text-white hover:bg-[#A94424] transition-all text-xs font-semibold shadow-sm hover:shadow active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Suggest Even Divide ({Math.round(100 / shareholders.length)}% Each)</span>
        </button>

        {shareholders.length < 5 && (
          <button
            onClick={handleAddShareholder}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#FAF7F2] text-[#383432] hover:bg-[#E7DFD5] border border-[#E7DFD5] transition-colors text-xs font-medium"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Co-owner (+1)</span>
          </button>
        )}

        {activePartition && (
          <button
            onClick={() => setShowDeedModal(true)}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#276728]/10 text-[#276728] hover:bg-[#276728]/20 transition-colors text-xs font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Draft Deed</span>
          </button>
        )}
      </div>

      {/* Division Results Breakdown */}
      {activePartition && (
        <div className="bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#23201F] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#276728]" />
              <span>Equitable Division Computed</span>
            </span>
            <span className="text-[11px] font-semibold bg-[#276728]/10 text-[#276728] px-2 py-0.5 rounded-full">
              {activePartition.parityScore}% Area Parity
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {activePartition.splits.map((split, i) => (
              <div
                key={split.shareholderId}
                className="bg-white rounded-lg p-2.5 border-l-4 shadow-2xs"
                style={{ borderLeftColor: split.color }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#23201F]">{split.shareholderName}</p>
                    <p className="text-[11px] text-[#6B6360]">Sub-Survey: <strong>{split.subSurveyNo}</strong></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#23201F]">{split.areaSqm} m²</p>
                    <p className="text-[11px] text-[#276728] font-medium">{split.regionalAreaFormatted}</p>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#6B6360] pt-1 border-t border-gray-100">
                  <span>Share: {split.sharePercentage}%</span>
                  <span>Est. Road Frontage: ~{split.roadFrontageMetres}m</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submit to Revenue Officer */}
          <div className="pt-2 border-t border-[#E7DFD5]">
            {submissionSuccess ? (
              <div className="bg-[#276728]/15 border border-[#276728]/30 rounded-lg p-2 text-center text-xs text-[#276728] font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Submitted to Tahsildar / SRO for Mutation Verification!</span>
              </div>
            ) : (
              <button
                onClick={handleSubmitMutation}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#23201F] text-white hover:bg-[#383432] transition-colors text-xs font-semibold shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Partition Plan for Official Mutation</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Statutory Partition Memorandum Modal */}
      {showDeedModal && activePartition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#E7DFD5]">
            <div className="flex items-center justify-between bg-[#23201F] text-white p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-semibold text-sm">Official Memorandum of Land Partition & Survey Demarcation</h3>
              </div>
              <button
                onClick={() => setShowDeedModal(false)}
                className="text-gray-300 hover:text-white text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-[#FBF9F5] leading-relaxed whitespace-pre-wrap text-[#23201F]">
              {generatePartitionDeedMemorandum(parcel, activePartition)}
            </div>

            <div className="p-3 bg-[#FAF7F2] border-t border-[#E7DFD5] flex items-center justify-between">
              <span className="text-xs text-[#6B6360]">Ready for submission under Land Revenue Code</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-[#E7DFD5] text-xs font-semibold text-[#23201F] hover:bg-gray-100"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowDeedModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#C85A32] text-xs font-semibold text-white hover:bg-[#A94424]"
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
