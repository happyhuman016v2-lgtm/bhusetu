import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { Parcel, PartitionResult } from '../types';
import { Layers } from 'lucide-react';

interface Props {
  parcels: Parcel[];
  selectedParcelId: string;
  onSelectParcel: (parcelId: string) => void;
  activePartition?: PartitionResult;
}

const OSM_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_MAP_STYLE,
      center: [77.1355, 11.0518], // Centered near KPR Institute / Coimbatore initially
      zoom: 16,
      maxZoom: 19,
      minZoom: 4,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    mapRef.current = map;

    map.on('load', () => {
      renderParcelsOnMap(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layers whenever parcels, selectedParcel, or activePartition changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    renderParcelsOnMap(map);

    // Fly to selected parcel
    const selected = parcels.find((p) => p.id === selectedParcelId);
    if (selected) {
      try {
        const bbox = turf.bbox(selected.geometry);
        map.fitBounds(
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
          ],
          { padding: 80, duration: 1200, maxZoom: 17.5 }
        );
      } catch (e) {
        console.warn('Failed to fit bounds:', e);
      }
    }
  }, [parcels, selectedParcelId, activePartition]);

  const renderParcelsOnMap = (map: maplibregl.Map) => {
    // Clear existing custom sources and layers
    const layerIdsToRemove = [
      'parcels-fill',
      'parcels-line',
      'parcels-selected-outline',
      'buffer-fill',
      'buffer-line',
      'partition-fill',
      'partition-line',
    ];

    layerIdsToRemove.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });

    ['parcels-source', 'buffer-source', 'partition-source'].forEach((srcId) => {
      if (map.getSource(srcId)) map.removeSource(srcId);
    });

    // 1. Buffer Zones (Waterbody FTL or Highway Setback)
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
          'fill-opacity': 0.25,
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

    // 2. Main Parcels Layer
    const parcelFeatures = parcels.map((p) => ({
      ...p.geometry,
      properties: {
        id: p.id,
        surveyNumber: p.surveyNumber,
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

    map.addLayer({
      id: 'parcels-fill',
      type: 'fill',
      source: 'parcels-source',
      paint: {
        'fill-color': [
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
        'fill-opacity': [
          'case',
          ['get', 'isSelected'],
          0.5,
          0.3,
        ],
      },
    });

    map.addLayer({
      id: 'parcels-line',
      type: 'line',
      source: 'parcels-source',
      paint: {
        'line-color': '#23201F',
        'line-width': [
          'case',
          ['get', 'isSelected'],
          3.5,
          2.0,
        ],
      },
    });

    // 3. Active Land Partition Sub-Plots (if active for current parcel)
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
          'fill-opacity': 0.55,
        },
      });

      map.addLayer({
        id: 'partition-line',
        type: 'line',
        source: 'partition-source',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2.5,
        },
      });
    }

    // Parcel Click handler
    map.on('click', 'parcels-fill', (e: any) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].properties?.id;
        if (id) {
          onSelectParcel(id);
        }
      }
    });

    // Cursor change on hover
    map.on('mouseenter', 'parcels-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'parcels-fill', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#E7DFD5] rounded-xl overflow-hidden border border-[#E7DFD5] shadow-xs">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-[#E7DFD5] text-xs max-w-xs space-y-1.5">
        <div className="flex items-center justify-between font-semibold text-[#23201F] border-b border-gray-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Cadastral Map Layers</span>
          </span>
          <span className="text-[10px] text-gray-500 font-normal">EPSG:4326</span>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-[#383432]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#276728] border border-black/20 inline-block" />
            <span>Clean (Grade A)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#D97706] border border-black/20 inline-block" />
            <span>Warning (Mismatch)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#B91C1C] border border-black/20 inline-block" />
            <span>Critical Encroach</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0284C7] border border-black/20 inline-block" />
            <span>Notified Buffer Zone</span>
          </div>
        </div>

        {activePartition && activePartition.parcelId === selectedParcelId && (
          <div className="mt-1 pt-1.5 border-t border-gray-100 text-[10px] text-[#C85A32] font-semibold flex items-center justify-between">
            <span>✨ AI Partition Overlays Active</span>
            <span className="bg-[#C85A32]/10 px-1.5 py-0.5 rounded text-[10px]">{activePartition.splits.length} Sub-Parcels</span>
          </div>
        )}
      </div>
    </div>
  );
};
