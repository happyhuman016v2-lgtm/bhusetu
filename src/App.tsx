import React, { useState, useEffect } from 'react';
import {
  Parcel,
  Role,
  PartitionResult,
  OfficerAuditEntry,
  SvamitvaParcel,
  EncroachmentAnalysisResult,
} from './types';
import { INITIAL_PARCELS } from './data/seedParcels';
import { SVAMITVA_VILLAGE_PARCELS } from './data/svamitvaVillageData';
import {
  fetchSvamitvaParcels,
  runEncroachmentAnalysis,
} from './services/svamitvaService';
import { analyzeParcelSpatialIntegrity } from './services/gisEngine';
import { Navbar } from './components/Navbar';
import { MapEngine } from './components/MapEngine';
import { CitizenPortal } from './components/CitizenPortal';
import { OfficerPortal } from './components/OfficerPortal';
import { SvamitvaPortal } from './components/SvamitvaPortal';
import { MockRegistryModal } from './components/MockRegistryModal';

export const App: React.FC = () => {
  // Dataset Mode: TRACGIS Cadastre vs SVAMITVA Drone Survey
  const [datasetMode, setDatasetMode] = useState<'tracgis' | 'svamitva'>('tracgis');

  // TRACGIS Parcels State
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    return INITIAL_PARCELS.map((p) => {
      const analysis = analyzeParcelSpatialIntegrity(p);
      return {
        ...p,
        trustScore: analysis.trustScore,
        trustGrade: analysis.trustGrade,
        status: analysis.status,
        violations: analysis.detectedViolations,
      };
    });
  });

  const [selectedParcelId, setSelectedParcelId] = useState<string>('parcel-1');
  const [selectionEpoch, setSelectionEpoch] = useState<number>(Date.now());
  const [activeRole, setActiveRole] = useState<Role>('citizen');
  const [activePartition, setActivePartition] = useState<PartitionResult | undefined>();
  const [pendingPartitions, setPendingPartitions] = useState<PartitionResult[]>([]);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // SVAMITVA Rural Drone Cadastre State
  const [svamitvaParcels, setSvamitvaParcels] = useState<SvamitvaParcel[]>(SVAMITVA_VILLAGE_PARCELS);
  const [selectedSvamitvaParcelId, setSelectedSvamitvaParcelId] = useState<string>('svamitva-101');
  const [bufferDistance, setBufferDistance] = useState<number>(3.0);
  const [encroachmentResults, setEncroachmentResults] = useState<EncroachmentAnalysisResult | null>(null);
  const [isAnalyzingEncroachments, setIsAnalyzingEncroachments] = useState<boolean>(false);

  // Initial audit log entries
  const [auditLogs, setAuditLogs] = useState<OfficerAuditEntry[]>([
    {
      id: 'log-1',
      timestamp: '08-Oct-2026 14:15:22 IST',
      officerName: 'Thiru M. Shanmugavel, M.A.',
      designation: 'Sub-Registrar (Grade-I) Sulur',
      action: 'TRUST_SCORE_VERIFIED',
      parcelId: 'parcel-kpr-01',
      surveyNumber: 'TN-CBE-KPR-102/4',
      details: 'Satellite boundary survey audited. RoR title matches WGS84 geodesic geometry (Trust Score 96/100).',
      hash: 'a9f4c3b281d76e4c890251fb328d48e24c6e91f098d752ba1398c2578e9140b3',
    },
    {
      id: 'log-2',
      timestamp: '08-Oct-2026 15:42:09 IST',
      officerName: 'Smt. V. Anitha, I.A.S.',
      designation: 'Revenue Divisional Officer Serilingampally',
      action: 'DISCREPANCY_REINSPECT_FLAGGED',
      parcelId: 'parcel-hyd-02',
      surveyNumber: 'TS-HYD-DUR-88/2',
      details: 'Critical buffer encroachment detected: 682 m² intrusion into Durgam Cheruvu FTL line flagged for enforcement.',
      hash: '8f71c99321ba409de817f52319c5b630e284a1795c4781dfa013476982bc9831',
    },
  ]);

  // Load live SVAMITVA parcels & initial encroachment analysis from FastAPI backend
  useEffect(() => {
    async function initSvamitva() {
      try {
        const result = await fetchSvamitvaParcels();
        if (result && result.features && result.features.length > 0) {
          setSvamitvaParcels(result.features);
        }
      } catch (e) {
        console.warn('Initial SVAMITVA fetch error:', e);
      }
      handleRunEncroachments(bufferDistance);
    }
    initSvamitva();
  }, []);

  // Recalculate encroachments when buffer distance changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRunEncroachments(bufferDistance);
    }, 300);
    return () => clearTimeout(timer);
  }, [bufferDistance]);

  const handleRunEncroachments = async (dist: number) => {
    setIsAnalyzingEncroachments(true);
    try {
      const results = await runEncroachmentAnalysis(dist);
      if (results) {
        setEncroachmentResults(results);
      }
    } catch (e) {
      console.warn('Encroachment analysis error:', e);
    } finally {
      setIsAnalyzingEncroachments(false);
    }
  };

  const handleReloadSvamitva = async () => {
    try {
      const result = await fetchSvamitvaParcels();
      if (result && result.features) {
        setSvamitvaParcels(result.features);
        if (result.features.length > 0) {
          setSelectedSvamitvaParcelId(result.features[0].id || result.features[0].properties?.property_id);
        }
      }
      handleRunEncroachments(bufferDistance);
    } catch (e) {
      console.warn('Reload error:', e);
    }
  };

  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
  const selectedSvamitvaParcel =
    svamitvaParcels.find((p) => p.id === selectedSvamitvaParcelId || p.properties?.property_id === selectedSvamitvaParcelId) ||
    svamitvaParcels[0];

  const handleSelectParcel = (id: string) => {
    setSelectedParcelId(id);
    setSelectionEpoch(Date.now());
    if (activePartition && activePartition.parcelId !== id) {
      setActivePartition(undefined);
    }
  };

  const handleSelectSvamitvaParcel = (id: string) => {
    setSelectedSvamitvaParcelId(id);
  };

  const handleSubmitPartitionToOfficer = (partition: PartitionResult) => {
    setPendingPartitions((prev) => {
      if (prev.some((item) => item.id === partition.id)) return prev;
      return [partition, ...prev];
    });
  };

  const handleApprovePartition = (partition: PartitionResult) => {
    setPendingPartitions((prev) => prev.filter((item) => item.id !== partition.id));
    setActivePartition(partition);
  };

  const handleAddAuditLog = (entry: Omit<OfficerAuditEntry, 'id' | 'timestamp' | 'hash'>) => {
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += Math.floor(Math.random() * 16).toString(16);
    }

    const newLog: OfficerAuditEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      ...entry,
      hash,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleIngestParcels = (newParcels: Parcel[]) => {
    setParcels(newParcels);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#23201F] flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onOpenRegistryModal={() => setIsRegistryModalOpen(true)}
        totalParcelsCount={parcels.length}
        datasetMode={datasetMode}
        onDatasetModeChange={setDatasetMode}
      />

      {/* Main Content: 2-Column Split View with Expandable Map */}
      <main className="flex-1 w-full max-w-[1850px] mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Hidden when Map is Expanded) */}
        {!isMapExpanded && (
          <div className="lg:col-span-4 xl:col-span-3.5 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
            {datasetMode === 'svamitva' ? (
              <SvamitvaPortal
                parcels={svamitvaParcels}
                selectedParcel={selectedSvamitvaParcel}
                onSelectParcel={handleSelectSvamitvaParcel}
                bufferDistance={bufferDistance}
                onBufferDistanceChange={setBufferDistance}
                encroachmentResults={encroachmentResults}
                isAnalyzing={isAnalyzingEncroachments}
                onRunAnalysis={() => handleRunEncroachments(bufferDistance)}
                onParcelsUpdated={handleReloadSvamitva}
              />
            ) : activeRole === 'citizen' ? (
              <CitizenPortal
                parcels={parcels}
                selectedParcel={selectedParcel}
                onSelectParcel={handleSelectParcel}
                activePartition={activePartition}
                onPartitionChange={setActivePartition}
                onSubmitToOfficer={handleSubmitPartitionToOfficer}
              />
            ) : (
              <OfficerPortal
                parcels={parcels}
                selectedParcel={selectedParcel}
                onSelectParcel={handleSelectParcel}
                pendingPartitions={pendingPartitions}
                onApprovePartition={handleApprovePartition}
                auditLogs={auditLogs}
                onAddAuditLog={handleAddAuditLog}
              />
            )}
          </div>
        )}

        {/* Right Column: Interactive Map (Expands to full width when isMapExpanded is true) */}
        <div
          className={`${
            isMapExpanded ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-8.5'
          } h-[600px] lg:h-[calc(100vh-100px)] sticky top-18`}
        >
          <MapEngine
            datasetMode={datasetMode}
            parcels={parcels}
            selectedParcelId={selectedParcelId}
            selectionEpoch={selectionEpoch}
            onSelectParcel={handleSelectParcel}
            activePartition={activePartition}
            svamitvaParcels={svamitvaParcels}
            selectedSvamitvaParcelId={selectedSvamitvaParcelId}
            onSelectSvamitvaParcel={handleSelectSvamitvaParcel}
            bufferDistance={bufferDistance}
            onBufferDistanceChange={setBufferDistance}
            encroachmentResults={encroachmentResults}
            isMapExpanded={isMapExpanded}
            onToggleExpandMap={() => setIsMapExpanded(!isMapExpanded)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#23201F] text-[#E7DFD5] text-xs py-3 px-4 border-t border-[#383432]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-bold text-white">BhuSetu v2.0</span> • Bharat Unified Land Stack • SVAMITVA Rural Drone Cadastre Pipeline
          </div>
          <div className="text-[11px] text-[#A89F91]">
            Survey of India (SoI) • Ministry of Panchayati Raj • Large-Scale Rural UAV Mapping
          </div>
        </div>
      </footer>

      {/* Mock Registry Modal */}
      <MockRegistryModal
        isOpen={isRegistryModalOpen}
        onClose={() => setIsRegistryModalOpen(false)}
        onIngestParcels={handleIngestParcels}
      />
    </div>
  );
};

export default App;
