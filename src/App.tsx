import React, { useState } from 'react';
import { Parcel, Role, PartitionResult, OfficerAuditEntry } from './types';
import { INITIAL_PARCELS } from './data/seedParcels';
import { analyzeParcelSpatialIntegrity } from './services/gisEngine';
import { Navbar } from './components/Navbar';
import { MapEngine } from './components/MapEngine';
import { CitizenPortal } from './components/CitizenPortal';
import { OfficerPortal } from './components/OfficerPortal';
import { MockRegistryModal } from './components/MockRegistryModal';

export const App: React.FC = () => {
  // Initialize parcels with spatial integrity analysis
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
  const [activeRole, setActiveRole] = useState<Role>('citizen');
  const [activePartition, setActivePartition] = useState<PartitionResult | undefined>();
  const [pendingPartitions, setPendingPartitions] = useState<PartitionResult[]>([]);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);

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

  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];

  const handleSelectParcel = (id: string) => {
    setSelectedParcelId(id);
    // Reset partition if switching to a parcel with different boundaries
    if (activePartition && activePartition.parcelId !== id) {
      setActivePartition(undefined);
    }
  };

  const handleSubmitPartitionToOfficer = (partition: PartitionResult) => {
    setPendingPartitions((prev) => {
      // Avoid duplicate
      if (prev.some((item) => item.id === partition.id)) return prev;
      return [partition, ...prev];
    });
  };

  const handleApprovePartition = (partition: PartitionResult) => {
    setPendingPartitions((prev) => prev.filter((item) => item.id !== partition.id));
    setActivePartition(partition);
  };

  const handleAddAuditLog = (entry: Omit<OfficerAuditEntry, 'id' | 'timestamp' | 'hash'>) => {
    const rawString = `${entry.action}_${entry.parcelId}_${Date.now()}`;
    // Simple fast hex hash for client demo
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
      />

      {/* Main Content: 2-Column Split View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Citizen or Officer Portal */}
        <div className="lg:col-span-5 xl:col-span-5 overflow-y-auto max-h-[calc(100vh-120px)] pr-1">
          {activeRole === 'citizen' ? (
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

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-7 xl:col-span-7 h-[550px] lg:h-[calc(100vh-120px)] sticky top-20">
          <MapEngine
            parcels={parcels}
            selectedParcelId={selectedParcelId}
            onSelectParcel={handleSelectParcel}
            activePartition={activePartition}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#23201F] text-[#E7DFD5] text-xs py-3 px-4 border-t border-[#383432]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-bold text-white">BhuSetu v2.0</span> • Bharat Unified Land Stack • HackITon '26
            Prototype
          </div>
          <div className="text-[11px] text-[#A89F91]">
            KPR Institute of Engineering and Technology • Department of Land Resources (DoLR) Reference
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
