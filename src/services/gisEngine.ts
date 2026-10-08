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

/**
 * Computes deterministic spatial analysis and heuristic trust score for a land parcel
 */
export function analyzeParcelSpatialIntegrity(parcel: Parcel): SpatialConflictReport {
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

  // 1. Check 2D Buffer Encroachments (Waterbody FTL or Highway Setback)
  if (parcel.bufferZone && parcel.bufferZone.geometry) {
    try {
      const intersection = turf.intersect(
        turf.featureCollection([geom, parcel.bufferZone.geometry])
      );

      if (intersection) {
        const overlapArea = Math.round(turf.area(intersection) * 10) / 10;
        if (overlapArea > 5) {
          // Threshold of 5 sqm to ignore micro raster-vertex errors
          hasEncroachment = true;
          encroachmentAreaSqm = overlapArea;
          encroachmentRatio = Math.round((overlapArea / gisArea) * 1000) / 10;
          encroachmentPolygon = intersection as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

          const isWaterbody = parcel.bufferZone.type.toLowerCase().includes('water') || parcel.bufferZone.type.toLowerCase().includes('ftl');
          detectedViolations.push({
            id: `encroach-${parcel.id}`,
            type: isWaterbody ? 'WATERBODY_BUFFER_ENCROACHMENT' : 'ROAD_SETBACK_ENCROACHMENT',
            severity: 'CRITICAL',
            title: isWaterbody ? 'Buffer Zone Encroachment (Waterbody FTL)' : 'Statutory Road Setback Encroachment',
            description: `Plot geometry overlaps ${encroachmentAreaSqm} m² (${encroachmentRatio}% of total area) into the notified ${parcel.bufferZone.name}.`,
            encroachmentAreaSqm,
            statutoryClause: isWaterbody
              ? 'Telangana HYDRAA Act / TN Water Resources Conservation Act (Sec 14)'
              : 'National Highways Development Act, Setback Regulations 2021',
          });
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

  // Deduction for buffer encroachment (severe penalty)
  if (hasEncroachment) {
    trustScore -= Math.min(50, Math.max(30, Math.round(encroachmentRatio * 1.5)));
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
