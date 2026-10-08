import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { Parcel, PartitionResult } from '../types';
import {
  Layers,
  Crosshair,
  Satellite,
  Split,
  Maximize2,
  Minimize2,
  Columns,
  MapPin,
} from 'lucide-react';

interface Props {
  parcels: Parcel[];
  selectedParcelId: string;
  onSelectParcel: (parcelId: string) => void;
  activePartition?: PartitionResult;
  isMapExpanded?: boolean;
  onToggleExpandMap?: () => void;
}

const OSM_TILES_URLS = [
  'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
];

const SATELLITE_TILES_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const BASE_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-street': {
      type: 'raster',
      tiles: OSM_TILES_URLS,
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
      maxzoom: 19,
    },
    'drone-source': {
      type: 'raster',
      tiles: [SATELLITE_TILES_URL],
      tileSize: 256,
      attribution: '&copy; Esri World Imagery & TRACGIS Drone Photogrammetry',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'base-tiles',
      type: 'raster',
      source: 'osm-street',
      minzoom: 0,
      maxzoom: 20,
    },
    {
      id: 'drone-layer',
      type: 'raster',
      source: 'drone-source',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.75, // Default 75% satellite opacity in single view
      },
    },
  ],
};

const SATELLITE_ONLY_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'drone-source': {
      type: 'raster',
      tiles: [SATELLITE_TILES_URL],
      tileSize: 256,
      attribution: '&copy; Esri World Imagery',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'drone-layer-right',
      type: 'raster',
      source: 'drone-source',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const MapEngine: React.FC<Props> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  activePartition,
  isMapExpanded,
  onToggleExpandMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRightContainerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapRightRef = useRef<maplibregl.Map | null>(null);

  // Split View Mode (Side-by-side comparison: Street vs Satellite)
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [satelliteOpacity, setSatelliteOpacity] = useState<number>(0.75);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);

  // Initial Center on first parcel (Sultanpur, Telangana)
  const initialCenter: [number, number] =
    parcels.length > 0 && parcels[0].geometry
      ? (turf.centroid(parcels[0].geometry).geometry.coordinates as [number, number])
      : [78.3268, 17.5507];

  // Helper to fit bounds to selected parcel
  const fitToParcel = (map: maplibregl.Map, parcel: Parcel) => {
    try {
      const bbox = turf.bbox(parcel.geometry);
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        {
          padding: 80,
          duration: 1100,
          maxZoom: 17.5,
        }
      );
    } catch (e) {
      console.warn('fitBounds error:', e);
    }
  };

  // Initialize Primary Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((maplibregl as any).config) {
      (maplibregl as any).config.WORKER_URL = '/maplibre-gl-worker.mjs';
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASE_MAP_STYLE,
      center: initialCenter,
      zoom: 15.5,
      maxZoom: 19.5,
      minZoom: 4,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    mapRef.current = map;

    map.on('load', () => {
      renderLayers(map, 'left');
      const selected = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
      if (selected && selected.geometry) {
        fitToParcel(map, selected);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Initialize or Destroy Secondary Map on Split View Toggle
  useEffect(() => {
    if (isSplitView) {
      if (!mapRightContainerRef.current) return;

      const primary = mapRef.current;
      const currentCenter = primary ? primary.getCenter() : initialCenter;
      const currentZoom = primary ? primary.getZoom() : 15.5;

      const mapRight = new maplibregl.Map({
        container: mapRightContainerRef.current,
        style: SATELLITE_ONLY_STYLE,
        center: currentCenter,
        zoom: currentZoom,
        maxZoom: 19.5,
        minZoom: 4,
      });

      mapRight.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

      mapRightRef.current = mapRight;

      mapRight.on('load', () => {
        renderLayers(mapRight, 'right');
      });

      // Synchronize movements between primary and secondary maps
      let isSyncing = false;

      const syncMove = (source: maplibregl.Map, target: maplibregl.Map) => {
        if (isSyncing) return;
        isSyncing = true;
        target.jumpTo({
          center: source.getCenter(),
          zoom: source.getZoom(),
          bearing: source.getBearing(),
          pitch: source.getPitch(),
        });
        isSyncing = false;
      };

      if (primary) {
        primary.on('move', () => {
          if (mapRightRef.current) syncMove(primary, mapRightRef.current);
        });
      }

      mapRight.on('move', () => {
        if (mapRef.current) syncMove(mapRight, mapRef.current);
      });

      // Resize maps
      setTimeout(() => {
        primary?.resize();
        mapRight.resize();
      }, 100);

      return () => {
        mapRight.remove();
        mapRightRef.current = null;
        primary?.resize();
      };
    } else {
      if (mapRightRef.current) {
        mapRightRef.current.remove();
        mapRightRef.current = null;
      }
      setTimeout(() => {
        mapRef.current?.resize();
      }, 100);
    }
  }, [isSplitView]);

  // Handle Satellite Opacity Slider in Single View
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('drone-layer')) {
      // In split view, left map is purely street (opacity 0)
      const op = isSplitView ? 0 : satelliteOpacity;
      map.setPaintProperty('drone-layer', 'raster-opacity', op);
    }
  }, [satelliteOpacity, isSplitView]);

  // Update Layers when parcels, selected, or partition changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderLayers(mapRef.current, 'left');
    }
    if (mapRightRef.current && mapRightRef.current.isStyleLoaded()) {
      renderLayers(mapRightRef.current, 'right');
    }

    const selected = parcels.find((p) => p.id === selectedParcelId);
    if (selected && selected.geometry) {
      if (mapRef.current) fitToParcel(mapRef.current, selected);
      if (mapRightRef.current) fitToParcel(mapRightRef.current, selected);
    }
  }, [parcels, selectedParcelId, activePartition, showBoundaries, showBuffers]);

  const handleFocusSelected = () => {
    const selected = parcels.find((p) => p.id === selectedParcelId);
    if (selected && selected.geometry) {
      if (mapRef.current) fitToParcel(mapRef.current, selected);
      if (mapRightRef.current) fitToParcel(mapRightRef.current, selected);
    }
  };

  const renderLayers = (map: maplibregl.Map, side: 'left' | 'right') => {
    const prefix = `${side}-`;
    const layerIds = [
      `${prefix}parcels-fill`,
      `${prefix}parcels-line`,
      `${prefix}parcels-selected-outline`,
      `${prefix}parcels-labels`,
      `${prefix}buffer-fill`,
      `${prefix}buffer-line`,
      `${prefix}partition-fill`,
      `${prefix}partition-line`,
    ];

    layerIds.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });

    [`${prefix}parcels-source`, `${prefix}buffer-source`, `${prefix}partition-source`].forEach(
      (src) => {
        if (map.getSource(src)) map.removeSource(src);
      }
    );

    // 1. Buffer Zones
    if (showBuffers) {
      const bufferFeatures = parcels
        .filter((p) => p.bufferZone && p.bufferZone.geometry)
        .map((p) => ({
          ...p.bufferZone!.geometry,
          properties: {
            parcelId: p.id,
            name: p.bufferZone!.name,
            type: p.bufferZone!.type,
          },
        }));

      if (bufferFeatures.length > 0) {
        map.addSource(`${prefix}buffer-source`, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: bufferFeatures as any,
          },
        });

        map.addLayer({
          id: `${prefix}buffer-fill`,
          type: 'fill',
          source: `${prefix}buffer-source`,
          paint: {
            'fill-color': '#0284C7',
            'fill-opacity': 0.35,
          },
        });

        map.addLayer({
          id: `${prefix}buffer-line`,
          type: 'line',
          source: `${prefix}buffer-source`,
          paint: {
            'line-color': '#0284C7',
            'line-width': 2.5,
            'line-dasharray': [3, 2],
          },
        });
      }
    }

    // 2. Main Cadastral Parcels Layer
    if (showBoundaries) {
      const parcelFeatures = parcels.map((p) => ({
        ...p.geometry,
        properties: {
          id: p.id,
          surveyNumber: p.surveyNumber,
          ulpin: p.ulpin,
          village: p.village,
          status: p.status,
          trustScore: p.trustScore,
          trustGrade: p.trustGrade,
          isSelected: p.id === selectedParcelId,
        },
      }));

      map.addSource(`${prefix}parcels-source`, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: parcelFeatures as any,
        },
      });

      // Cadastral Fill
      map.addLayer({
        id: `${prefix}parcels-fill`,
        type: 'fill',
        source: `${prefix}parcels-source`,
        paint: {
          'fill-color': [
            'case',
            ['get', 'isSelected'],
            '#C85A32',
            [
              'match',
              ['get', 'status'],
              'CLEAN',
              '#276728',
              'WARNING',
              '#D97706',
              'CRITICAL',
              '#B91C1C',
              '#6B6360',
            ],
          ],
          'fill-opacity': [
            'case',
            ['get', 'isSelected'],
            side === 'right' ? 0.35 : 0.45,
            side === 'right' ? 0.15 : 0.25,
          ],
        },
      });

      // Cadastral Boundary Line
      map.addLayer({
        id: `${prefix}parcels-line`,
        type: 'line',
        source: `${prefix}parcels-source`,
        paint: {
          'line-color': [
            'case',
            ['get', 'isSelected'],
            '#FFFFFF',
            side === 'right' ? '#FBF9F5' : '#23201F',
          ],
          'line-width': [
            'case',
            ['get', 'isSelected'],
            3.5,
            2.0,
          ],
        },
      });

      // Glow outline for selected
      map.addLayer({
        id: `${prefix}parcels-selected-outline`,
        type: 'line',
        source: `${prefix}parcels-source`,
        filter: ['==', ['get', 'isSelected'], true],
        paint: {
          'line-color': '#C85A32',
          'line-width': 6.0,
          'line-opacity': 0.65,
        },
      });

      // Survey labels
      map.addLayer({
        id: `${prefix}parcels-labels`,
        type: 'symbol',
        source: `${prefix}parcels-source`,
        minzoom: 14.5,
        layout: {
          'text-field': ['get', 'surveyNumber'],
          'text-size': 11,
          'text-anchor': 'center',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#23201F',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2.5,
        },
      });

      // Click to select & fitBounds
      map.on('click', `${prefix}parcels-fill`, (e: any) => {
        if (e.features && e.features[0]) {
          const id = e.features[0].properties?.id;
          if (id) {
            onSelectParcel(id);
            const clickedParcel = parcels.find((p) => p.id === id);
            if (clickedParcel && clickedParcel.geometry) {
              if (mapRef.current) fitToParcel(mapRef.current, clickedParcel);
              if (mapRightRef.current) fitToParcel(mapRightRef.current, clickedParcel);
            }
          }
        }
      });

      map.on('mouseenter', `${prefix}parcels-fill`, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', `${prefix}parcels-fill`, () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // 3. Active Land Partition Sub-Plots
    if (activePartition && activePartition.parcelId === selectedParcelId) {
      const partitionFeatures = activePartition.splits.map((s) => ({
        ...s.polygon,
        properties: {
          name: s.shareholderName,
          color: s.color,
          area: s.regionalAreaFormatted,
          subSurvey: s.subSurveyNo,
        },
      }));

      map.addSource(`${prefix}partition-source`, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: partitionFeatures as any,
        },
      });

      map.addLayer({
        id: `${prefix}partition-fill`,
        type: 'fill',
        source: `${prefix}partition-source`,
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.55,
        },
      });

      map.addLayer({
        id: `${prefix}partition-line`,
        type: 'line',
        source: `${prefix}partition-source`,
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 3,
        },
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-[#E7DFD5] rounded-2xl overflow-hidden border border-[#E7DFD5] shadow-sm flex flex-col">
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        {/* Split Screen Button: Street vs Satellite */}
        <button
          onClick={() => setIsSplitView(!isSplitView)}
          className={`px-3 py-2 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
            isSplitView
              ? 'bg-[#23201F] text-white border-black'
              : 'bg-white/95 backdrop-blur-md text-[#23201F] border-[#E7DFD5] hover:bg-[#FAF7F2]'
          }`}
          title="Toggle Side-by-Side Comparison: Street Map vs Satellite Imagery"
        >
          <Columns className="w-4 h-4 text-[#C85A32]" />
          <span>{isSplitView ? 'Exit Split View' : 'Split View (Street vs Sat)'}</span>
        </button>

        {/* Satellite Imagery Slider & Toggle (shown when NOT in split view) */}
        {!isSplitView && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E7DFD5] flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#23201F]">
              <Satellite className="w-4 h-4 text-[#C85A32]" />
              <span className="hidden sm:inline">Satellite Opacity</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={satelliteOpacity}
                onChange={(e) => setSatelliteOpacity(parseFloat(e.target.value))}
                className="w-20 sm:w-24 h-1.5 bg-[#E7DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                title="Adjust Satellite Layer Opacity"
              />
              <span className="text-[11px] font-mono font-bold text-[#383432] w-8">
                {Math.round(satelliteOpacity * 100)}%
              </span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
              <button
                onClick={() => setSatelliteOpacity(0)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  satelliteOpacity === 0
                    ? 'bg-[#23201F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Street
              </button>
              <button
                onClick={() => setSatelliteOpacity(1)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  satelliteOpacity === 1
                    ? 'bg-[#23201F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sat
              </button>
            </div>
          </div>
        )}

        {/* Focus Boundary Button */}
        <button
          onClick={handleFocusSelected}
          className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E7DFD5] flex items-center gap-1.5 text-xs font-bold text-[#C85A32] hover:bg-[#FAF7F2] transition-colors active:scale-95"
          title="Fly camera to selected plot boundaries"
        >
          <Crosshair className="w-4 h-4" />
          <span>Focus Boundary</span>
        </button>

        {/* Fullscreen / Expand Map Toggle Button */}
        {onToggleExpandMap && (
          <button
            onClick={onToggleExpandMap}
            className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E7DFD5] flex items-center gap-1.5 text-xs font-bold text-[#23201F] hover:bg-[#FAF7F2] transition-colors active:scale-95"
            title={isMapExpanded ? 'Restore Sidebar' : 'Expand Map to Full Width'}
          >
            {isMapExpanded ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#C85A32]" />
                <span className="hidden sm:inline">Show Details</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#C85A32]" />
                <span className="hidden sm:inline">Enlarge Map</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Map View Area: Single Canvas or Split Dual-Pane */}
      <div className="w-full h-full flex flex-1 overflow-hidden relative">
        {/* Left Map Pane (Street & Cadastral Vector Map) */}
        <div
          ref={mapContainerRef}
          className={`h-full transition-all duration-300 ${
            isSplitView ? 'w-1/2 border-r-2 border-[#C85A32]' : 'w-full'
          }`}
        />

        {/* Left Pane Badge in Split Mode */}
        {isSplitView && (
          <div className="absolute top-16 left-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow border border-[#E7DFD5] text-[11px] font-bold text-[#23201F] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>🗺️ Cadastral Street Map</span>
          </div>
        )}

        {/* Right Map Pane (Satellite High-Res Photogrammetry) in Split Mode */}
        {isSplitView && (
          <div ref={mapRightContainerRef} className="w-1/2 h-full relative" />
        )}

        {/* Right Pane Badge in Split Mode */}
        {isSplitView && (
          <div className="absolute top-16 right-3 z-10 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span>🛰️ Esri Satellite Imagery</span>
          </div>
        )}
      </div>

      {/* Bottom Right Cadastral Legend & Layer Toggles */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-[#E7DFD5] text-xs max-w-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-[#23201F] border-b border-gray-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>TRACGIS Parcels ({parcels.length} Plots)</span>
          </span>
          <span className="text-[10px] text-gray-400 font-normal">EPSG:4326</span>
        </div>

        {/* Legend Swatches */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-[#383432]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#276728] border border-black/20 shrink-0" />
            <span>Clean Title (Grade A)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#D97706] border border-black/20 shrink-0" />
            <span>Survey Discrepancy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#B91C1C] border border-black/20 shrink-0" />
            <span>Critical Encroachment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0284C7] border border-black/20 shrink-0" />
            <span>Notified FTL / Buffer</span>
          </div>
        </div>

        {/* Layer Checkboxes */}
        <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6B6360]">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showBoundaries}
              onChange={(e) => setShowBoundaries(e.target.checked)}
              className="accent-[#C85A32]"
            />
            <span>Boundaries</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={(e) => setShowBuffers(e.target.checked)}
              className="accent-[#0284C7]"
            />
            <span>Buffer Zones</span>
          </label>
        </div>

        {activePartition && activePartition.parcelId === selectedParcelId && (
          <div className="pt-1.5 border-t border-gray-100 text-[10px] text-[#C85A32] font-semibold flex items-center justify-between">
            <span>✨ AI Partition Overlays Active</span>
            <span className="bg-[#C85A32]/10 px-1.5 py-0.5 rounded text-[10px]">
              {activePartition.splits.length} Sub-Plots
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
