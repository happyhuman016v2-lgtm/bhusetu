import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { Parcel, PartitionResult } from '../types';
import {
  Layers,
  Sliders,
  Crosshair,
  Satellite,
  Map as MapIcon,
  Eye,
  Info,
} from 'lucide-react';

interface Props {
  parcels: Parcel[];
  selectedParcelId: string;
  onSelectParcel: (parcelId: string) => void;
  activePartition?: PartitionResult;
}

const BASE_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'carto-positron': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    },
    'drone-source': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri World Imagery & TRACGIS Drone Photogrammetry',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'base-tiles',
      type: 'raster',
      source: 'carto-positron',
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
        'raster-opacity': 0.75, // Default 75% satellite opacity
      },
    },
  ],
};

export const MapEngine: React.FC<Props> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  activePartition,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef<boolean>(false);

  // Satellite Opacity Slider state (0 to 1)
  const [satelliteOpacity, setSatelliteOpacity] = useState<number>(0.75);
  const [showLayersDropdown, setShowLayersDropdown] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);

  // Initial Center on first parcel (Sultanpur, Telangana)
  const initialCenter: [number, number] = parcels.length > 0 && parcels[0].geometry
    ? (turf.centroid(parcels[0].geometry).geometry.coordinates as [number, number])
    : [78.3268, 17.5507];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

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
      isLoadedRef.current = true;
      renderAllLayers(map);

      // Fit bounds to the selected parcel on initial load
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

  // Update satellite opacity via slider
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('drone-layer')) {
      map.setPaintProperty('drone-layer', 'raster-opacity', satelliteOpacity);
    }
  }, [satelliteOpacity]);

  // Handle selected parcel change or data change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    renderAllLayers(map);

    const selected = parcels.find((p) => p.id === selectedParcelId);
    if (selected && selected.geometry) {
      fitToParcel(map, selected);
    }
  }, [parcels, selectedParcelId, activePartition, showBoundaries, showBuffers]);

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
          duration: 1200,
          maxZoom: 17.5,
        }
      );
    } catch (e) {
      console.warn('fitBounds error:', e);
    }
  };

  const handleFocusSelected = () => {
    const map = mapRef.current;
    const selected = parcels.find((p) => p.id === selectedParcelId);
    if (map && selected && selected.geometry) {
      fitToParcel(map, selected);
    }
  };

  const renderAllLayers = (map: maplibregl.Map) => {
    // Clean up previous layers
    const layerIds = [
      'parcels-fill',
      'parcels-line',
      'parcels-selected-outline',
      'parcels-labels',
      'buffer-fill',
      'buffer-line',
      'partition-fill',
      'partition-line',
    ];

    layerIds.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });

    ['parcels-source', 'buffer-source', 'partition-source'].forEach((src) => {
      if (map.getSource(src)) map.removeSource(src);
    });

    // 1. Buffer Zones (Waterbody FTL or Road Corridor)
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
        map.addSource('buffer-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: bufferFeatures as any,
          },
        });

        map.addLayer({
          id: 'buffer-fill',
          type: 'fill',
          source: 'buffer-source',
          paint: {
            'fill-color': '#0284C7',
            'fill-opacity': 0.3,
          },
        });

        map.addLayer({
          id: 'buffer-line',
          type: 'line',
          source: 'buffer-source',
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

      map.addSource('parcels-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: parcelFeatures as any,
        },
      });

      // Cadastral Fill
      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels-source',
        paint: {
          'fill-color': [
            'case',
            ['get', 'isSelected'],
            '#C85A32', // Selected highlight in terra cotta
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
            0.5,
            0.25,
          ],
        },
      });

      // Cadastral Boundary Line
      map.addLayer({
        id: 'parcels-line',
        type: 'line',
        source: 'parcels-source',
        paint: {
          'line-color': [
            'case',
            ['get', 'isSelected'],
            '#FFFFFF',
            '#23201F',
          ],
          'line-width': [
            'case',
            ['get', 'isSelected'],
            3.5,
            2.0,
          ],
        },
      });

      // Boundary Glow for Selected Parcel
      map.addLayer({
        id: 'parcels-selected-outline',
        type: 'line',
        source: 'parcels-source',
        filter: ['==', ['get', 'isSelected'], true],
        paint: {
          'line-color': '#C85A32',
          'line-width': 6.0,
          'line-opacity': 0.6,
        },
      });

      // Survey Number Labels
      map.addLayer({
        id: 'parcels-labels',
        type: 'symbol',
        source: 'parcels-source',
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

      map.addSource('partition-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: partitionFeatures as any,
        },
      });

      map.addLayer({
        id: 'partition-fill',
        type: 'fill',
        source: 'partition-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.6,
        },
      });

      map.addLayer({
        id: 'partition-line',
        type: 'line',
        source: 'partition-source',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 3,
        },
      });
    }

    // Parcel Click Handler: Select AND instantly fly to boundary!
    map.on('click', 'parcels-fill', (e: any) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].properties?.id;
        if (id) {
          onSelectParcel(id);
          const clickedParcel = parcels.find((p) => p.id === id);
          if (clickedParcel && clickedParcel.geometry) {
            fitToParcel(map, clickedParcel);
          }
        }
      }
    });

    map.on('mouseenter', 'parcels-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'parcels-fill', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#E7DFD5] rounded-2xl overflow-hidden border border-[#E7DFD5] shadow-sm flex flex-col">
      {/* Top Floating Controls: Satellite Slider & Quick Actions */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        {/* Satellite Imagery Slider & Toggle */}
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E7DFD5] flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#23201F]">
            <Satellite className="w-4 h-4 text-[#C85A32]" />
            <span>Satellite Imagery</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={satelliteOpacity}
              onChange={(e) => setSatelliteOpacity(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-[#E7DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
              title="Adjust Satellite Layer Opacity"
            />
            <span className="text-[11px] font-mono font-bold text-[#383432] w-8">
              {Math.round(satelliteOpacity * 100)}%
            </span>
          </div>

          {/* Preset Buttons: Street vs Satellite */}
          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
            <button
              onClick={() => setSatelliteOpacity(0)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                satelliteOpacity === 0 ? 'bg-[#23201F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setSatelliteOpacity(1)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                satelliteOpacity === 1 ? 'bg-[#23201F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sat
            </button>
          </div>
        </div>

        {/* Focus Boundary Button */}
        <button
          onClick={handleFocusSelected}
          className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E7DFD5] flex items-center gap-1.5 text-xs font-bold text-[#C85A32] hover:bg-[#FAF7F2] transition-colors active:scale-95"
          title="Fly camera to selected plot boundaries"
        >
          <Crosshair className="w-4 h-4" />
          <span>Focus Boundary</span>
        </button>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Bottom Right Cadastral Legend & Layer Toggles */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-[#E7DFD5] text-xs max-w-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-[#23201F] border-b border-gray-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>TRACGIS Cadastral Layer ({parcels.length} Plots)</span>
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
