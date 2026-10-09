import * as turf from '@turf/turf';
import { Parcel, TrustGrade, ParcelStatus, Violation } from '../types';

export interface SpatialConflictReport {
  calculatedGisAreaSqm: number;
  areaDeltaSqm: number;
  areaDeltaPercent: number;
  hasEncroachment: boolean;
  encroachmentAreaSqm: number;
  encroachmentRatio: number;
  encroachmentPolygon: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null;
  trustScore: number;
  trustGrade: TrustGrade;
  status: ParcelStatus;
  detectedViolations: Violation[];
}

export interface BufferZoneItem {
  id?: string;
  name: string;
  type: string;
  geometry: GeoJSON.Feature<GeoJSON.Polygon> | GeoJSON.Polygon;
}

/**
 * Computes deterministic spatial analysis and heuristic trust score for a land parcel
 */
export function analyzeParcelSpatialIntegrity(
  parcel: Parcel,
  allBufferZones?: BufferZoneItem[]
): SpatialConflictReport {
  const geom = parcel.geometry;
  const gisArea = Math.round(turf.area(geom) * 10) / 10;
  const rorArea = parcel.area.rorSqm;

  const areaDelta = Math.abs(gisArea - rorArea);
  const areaDeltaPercent = Math.round((areaDelta / rorArea) * 1000) / 10;

  let hasEncroachment = false;
  let encroachmentAreaSqm = 0;
  let encroachmentRatio = 0;
  let encroachmentPolygon: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null = null;
  const detectedViolations: Violation[] = [];

  // Compile list of buffers to evaluate: either provided allBufferZones or parcel's own bufferZone
  const buffersToCheck: BufferZoneItem[] = [];
  if (allBufferZones && allBufferZones.length > 0) {
    buffersToCheck.push(...allBufferZones);
  } else if (parcel.bufferZone && parcel.bufferZone.geometry) {
    buffersToCheck.push(parcel.bufferZone);
  }

  // 1. Check 2D Buffer Encroachments against all applicable buffers
  for (const bz of buffersToCheck) {
    if (!bz || !bz.geometry) continue;
    try {
      const bzGeom = (bz.geometry as any).type === 'Feature' ? (bz.geometry as any) : turf.feature(bz.geometry as any);
      const intersection = turf.intersect(
        turf.featureCollection([geom, bzGeom])
      );

      if (intersection) {
        const overlapArea = Math.round(turf.area(intersection) * 10) / 10;
        if (overlapArea > 5) {
          // Threshold of 5 sqm to ignore micro raster-vertex errors
          hasEncroachment = true;
          encroachmentAreaSqm = Math.max(encroachmentAreaSqm, overlapArea);
          const currentRatio = Math.round((overlapArea / gisArea) * 1000) / 10;
          encroachmentRatio = Math.max(encroachmentRatio, currentRatio);
          encroachmentPolygon = intersection as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

          const bzType = bz.type || 'Waterbody FTL';
          const isWaterbody = bzType.toLowerCase().includes('water') || bzType.toLowerCase().includes('ftl');
          
          // Avoid duplicate violation types for the same parcel
          const violationId = `encroach-${parcel.id}-${bz.name.replace(/\s+/g, '-').slice(0, 15)}`;
          if (!detectedViolations.some(v => v.id === violationId)) {
            detectedViolations.push({
              id: violationId,
              type: isWaterbody ? 'WATERBODY_BUFFER_ENCROACHMENT' : 'ROAD_SETBACK_ENCROACHMENT',
              severity: 'CRITICAL',
              title: isWaterbody ? 'Buffer Zone Encroachment (Waterbody FTL)' : 'Statutory Road Setback Encroachment',
              description: `Plot geometry overlaps ${overlapArea} m² (${currentRatio}% of total area) into the notified ${bz.name}.`,
              encroachmentAreaSqm: overlapArea,
              statutoryClause: isWaterbody
                ? 'Telangana HYDRAA Act / TN Water Resources Conservation Act (Sec 14)'
                : 'National Highways Development Act, Setback Regulations 2021',
            });
          }
        }
      }
    } catch (e) {
      console.warn('Buffer intersection evaluation skipped:', e);
    }
  }

  // 2. Area Discrepancy Check (> 5% discrepancy flagged)
  if (areaDeltaPercent > 5) {
    detectedViolations.push({
      id: `mismatch-${parcel.id}`,
      type: 'AREA_RECORD_MISMATCH',
      severity: areaDeltaPercent > 12 ? 'CRITICAL' : 'WARNING',
      title: 'Cadastral RoR vs Geodesic GIS Area Discrepancy',
      description: `Discrepancy of ${areaDelta.toFixed(1)} m² (${areaDeltaPercent}%) detected between RoR Title (${rorArea} m²) and Satellite Geodesic Boundary (${gisArea} m²).`,
      encroachmentAreaSqm: Math.round(areaDelta),
      statutoryClause: 'Survey and Boundaries Act, Section 9 (Discrepancy Rectification Required)',
    });
  }

  // 3. Encumbrance & Legal Check
  const activeEncumbrances = parcel.encumbrances.filter((e) => e.status === 'Active');
  if (activeEncumbrances.length > 0) {
    detectedViolations.push({
      id: `encumbrance-${parcel.id}`,
      type: 'UNRESOLVED_ENCUMBRANCE',
      severity: 'WARNING',
      title: 'Active Financial / Judicial Encumbrance',
      description: `${activeEncumbrances.length} unresolved encumbrance(s): ${activeEncumbrances.map((e) => `${e.type} (${e.bankOrCourt})`).join(', ')}.`,
      statutoryClause: 'Registration Act 1908, Sec 17 & Transfer of Property Act Sec 52',
    });
  }

  // 4. Deterministic Trust Score Heuristic (0 to 100)
  let trustScore = 100;

  // Deduction for area mismatch
  if (areaDeltaPercent > 10) {
    trustScore -= 25;
  } else if (areaDeltaPercent > 4) {
    trustScore -= 12;
  }

  // Deduction for buffer encroachment (severe penalty: statutory illegal intrusion)
  if (hasEncroachment) {
    // Statutory intrusion drops trust score drastically (maximum score allowed for encroached parcel is 45)
    const encroachmentPenalty = Math.max(55, Math.min(85, 55 + Math.round(encroachmentRatio * 0.4)));
    trustScore -= encroachmentPenalty;
  }

  // Deduction for tax overdue
  if (parcel.tax.status === 'Overdue') {
    trustScore -= 15;
  } else if (parcel.tax.status === 'Pending') {
    trustScore -= 5;
  }

  // Deduction for active encumbrances
  if (activeEncumbrances.length > 0) {
    trustScore -= 15 * activeEncumbrances.length;
  }

  trustScore = Math.max(10, Math.min(100, trustScore));

  // Determine Grade & Status
  let trustGrade: TrustGrade = 'F';
  if (trustScore >= 90) trustGrade = 'A';
  else if (trustScore >= 75) trustGrade = 'B';
  else if (trustScore >= 60) trustGrade = 'C';
  else if (trustScore >= 45) trustGrade = 'D';

  let status: ParcelStatus = 'CLEAN';
  if (trustScore < 50 || hasEncroachment) {
    status = 'CRITICAL';
  } else if (trustScore < 85 || activeEncumbrances.length > 0 || areaDeltaPercent > 4) {
    status = 'WARNING';
  }

  return {
    calculatedGisAreaSqm: gisArea,
    areaDeltaSqm: areaDelta,
    areaDeltaPercent,
    hasEncroachment,
    encroachmentAreaSqm,
    encroachmentRatio,
    encroachmentPolygon,
    trustScore,
    trustGrade,
    status,
    detectedViolations,
  };
}

