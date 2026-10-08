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
  fetchSurveySourceState,
  uploadSurveyGeoJSON,
  testWFSConnection,
  loadDemoSurvey,
  clearSurveySource,
  fetchRoadSourceState,
  uploadRoadGeoJSON,
  loadDemoRoad,
  clearRoadSource,
  SurveySourceMetadata,
  SurveyUploadResponse,
} from '../services/svamitvaService';
import { RoadSourceMetadata } from '../types';
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
  Upload,
  Database,
  Globe,
  RefreshCw,
  AlertCircle,
  FileCheck,
  Trash2,
  Lock,
  Layers,
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
  onParcelsUpdated?: () => void;
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
  onParcelsUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [landTypeFilter, setLandTypeFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'source' | 'parcels' | 'ror' | 'disputes' | 'card'>('source');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<EncroachmentConflict | null>(null);

  // Survey Source & Ingestion State
  const [sourceMeta, setSourceMeta] = useState<SurveySourceMetadata | null>(null);
  const [surveyFile, setSurveyFile] = useState<File | null>(null);
  const [supplierInput, setSupplierInput] = useState<string>('');
  const [surveyDateInput, setSurveyDateInput] = useState<string>('2026-10-08');
  const [accuracyInput, setAccuracyInput] = useState<string>('Sub-5cm Drone Photogrammetry');
  const [isUploadingSurvey, setIsUploadingSurvey] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<SurveyUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // WFS State
  const [wfsUrl, setWfsUrl] = useState<string>('https://svamitva.nic.in/geoserver/wfs');
  const [wfsLayer, setWfsLayer] = useState<string>('svamitva:cadastral_drone_parcels');
  const [isTestingWFS, setIsTestingWFS] = useState<boolean>(false);
  const [wfsTestResult, setWfsTestResult] = useState<any | null>(null);

  // RoR state
  const [dossier, setDossier] = useState<RoRDossier | null>(null);
  const [loadingRoR, setLoadingRoR] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [copiedULPIN, setCopiedULPIN] = useState<boolean>(false);

  // Road Source State
  const [roadMeta, setRoadMeta] = useState<RoadSourceMetadata | null>(null);
  const [roadFile, setRoadFile] = useState<File | null>(null);
  const [roadSupplierInput, setRoadSupplierInput] = useState<string>('');
  const [roadNameInput, setRoadNameInput] = useState<string>('');
  const [isUploadingRoad, setIsUploadingRoad] = useState<boolean>(false);
  const [uploadRoadResult, setUploadRoadResult] = useState<any | null>(null);
  const [uploadRoadError, setUploadRoadError] = useState<string | null>(null);

  // Load Source Metadata on mount
  const loadSourceState = async () => {
    try {
      const res = await fetchSurveySourceState();
      if (res?.metadata) setSourceMeta(res.metadata);
    } catch (e) {
      console.warn('Failed to fetch survey source state:', e);
    }
  };

  const loadRoadState = async () => {
    try {
      const res = await fetchRoadSourceState();
      if (res?.metadata) setRoadMeta(res.metadata);
    } catch (e) {
      console.warn('Failed to fetch road source state:', e);
    }
  };

  useEffect(() => {
    loadSourceState();
    loadRoadState();
  }, []);

  const handleRoadFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadFile) {
      setUploadRoadError('Please select a Road GeoJSON file.');
      return;
    }
    setIsUploadingRoad(true);
    setUploadRoadError(null);
    setUploadRoadResult(null);

    try {
      const result = await uploadRoadGeoJSON(
        roadFile,
        roadSupplierInput || 'Road Authority / Field Survey',
        roadNameInput || undefined
      );
      setUploadRoadResult(result);
      await loadRoadState();
      if (onParcelsUpdated) {
        onParcelsUpdated();
      }
    } catch (err: any) {
      setUploadRoadError(err.message || 'Road GeoJSON upload failed.');
    } finally {
      setIsUploadingRoad(false);
    }
  };

  const handleLoadDemoRoad = async () => {
    try {
      await loadDemoRoad();
      await loadRoadState();
      if (onParcelsUpdated) onParcelsUpdated();
    } catch (err: any) {
      alert(`Failed to load demo road: ${err.message}`);
    }
  };

  const handleClearRoad = async () => {
    try {
      await clearRoadSource();
      await loadRoadState();
      if (onParcelsUpdated) onParcelsUpdated();
    } catch (err: any) {
      alert(`Failed to clear road source: ${err.message}`);
    }
  };


  // Handlers for Survey Ingestion
  const handleSurveyFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyFile) {
      setUploadError('Please select a GeoJSON survey file.');
      return;
    }
    setIsUploadingSurvey(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const result = await uploadSurveyGeoJSON(
        surveyFile,
        supplierInput || 'Field Survey Team',
        surveyDateInput || 'Unknown',
        accuracyInput
      );
      setUploadResult(result);
      await loadSourceState();
      if (onParcelsUpdated) {
        onParcelsUpdated();
      }
    } catch (err: any) {
      setUploadError(err.message || 'GeoJSON upload failed.');
    } finally {
      setIsUploadingSurvey(false);
    }
  };

  const handleTestWFS = async () => {
    setIsTestingWFS(true);
    setWfsTestResult(null);
    try {
      const res = await testWFSConnection(wfsUrl, wfsLayer);
      setWfsTestResult(res);
    } catch (err: any) {
      setWfsTestResult({
        status: 'CONNECTION_FAILED',
        connected: false,
        message: err.message || 'WFS test failed.'
      });
    } finally {
      setIsTestingWFS(false);
    }
  };

  const handleLoadDemoDataset = async () => {
    try {
      await loadDemoSurvey();
      await loadSourceState();
      if (onParcelsUpdated) {
        onParcelsUpdated();
      }
    } catch (err: any) {
      alert(`Failed to load demo: ${err.message}`);
    }
  };

  const handleClearSurveyDataset = async () => {
    try {
      await clearSurveySource();
      await loadSourceState();
      if (onParcelsUpdated) {
        onParcelsUpdated();
      }
    } catch (err: any) {
      alert(`Failed to clear survey: ${err.message}`);
    }
  };

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
            <div className="flex items-center gap-2 flex-wrap">
              {sourceMeta?.state === 'CONFIGURED_WFS' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Globe className="w-3 h-3" />
                  <span>DATA SOURCE: CONFIGURED GIS / WFS</span>
                </span>
              )}
              {sourceMeta?.state === 'UPLOADED_FILE' && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Upload className="w-3 h-3" />
                  <span>DATA SOURCE: IMPORTED SURVEY FILE</span>
                </span>
              )}
              {sourceMeta?.state === 'SYNTHETIC_DEMO' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Database className="w-3 h-3" />
                  <span>DATA SOURCE: SYNTHETIC DEMONSTRATION</span>
                </span>
              )}
              {(!sourceMeta || sourceMeta.state === 'NO_SOURCE') && (
                <span className="px-2.5 py-0.5 rounded-full bg-gray-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>DATA SOURCE: NO SURVEY DATA</span>
                </span>
              )}
              <span className="text-gray-400 text-xs font-mono">
                LGD: {selectedParcel?.properties?.village_lgd_code || '142890'}
              </span>
            </div>

            {sourceMeta?.state === 'SYNTHETIC_DEMO' ? (
              <>
                <h2 className="text-base font-bold text-[#FBF9F5] mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C85A32]" />
                  Abadi Demonstration Dataset — {parcels.length} Parcels
                </h2>
                <p className="text-[11px] text-amber-300 font-medium mt-0.5">
                  Not official cadastral or government survey data. (Synthetic fixture for engine evaluation)
                </p>
                <p className="text-xs text-gray-400">
                  Tehsil {selectedParcel?.properties?.tehsil || 'Bakshi Ka Talab'}, Dist. {selectedParcel?.properties?.district || 'Lucknow'}, {selectedParcel?.properties?.state || 'Uttar Pradesh'}
                </p>
              </>
            ) : sourceMeta?.state === 'UPLOADED_FILE' ? (
              <>
                <h2 className="text-base font-bold text-[#FBF9F5] mt-1 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  {sourceMeta?.original_filename || 'Uploaded Survey Dataset'} — {parcels.length} Parcels
                </h2>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Supplier: {sourceMeta?.supplier || 'Field Team'} • Date: {sourceMeta?.survey_date || 'Unknown'} • SHA-256: {sourceMeta?.sha256_checksum ? `${sourceMeta.sha256_checksum.slice(0, 12)}...` : 'N/A'}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedParcel?.properties?.village ? `Village ${selectedParcel.properties.village}` : 'Village: UNKNOWN'} • {selectedParcel?.properties?.tehsil || 'Tehsil UNKNOWN'}, {selectedParcel?.properties?.district || 'District UNKNOWN'}
                </p>
              </>
            ) : sourceMeta?.state === 'CONFIGURED_WFS' ? (
              <>
                <h2 className="text-base font-bold text-[#FBF9F5] mt-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  {sourceMeta?.source_type || 'WFS Cadastral Layer'} — {parcels.length} Parcels
                </h2>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  Connected to OGC WFS Service: {sourceMeta?.original_filename || 'Remote WFS'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-base font-bold text-[#FBF9F5] mt-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  No Survey Data Loaded
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Upload survey geometry in the 'Source & Ingest' tab to begin cadastral analysis.
                </p>
              </>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-gray-400 block">Resolution</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {sourceMeta?.accuracy_metadata || 'GSD < 5cm UAV'}
            </span>
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
              {bufferDistance.toFixed(1)} Metres (UTM EPSG:{selectedParcel?.properties?.calculated_utm_epsg || '32644'})
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
          onClick={() => setActiveTab('source')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'source'
              ? 'bg-[#23201F] text-white shadow-xs'
              : 'hover:bg-white/40 text-blue-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>Source &amp; Ingest</span>
        </button>

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

      {/* TAB 0: SURVEY SOURCE & INGESTION ENGINE */}
      {activeTab === 'source' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Active Source Provenance Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Active Survey Provenance &amp; State
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700">
                {sourceMeta?.state || 'NO_SOURCE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
              <div>
                <span className="text-gray-400 block text-[10px]">Source Type:</span>
                <span className="font-bold text-[#23201F]">{sourceMeta?.source_type || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Dataset ID:</span>
                <span className="font-mono font-bold text-purple-700">{sourceMeta?.dataset_id || 'none'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Original File / Layer:</span>
                <span className="font-medium text-gray-700 truncate block" title={sourceMeta?.original_filename}>
                  {sourceMeta?.original_filename || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Source CRS:</span>
                <span className="font-mono text-gray-700">{sourceMeta?.source_crs || 'EPSG:4326'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Survey Date / Supplier:</span>
                <span className="text-gray-700">{sourceMeta?.survey_date} • {sourceMeta?.supplier}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">SHA-256 Checksum:</span>
                <span className="font-mono text-[9px] text-gray-600 truncate block" title={sourceMeta?.sha256_checksum || 'N/A'}>
                  {sourceMeta?.sha256_checksum ? `${sourceMeta.sha256_checksum.slice(0, 16)}...` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Disclaimer Notice */}
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[10px] text-amber-900 leading-relaxed">
              <strong>Notice: </strong>
              {sourceMeta?.disclaimer || 'No survey source configured. Upload a GeoJSON file or test WFS connector.'}
            </div>
          </div>

          {/* Upload GeoJSON FeatureCollection Form */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-bold text-xs text-[#23201F]">
                Ingest Cadastral Survey File (GeoJSON FeatureCollection)
              </h3>
            </div>
            <p className="text-[11px] text-[#6B6360]">
              Validates Polygon and MultiPolygon geometry, interior rings (holes), coordinate finiteness, and duplicate source parcel IDs without silent alterations.
            </p>

            <form onSubmit={handleSurveyFileUpload} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  GeoJSON Survey File (.geojson / .json)
                </label>
                <input
                  type="file"
                  accept=".geojson,.json,application/geo+json,application/json"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSurveyFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C85A32] file:text-white hover:file:bg-[#a64420] file:cursor-pointer cursor-pointer border border-[#E7DFD5] p-1.5 rounded-xl bg-[#FAF7F2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Supplier / Agency</label>
                  <input
                    type="text"
                    value={supplierInput}
                    onChange={(e) => setSupplierInput(e.target.value)}
                    placeholder="e.g. Survey of India / Drone Vendor"
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Survey Date</label>
                  <input
                    type="date"
                    value={surveyDateInput}
                    onChange={(e) => setSurveyDateInput(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploadingSurvey || !surveyFile}
                className="w-full py-2.5 px-4 rounded-xl bg-[#C85A32] text-white font-bold hover:bg-[#a64420] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 text-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isUploadingSurvey ? 'Validating Geometry & Ingesting...' : 'Validate & Ingest Survey File'}</span>
              </button>
            </form>

            {uploadError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadResult && (
              <div className="bg-emerald-50 text-emerald-900 p-3.5 rounded-xl border border-emerald-300 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{uploadResult.status}</span>
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    {uploadResult.imported_count} Parcels Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-white/70 p-2 rounded-lg border border-emerald-200">
                  <div>
                    <span className="text-gray-500 block">SHA-256:</span>
                    <span className="truncate block font-bold">{uploadResult.sha256_checksum.slice(0, 16)}...</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Rejected Features:</span>
                    <span className="font-bold text-red-700">{uploadResult.rejected_count}</span>
                  </div>
                </div>

                {uploadResult.rejected_count > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-[11px] text-red-800">Rejected Feature Explanations:</span>
                    <ul className="list-disc pl-4 text-[10px] text-red-700 space-y-0.5">
                      {uploadResult.rejected_features.map((err, i) => (
                        <li key={i}>Index #{err.feature_index}: {err.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* WFS GeoServer Connector Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-xs text-[#23201F]">
                Remote GIS / WFS GeoServer Connector
              </h3>
            </div>
            <p className="text-[11px] text-[#6B6360]">
              Tests OGC WFS 2.0.0 GetCapabilities and DescribeFeatureType. Restricts queries to allowed host whitelist.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">WFS Server URL</label>
                <input
                  type="text"
                  value={wfsUrl}
                  onChange={(e) => setWfsUrl(e.target.value)}
                  placeholder="https://svamitva.nic.in/geoserver/wfs"
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Target Layer Name</label>
                <input
                  type="text"
                  value={wfsLayer}
                  onChange={(e) => setWfsLayer(e.target.value)}
                  placeholder="svamitva:cadastral_drone_parcels"
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleTestWFS}
                disabled={isTestingWFS}
                className="w-full py-2 px-3 rounded-xl bg-[#23201F] text-white font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingWFS ? 'animate-spin' : ''}`} />
                <span>{isTestingWFS ? 'Testing WFS Capabilities...' : 'Test WFS Connection & Capabilities'}</span>
              </button>
            </div>

            {wfsTestResult && (
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                wfsTestResult.connected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Status: {wfsTestResult.status}</span>
                  <span className="text-[10px] font-mono">{wfsTestResult.connected ? '✓ VERIFIED' : 'UNAVAILABLE'}</span>
                </div>
                <p className="text-[11px]">{wfsTestResult.message}</p>
                {wfsTestResult.configuration_guide && (
                  <div className="bg-white/80 p-2 rounded-lg border border-black/10 font-mono text-[10px] space-y-1 mt-1">
                    <span className="font-bold text-gray-700 block">Required Server Configuration Keys:</span>
                    <ul className="list-disc pl-4 text-gray-600">
                      {wfsTestResult.configuration_guide.required_keys.map((k: string, i: number) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ROAD SOURCE INGESTION & MANAGEMENT CARD */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#23201F] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-slate-700" />
                Active Road &amp; Corridor Source State
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                roadMeta?.state === 'IMPORTED_ROAD' || roadMeta?.state === 'PUBLIC_VECTOR_ROAD'
                  ? 'bg-emerald-100 text-emerald-800'
                  : roadMeta?.state === 'SYNTHETIC_DEMO_ROAD'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {roadMeta?.state || 'SYNTHETIC_DEMO_ROAD'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5]">
              <div>
                <span className="text-gray-400 block text-[10px]">Road Source Type:</span>
                <span className="font-bold text-[#23201F]">{roadMeta?.source_name || 'Demo Road Geometry'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Geometry Interpretation:</span>
                <span className="font-mono font-bold text-blue-700">
                  {roadMeta?.geometry_interpretation === 'CENTERLINE'
                    ? 'CENTERLINE (Buffer from centreline)'
                    : 'ROAD BOUNDARY (Corridor polygon)'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Supplier / Origin:</span>
                <span className="text-gray-700 truncate block">
                  {roadMeta?.supplier || 'Synthetic Demonstration'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Features Count:</span>
                <span className="font-mono font-bold text-gray-800">{roadMeta?.total_features ?? 1} Features</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[10px] text-slate-700">
              <strong>Road Provenance: </strong>
              {roadMeta?.disclaimer || 'SOURCE: SYNTHETIC DEMONSTRATION — Demo Road Geometry.'}
            </div>

            {/* Ingest Road GeoJSON Form */}
            <form onSubmit={handleRoadFileUpload} className="space-y-2.5 text-xs pt-1 border-t border-gray-100">
              <span className="font-bold text-[11px] text-gray-700 block">
                Ingest Road / Corridor GeoJSON (LineString / Polygon)
              </span>
              <div>
                <input
                  type="file"
                  accept=".geojson,.json"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setRoadFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-white hover:file:bg-slate-800 file:cursor-pointer cursor-pointer border border-[#E7DFD5] p-1.5 rounded-xl bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Road Name (Optional)</label>
                  <input
                    type="text"
                    value={roadNameInput}
                    onChange={(e) => setRoadNameInput(e.target.value)}
                    placeholder="e.g. Rampur Main Arterial Track"
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Supplier / Agency</label>
                  <input
                    type="text"
                    value={roadSupplierInput}
                    onChange={(e) => setRoadSupplierInput(e.target.value)}
                    placeholder="e.g. OpenStreetMap / PWD"
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isUploadingRoad || !roadFile}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 text-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingRoad ? 'Validating & Ingesting...' : 'Ingest Road GeoJSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoRoad}
                  className="py-2 px-3 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-800 border border-gray-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                  title="Restore demo road geometry"
                >
                  <RefreshCw className="w-3 h-3 text-amber-600" />
                  <span>Demo Road</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearRoad}
                  className="py-2 px-2.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-300 rounded-xl text-xs transition-colors"
                  title="Clear road source"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </form>

            {uploadRoadError && (
              <div className="bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{uploadRoadError}</span>
              </div>
            )}

            {uploadRoadResult && (
              <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-300 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>✓ Road Vector Ingested</span>
                  <span className="font-mono text-[10px] bg-emerald-200 px-2 py-0.5 rounded-full">
                    {uploadRoadResult.geometry_interpretation}
                  </span>
                </div>
                <p className="text-[11px]">{uploadRoadResult.features_imported} road feature(s) active for metric corridor review.</p>
              </div>
            )}
          </div>

          {/* Demo & Reset Controls */}
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E7DFD5] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleLoadDemoDataset}
              className="flex-1 py-2 px-3 bg-white hover:bg-gray-50 border border-[#E7DFD5] text-[#23201F] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Labelled Synthetic Demo</span>
            </button>
            <button
              type="button"
              onClick={handleClearSurveyDataset}
              className="py-2 px-3 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
              title="Clear survey parcels to test NO_SOURCE state"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Clear Source</span>
            </button>
          </div>
        </div>
      )}

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

          {/* SELECTED PARCEL & ANALYSIS SUMMARY CARD */}
          {selectedParcel && (
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-[#E7DFD5]">
                <span className="font-bold text-[#23201F] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Selected Parcel Inspection</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#E7DFD5] text-[#C85A32]">
                  Plot {selectedParcel.properties.survey_plot_no}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {/* PARCEL Column */}
                <div className="space-y-1 bg-white p-2.5 rounded-lg border border-[#E7DFD5]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    PARCEL
                  </span>
                  <div>
                    <span className="text-gray-500">ID: </span>
                    <span className="font-mono font-bold text-gray-800">
                      {selectedParcel.properties.survey_plot_no || selectedParcel.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Source: </span>
                    <span className="font-medium text-gray-800">
                      {sourceMeta?.source_type || (sourceMeta?.state === 'SYNTHETIC_DEMO' ? 'Synthetic Demo' : 'Imported GeoJSON')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Area: </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {selectedParcel.properties.area_sq_mtr} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Survey date: </span>
                    <span className="text-gray-700">
                      {selectedParcel.properties.survey_date || sourceMeta?.survey_date || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Dataset: </span>
                    <span className="font-mono text-purple-700 text-[10px]">
                      {sourceMeta?.dataset_id || 'ds-active'}
                    </span>
                  </div>
                </div>

                {/* ANALYSIS Column */}
                <div className="space-y-1 bg-white p-2.5 rounded-lg border border-[#E7DFD5]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    ANALYSIS
                  </span>
                  <div>
                    <span className="text-gray-500">Registered area: </span>
                    <span className="font-semibold text-gray-800">
                      {dossier?.legal_registry.recorded_legal_area_sqm != null
                        ? `${dossier.legal_registry.recorded_legal_area_sqm} m²`
                        : 'Verification required'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Survey area: </span>
                    <span className="font-mono font-bold text-gray-800">
                      {dossier?.spatial.actual_survey_area_sqm ?? selectedParcel.properties.area_sq_mtr} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Difference: </span>
                    <span className="font-mono font-bold">
                      {dossier?.variance_analysis.absolute_discrepancy_pct != null
                        ? `${dossier.variance_analysis.absolute_discrepancy_pct.toFixed(2)}% (${dossier.variance_analysis.signed_area_change_sqm != null && dossier.variance_analysis.signed_area_change_sqm > 0 ? '+' : ''}${dossier.variance_analysis.signed_area_change_sqm ?? ''} m²)`
                        : 'Verification required'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold text-slate-600 mt-1">ROAD / CORRIDOR ANALYSIS</span>
                    {(() => {
                      const conflict = conflicts.find(
                        (c) => c.properties.encroaching_parcel_id === selectedParcel.id || c.properties.survey_plot_no === selectedParcel.properties.survey_plot_no
                      );
                      const roadSourceName = roadMeta?.source_name || (roadMeta?.state === 'SYNTHETIC_DEMO_ROAD' ? 'Demo Road Geometry' : 'Vector Road');
                      if (conflict) {
                        return (
                          <div className="space-y-0.5 mt-0.5 bg-red-50/70 p-1.5 rounded border border-red-200 text-[10px]">
                            <div><span className="text-gray-500">Road Source: </span><span className="font-bold text-gray-800">{roadSourceName}</span></div>
                            <div><span className="text-gray-500">Buffer: </span><span className="font-mono font-bold text-amber-700">{bufferDistance.toFixed(1)} m ({conflict.properties.geometry_interpretation || 'CENTERLINE'})</span></div>
                            <div><span className="text-gray-500">Intersection: </span><span className="font-mono font-bold text-red-700">{conflict.properties.overlap_area_sqm} m²</span></div>
                            <div><span className="text-gray-500">Affected: </span><span className="font-mono font-bold text-red-700">{conflict.properties.affected_pct ?? ((conflict.properties.overlap_area_sqm / (selectedParcel.properties.area_sq_mtr || 1)) * 100).toFixed(1)}%</span></div>
                            <div className="text-red-800 font-bold mt-0.5">Status: Potential overlap — verification required</div>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-0.5 mt-0.5 bg-emerald-50/50 p-1.5 rounded border border-emerald-200 text-[10px]">
                          <div><span className="text-gray-500">Road Source: </span><span className="font-semibold text-gray-700">{roadSourceName}</span></div>
                          <div><span className="text-gray-500">Buffer: </span><span className="font-mono text-gray-700">{bufferDistance.toFixed(1)} m</span></div>
                          <div className="text-emerald-700 font-bold">Status: No corridor overlap detected (0 m²)</div>
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <span className="text-gray-500">Review status: </span>
                    <span className={`font-bold ${
                      dossier?.variance_analysis.exceeds_threshold || conflicts.some((c) => c.properties.encroaching_parcel_id === selectedParcel.id)
                        ? 'text-red-700'
                        : dossier?.legal_registry.recorded_legal_area_sqm == null
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}>
                      {dossier?.variance_analysis.exceeds_threshold || conflicts.some((c) => c.properties.encroaching_parcel_id === selectedParcel.id)
                        ? 'Flagged for Officer Review'
                        : dossier?.legal_registry.recorded_legal_area_sqm == null
                        ? 'Verification required'
                        : 'Tolerance Acceptable (<= 5.0%)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  {dossier.legal_registry.recorded_legal_area_sqm == null || dossier.legal_registry.recorded_legal_area_sqm === 0 ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-gray-100 text-gray-700 border border-gray-300">
                      Registered Area Unavailable
                    </span>
                  ) : (dossier.variance_analysis.exceeds_threshold ?? ((dossier.variance_analysis.absolute_discrepancy_pct ?? 0) > 5.0)) ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                      Discrepancy &gt; 5.0% (Officer Review)
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Tolerance Acceptable (&le; 5.0%)
                    </span>
                  )}
                </div>

                {/* Prominent Comparison Badge */}
                <div
                  className={`p-2.5 rounded-xl text-xs space-y-1.5 ${
                    dossier.legal_registry.recorded_legal_area_sqm == null || dossier.legal_registry.recorded_legal_area_sqm === 0
                      ? 'bg-gray-50 text-gray-800 border border-gray-200'
                      : (dossier.variance_analysis.exceeds_threshold ?? ((dossier.variance_analysis.absolute_discrepancy_pct ?? 0) > 5.0))
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>
                      Survey Area: <strong>{dossier.spatial.actual_survey_area_sqm ?? dossier.spatial.actual_drone_area_sqm} m²</strong>
                    </span>
                    <span>
                      Registered Deed:{' '}
                      <strong>
                        {dossier.legal_registry.recorded_legal_area_sqm != null
                          ? `${dossier.legal_registry.recorded_legal_area_sqm} m²`
                          : 'Not Documented'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-black/10 text-xs">
                    <span>Absolute Discrepancy:</span>
                    <span className="font-mono font-bold">
                      {dossier.variance_analysis.absolute_discrepancy_pct != null
                        ? `${dossier.variance_analysis.absolute_discrepancy_pct.toFixed(3)}%`
                        : 'N/A (Missing Registered Area)'}
                    </span>
                  </div>

                  {dossier.variance_analysis.signed_area_change_sqm != null && (
                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                      <span>Signed Area Change:</span>
                      <span className="font-mono font-medium">
                        {dossier.variance_analysis.signed_area_change_sqm > 0 ? '+' : ''}
                        {dossier.variance_analysis.signed_area_change_sqm.toFixed(2)} m²
                      </span>
                    </div>
                  )}
                </div>

                {/* Match Status & Provenance */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#FAF7F2] p-2 rounded-xl border border-[#E7DFD5]">
                  <div>
                    <span className="text-gray-500 block">Revenue Match Status:</span>
                    <span className="font-bold text-gray-800">
                      {dossier.legal_registry.match_status || 'PROTOTYPE_DEMO_MATCH'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Photogrammetry GSD:</span>
                    <span className="text-gray-700">
                      {dossier.spatial.source_uncertainty || '±5cm UAV GSD'}
                    </span>
                  </div>
                </div>

                {/* Provisional Notice */}
                <p className="text-[10px] text-gray-500 italic">
                  {dossier.disclaimer || 'Provisional ULPIN and area reconciliation for prototype assessment. Official title authority rests with revenue inspector.'}
                </p>
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
