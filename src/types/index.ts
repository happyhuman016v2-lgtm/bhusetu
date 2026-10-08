export type TrustGrade = 'A' | 'B' | 'C' | 'D' | 'F';
export type ParcelStatus = 'CLEAN' | 'WARNING' | 'CRITICAL';
export type Role = 'citizen' | 'officer';

export interface Violation {
  id: string;
  type: 'WATERBODY_BUFFER_ENCROACHMENT' | 'ROAD_SETBACK_ENCROACHMENT' | 'AREA_RECORD_MISMATCH' | 'UNRESOLVED_ENCUMBRANCE';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  encroachmentAreaSqm?: number;
  bufferNotifiedDistanceM?: number;
  statutoryClause?: string;
}

export interface Encumbrance {
  id?: string;
  date: string;
  bankOrCourt?: string;
  type: string;
  amountRupees?: number;
  details?: string;
  status: string;
}

export interface NearestRevenueOffice {
  officeName: string;
  officeType: string;
  jurisdiction: string;
  distanceKm: number;
  address: string;
  officerName: string;
  designation: string;
  phone: string;
  altPhone?: string;
  email: string;
  grievanceHours: string;
  emergencyHelpline: string;
}

export interface CoOwner {
  id: string;
  name: string;
  shareFraction: number; // e.g. 0.5
  relationship: string;
}

export interface SubParcelSplit {
  shareholderId: string;
  shareholderName: string;
  sharePercentage: number;
  areaSqm: number;
  regionalAreaFormatted: string;
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
  color: string;
  roadFrontageMetres: number;
  subSurveyNo: string;
}

export interface PartitionResult {
  id: string;
  parcelId: string;
  totalAreaSqm: number;
  splits: SubParcelSplit[];
  parityScore: number;
  createdDate: string;
  status: 'DRAFT' | 'OFFICER_REVIEW_PENDING' | 'STATUTORY_APPROVED';
}

export interface Parcel {
  id: string;
  ulpin: string; // 14-digit Bhu-Aadhaar
  surveyNumber: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  owner: {
    name: string;
    fatherOrHusbandName?: string;
    type: string;
    jointOwners?: string[];
  };
  area: {
    rorSqm: number;
    gisSqm: number;
    regionalUnit: string;
    regionalValue: string;
  };
  landUse: string;
  tax: {
    status: string;
    lastPaidDate: string;
    annualDemandRupees: number;
    receiptNumber?: string;
  };
  encumbrances: Encumbrance[];
  status: ParcelStatus;
  trustScore: number;
  trustGrade: TrustGrade;
  violations: Violation[];
  geometry: GeoJSON.Feature<GeoJSON.Polygon>;
  conflictOverlay?: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
  bufferZone?: {
    name: string;
    type: 'Waterbody FTL' | 'National Highway Setback' | 'Forest Reserve';
    geometry: GeoJSON.Feature<GeoJSON.Polygon>;
  };
  nearestOffice: NearestRevenueOffice;
  coOwners: CoOwner[];
  activePartition?: PartitionResult;
}

export interface OfficerAuditEntry {
  id: string;
  timestamp: string;
  officerName: string;
  designation: string;
  action: 'PARTITION_MUTATION_APPROVED' | 'DEMOLITION_NOTICE_ISSUED' | 'DISCREPANCY_REINSPECT_FLAGGED' | 'TRUST_SCORE_VERIFIED' | 'DRONE_RESURVEY_ORDERED';
  parcelId: string;
  surveyNumber: string;
  details: string;
  hash: string;
}

export interface SvamitvaParcelProperties {
  property_id: string;
  survey_plot_no: string;
  owner_name: string;
  father_husband_name: string;
  area_sq_mtr: number;
  gharouni_card_no: string;
  land_type: string;
  scheme: string;
  survey_technology: string;
  survey_date: string;
  accuracy_class: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  village_lgd_code: string;
  is_public_road_adjacent: boolean;
}