export interface DynamicChauhaddi {
  north: { label: string; subtext: string; tag: string };
  south: { label: string; subtext: string; tag: string };
  east: { label: string; subtext: string; tag: string };
  west: { label: string; subtext: string; tag: string };
}

/**
 * Computes deterministic 4-Point Boundary Cadastral Neighbors (Chauhaddi)
 * by probing outward from the target parcel's bounding box across adjacent parcels.
 */
export function computeChauhaddiNeighbors(
  targetParcel: Parcel,
  allParcels: Parcel[]
): DynamicChauhaddi {
  try {
    const targetGeom = targetParcel.geometry;
    const bbox = turf.bbox(targetGeom); // [minX, minY, maxX, maxY]
    const centroid = turf.centroid(targetGeom).geometry.coordinates; // [lng, lat]
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];
    const probeDist = Math.max(width, height) * 0.45 + 0.00008; // ~8-15m probe

    const probes = {
      north: turf.point([centroid[0], bbox[3] + probeDist]),
      south: turf.point([centroid[0], bbox[1] - probeDist]),
      east: turf.point([bbox[2] + probeDist, centroid[1]]),
      west: turf.point([bbox[0] - probeDist, centroid[1]]),
    };

    const result: DynamicChauhaddi = {
      north: { label: 'Agricultural Field Ridge', subtext: 'North Village Cadastral Boundary', tag: 'Field' },
      south: { label: 'Public Access Corridor', subtext: 'Village Right-of-Way Roadway', tag: 'Corridor' },
      east: { label: 'Adjacent Survey Holding', subtext: 'Registered Freehold Land', tag: 'Freehold' },
      west: { label: 'Natural Field Boundary', subtext: 'Natural Ridge / Irrigation Drainage', tag: 'Natural' },
    };

    const directions = ['north', 'south', 'east', 'west'] as const;

    for (const dir of directions) {
      const probePt = probes[dir];
      let closestParcel: Parcel | null = null;
      let minDistance = Infinity;

      for (const p of allParcels) {
        if (p.id === targetParcel.id || !p.geometry) continue;
        try {
          // Distance from probe point to neighbor parcel polygon
          const dist = turf.pointToPolygonDistance(probePt, p.geometry as any, { units: 'meters' });
          if (dist < minDistance && dist < 45) { // within 45 meters
            minDistance = dist;
            closestParcel = p;
          }
        } catch {
          // fallback ignore
        }
      }

      if (closestParcel) {
        result[dir] = {
          label: `Survey ${closestParcel.surveyNumber}`,
          subtext: `${closestParcel.owner.name} (${closestParcel.landUse || 'Agricultural'})`,
          tag: 'Patta',
        };
      } else {
        // Descriptive directional abuttal based on orientation
        if (dir === 'north') {
          result.north = { label: 'North Village Abuttal', subtext: 'Statutory Village Boundary', tag: 'Abuttal' };
        } else if (dir === 'south') {
          result.south = { label: 'Public Right-of-Way', subtext: 'Village Connecting Access Road', tag: 'Road' };
        } else if (dir === 'east') {
          result.east = { label: 'Field Ridge / Channel', subtext: 'Irrigation Abuttal', tag: 'Freehold' };
        } else if (dir === 'west') {
          result.west = { label: 'West Field Ridge', subtext: 'Adjacent Holding Abuttal', tag: 'Patta' };
        }
      }
    }

    return result;
  } catch (err) {
    console.warn('Failed to compute spatial Chauhaddi:', err);
    return {
      north: { label: `Survey TS-${targetParcel.surveyNumber}-N`, subtext: 'Adjoining Agricultural Patta', tag: 'Patta' },
      south: { label: 'Public Right-of-Way', subtext: '4m Paved Village Access Road', tag: 'Corridor' },
      east: { label: `Survey TS-${targetParcel.surveyNumber}-E`, subtext: 'Statutory Freehold Boundary', tag: 'Freehold' },
      west: { label: 'Field Ridge / Watercourse', subtext: 'Natural Drainage Boundary', tag: 'Natural' },
    };
  }
}
