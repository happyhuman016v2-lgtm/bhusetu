import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import {
  Parcel,
  PartitionResult,
  SvamitvaParcel,
  EncroachmentAnalysisResult,
} from '../types';
import {
  Layers,
  Crosshair,
  Satellite,
  Maximize2,
  Minimize2,
  Columns,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { fetchParcelBuffer, generateClientGeodesicBuffer } from '../services/svamitvaService';

interface Props {
  datasetMode?: 'tracgis' | 'svamitva';
  // TRACGIS props
  parcels: Parcel[];
  selectedParcelId: string;
  selectionEpoch?: number;
  onSelectParcel: (parcelId: string) => void;
  activePartition?: PartitionResult;
  // SVAMITVA props
  svamitvaParcels?: SvamitvaParcel[];
  selectedSvamitvaParcelId?: string;
  onSelectSvamitvaParcel?: (parcelId: string) => void;
  bufferDistance?: number;
  onBufferDistanceChange?: (dist: number) => void;
  encroachmentResults?: EncroachmentAnalysisResult | null;
  // Road & Source Props
  roadFeatures?: any[];
  roadMetadata?: any;
  parcelMetadata?: any;
  // Layout
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
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
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
      maxzoom: 22,
    },
    {
      id: 'drone-layer',
      type: 'raster',
      source: 'drone-source',
      minzoom: 0,
      maxzoom: 24,
      paint: {
        'raster-opacity': 0.75,
      },
    },
  ],
};

const SATELLITE_BASE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'satellite-source': {
      type: 'raster',
      tiles: [SATELLITE_TILES_URL],
      tileSize: 256,
      attribution: '&copy; Esri World Imagery',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'satellite-tiles',
      type: 'raster',
      source: 'satellite-source',
      minzoom: 0,
      maxzoom: 24,
      paint: {
        'raster-opacity': 1.0,
      },
    },
  ],
};

// Helper: Ensure valid GeoJSON FeatureCollection for TRACGIS parcels
const buildParcelFeatures = (
  parcels: Parcel[],
  selectedId: string,
  visible: boolean
): GeoJSON.FeatureCollection => {
  if (!visible) return { type: 'FeatureCollection', features: [] };
  return {
    type: 'FeatureCollection',
    features: parcels.map((p) => {
      const geom = (p.geometry as any)?.geometry || p.geometry;
      return {
        type: 'Feature',
        id: p.id,
        geometry: geom,
        properties: {
          id: p.id,
          surveyNumber: p.surveyNumber,
          ulpin: p.ulpin,
          status: p.status,
          trustGrade: p.trustGrade,
          trustScore: p.trustScore,
          isSelected: p.id === selectedId,
        },
      };
    }) as any,
  };
};

// Helper: Ensure valid GeoJSON FeatureCollection for buffer zones
const buildBufferFeatures = (
  parcels: Parcel[],
  visible: boolean
): GeoJSON.FeatureCollection => {
  if (!visible) return { type: 'FeatureCollection', features: [] };
  return {
    type: 'FeatureCollection',
    features: parcels
      .filter((p) => p.bufferZone && p.bufferZone.geometry)
      .map((p) => {
        const geom = (p.bufferZone!.geometry as any)?.geometry || p.bufferZone!.geometry;
        return {
          type: 'Feature',
          properties: {
            parcelId: p.id,
            name: p.bufferZone!.name,
            type: p.bufferZone!.type,
          },
          geometry: geom,
        };
      }) as any,
  };
};

// Helper: Ensure valid GeoJSON FeatureCollection for active partitions
const buildPartitionFeatures = (
  activePartition: PartitionResult | undefined,
  selectedId: string
): GeoJSON.FeatureCollection => {
  if (!activePartition || activePartition.parcelId !== selectedId) {
    return { type: 'FeatureCollection', features: [] };
  }
  return {
    type: 'FeatureCollection',
    features: activePartition.splits.map((s) => ({
      type: 'Feature',
      geometry: (s.polygon as any)?.geometry || s.polygon,
      properties: {
        name: s.shareholderName,
        color: s.color,
        area: s.regionalAreaFormatted,
        subSurvey: s.subSurveyNo,
      },
    })) as any,
  };
};

// Helper: Build SVAMITVA GeoJSON FeatureCollection
const buildSvamitvaFeatures = (
  parcels: SvamitvaParcel[] = [],
  selectedId: string = ''
): GeoJSON.FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: parcels.map((p) => ({
      ...p,
      properties: {
        ...p.properties,
        isSelected: p.id === selectedId || p.properties?.property_id === selectedId,
      },
    })) as any,
  };
};