export interface SvamitvaParcel {
  type: 'Feature';
  id: string;
  geometry: GeoJSON.Polygon;
  properties: SvamitvaParcelProperties;
}

export interface EncroachmentConflict {
  type: 'Feature';
  id: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: {
    conflict_type: string;
    dispute_severity: 'CRITICAL' | 'WARNING' | 'INFO';
    overlap_area_sqm: number;
    encroaching_parcel_id: string;
    survey_plot_no: string;
    owner_name: string;
    gharouni_card_no: string;
    affected_asset: string;
    buffer_distance_tested_m: number;
    statutory_clause: string;
    dispute_risk_score: number;
  };
}

export interface EncroachmentAnalysisResult {
  type: 'FeatureCollection';
  name: string;
  features: EncroachmentConflict[];
  metadata: {
    total_conflicts_detected: number;
    total_encroachment_sqm: number;
    tested_buffer_meters: number;
    critical_disputes_count: number;
    warning_disputes_count: number;
  };
}

export interface ChauhaddiNeighbor {
  boundary_type: 'PARCEL' | 'PUBLIC_ROAD' | 'CORRIDOR';
  plot_no: string;
  owner: string;
  land_type?: string;
  property_id?: string;
  description: string;
}

export interface RoRPattadar {
  pattadar_id: string;
  name: string;
  relation: string;
  share_pct: number;
  equity_area_sqm: number;
  status: string;
}

export interface RoREncumbrance {
  encumbrance_id: string;
  type: string;
  institution: string;
  description: string;
  registered_date: string;
  amount_rupees?: number;
  status: string;
}

export interface RoRDisputeFlag {
  flag_code: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  statutory_ref: string;
}

export interface RoRDossier {
  parcel_id: string;
  ulpin: string;
  scheme: string;
  gharouni_card_no: string;
  khata_number: string;
  khasra_number: string;
  survey_plot_no: string;
  tenure_type: string;
  spatial: {
    centroid_wgs84: [number, number];
    actual_drone_area_sqm: number;
    actual_drone_area_acres: number;
    accuracy_class: string;
    survey_date: string;
  };
  legal_registry: {
    recorded_legal_area_sqm: number;
    recorded_legal_area_acres: number;
    area_unit_regional: string;
    registry_source: string;
  };
  variance_analysis: {
    variance_sqm: number;
    variance_pct: number;
    within_statutory_tolerance: boolean;
    evaluation: string;
  };
  chauhaddi: {
    north: ChauhaddiNeighbor;
    south: ChauhaddiNeighbor;
    east: ChauhaddiNeighbor;
    west: ChauhaddiNeighbor;
  };
  pattadars: RoRPattadar[];
  encumbrances: RoREncumbrance[];
  dispute_flags: RoRDisputeFlag[];
  title_confidence: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: string;
  };
  location: {
    village: string;
    tehsil: string;
    district: string;
    state: string;
    village_lgd_code: string;
  };
}

export interface PropertyCardCertificate {
  certificate_type: string;
  issuing_authority: string;
  ulpin: string;
  gharouni_card_no: string;
  khata_number: string;
  khasra_number: string;
  survey_plot_no: string;
  tenure_category: string;
  pattadar_summary: RoRPattadar[];
  primary_owner: string;
  father_husband_name: string;
  spatial_footprint: {
    uav_drone_area_sqm: number;
    uav_drone_area_acres: number;
    regional_area_display: string;
    centroid_coordinates: [number, number];
    accuracy_class: string;
    survey_date: string;
  };
  variance_audit: {
    recorded_revenue_area_sqm: number;
    variance_percentage: string;
    statutory_tolerance_status: string;
  };
  chauhaddi_boundaries: string;
  title_confidence: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: string;
  };
  encumbrance_status: string;
  qr_verification: {
    qr_hash: string;
    verification_url: string;
    ledger_anchor: string;
  };
  statutory_memorandum: string;
  location: {
    village: string;
    tehsil: string;
    district: string;
    state: string;
    village_lgd_code: string;
  };
}


