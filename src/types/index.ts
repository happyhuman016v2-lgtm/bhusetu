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
  id: string;
  date: string;
  bankOrCourt: string;
  type: 'Bank Mortgage' | 'Civil Partition Suit' | 'Court Injunction' | 'Nil';
  amountRupees?: number;
  status: 'Active' | 'Resolved';
}

export interface NearestRevenueOffice {
  officeName: string;
  officeType: 'Sub-Registrar Office (Registration Dept)' | 'Tahsildar / Taluk Revenue Office' | 'Village Administrative Office (VAO)';
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
    type: 'Individual' | 'Joint / Co-owners' | 'Government' | 'Ancestral Estate';
    jointOwners?: string[];
  };
  area: {
    rorSqm: number;
    gisSqm: number;
    regionalUnit: 'Acre' | 'Cent' | 'Guntha' | 'Bigha' | 'Sq. Yard';
    regionalValue: string;
  };
  landUse: 'Agricultural' | 'Residential' | 'Commercial' | 'Buffer Reserve';
  tax: {
    status: 'Paid' | 'Pending' | 'Overdue';
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
  action: 'PARTITION_MUTATION_APPROVED' | 'DEMOLITION_NOTICE_ISSUED' | 'DISCREPANCY_REINSPECT_FLAGGED' | 'TRUST_SCORE_VERIFIED';
  parcelId: string;
  surveyNumber: string;
  details: string;
  hash: string;
}
