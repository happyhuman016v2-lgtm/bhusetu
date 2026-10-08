import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { Parcel, PartitionResult } from '../types';
import {
  Layers,
  Crosshair,
  Satellite,
  Maximize2,
  Minimize2,
  Columns,
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
        'raster-opacity': 0.75,
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

  // Keep latest references for event listeners without re-binding
  const parcelsRef = useRef<Parcel[]>(parcels);
  parcelsRef.current = parcels;

  const onSelectParcelRef = useRef(onSelectParcel);
  onSelectParcelRef.current = onSelectParcel;

  // Split View Mode (Side-by-side comparison: Street vs Satellite)
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [satelliteOpacity, setSatelliteOpacity] = useState<number>(0.75);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);

  // Track active interacting map to prevent recursive sync loops
  const interactingMapRef = useRef<'left' | 'right' | null>(null);
  const syncRafRef = useRef<number | null>(null);

  // Initial Center on first parcel
  const initialCenter: [number, number] =
    parcels.length > 0 && parcels[0].geometry
      ? (turf.centroid(parcels[0].geometry).geometry.coordinates as [number, number])
      : [78.3268, 17.5507];

  const fitToParcel = useCallback((map: maplibregl.Map, parcel: Parcel) => {
    try {
      const bbox = turf.bbox(parcel.geometry);
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        {
          padding: 80,
          duration: 1000,
          maxZoom: 17.5,
        }
      );
    } catch (e) {
      console.warn('fitBounds error:', e);
    }
  }, []);

  // Update GeoJSON sources efficiently using .setData()
  const updateMapData = useCallback(
    (map: maplibregl.Map, side: 'left' | 'right') => {
      if (!map.isStyleLoaded()) return;

      const prefix = `${side}-`;

      // 1. Parcels FeatureCollection
      const parcelFeatures = showBoundaries
        ? parcels.map((p) => ({
            ...p.geometry,
            properties: {
              id: p.id,
              surveyNumber: p.surveyNumber,
              ulpin: p.ulpin,
              status: p.status,
              trustGrade: p.trustGrade,
              isSelected: p.id === selectedParcelId,
            },
          }))
        : [];

      const parcelSource = map.getSource(`${prefix}parcels-source`) as maplibregl.GeoJSONSource;
      if (parcelSource) {
        parcelSource.setData({
          type: 'FeatureCollection',
          features: parcelFeatures as any,
        });
      }

      // 2. Buffer Zones FeatureCollection
      const bufferFeatures = showBuffers
        ? parcels
            .filter((p) => p.bufferZone && p.bufferZone.geometry)
            .map((p) => ({
              ...p.bufferZone!.geometry,
              properties: {
                parcelId: p.id,
                name: p.bufferZone!.name,
                type: p.bufferZone!.type,
              },
            }))
        : [];

      const bufferSource = map.getSource(`${prefix}buffer-source`) as maplibregl.GeoJSONSource;
      if (bufferSource) {
        bufferSource.setData({
          type: 'FeatureCollection',
          features: bufferFeatures as any,
        });
      }

      // 3. Partition FeatureCollection
      const partitionFeatures =
        activePartition && activePartition.parcelId === selectedParcelId
          ? activePartition.splits.map((s) => ({
              ...s.polygon,
              properties: {
                name: s.shareholderName,
                color: s.color,
                area: s.regionalAreaFormatted,
                subSurvey: s.subSurveyNo,
              },
            }))
          : [];

      const partitionSource = map.getSource(`${prefix}partition-source`) as maplibregl.GeoJSONSource;
      if (partitionSource) {
        partitionSource.setData({
          type: 'FeatureCollection',
          features: partitionFeatures as any,
        });
      }
    },
    [parcels, selectedParcelId, activePartition, showBoundaries, showBuffers]
  );

  // Set up layers once on map load
  const setupLayersOnce = (map: maplibregl.Map, side: 'left' | 'right') => {
    const prefix = `${side}-`;

    // 1. Buffer Source & Layers
    map.addSource(`${prefix}buffer-source`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
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

    // 2. Parcels Source & Layers
    map.addSource(`${prefix}parcels-source`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

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
        'line-width': ['case', ['get', 'isSelected'], 3.5, 2.0],
      },
    });

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

    // 3. Partition Source & Layers
    map.addSource(`${prefix}partition-source`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
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

    // Register Click & Hover Listeners ONCE
    map.on('click', `${prefix}parcels-fill`, (e: any) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].properties?.id;
        if (id) {
          onSelectParcelRef.current(id);
          const clickedParcel = parcelsRef.current.find((p) => p.id === id);
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
  };

  // Initialize Primary Map (Once)
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
      setupLayersOnce(map, 'left');
      updateMapData(map, 'left');
      const selected = parcelsRef.current.find((p) => p.id === selectedParcelId) || parcelsRef.current[0];
      if (selected && selected.geometry) {
        fitToParcel(map, selected);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update primary & secondary maps whenever data or filters change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateMapData(mapRef.current, 'left');
    }
    if (mapRightRef.current && mapRightRef.current.isStyleLoaded()) {
      updateMapData(mapRightRef.current, 'right');
    }
  }, [updateMapData]);

  // Satellite Opacity Slider
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('drone-layer')) {
      const op = isSplitView ? 0 : satelliteOpacity;
      map.setPaintProperty('drone-layer', 'raster-opacity', op);
    }
  }, [satelliteOpacity, isSplitView]);

  // Handle Split View Initialization & Synchronized Event Handling
  useEffect(() => {
    const primary = mapRef.current;

    if (!isSplitView) {
      if (mapRightRef.current) {
        mapRightRef.current.remove();
        mapRightRef.current = null;
      }
      setTimeout(() => primary?.resize(), 50);
      return;
    }

    if (!mapRightContainerRef.current || !primary) return;

    const currentCenter = primary.getCenter();
    const currentZoom = primary.getZoom();
    const currentBearing = primary.getBearing();
    const currentPitch = primary.getPitch();

    const mapRight = new maplibregl.Map({
      container: mapRightContainerRef.current,
      style: SATELLITE_ONLY_STYLE,
      center: currentCenter,
      zoom: currentZoom,
      bearing: currentBearing,
      pitch: currentPitch,
      maxZoom: 19.5,
      minZoom: 4,
    });

    mapRight.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    mapRightRef.current = mapRight;

    mapRight.on('load', () => {
      setupLayersOnce(mapRight, 'right');
      updateMapData(mapRight, 'right');
    });

    // Pointer-driven synchronization (Only the active interacting map drives the other)
    const onLeftPointerDown = () => {
      interactingMapRef.current = 'left';
    };
    const onRightPointerDown = () => {
      interactingMapRef.current = 'right';
    };
    const onPointerUp = () => {
      interactingMapRef.current = null;
    };

    const leftCanvas = primary.getCanvas();
    const rightCanvas = mapRight.getCanvas();

    leftCanvas.addEventListener('mousedown', onLeftPointerDown);
    leftCanvas.addEventListener('wheel', onLeftPointerDown, { passive: true });
    leftCanvas.addEventListener('touchstart', onLeftPointerDown, { passive: true });

    rightCanvas.addEventListener('mousedown', onRightPointerDown);
    rightCanvas.addEventListener('wheel', onRightPointerDown, { passive: true });
    rightCanvas.addEventListener('touchstart', onRightPointerDown, { passive: true });

    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Sync from Left to Right via requestAnimationFrame (Capped at 60 FPS)
    const syncLeftToRight = () => {
      if (interactingMapRef.current !== 'left' || !mapRightRef.current) return;
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current);

      syncRafRef.current = requestAnimationFrame(() => {
        mapRightRef.current?.jumpTo({
          center: primary.getCenter(),
          zoom: primary.getZoom(),
          bearing: primary.getBearing(),
          pitch: primary.getPitch(),
        });
      });
    };

    // Sync from Right to Left via requestAnimationFrame
    const syncRightToLeft = () => {
      if (interactingMapRef.current !== 'right' || !mapRef.current) return;
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current);

      syncRafRef.current = requestAnimationFrame(() => {
        mapRef.current?.jumpTo({
          center: mapRight.getCenter(),
          zoom: mapRight.getZoom(),
          bearing: mapRight.getBearing(),
          pitch: mapRight.getPitch(),
        });
      });
    };

    primary.on('move', syncLeftToRight);
    mapRight.on('move', syncRightToLeft);

    setTimeout(() => {
      primary.resize();
      mapRight.resize();
    }, 50);

    return () => {
      primary.off('move', syncLeftToRight);
      mapRight.off('move', syncRightToLeft);

      leftCanvas.removeEventListener('mousedown', onLeftPointerDown);
      leftCanvas.removeEventListener('wheel', onLeftPointerDown);
      leftCanvas.removeEventListener('touchstart', onLeftPointerDown);

      rightCanvas.removeEventListener('mousedown', onRightPointerDown);
      rightCanvas.removeEventListener('wheel', onRightPointerDown);
      rightCanvas.removeEventListener('touchstart', onRightPointerDown);

      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);

      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current);

      mapRight.remove();
      mapRightRef.current = null;
      primary.resize();
    };
  }, [isSplitView]);

  // Handle Resize immediately on layout expand/collapse without CSS delay
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.resize();
      mapRightRef.current?.resize();
    }, 40);
    return () => clearTimeout(timer);
  }, [isMapExpanded]);

  const handleFocusSelected = () => {
    const selected = parcels.find((p) => p.id === selectedParcelId);
    if (selected && selected.geometry) {
      if (mapRef.current) fitToParcel(mapRef.current, selected);
      if (mapRightRef.current) fitToParcel(mapRightRef.current, selected);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-[#E7DFD5] rounded-2xl overflow-hidden border border-[#E7DFD5] shadow-sm flex flex-col">
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        {/* Split Screen Button */}
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

        {/* Satellite Imagery Slider & Toggle (when NOT in split view) */}
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

      {/* Main Map View Area: Instant responsive layout (Zero CSS transitions on canvas) */}
      <div className="w-full h-full flex flex-1 overflow-hidden relative">
        {/* Left Map Pane (Street & Cadastral Vector Map) */}
        <div
          ref={mapContainerRef}
          className={`h-full ${isSplitView ? 'w-1/2 border-r-2 border-[#C85A32]' : 'w-full'}`}
        />

        {/* Left Pane Badge in Split Mode */}
        {isSplitView && (
          <div className="absolute top-16 left-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow border border-[#E7DFD5] text-[11px] font-bold text-[#23201F] flex items-center gap-1.5 pointer-events-none">
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
          <div className="absolute top-16 right-3 z-10 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
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