export const MapEngine: React.FC<Props> = ({
  datasetMode = 'tracgis',
  parcels,
  selectedParcelId,
  selectionEpoch,
  onSelectParcel,
  activePartition,
  svamitvaParcels = [],
  selectedSvamitvaParcelId = '',
  onSelectSvamitvaParcel,
  bufferDistance = 3.0,
  onBufferDistanceChange,
  encroachmentResults = null,
  roadFeatures = [],
  roadMetadata = null,
  parcelMetadata = null,
  isMapExpanded,
  onToggleExpandMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRightContainerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapRightRef = useRef<maplibregl.Map | null>(null);

  // References for event handlers
  const parcelsRef = useRef<Parcel[]>(parcels);
  parcelsRef.current = parcels;

  const svamitvaParcelsRef = useRef<SvamitvaParcel[]>(svamitvaParcels);
  svamitvaParcelsRef.current = svamitvaParcels;

  const roadFeaturesRef = useRef<any[]>(roadFeatures);
  roadFeaturesRef.current = roadFeatures;

  const onSelectParcelRef = useRef(onSelectParcel);
  onSelectParcelRef.current = onSelectParcel;

  const onSelectSvamitvaParcelRef = useRef(onSelectSvamitvaParcel);
  onSelectSvamitvaParcelRef.current = onSelectSvamitvaParcel;

  const datasetModeRef = useRef(datasetMode);
  datasetModeRef.current = datasetMode;

  // Split View Controls (Side-by-side Dual Panes)
  const [isSplitView, setIsSplitView] = useState<boolean>(false);

  // Layer Visibility & Opacity
  const [satelliteOpacity, setSatelliteOpacity] = useState<number>(0.75);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);
  const [showEncroachments, setShowEncroachments] = useState<boolean>(true);


  // Hover Tooltip Popup for SVAMITVA
  const [hoveredFeature, setHoveredFeature] = useState<{
    x: number;
    y: number;
    props: any;
  } | null>(null);

  // Active sync driver for dual split mode
  const activeDriverRef = useRef<'left' | 'right' | null>(null);

  // Initial Center: SVAMITVA village (Lucknow) or TRACGIS (Telangana)
  const initialCenter: [number, number] =
    datasetMode === 'svamitva' && svamitvaParcels.length > 0
      ? [80.9462, 26.9854]
      : parcels.length > 0 && parcels[0].geometry
      ? (turf.centroid(parcels[0].geometry).geometry.coordinates as [number, number])
      : [78.3268, 17.5507];

  const fitToGeometry = useCallback((map: maplibregl.Map, geomInput: any) => {
    try {
      if (!map || !geomInput) return;
      const geom = (geomInput as any)?.geometry || geomInput;
      const bbox = turf.bbox(geom);
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        {
          padding: 80,
          duration: 900,
          maxZoom: 18.0,
          essential: true,
        }
      );
    } catch (e) {
      console.warn('fitBounds error:', e);
    }
  }, []);

  // Update TRACGIS GeoJSON sources
  const updateTracgisData = useCallback(
    (map: maplibregl.Map, side: 'left' | 'right') => {
      const prefix = `${side}-`;

      const parcelSource = map.getSource(`${prefix}parcels-source`) as maplibregl.GeoJSONSource;
      if (parcelSource) {
        const fc = buildParcelFeatures(parcelsRef.current, selectedParcelId, showBoundaries && datasetMode === 'tracgis');
        parcelSource.setData(fc as any);
      }

      const bufferSource = map.getSource(`${prefix}buffer-source`) as maplibregl.GeoJSONSource;
      if (bufferSource) {
        const fc = buildBufferFeatures(parcelsRef.current, showBuffers && datasetMode === 'tracgis');
        bufferSource.setData(fc as any);
      }

      const partitionSource = map.getSource(`${prefix}partition-source`) as maplibregl.GeoJSONSource;
      if (partitionSource) {
        const fc = buildPartitionFeatures(activePartition, selectedParcelId);
        partitionSource.setData(fc as any);
      }
    },
    [activePartition, showBoundaries, showBuffers, selectedParcelId, datasetMode]
  );

  // Update SVAMITVA GeoJSON sources (Parcels, Dynamic Buffer, Encroachments)
  const updateSvamitvaData = useCallback(
    async (map: maplibregl.Map, side: 'left' | 'right') => {
      const prefix = `${side}-`;

      // 1. Parcels (Render only true cadastral parcels; road features are in independent road-source)
      const svamitvaSource = map.getSource(`${prefix}svamitva-source`) as maplibregl.GeoJSONSource;
      if (svamitvaSource) {
        const isVis = showBoundaries && datasetMode === 'svamitva';
        // Filter out any parcel that is marked as Public Road so parcels and roads are strictly separate layers
        const privateOnly = svamitvaParcelsRef.current.filter(
          (p) => p.id !== 'svamitva-road-01' && p.properties?.land_type !== 'Public Road'
        );
        const fc = buildSvamitvaFeatures(isVis ? privateOnly : [], selectedSvamitvaParcelId);
        svamitvaSource.setData(fc as any);
      }

      // 2. Independent Road Vector Source (Centerline & Boundary Corridors)
      const roadSource = map.getSource(`${prefix}road-source`) as maplibregl.GeoJSONSource;
      if (roadSource) {
        const isRoadVis = showRoads && datasetMode === 'svamitva';
        const roadFc: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: isRoadVis ? (roadFeaturesRef.current as any) : [],
        };
        roadSource.setData(roadFc as any);
      }

      // 3. Dynamic Metric Buffer (Around selected parcel)
      const bufferSource = map.getSource(`${prefix}svamitva-buffer-source`) as maplibregl.GeoJSONSource;
      if (bufferSource) {
        if (datasetMode === 'svamitva' && selectedSvamitvaParcelId && showBuffers) {
          const target = svamitvaParcelsRef.current.find(
            (p) => p.id === selectedSvamitvaParcelId || p.properties.property_id === selectedSvamitvaParcelId
          );
          if (target && target.geometry) {
            // Attempt API fetch or client fallback
            let bufGeom = await fetchParcelBuffer(target.id, bufferDistance);
            if (!bufGeom) {
              bufGeom = generateClientGeodesicBuffer(target.geometry, bufferDistance);
            }
            if (bufGeom) {
              bufferSource.setData({
                type: 'FeatureCollection',
                features: [bufGeom as any],
              });
            }
          } else {
            bufferSource.setData({ type: 'FeatureCollection', features: [] });
          }
        } else {
          bufferSource.setData({ type: 'FeatureCollection', features: [] });
        }
      }

      // 4. Potential Corridor Review Zones (Amber/Red Highlight)
      const conflictSource = map.getSource(`${prefix}svamitva-conflict-source`) as maplibregl.GeoJSONSource;
      if (conflictSource) {
        if (datasetMode === 'svamitva' && encroachmentResults && showEncroachments) {
          conflictSource.setData(encroachmentResults as any);
        } else {
          conflictSource.setData({ type: 'FeatureCollection', features: [] });
        }
      }
    },
    [datasetMode, selectedSvamitvaParcelId, bufferDistance, encroachmentResults, showBoundaries, showRoads, showBuffers, showEncroachments]
  );

  // Setup all layers once on map load
  const setupLayersOnce = (map: maplibregl.Map, side: 'left' | 'right') => {
    const prefix = `${side}-`;

    // --- TRACGIS LAYERS ---
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
        'fill-opacity': side === 'right' ? 0.35 : 0.4,
      },
    });
    map.addLayer({
      id: `${prefix}buffer-line`,
      type: 'line',
      source: `${prefix}buffer-source`,
      paint: {
        'line-color': side === 'right' ? '#38BDF8' : '#0284C7',
        'line-width': 2.5,
        'line-dasharray': [3, 2],
      },
    });

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
            '#DC2626',
            '#6B6360',
          ],
        ],
        'fill-opacity': [
          'case',
          ['get', 'isSelected'],
          side === 'right' ? 0.45 : 0.55,
          side === 'right' ? 0.22 : 0.32,
        ],
      },
    });
    map.addLayer({
      id: `${prefix}parcels-casing`,
      type: 'line',
      source: `${prefix}parcels-source`,
      paint: {
        'line-color': '#000000',
        'line-width': ['case', ['get', 'isSelected'], 5.0, 3.5],
        'line-opacity': 0.85,
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
          side === 'right' ? '#FFEA00' : '#FFFFFF',
          side === 'right' ? '#FACC15' : '#FFFFFF',
        ],
        'line-width': ['case', ['get', 'isSelected'], 3.5, 2.2],
      },
    });
    map.addLayer({
      id: `${prefix}parcels-labels`,
      type: 'symbol',
      source: `${prefix}parcels-source`,
      minzoom: 12.5,
      layout: {
        'text-field': ['get', 'surveyNumber'],
        'text-size': 11.5,
        'text-anchor': 'center',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': side === 'right' ? '#FFFFFF' : '#1E293B',
        'text-halo-color': side === 'right' ? '#000000' : '#FFFFFF',
        'text-halo-width': 3.0,
      },
    });

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
        'fill-opacity': 0.6,
      },
    });
    map.addLayer({
      id: `${prefix}partition-line`,
      type: 'line',
      source: `${prefix}partition-source`,
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 3.5,
      },
    });

    // --- SVAMITVA DRONE CADASTRAL LAYERS ---
    // 1. Dynamic Metric Buffer Layer (Underneath parcels)
    map.addSource(`${prefix}svamitva-buffer-source`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: `${prefix}svamitva-buffer-fill`,
      type: 'fill',
      source: `${prefix}svamitva-buffer-source`,
      paint: {
        'fill-color': '#F59E0B',
        'fill-opacity': 0.25,
      },
    });
    map.addLayer({
      id: `${prefix}svamitva-buffer-line`,
      type: 'line',
      source: `${prefix}svamitva-buffer-source`,
      paint: {
        'line-color': '#D97706',
        'line-width': 3.0,
        'line-dasharray': [4, 2],
      },
    });

    // 2. SVAMITVA Parcels Source & Layers
    map.addSource(`${prefix}svamitva-source`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: `${prefix}svamitva-fill`,
      type: 'fill',
      source: `${prefix}svamitva-source`,
      paint: {
        'fill-color': [
          'case',
          ['get', 'isSelected'],
          '#C85A32',
          [
            'match',
            ['get', 'land_type'],
            'Public Road',
            '#1E293B',
            'Community Asset',
            '#7C3AED',
            'Public Institutional',
            '#4F46E5',
            'Open Land',
            '#D97706',
            '#0284C7', // Residential default sky-blue
          ],
        ],
        'fill-opacity': [
          'case',
          ['get', 'isSelected'],
          0.7,
          ['match', ['get', 'land_type'], 'Public Road', 0.85, 0.45],
        ],
      },
    });
    map.addLayer({
      id: `${prefix}svamitva-casing`,
      type: 'line',
      source: `${prefix}svamitva-source`,
      paint: {
        'line-color': '#000000',
        'line-width': ['case', ['get', 'isSelected'], 4.5, 3.0],
        'line-opacity': 0.85,
      },
    });
    map.addLayer({
      id: `${prefix}svamitva-line`,
      type: 'line',
      source: `${prefix}svamitva-source`,
      paint: {
        'line-color': [
          'case',
          ['get', 'isSelected'],
          '#FFEA00',
          side === 'right' ? '#FACC15' : '#FFFFFF',
        ],
        'line-width': ['case', ['get', 'isSelected'], 3.5, 2.0],
      },
    });
    map.addLayer({
      id: `${prefix}svamitva-labels`,
      type: 'symbol',
      source: `${prefix}svamitva-source`,
      minzoom: 17.0,
      layout: {
        'text-field': ['get', 'survey_plot_no'],
        'text-size': 10,
        'text-anchor': 'center',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#000000',
        'text-halo-width': 2.5,
      },
    });
    // Dedicated layer for selected parcel label (always visible at zoom >= 13.5)
    map.addLayer({
      id: `${prefix}svamitva-selected-label`,
      type: 'symbol',
      source: `${prefix}svamitva-source`,
      filter: ['==', ['get', 'isSelected'], true],
      minzoom: 13.5,
      layout: {
        'text-field': ['concat', 'Plot ', ['get', 'survey_plot_no']],
        'text-size': 12,
        'text-anchor': 'center',
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#FFEA00',
        'text-halo-color': '#000000',
        'text-halo-width': 3.5,
      },
    });

    // 3. Independent Road Vector Layers (Centreline & Boundary Corridors)
    map.addSource(`${prefix}road-source`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    // Road Corridor Boundary Fill (for Polygon/MultiPolygon roads)
    map.addLayer({
      id: `${prefix}road-boundary-fill`,
      type: 'fill',
      source: `${prefix}road-source`,
      filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
      paint: {
        'fill-color': '#475569',
        'fill-opacity': 0.75,
      },
    });
    // Road Corridor Boundary Outline
    map.addLayer({
      id: `${prefix}road-boundary-line`,
      type: 'line',
      source: `${prefix}road-source`,
      filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
      paint: {
        'line-color': '#1E293B',
        'line-width': 2.5,
      },
    });
    // Road Centerline Line & Casing (for LineString/MultiLineString roads)
    map.addLayer({
      id: `${prefix}road-centerline-casing`,
      type: 'line',
      source: `${prefix}road-source`,
      filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
      paint: {
        'line-color': '#0F172A',
        'line-width': 5.0,
      },
    });
    map.addLayer({
      id: `${prefix}road-centerline-line`,
      type: 'line',
      source: `${prefix}road-source`,
      filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
      paint: {
        'line-color': '#F59E0B',
        'line-width': 3.0,
        'line-dasharray': [2, 1],
      },
    });

    // 4. Potential Corridor Review Zones (Amber/Red Highlight)
    map.addSource(`${prefix}svamitva-conflict-source`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: `${prefix}svamitva-conflict-fill`,
      type: 'fill',
      source: `${prefix}svamitva-conflict-source`,
      paint: {
        'fill-color': '#DC2626',
        'fill-opacity': 0.65,
      },
    });
    map.addLayer({
      id: `${prefix}svamitva-conflict-line`,
      type: 'line',
      source: `${prefix}svamitva-conflict-source`,
      paint: {
        'line-color': '#991B1B',
        'line-width': 3.5,
      },
    });

    // Event Listeners for TRACGIS
    map.on('click', `${prefix}parcels-fill`, (e: any) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].properties?.id;
        if (id) {
          onSelectParcelRef.current(id);
          const clicked = parcelsRef.current.find((p) => p.id === id);
          if (clicked && clicked.geometry) {
            if (mapRef.current) fitToGeometry(mapRef.current, clicked.geometry);
            if (mapRightRef.current) fitToGeometry(mapRightRef.current, clicked.geometry);
          }
        }
      }
    });

    // Event Listeners for SVAMITVA
    map.on('click', `${prefix}svamitva-fill`, (e: any) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].id || e.features[0].properties?.property_id;
        if (id && onSelectSvamitvaParcelRef.current) {
          onSelectSvamitvaParcelRef.current(id);
          const clicked = svamitvaParcelsRef.current.find(
            (p) => p.id === id || p.properties?.property_id === id
          );
          if (clicked && clicked.geometry) {
            if (mapRef.current) fitToGeometry(mapRef.current, clicked.geometry);
            if (mapRightRef.current) fitToGeometry(mapRightRef.current, clicked.geometry);
          }
        }
      }
    });

    // Hover Tooltip for SVAMITVA (Left map only)
    if (side === 'left') {
      map.on('mousemove', `${prefix}svamitva-fill`, (e: any) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          setHoveredFeature({
            x: e.point.x,
            y: e.point.y,
            props: e.features[0].properties,
          });
        }
      });

      map.on('mouseleave', `${prefix}svamitva-fill`, () => {
        map.getCanvas().style.cursor = '';
        setHoveredFeature(null);
      });
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
      zoom: datasetMode === 'svamitva' ? 16.5 : 15.5,
      maxZoom: 20.0,
      minZoom: 4,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    mapRef.current = map;

    map.on('load', () => {
      setupLayersOnce(map, 'left');
      updateTracgisData(map, 'left');
      updateSvamitvaData(map, 'left');

      if (datasetMode === 'svamitva') {
        const target = svamitvaParcelsRef.current.find((p) => p.id === selectedSvamitvaParcelId) || svamitvaParcelsRef.current[0];
        if (target && target.geometry) fitToGeometry(map, target.geometry);
      } else {
        const selected = parcelsRef.current.find((p) => p.id === selectedParcelId) || parcelsRef.current[0];
        if (selected && selected.geometry) fitToGeometry(map, selected.geometry);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Data on State / Prop changes
  useEffect(() => {
    if (mapRef.current) {
      updateTracgisData(mapRef.current, 'left');
      updateSvamitvaData(mapRef.current, 'left');
    }
    if (mapRightRef.current) {
      updateTracgisData(mapRightRef.current, 'right');
      updateSvamitvaData(mapRightRef.current, 'right');
    }
  }, [
    updateTracgisData,
    updateSvamitvaData,
    datasetMode,
    parcels,
    selectedParcelId,
    svamitvaParcels,
    selectedSvamitvaParcelId,
    bufferDistance,
    encroachmentResults,
    roadFeatures,
    showBoundaries,
    showRoads,
    showBuffers,
    showEncroachments,
  ]);

  // Handle Dataset Mode Switch camera animation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (datasetMode === 'svamitva') {
      const target = svamitvaParcels.find((p) => p.id === selectedSvamitvaParcelId) || svamitvaParcels[0];
      if (target && target.geometry) {
        fitToGeometry(map, target.geometry);
        if (mapRightRef.current) fitToGeometry(mapRightRef.current, target.geometry);
      }
    } else {
      const target = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
      if (target && target.geometry) {
        fitToGeometry(map, target.geometry);
        if (mapRightRef.current) fitToGeometry(mapRightRef.current, target.geometry);
      }
    }
  }, [datasetMode]);

  // Fit viewport to full dataset bounds when a new survey dataset is loaded
  const prevSvamitvaCountRef = useRef<number>(svamitvaParcels.length);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || datasetMode !== 'svamitva' || svamitvaParcels.length === 0) return;

    if (prevSvamitvaCountRef.current !== svamitvaParcels.length) {
      prevSvamitvaCountRef.current = svamitvaParcels.length;
      try {
        const fc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: svamitvaParcels as any };
        const bbox = turf.bbox(fc);
        if (bbox && isFinite(bbox[0]) && isFinite(bbox[1]) && isFinite(bbox[2]) && isFinite(bbox[3])) {
          map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 60, duration: 900 });
          if (mapRightRef.current) {
            mapRightRef.current.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 60, duration: 900 });
          }
        }
      } catch (err) {
        console.warn('Dataset fitBounds error:', err);
      }
    }
  }, [svamitvaParcels, datasetMode]);

  // Automatically fly to selected TRACGIS parcel
  useEffect(() => {
    if (datasetMode !== 'tracgis' || !selectedParcelId) return;
    const target = parcels.find((p) => p.id === selectedParcelId);
    if (!target || !target.geometry) return;

    if (mapRef.current) fitToGeometry(mapRef.current, target.geometry);
    if (mapRightRef.current) fitToGeometry(mapRightRef.current, target.geometry);
  }, [selectedParcelId, selectionEpoch, parcels, fitToGeometry, datasetMode]);

  // Automatically fly to selected SVAMITVA parcel
  useEffect(() => {
    if (datasetMode !== 'svamitva' || !selectedSvamitvaParcelId) return;
    const target = svamitvaParcels.find((p) => p.id === selectedSvamitvaParcelId || p.properties?.property_id === selectedSvamitvaParcelId);
    if (!target || !target.geometry) return;

    if (mapRef.current) fitToGeometry(mapRef.current, target.geometry);
    if (mapRightRef.current) fitToGeometry(mapRightRef.current, target.geometry);
  }, [selectedSvamitvaParcelId, svamitvaParcels, fitToGeometry, datasetMode]);

  // Satellite Opacity Slider
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyOpacity = () => {
      if (map.getLayer('drone-layer')) {
        const op = isSplitView ? 0 : satelliteOpacity;
        map.setPaintProperty('drone-layer', 'raster-opacity', op);
      }
    };

    if (map.isStyleLoaded()) {
      applyOpacity();
    } else {
      map.once('styledata', applyOpacity);
    }
  }, [satelliteOpacity, isSplitView]);

  // Side-by-Side Split View Synchronization
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

    const mapRight = new maplibregl.Map({
      container: mapRightContainerRef.current,
      style: SATELLITE_BASE_STYLE,
      center: primary.getCenter(),
      zoom: primary.getZoom(),
      bearing: primary.getBearing(),
      pitch: primary.getPitch(),
      maxZoom: 20.0,
      minZoom: 4,
    });

    mapRight.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    mapRightRef.current = mapRight;

    mapRight.on('load', () => {
      setupLayersOnce(mapRight, 'right');
      updateTracgisData(mapRight, 'right');
      updateSvamitvaData(mapRight, 'right');
    });

    const syncLeftToRight = () => {
      if (activeDriverRef.current !== 'left' || !mapRightRef.current) return;
      mapRightRef.current.jumpTo({
        center: primary.getCenter(),
        zoom: primary.getZoom(),
        bearing: primary.getBearing(),
        pitch: primary.getPitch(),
      });
    };

    const syncRightToLeft = () => {
      if (activeDriverRef.current !== 'right' || !mapRef.current) return;
      mapRef.current.jumpTo({
        center: mapRight.getCenter(),
        zoom: mapRight.getZoom(),
        bearing: mapRight.getBearing(),
        pitch: mapRight.getPitch(),
      });
    };

    primary.on('movestart', () => {
      if (!activeDriverRef.current) activeDriverRef.current = 'left';
    });
    primary.on('move', syncLeftToRight);
    primary.on('moveend', () => {
      if (activeDriverRef.current === 'left') activeDriverRef.current = null;
    });

    mapRight.on('movestart', () => {
      if (!activeDriverRef.current) activeDriverRef.current = 'right';
    });
    mapRight.on('move', syncRightToLeft);
    mapRight.on('moveend', () => {
      if (activeDriverRef.current === 'right') activeDriverRef.current = null;
    });

    setTimeout(() => {
      primary.resize();
      mapRight.resize();
    }, 60);

    return () => {
      primary.off('movestart', () => {});
      primary.off('move', syncLeftToRight);
      primary.off('moveend', () => {});

      mapRight.off('movestart', () => {});
      mapRight.off('move', syncRightToLeft);
      mapRight.off('moveend', () => {});

      mapRight.remove();
      mapRightRef.current = null;
      primary.resize();
    };
  }, [isSplitView]);

  // Resize handler
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.resize();
      mapRightRef.current?.resize();
    }, 50);
    return () => clearTimeout(timer);
  }, [isMapExpanded, isSplitView]);

  const handleFocusSelected = () => {
    if (datasetMode === 'svamitva') {
      const target = svamitvaParcels.find((p) => p.id === selectedSvamitvaParcelId) || svamitvaParcels[0];
      if (target && target.geometry) {
        if (mapRef.current) fitToGeometry(mapRef.current, target.geometry);
        if (mapRightRef.current) fitToGeometry(mapRightRef.current, target.geometry);
      }
    } else {
      const selected = parcels.find((p) => p.id === selectedParcelId);
      if (selected && selected.geometry) {
        if (mapRef.current) fitToGeometry(mapRef.current, selected.geometry);
        if (mapRightRef.current) fitToGeometry(mapRightRef.current, selected.geometry);
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-[#E7DFD5] rounded-2xl overflow-hidden border border-[#E7DFD5] shadow-sm flex flex-col">
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-24px)]">
        {/* Split Screen Button */}
        <button
          onClick={() => setIsSplitView(!isSplitView)}
          className={`px-3 py-2 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
            isSplitView
              ? 'bg-[#23201F] text-white border-black'
              : 'bg-white/95 backdrop-blur-md text-[#23201F] border-[#E7DFD5] hover:bg-[#FAF7F2]'
          }`}
          title="Toggle Side-by-Side Comparison: Cadastral Street Map vs Satellite Imagery"
        >
          <Columns className="w-4 h-4 text-[#C85A32]" />
          <span>{isSplitView ? 'Exit Split View' : 'Split View (Street vs Sat)'}</span>
        </button>

        {/* SVAMITVA Metric Buffer Distance Quick Slider */}
        {datasetMode === 'svamitva' && onBufferDistanceChange && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E7DFD5] flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#23201F]">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Buffer (UTM):</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="20.0"
                step="0.5"
                value={bufferDistance}
                onChange={(e) => onBufferDistanceChange(parseFloat(e.target.value))}
                className="w-20 sm:w-28 h-1.5 bg-[#E7DFD5] rounded-lg appearance-none cursor-pointer accent-amber-600"
                title="Adjust metric buffer distance"
              />
              <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {bufferDistance.toFixed(1)}m
              </span>
            </div>
          </div>
        )}

        {/* Satellite Imagery Slider & Presets (When NOT in Split View) */}
        {!isSplitView && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#E7DFD5] flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#23201F]">
              <Satellite className="w-4 h-4 text-[#C85A32]" />
              <span className="hidden sm:inline">Satellite</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={satelliteOpacity}
                onChange={(e) => setSatelliteOpacity(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1.5 bg-[#E7DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                title="Adjust Satellite Layer Opacity"
              />
              <span className="text-[11px] font-mono font-bold text-[#383432]">
                {Math.round(satelliteOpacity * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
              <button
                onClick={() => setSatelliteOpacity(0)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  satelliteOpacity === 0 ? 'bg-[#23201F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Street
              </button>
              <button
                onClick={() => setSatelliteOpacity(1)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  satelliteOpacity === 1 ? 'bg-[#23201F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

      {/* Main Map Viewport (Side-by-Side Dual Split View) */}
      <div className="w-full h-full flex flex-1 overflow-hidden relative">
        {/* Left Map Pane: Cadastral Street Map */}
        <div
          ref={mapContainerRef}
          className={`h-full ${isSplitView ? 'w-1/2 border-r-2 border-[#C85A32]' : 'w-full'}`}
        />

        {/* Left Pane Badge */}
        {isSplitView && (
          <div className="absolute top-16 left-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow border border-[#E7DFD5] text-[11px] font-bold text-[#23201F] flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>🗺️ Cadastral Street Map</span>
          </div>
        )}

        {/* Right Map Pane: Esri Satellite Photogrammetry */}
        {isSplitView && <div ref={mapRightContainerRef} className="w-1/2 h-full relative" />}

        {/* Right Pane Badge */}
        {isSplitView && (
          <div className="absolute top-16 right-3 z-10 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>🛰️ Esri Satellite Photogrammetry</span>
          </div>
        )}

        {/* Hover Tooltip Popup for SVAMITVA */}
        {hoveredFeature && datasetMode === 'svamitva' && (
          <div
            className="absolute z-30 pointer-events-none bg-[#23201F]/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-2xl border border-white/20 text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-2 min-w-[200px]"
            style={{
              left: `${hoveredFeature.x}px`,
              top: `${hoveredFeature.y - 12}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-gray-600 pb-1">
              <span className="font-bold text-amber-400">
                Plot {hoveredFeature.props.survey_plot_no}
              </span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">
                {hoveredFeature.props.land_type}
              </span>
            </div>
            <p className="font-semibold text-white truncate">{hoveredFeature.props.owner_name}</p>
            <div className="flex items-center justify-between text-[11px] text-gray-300">
              <span>Drone Area:</span>
              <span className="font-mono font-bold text-emerald-400">
                {hoveredFeature.props.area_sq_mtr} m²
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Gharouni:</span>
              <span className="font-mono">{hoveredFeature.props.gharouni_card_no}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right Legend & Layer Toggles */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-[#E7DFD5] text-xs max-w-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-[#23201F] border-b border-gray-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>
              {datasetMode === 'svamitva'
                ? parcelMetadata?.state === 'UPLOADED_FILE'
                  ? `Imported Survey (${svamitvaParcels.filter(p => p.id !== 'svamitva-road-01' && p.properties?.land_type !== 'Public Road').length} Plots)`
                  : `Survey Analysis Demo (${svamitvaParcels.filter(p => p.id !== 'svamitva-road-01' && p.properties?.land_type !== 'Public Road').length} Plots)`
                : `TRACGIS Parcels (${parcels.length} Plots)`}
            </span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {datasetMode === 'svamitva'
              ? encroachmentResults?.metadata?.analysis_crs || 'EPSG:32644'
              : 'EPSG:4326'}
          </span>
        </div>

        {/* Legend Swatches */}
        {datasetMode === 'svamitva' ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-[#383432]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#0284C7] border border-black/20 shrink-0" />
              <span>
                {parcelMetadata?.state === 'UPLOADED_FILE'
                  ? 'Imported Parcels'
                  : 'Demo Parcels'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#475569] border border-black/20 shrink-0" />
              <span>
                {roadMetadata?.state === 'IMPORTED_ROAD' || roadMetadata?.state === 'PUBLIC_VECTOR_ROAD'
                  ? 'Vector Road Corridor'
                  : 'Demo Road Geometry'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#F59E0B] border border-dashed border-amber-800 shrink-0" />
              <span>Corridor ({bufferDistance}m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#DC2626] border border-black/20 shrink-0" />
              <span>Potential Review Area</span>
            </div>
          </div>
        ) : (
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
              <span className="w-3 h-3 rounded-xs bg-[#DC2626] border border-black/20 shrink-0" />
              <span>Critical Encroachment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#0284C7] border border-black/20 shrink-0" />
              <span>Notified FTL / Buffer</span>
            </div>
          </div>
        )}

        {/* Layer Checkboxes */}
        <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6B6360] flex-wrap gap-1">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showBoundaries}
              onChange={(e) => setShowBoundaries(e.target.checked)}
              className="accent-[#C85A32]"
            />
            <span className="font-medium text-[#23201F]">Parcels</span>
          </label>
          {datasetMode === 'svamitva' && (
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showRoads}
                onChange={(e) => setShowRoads(e.target.checked)}
                className="accent-slate-700"
              />
              <span className="font-medium text-slate-800">Roads</span>
            </label>
          )}
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={(e) => setShowBuffers(e.target.checked)}
              className="accent-amber-600"
            />
            <span className="font-medium text-[#23201F]">Buffers</span>
          </label>
          {datasetMode === 'svamitva' && (
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showEncroachments}
                onChange={(e) => setShowEncroachments(e.target.checked)}
                className="accent-red-600"
              />
              <span className="font-medium text-red-700">Review</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
