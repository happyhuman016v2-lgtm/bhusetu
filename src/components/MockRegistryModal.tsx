import React, { useState } from 'react';
import { Database, FileSpreadsheet, CheckCircle2, Upload, AlertCircle, X } from 'lucide-react';
import { Parcel } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onIngestParcels: (newParcels: Parcel[]) => void;
}

export const MockRegistryModal: React.FC<Props> = ({ isOpen, onClose, onIngestParcels }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const sampleCSV = `surveyNumber,ulpin,village,taluk,district,state,ownerName,rorSqm,landUse,taxStatus
TN-CBE-KPR-108/1,33-2026-9921-5011,Arasur,Sulur,Coimbatore,Tamil Nadu,Ramaswamy Gounder,2150,Agricultural,Paid
TS-HYD-MAD-52/1,36-2026-3310-7742,Madhapur,Serilingampally,Hyderabad,Telangana,A. K. Enterprises,3100,Commercial,Paid`;

  const handleLoadSample = () => {
    setJsonInput(sampleCSV);
    setErrorMsg('');
    setSuccessMsg('Sample National RoR CSV loaded into ingestion buffer.');
  };

  const handleSimulateSync = () => {
    try {
      setSuccessMsg('Registry Ingestion Engine: 6 Authoritative State Cadastral Records synchronized with Central Bhu-Aadhaar stack.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-[#E7DFD5]">
        <div className="bg-[#23201F] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#C85A32]" />
            <div>
              <h3 className="font-bold text-sm">State Land Registry (RoR) Mock Ingestion Engine</h3>
              <p className="text-[10px] text-gray-300">
                Simulates Dharani, Bhoomi, AnyROR & Tamil Nilam Record of Rights synchronization
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg px-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-1.5">
            <p className="font-semibold text-[#23201F]">Standard Indian Record of Rights (RoR) Schema</p>
            <p className="text-[#6B6360] leading-relaxed">
              Because state revenue databases are gated/closed under government networks, BhuSetu features an automated
              ingestion engine that normalizes cadastral deeds, Jamabandi registers, and TRACGIS / Bhunaksha records
              into the canonical ULPIN standard.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#23201F]">Structured RoR Ingestion Buffer (CSV or JSON)</label>
              <button
                onClick={handleLoadSample}
                className="text-[11px] text-[#C85A32] hover:underline font-semibold flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Load Sample CSV</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste structured RoR entries or CSV format here..."
              className="w-full font-mono text-[11px] p-2.5 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-2 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-2 rounded-lg flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#FAF7F2] border-t border-[#E7DFD5] flex items-center justify-between">
          <span className="text-[11px] text-[#6B6360]">Compliant with DoLR ULPIN Specification</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#E7DFD5] text-xs font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSimulateSync}
              className="px-4 py-1.5 rounded-lg bg-[#C85A32] text-white text-xs font-bold hover:bg-[#A94424] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Execute Ingestion Sync</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
