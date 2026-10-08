import { Parcel } from '../types';

export const INITIAL_PARCELS: Parcel[] = [
  {
    "id": "parcel-1",
    "ulpin": "14-8842-9901-2020",
    "surveyNumber": "TS-SNG-AMP-433",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Ramesh Reddy",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 35103.9,
      "gisSqm": 35103.9,
      "regionalUnit": "Guntha",
      "regionalValue": "8.67 Acres (347.0 Gunthas)"
    },
    "landUse": "Residential Zone R1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-11-20",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025000"
    },
    "encumbrances": [
      {
        "date": "2021-04-12",
        "type": "Registered Sale Deed",
        "details": "Sub-Registrar Sangareddy Document #2104/2021",
        "status": "Clean"
      },
      {
        "date": "2023-01-15",
        "type": "Property Tax Clearance",
        "details": "GHMC Municipal Tax NOC #TX-88319",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 96,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-1",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3268252,
              17.5507838
            ],
            [
              78.3267109,
              17.5498922
            ],
            [
              78.3266829,
              17.5497267
            ],
            [
              78.3267256,
              17.5496279
            ],
            [
              78.3269224,
              17.5493723
            ],
            [
              78.3270519,
              17.5492464
            ],
            [
              78.3269223,
              17.5491162
            ],
            [
              78.3267705,
              17.5489262
            ],
            [
              78.3265756,
              17.548764
            ],
            [
              78.3264361,
              17.5486605
            ],
            [
              78.3263017,
              17.548731
            ],
            [
              78.3253291,
              17.5493798
            ],
            [
              78.3251879,
              17.549468
            ],
            [
              78.3251876,
              17.5496517
            ],
            [
              78.3251673,
              17.5503715
            ],
            [
              78.3251601,
              17.5506272
            ],
            [
              78.3251545,
              17.5507833
            ],
            [
              78.325301,
              17.5508061
            ],
            [
              78.3254571,
              17.5508232
            ],
            [
              78.3257798,
              17.5508578
            ],
            [
              78.3259246,
              17.5508743
            ],
            [
              78.3261047,
              17.5508567
            ],
            [
              78.3266608,
              17.5508043
            ],
            [
              78.3268252,
              17.5507838
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-1",
        "ulpin": "14-8842-9901-2020",
        "state_survey_no": "TS-SNG-AMP-433",
        "survey_number": "TS-SNG-AMP-433",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Ramesh Reddy",
        "owner_masked": "R***sh R***dy",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 35103.9,
        "gis_area_sqm": 35103.9,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 96,
        "zoning": "Residential Zone R1",
        "classification": "Residential Zone R1",
        "tax_status": "Paid",
        "tax_amount": "₹12,400",
        "tax_last_paid": "2025-11-20",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved (G+2 Sanctioned)",
        "building": {
          "sanctioned": {
            "height": 9.5,
            "floors": 3,
            "far": 1.4
          },
          "detected": {
            "height": 9.4,
            "floors": 3,
            "far": 1.38
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2021-04-12",
            "type": "Registered Sale Deed",
            "details": "Sub-Registrar Sangareddy Document #2104/2021",
            "status": "Clean"
          },
          {
            "date": "2023-01-15",
            "type": "Property Tax Clearance",
            "details": "GHMC Municipal Tax NOC #TX-88319",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-1-1",
        "name": "Ramesh (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-1-2",
        "name": "Co-owner 1",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-2",
    "ulpin": "14-8842-9901-2021",
    "surveyNumber": "TS-RR-SUR-401/1A",
    "village": "Madhapur",
    "taluk": "Shaikpet Mandal",
    "district": "Hyderabad",
    "state": "Telangana",
    "owner": {
      "name": "Sunil Ganapathi",
      "type": "Private Commercial / Encroacher"
    },
    "area": {
      "rorSqm": 4500,
      "gisSqm": 4515,
      "regionalUnit": "Guntha",
      "regionalValue": "1.12 Acres (44.6 Gunthas)"
    },
    "landUse": "Waterbody Buffer (FTL)",
    "tax": {
      "status": "Defaulter / Disputed",
      "lastPaidDate": "2023-04-01",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025001"
    },
    "encumbrances": [
      {
        "date": "2024-06-20",
        "type": "HYDRAA Statutory Notice",
        "details": "Encroachment inside Durgam Cheruvu FTL buffer — Demolition Review",
        "status": "Active"
      },
      {
        "date": "2024-09-02",
        "type": "High Court Interim Stay",
        "details": "Writ Petition #18492/2024 pending hearing",
        "status": "Active"
      }
    ],
    "status": "CRITICAL",
    "trustScore": 14,
    "trustGrade": "F",
    "violations": [
      {
        "id": "vio-2",
        "type": "WATERBODY_BUFFER_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Full Tank Level (FTL) Lake Buffer Encroachment",
        "description": "Cadastral parcel intrudes into notified lake/kunta water catchment buffer line.",
        "encroachmentAreaSqm": 813,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-2",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3849,
              17.4344
            ],
            [
              78.3857,
              17.4344
            ],
            [
              78.3857,
              17.4338
            ],
            [
              78.3849,
              17.4338
            ],
            [
              78.3849,
              17.4344
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-2",
        "ulpin": "14-8842-9901-2021",
        "state_survey_no": "TS-RR-SUR-401/1A",
        "survey_number": "TS-RR-SUR-401/1A",
        "state": "Telangana",
        "district": "Hyderabad",
        "mandal": "Shaikpet",
        "village": "Madhapur",
        "census_code": "574044",
        "dmv_code": "1738012",
        "owner_name": "Sunil Ganapathi",
        "owner_masked": "S***l G***ti",
        "owner_type": "Private Commercial / Encroacher",
        "legal_ror_area_sqm": 4500,
        "gis_area_sqm": 4515,
        "area_diff_sqm": 15,
        "area_diff_pct": 0.33,
        "status": "CRITICAL",
        "trust_score": "F",
        "trust_num": 14,
        "zoning": "Waterbody Buffer (FTL)",
        "classification": "Waterbody Buffer (FTL)",
        "tax_status": "Defaulter / Disputed",
        "tax_amount": "₹42,000",
        "tax_last_paid": "2023-04-01",
        "dispute_tag": "CRITICAL_FTL_ENCROACHMENT",
        "permit_status": "Unsanctioned / Illegal Construction",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Commercial Warehouse",
            "height": 8.5,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-HYDRAA-01",
            "severity": "CRITICAL",
            "type": "FTL_ENCROACHMENT",
            "description": "CRITICAL: Illegal Commercial Warehouse inside Durgam Cheruvu 30m FTL Lake Buffer",
            "details": "Structure encroaches 2,818.4 m² past notified Full Tank Level (FTL) buffer boundary line. Statutory Demolition Notice required.",
            "encroachment_area_sqm": 2818.4
          }
        ],
        "buffer_zones": [
          {
            "type": "Feature",
            "properties": {
              "name": "Durgam Cheruvu 30m FTL Buffer",
              "type": "waterbody_ftl"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    78.3797,
                    17.4337
                  ],
                  [
                    78.381,
                    17.4346
                  ],
                  [
                    78.3827,
                    17.4352
                  ],
                  [
                    78.3842,
                    17.435
                  ],
                  [
                    78.3853,
                    17.4342
                  ],
                  [
                    78.3858,
                    17.4327
                  ],
                  [
                    78.3855,
                    17.4311
                  ],
                  [
                    78.3844,
                    17.43
                  ],
                  [
                    78.3826,
                    17.4297
                  ],
                  [
                    78.381,
                    17.4304
                  ],
                  [
                    78.38,
                    17.4316
                  ],
                  [
                    78.3797,
                    17.4337
                  ]
                ]
              ]
            }
          }
        ],
        "encumbrances": [
          {
            "date": "2024-06-20",
            "type": "HYDRAA Statutory Notice",
            "details": "Encroachment inside Durgam Cheruvu FTL buffer — Demolition Review",
            "status": "Active"
          },
          {
            "date": "2024-09-02",
            "type": "High Court Interim Stay",
            "details": "Writ Petition #18492/2024 pending hearing",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.3846,
                17.433500000000002
              ],
              [
                78.386,
                17.433500000000002
              ],
              [
                78.386,
                17.4343
              ],
              [
                78.3846,
                17.4343
              ],
              [
                78.3846,
                17.433500000000002
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Revenue Divisional Office (RDO) Serilingampally / HYDRAA Central Wing",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Serilingampally Revenue Division / Zone 4",
      "distanceKm": 1.8,
      "address": "Opp. Mandal Revenue Office, Chanda Nagar, Hyderabad - 500050",
      "officerName": "Smt. V. Anitha, I.A.S.",
      "designation": "Revenue Divisional Officer & Executive Magistrate",
      "phone": "+91 40 2345 6112",
      "altPhone": "+91 94409 01822",
      "email": "rdo.serilingampally@telangana.gov.in",
      "grievanceHours": "Monday Prajavani: 10:00 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (HYDRAA Lake Protection Helpline)"
    },
    "coOwners": [
      {
        "id": "co-2-1",
        "name": "Sunil (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-2-2",
        "name": "Co-owner 2",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-3",
    "ulpin": "07-8842-9901-2022",
    "surveyNumber": "DL-MCD-LJP-108/4",
    "village": "Lajpat Nagar",
    "taluk": "Defence Colony Mandal",
    "district": "South Delhi",
    "state": "Delhi NCT",
    "owner": {
      "name": "Arvind Sharma",
      "type": "Joint Urban Freehold"
    },
    "area": {
      "rorSqm": 220,
      "gisSqm": 218,
      "regionalUnit": "Guntha",
      "regionalValue": "2.2 Gunthas"
    },
    "landUse": "Dense Mixed Commercial",
    "tax": {
      "status": "Overdue",
      "lastPaidDate": "2023-08-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025002"
    },
    "encumbrances": [
      {
        "date": "2025-01-10",
        "type": "MCD Stop-Work Order",
        "details": "Unauthorized construction beyond G+2 sanction",
        "status": "Active"
      },
      {
        "date": "2020-07-22",
        "type": "Registered Sale Deed",
        "details": "Sub-registrar SRO-III, South Delhi",
        "status": "Cleared"
      }
    ],
    "status": "WARNING",
    "trustScore": 32,
    "trustGrade": "C",
    "violations": [
      {
        "id": "vio-3",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 39,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-3",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.2395,
              28.5698
            ],
            [
              77.2401,
              28.5699
            ],
            [
              77.2402,
              28.5694
            ],
            [
              77.2396,
              28.5693
            ],
            [
              77.2395,
              28.5698
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-3",
        "ulpin": "07-8842-9901-2022",
        "state_survey_no": "DL-MCD-LJP-108/4",
        "survey_number": "DL-MCD-LJP-108/4",
        "state": "Delhi NCT",
        "district": "South Delhi",
        "mandal": "Defence Colony",
        "village": "Lajpat Nagar",
        "census_code": "058721",
        "dmv_code": "0701004",
        "owner_name": "Arvind Sharma",
        "owner_masked": "A***nd S***ma",
        "owner_type": "Joint Urban Freehold",
        "legal_ror_area_sqm": 220,
        "gis_area_sqm": 218,
        "area_diff_sqm": -2,
        "area_diff_pct": 0.91,
        "status": "WARNING",
        "trust_score": "C",
        "trust_num": 32,
        "zoning": "Dense Mixed Commercial",
        "classification": "Dense Mixed Commercial",
        "tax_status": "Overdue",
        "tax_amount": "₹28,500",
        "tax_last_paid": "2023-08-15",
        "dispute_tag": "UNAPPROVED_HEIGHT_FAR",
        "permit_status": "G+2 Sanctioned (G+5 Built)",
        "building": {
          "sanctioned": {
            "height": 9,
            "floors": 3,
            "far": 1.5
          },
          "detected": {
            "height": 18.5,
            "floors": 6,
            "far": 3.8
          }
        },
        "violations": [
          {
            "id": "V-MCD-01",
            "severity": "WARNING",
            "type": "HEIGHT_AND_FAR_VIOLATION",
            "description": "STRUCTURAL ALERT: Unauthorized G+5 Construction (Sanctioned G+2 9.0m Limit)",
            "details": "Drone photogrammetry detects 18.5m height and FAR 3.8 (allowed 1.5). Zero setback from adjacent plots presents severe structural risk.",
            "encroachment_area_sqm": 85
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2025-01-10",
            "type": "MCD Stop-Work Order",
            "details": "Unauthorized construction beyond G+2 sanction",
            "status": "Active"
          },
          {
            "date": "2020-07-22",
            "type": "Registered Sale Deed",
            "details": "Sub-registrar SRO-III, South Delhi",
            "status": "Cleared"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.23920000000001,
                28.569
              ],
              [
                77.2405,
                28.569
              ],
              [
                77.2405,
                28.5698
              ],
              [
                77.23920000000001,
                28.5698
              ],
              [
                77.23920000000001,
                28.569
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office V-A (South Delhi) / Lajpat Nagar",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Defence Colony Sub-Division / South Delhi",
      "distanceKm": 1.2,
      "address": "DC Office Complex, MB Road, Saket / Lajpat Nagar, New Delhi - 110024",
      "officerName": "Shri R. K. Sharma, DANICS",
      "designation": "Sub-Registrar Grade-I & Executive Magistrate",
      "phone": "+91 11 2953 2340",
      "altPhone": "+91 98110 33490",
      "email": "sr5a.south@delhi.gov.in",
      "grievanceHours": "Monday to Friday: 10:00 AM – 12:30 PM",
      "emergencyHelpline": "1077 (Delhi Revenue Helpline)"
    },
    "coOwners": [
      {
        "id": "co-3-1",
        "name": "Arvind (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-3-2",
        "name": "Co-owner 3",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-4",
    "ulpin": "14-3361-0004-2026",
    "surveyNumber": "TS-PED-PED-82",
    "village": "Peddakalvala",
    "taluk": "Peddapalli Mandal",
    "district": "Peddapalli",
    "state": "Telangana",
    "owner": {
      "name": "Prabhakar Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 38809.2,
      "gisSqm": 38809.2,
      "regionalUnit": "Guntha",
      "regionalValue": "9.59 Acres (383.6 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025003"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-PED-PED-82",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-4",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.3634755,
              18.5973899
            ],
            [
              79.3641444,
              18.597151
            ],
            [
              79.36511,
              18.5966913
            ],
            [
              79.364262,
              18.5953522
            ],
            [
              79.3642071,
              18.5952677
            ],
            [
              79.3640271,
              18.5953651
            ],
            [
              79.3638466,
              18.5954571
            ],
            [
              79.3633963,
              18.5956894
            ],
            [
              79.3632901,
              18.5957689
            ],
            [
              79.363141,
              18.5958456
            ],
            [
              79.362752,
              18.5961271
            ],
            [
              79.3625193,
              18.5961083
            ],
            [
              79.3625951,
              18.5963379
            ],
            [
              79.3629836,
              18.5975335
            ],
            [
              79.3634755,
              18.5973899
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-4",
        "ulpin": "14-3361-0004-2026",
        "state_survey_no": "TS-PED-PED-82",
        "survey_number": "TS-PED-PED-82",
        "state": "Telangana",
        "district": "Peddapalli",
        "mandal": "Peddapalli",
        "village": "Peddakalvala",
        "census_code": "571990",
        "dmv_code": "2016015",
        "owner_name": "Prabhakar Venkatesh",
        "owner_masked": "P***r V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 38809.2,
        "gis_area_sqm": 38809.2,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹15,561",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-PED-PED-82",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Executive Taluk Office Peddapalli",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Peddapalli Revenue Division / Peddakalvala Circle",
      "distanceKm": 3.1,
      "address": "Mini Collectorate Complex, Subhash Nagar, Peddapalli - 505172",
      "officerName": "Sri T. Venkateshwarlu",
      "designation": "Tahsildar & Mandal Executive Magistrate",
      "phone": "+91 8728 222104",
      "email": "tahsildar.peddapalli@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:30 PM (Prajavani)",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-4-1",
        "name": "Prabhakar (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-4-2",
        "name": "Co-owner 4",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-5",
    "ulpin": "14-8623-0005-2026",
    "surveyNumber": "TS-PED-PED-66",
    "village": "Peddakalvala",
    "taluk": "Peddapalli Mandal",
    "district": "Peddapalli",
    "state": "Telangana",
    "owner": {
      "name": "Sudarshan Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 17377.2,
      "gisSqm": 17377.2,
      "regionalUnit": "Guntha",
      "regionalValue": "4.29 Acres (171.8 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025004"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-PED-PED-66",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-5",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.3632901,
              18.5957689
            ],
            [
              79.3632169,
              18.5955909
            ],
            [
              79.3627597,
              18.5943514
            ],
            [
              79.3627132,
              18.5941909
            ],
            [
              79.3625929,
              18.5942525
            ],
            [
              79.3620985,
              18.5944819
            ],
            [
              79.3618999,
              18.5945697
            ],
            [
              79.3617853,
              18.5947284
            ],
            [
              79.3618928,
              18.594869
            ],
            [
              79.3626128,
              18.5959469
            ],
            [
              79.3625049,
              18.5960055
            ],
            [
              79.3625193,
              18.5961083
            ],
            [
              79.362752,
              18.5961271
            ],
            [
              79.363141,
              18.5958456
            ],
            [
              79.3632901,
              18.5957689
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-5",
        "ulpin": "14-8623-0005-2026",
        "state_survey_no": "TS-PED-PED-66",
        "survey_number": "TS-PED-PED-66",
        "state": "Telangana",
        "district": "Peddapalli",
        "mandal": "Peddapalli",
        "village": "Peddakalvala",
        "census_code": "571990",
        "dmv_code": "2016015",
        "owner_name": "Sudarshan Narayana",
        "owner_masked": "S***n N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 17377.2,
        "gis_area_sqm": 17377.2,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹14,823",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-PED-PED-66",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Executive Taluk Office Peddapalli",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Peddapalli Revenue Division / Peddakalvala Circle",
      "distanceKm": 3.1,
      "address": "Mini Collectorate Complex, Subhash Nagar, Peddapalli - 505172",
      "officerName": "Sri T. Venkateshwarlu",
      "designation": "Tahsildar & Mandal Executive Magistrate",
      "phone": "+91 8728 222104",
      "email": "tahsildar.peddapalli@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:30 PM (Prajavani)",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-5-1",
        "name": "Sudarshan (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-5-2",
        "name": "Co-owner 5",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-6",
    "ulpin": "14-5838-0006-2026",
    "surveyNumber": "TS-PED-PED-83",
    "village": "Peddakalvala",
    "taluk": "Peddapalli Mandal",
    "district": "Peddapalli",
    "state": "Telangana",
    "owner": {
      "name": "Narasimha Goud",
      "type": "Individual Freehold (Succession Contested)"
    },
    "area": {
      "rorSqm": 36536.1,
      "gisSqm": 37449.5,
      "regionalUnit": "Guntha",
      "regionalValue": "9.25 Acres (370.2 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Overdue (3 Years Defaulter)",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025005"
    },
    "encumbrances": [
      {
        "date": "2024-11-15",
        "type": "Mutation Dispute Objection",
        "details": "Objection petition filed under ROR Act §5",
        "status": "Active"
      },
      {
        "date": "2020-02-18",
        "type": "Primary Agriculture Co-op Loan",
        "details": "Crop loan hypothecation of ₹1,80,000",
        "status": "Active"
      }
    ],
    "status": "WARNING",
    "trustScore": 58,
    "trustGrade": "C",
    "violations": [
      {
        "id": "vio-6",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 6741,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-6",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.3663477,
              18.5959205
            ],
            [
              79.3664678,
              18.5958187
            ],
            [
              79.3665392,
              18.5957873
            ],
            [
              79.3665353,
              18.5957796
            ],
            [
              79.3658707,
              18.5942964
            ],
            [
              79.3657267,
              18.5943701
            ],
            [
              79.3655876,
              18.5944269
            ],
            [
              79.3646417,
              18.5948675
            ],
            [
              79.3643067,
              18.5951747
            ],
            [
              79.3642071,
              18.5952677
            ],
            [
              79.364262,
              18.5953522
            ],
            [
              79.36511,
              18.5966913
            ],
            [
              79.3651468,
              18.5966738
            ],
            [
              79.3663477,
              18.5959205
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-6",
        "ulpin": "14-5838-0006-2026",
        "state_survey_no": "TS-PED-PED-83",
        "survey_number": "TS-PED-PED-83",
        "state": "Telangana",
        "district": "Peddapalli",
        "mandal": "Peddapalli",
        "village": "Peddakalvala",
        "census_code": "571990",
        "dmv_code": "2016015",
        "owner_name": "Narasimha Goud",
        "owner_masked": "N***a G***d",
        "owner_type": "Individual Freehold (Succession Contested)",
        "legal_ror_area_sqm": 36536.1,
        "gis_area_sqm": 37449.5,
        "area_diff_sqm": 913.4,
        "area_diff_pct": 2.5,
        "status": "WARNING",
        "trust_score": "C",
        "trust_num": 58,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Agricultural Freehold",
        "tax_status": "Overdue (3 Years Defaulter)",
        "tax_amount": "₹12,038",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "MUTATION_DISPUTE",
        "permit_status": "Agricultural Ryotwari",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-006",
            "severity": "WARNING",
            "type": "MUTATION_CONTESTED",
            "description": "SUCCESSION DISPUTE: Contested mutation application filed before Tahsildar",
            "details": "Succession transfer challenged by legal heirs. Revenue record locked pending DRO inquiry.",
            "encroachment_area_sqm": 0
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2024-11-15",
            "type": "Mutation Dispute Objection",
            "details": "Objection petition filed under ROR Act §5",
            "status": "Active"
          },
          {
            "date": "2020-02-18",
            "type": "Primary Agriculture Co-op Loan",
            "details": "Crop loan hypothecation of ₹1,80,000",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                79.3639071,
                18.5939964
              ],
              [
                79.3668392,
                18.5939964
              ],
              [
                79.3668392,
                18.59569385
              ],
              [
                79.3639071,
                18.59569385
              ],
              [
                79.3639071,
                18.5939964
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Executive Taluk Office Peddapalli",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Peddapalli Revenue Division / Peddakalvala Circle",
      "distanceKm": 3.1,
      "address": "Mini Collectorate Complex, Subhash Nagar, Peddapalli - 505172",
      "officerName": "Sri T. Venkateshwarlu",
      "designation": "Tahsildar & Mandal Executive Magistrate",
      "phone": "+91 8728 222104",
      "email": "tahsildar.peddapalli@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:30 PM (Prajavani)",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-6-1",
        "name": "Narasimha (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-6-2",
        "name": "Co-owner 6",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-7",
    "ulpin": "14-4146-0007-2026",
    "surveyNumber": "TS-PED-PED-84",
    "village": "Peddakalvala",
    "taluk": "Peddapalli Mandal",
    "district": "Peddapalli",
    "state": "Telangana",
    "owner": {
      "name": "Kavitha Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 21983.3,
      "gisSqm": 21983.3,
      "regionalUnit": "Guntha",
      "regionalValue": "5.43 Acres (217.3 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025006"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-PED-PED-84",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-7",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.366902,
              18.5956281
            ],
            [
              79.367515,
              18.5953498
            ],
            [
              79.3680584,
              18.5951756
            ],
            [
              79.3675199,
              18.5941457
            ],
            [
              79.3674798,
              18.5939749
            ],
            [
              79.3673048,
              18.5940504
            ],
            [
              79.3664636,
              18.5943762
            ],
            [
              79.3662995,
              18.5944236
            ],
            [
              79.3661629,
              18.5946521
            ],
            [
              79.3667249,
              18.5957058
            ],
            [
              79.366902,
              18.5956281
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-7",
        "ulpin": "14-4146-0007-2026",
        "state_survey_no": "TS-PED-PED-84",
        "survey_number": "TS-PED-PED-84",
        "state": "Telangana",
        "district": "Peddapalli",
        "mandal": "Peddapalli",
        "village": "Peddakalvala",
        "census_code": "571990",
        "dmv_code": "2016015",
        "owner_name": "Kavitha Venkatesh",
        "owner_masked": "K***a V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 21983.3,
        "gis_area_sqm": 21983.3,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹7,346",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-PED-PED-84",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Executive Taluk Office Peddapalli",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Peddapalli Revenue Division / Peddakalvala Circle",
      "distanceKm": 3.1,
      "address": "Mini Collectorate Complex, Subhash Nagar, Peddapalli - 505172",
      "officerName": "Sri T. Venkateshwarlu",
      "designation": "Tahsildar & Mandal Executive Magistrate",
      "phone": "+91 8728 222104",
      "email": "tahsildar.peddapalli@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:30 PM (Prajavani)",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-7-1",
        "name": "Kavitha (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-7-2",
        "name": "Co-owner 7",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-8",
    "ulpin": "14-8852-0008-2026",
    "surveyNumber": "TS-PED-PED-87/2",
    "village": "Peddakalvala",
    "taluk": "Peddapalli Mandal",
    "district": "Peddapalli",
    "state": "Telangana",
    "owner": {
      "name": "Shankar Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 7755.3,
      "gisSqm": 7755.3,
      "regionalUnit": "Guntha",
      "regionalValue": "1.92 Acres (76.7 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025007"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-PED-PED-87/2",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-8",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.3674798,
              18.5939749
            ],
            [
              79.3674245,
              18.5938697
            ],
            [
              79.367272,
              18.5935959
            ],
            [
              79.367209,
              18.5934744
            ],
            [
              79.3661593,
              18.5939374
            ],
            [
              79.3662211,
              18.5942489
            ],
            [
              79.3662995,
              18.5944236
            ],
            [
              79.3664636,
              18.5943762
            ],
            [
              79.3673048,
              18.5940504
            ],
            [
              79.3674798,
              18.5939749
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-8",
        "ulpin": "14-8852-0008-2026",
        "state_survey_no": "TS-PED-PED-87/2",
        "survey_number": "TS-PED-PED-87/2",
        "state": "Telangana",
        "district": "Peddapalli",
        "mandal": "Peddapalli",
        "village": "Peddakalvala",
        "census_code": "571990",
        "dmv_code": "2016015",
        "owner_name": "Shankar Narayana",
        "owner_masked": "S***r N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 7755.3,
        "gis_area_sqm": 7755.3,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹6,052",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-PED-PED-87/2",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Executive Taluk Office Peddapalli",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Peddapalli Revenue Division / Peddakalvala Circle",
      "distanceKm": 3.1,
      "address": "Mini Collectorate Complex, Subhash Nagar, Peddapalli - 505172",
      "officerName": "Sri T. Venkateshwarlu",
      "designation": "Tahsildar & Mandal Executive Magistrate",
      "phone": "+91 8728 222104",
      "email": "tahsildar.peddapalli@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:30 PM (Prajavani)",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-8-1",
        "name": "Shankar (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-8-2",
        "name": "Co-owner 8",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-9",
    "ulpin": "14-7987-0009-2026",
    "surveyNumber": "TS-WAR-ELK-876",
    "village": "Elkathurthi",
    "taluk": "Elkathurthi Mandal",
    "district": "Warangal_Urban",
    "state": "Telangana",
    "owner": {
      "name": "Yadagiri Goud",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 65645.1,
      "gisSqm": 65645.1,
      "regionalUnit": "Guntha",
      "regionalValue": "16.22 Acres (648.9 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025008"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-WAR-ELK-876",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-9",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.4320794,
              18.1100407
            ],
            [
              79.4320843,
              18.1098499
            ],
            [
              79.4320774,
              18.1082208
            ],
            [
              79.4320756,
              18.1080168
            ],
            [
              79.4320627,
              18.1080225
            ],
            [
              79.4320057,
              18.1080479
            ],
            [
              79.4318686,
              18.1081088
            ],
            [
              79.4313244,
              18.1084211
            ],
            [
              79.4312945,
              18.1084343
            ],
            [
              79.4308,
              18.1086524
            ],
            [
              79.430415,
              18.1088222
            ],
            [
              79.4303613,
              18.1088459
            ],
            [
              79.4303529,
              18.1087898
            ],
            [
              79.4302892,
              18.1083622
            ],
            [
              79.4302718,
              18.1082365
            ],
            [
              79.4301011,
              18.1082837
            ],
            [
              79.4285277,
              18.1088534
            ],
            [
              79.428379,
              18.1089022
            ],
            [
              79.4284816,
              18.1089974
            ],
            [
              79.4295955,
              18.1101529
            ],
            [
              79.4297796,
              18.1103437
            ],
            [
              79.429868,
              18.1104717
            ],
            [
              79.4300876,
              18.1104326
            ],
            [
              79.4318882,
              18.110081
            ],
            [
              79.4320794,
              18.1100407
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-9",
        "ulpin": "14-7987-0009-2026",
        "state_survey_no": "TS-WAR-ELK-876",
        "survey_number": "TS-WAR-ELK-876",
        "state": "Telangana",
        "district": "Warangal_Urban",
        "mandal": "Elkathurthi",
        "village": "Elkathurthi",
        "census_code": "572690",
        "dmv_code": "2051005",
        "owner_name": "Yadagiri Goud",
        "owner_masked": "Y***i G***d",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 65645.1,
        "gis_area_sqm": 65645.1,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹8,187",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-WAR-ELK-876",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office Elkathurthi / Warangal Urban",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Elkathurthi Mandal Circle / Warangal Urban",
      "distanceKm": 2.8,
      "address": "Near Bus Stand, Huzurabad Highway, Elkathurthi - 505101",
      "officerName": "Sri B. Mallikarjun Reddy",
      "designation": "Joint Sub-Registrar & Public Grievance Officer",
      "phone": "+91 870 244 8920",
      "email": "sro.elkathurthi@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-9-1",
        "name": "Yadagiri (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-9-2",
        "name": "Co-owner 9",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-10",
    "ulpin": "14-2117-0010-2026",
    "surveyNumber": "TS-WAR-ELK-877",
    "village": "Elkathurthi",
    "taluk": "Elkathurthi Mandal",
    "district": "Warangal_Urban",
    "state": "Telangana",
    "owner": {
      "name": "Venkatesh Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 31423.1,
      "gisSqm": 31423.1,
      "regionalUnit": "Guntha",
      "regionalValue": "7.76 Acres (310.6 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025009"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-WAR-ELK-877",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-10",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.429868,
              18.1104717
            ],
            [
              79.4297796,
              18.1103437
            ],
            [
              79.4295955,
              18.1101529
            ],
            [
              79.4284816,
              18.1089974
            ],
            [
              79.428379,
              18.1089022
            ],
            [
              79.4282354,
              18.1089856
            ],
            [
              79.4276998,
              18.1093673
            ],
            [
              79.4275694,
              18.109475
            ],
            [
              79.427516,
              18.1095036
            ],
            [
              79.4274542,
              18.1095368
            ],
            [
              79.4274451,
              18.1095417
            ],
            [
              79.4274043,
              18.1095614
            ],
            [
              79.4280519,
              18.1104914
            ],
            [
              79.4281435,
              18.1105935
            ],
            [
              79.4281734,
              18.1106893
            ],
            [
              79.4282822,
              18.1110833
            ],
            [
              79.428636,
              18.1109512
            ],
            [
              79.4287051,
              18.1109254
            ],
            [
              79.4297532,
              18.1105342
            ],
            [
              79.429868,
              18.1104717
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-10",
        "ulpin": "14-2117-0010-2026",
        "state_survey_no": "TS-WAR-ELK-877",
        "survey_number": "TS-WAR-ELK-877",
        "state": "Telangana",
        "district": "Warangal_Urban",
        "mandal": "Elkathurthi",
        "village": "Elkathurthi",
        "census_code": "572690",
        "dmv_code": "2051005",
        "owner_name": "Venkatesh Venkatesh",
        "owner_masked": "V***h V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 31423.1,
        "gis_area_sqm": 31423.1,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹14,317",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-WAR-ELK-877",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office Elkathurthi / Warangal Urban",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Elkathurthi Mandal Circle / Warangal Urban",
      "distanceKm": 2.8,
      "address": "Near Bus Stand, Huzurabad Highway, Elkathurthi - 505101",
      "officerName": "Sri B. Mallikarjun Reddy",
      "designation": "Joint Sub-Registrar & Public Grievance Officer",
      "phone": "+91 870 244 8920",
      "email": "sro.elkathurthi@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-10-1",
        "name": "Venkatesh (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-10-2",
        "name": "Co-owner 10",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-11",
    "ulpin": "14-8632-0011-2026",
    "surveyNumber": "TS-WAR-ELK-878",
    "village": "Elkathurthi",
    "taluk": "Elkathurthi Mandal",
    "district": "Warangal_Urban",
    "state": "Telangana",
    "owner": {
      "name": "Mallaiah Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 40449.4,
      "gisSqm": 40449.4,
      "regionalUnit": "Guntha",
      "regionalValue": "10.00 Acres (399.8 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025010"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-WAR-ELK-878",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-11",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.4306658,
              18.1118422
            ],
            [
              79.430578,
              18.1116877
            ],
            [
              79.4299694,
              18.1106465
            ],
            [
              79.429868,
              18.1104717
            ],
            [
              79.4297532,
              18.1105342
            ],
            [
              79.4287051,
              18.1109254
            ],
            [
              79.428636,
              18.1109512
            ],
            [
              79.4282822,
              18.1110833
            ],
            [
              79.4283279,
              18.1112486
            ],
            [
              79.4285308,
              18.1118634
            ],
            [
              79.4285891,
              18.1119605
            ],
            [
              79.428624,
              18.1120985
            ],
            [
              79.4288919,
              18.1127062
            ],
            [
              79.4290868,
              18.1130641
            ],
            [
              79.4291772,
              18.1129884
            ],
            [
              79.4294907,
              18.1127434
            ],
            [
              79.4297391,
              18.1125493
            ],
            [
              79.4305153,
              18.1119428
            ],
            [
              79.4306658,
              18.1118422
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-11",
        "ulpin": "14-8632-0011-2026",
        "state_survey_no": "TS-WAR-ELK-878",
        "survey_number": "TS-WAR-ELK-878",
        "state": "Telangana",
        "district": "Warangal_Urban",
        "mandal": "Elkathurthi",
        "village": "Elkathurthi",
        "census_code": "572690",
        "dmv_code": "2051005",
        "owner_name": "Mallaiah Narayana",
        "owner_masked": "M***h N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 40449.4,
        "gis_area_sqm": 40449.4,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹2,832",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-WAR-ELK-878",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office Elkathurthi / Warangal Urban",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Elkathurthi Mandal Circle / Warangal Urban",
      "distanceKm": 2.8,
      "address": "Near Bus Stand, Huzurabad Highway, Elkathurthi - 505101",
      "officerName": "Sri B. Mallikarjun Reddy",
      "designation": "Joint Sub-Registrar & Public Grievance Officer",
      "phone": "+91 870 244 8920",
      "email": "sro.elkathurthi@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-11-1",
        "name": "Mallaiah (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-11-2",
        "name": "Co-owner 11",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-12",
    "ulpin": "14-5179-0012-2026",
    "surveyNumber": "TS-WAR-ELK-879",
    "village": "Elkathurthi",
    "taluk": "Elkathurthi Mandal",
    "district": "Warangal_Urban",
    "state": "Telangana",
    "owner": {
      "name": "Srinivas Goud",
      "type": "Individual Freehold (Succession Contested)"
    },
    "area": {
      "rorSqm": 48062.6,
      "gisSqm": 49264.2,
      "regionalUnit": "Guntha",
      "regionalValue": "12.17 Acres (486.9 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Overdue (3 Years Defaulter)",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025011"
    },
    "encumbrances": [
      {
        "date": "2024-11-15",
        "type": "Mutation Dispute Objection",
        "details": "Objection petition filed under ROR Act §5",
        "status": "Active"
      },
      {
        "date": "2020-02-18",
        "type": "Primary Agriculture Co-op Loan",
        "details": "Crop loan hypothecation of ₹1,80,000",
        "status": "Active"
      }
    ],
    "status": "WARNING",
    "trustScore": 58,
    "trustGrade": "C",
    "violations": [
      {
        "id": "vio-12",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 8868,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-12",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.4317858,
              18.1130379
            ],
            [
              79.4317877,
              18.1130371
            ],
            [
              79.431855,
              18.1130104
            ],
            [
              79.4319853,
              18.1129587
            ],
            [
              79.4322537,
              18.112827
            ],
            [
              79.4323636,
              18.1127731
            ],
            [
              79.4324606,
              18.1127155
            ],
            [
              79.4325427,
              18.1126667
            ],
            [
              79.4324969,
              18.1125265
            ],
            [
              79.4324233,
              18.1120826
            ],
            [
              79.4323499,
              18.1119154
            ],
            [
              79.4321879,
              18.1119036
            ],
            [
              79.4308065,
              18.1118597
            ],
            [
              79.4306658,
              18.1118422
            ],
            [
              79.4305153,
              18.1119428
            ],
            [
              79.4297391,
              18.1125493
            ],
            [
              79.4294907,
              18.1127434
            ],
            [
              79.4291772,
              18.1129884
            ],
            [
              79.4290868,
              18.1130641
            ],
            [
              79.4292503,
              18.1133646
            ],
            [
              79.4293346,
              18.1135274
            ],
            [
              79.4294467,
              18.1137904
            ],
            [
              79.429503,
              18.1139225
            ],
            [
              79.429563,
              18.1139236
            ],
            [
              79.4297416,
              18.1138302
            ],
            [
              79.4297892,
              18.1138116
            ],
            [
              79.4298872,
              18.1137734
            ],
            [
              79.4315865,
              18.1131108
            ],
            [
              79.4317858,
              18.1130379
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-12",
        "ulpin": "14-5179-0012-2026",
        "state_survey_no": "TS-WAR-ELK-879",
        "survey_number": "TS-WAR-ELK-879",
        "state": "Telangana",
        "district": "Warangal_Urban",
        "mandal": "Elkathurthi",
        "village": "Elkathurthi",
        "census_code": "572690",
        "dmv_code": "2051005",
        "owner_name": "Srinivas Goud",
        "owner_masked": "S***s G***d",
        "owner_type": "Individual Freehold (Succession Contested)",
        "legal_ror_area_sqm": 48062.6,
        "gis_area_sqm": 49264.2,
        "area_diff_sqm": 1201.6,
        "area_diff_pct": 2.5,
        "status": "WARNING",
        "trust_score": "C",
        "trust_num": 58,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Agricultural Freehold",
        "tax_status": "Overdue (3 Years Defaulter)",
        "tax_amount": "₹14,379",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "MUTATION_DISPUTE",
        "permit_status": "Agricultural Ryotwari",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-012",
            "severity": "WARNING",
            "type": "MUTATION_CONTESTED",
            "description": "SUCCESSION DISPUTE: Contested mutation application filed before Tahsildar",
            "details": "Succession transfer challenged by legal heirs. Revenue record locked pending DRO inquiry.",
            "encroachment_area_sqm": 0
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2024-11-15",
            "type": "Mutation Dispute Objection",
            "details": "Objection petition filed under ROR Act §5",
            "status": "Active"
          },
          {
            "date": "2020-02-18",
            "type": "Primary Agriculture Co-op Loan",
            "details": "Crop loan hypothecation of ₹1,80,000",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                79.4287868,
                18.111542200000002
              ],
              [
                79.4328427,
                18.111542200000002
              ],
              [
                79.4328427,
                18.113082900000002
              ],
              [
                79.4287868,
                18.113082900000002
              ],
              [
                79.4287868,
                18.111542200000002
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office Elkathurthi / Warangal Urban",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Elkathurthi Mandal Circle / Warangal Urban",
      "distanceKm": 2.8,
      "address": "Near Bus Stand, Huzurabad Highway, Elkathurthi - 505101",
      "officerName": "Sri B. Mallikarjun Reddy",
      "designation": "Joint Sub-Registrar & Public Grievance Officer",
      "phone": "+91 870 244 8920",
      "email": "sro.elkathurthi@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-12-1",
        "name": "Srinivas (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-12-2",
        "name": "Co-owner 12",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-13",
    "ulpin": "14-1187-0013-2026",
    "surveyNumber": "TS-WAR-ELK-880",
    "village": "Elkathurthi",
    "taluk": "Elkathurthi Mandal",
    "district": "Warangal_Urban",
    "state": "Telangana",
    "owner": {
      "name": "Laxmi Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 40983.8,
      "gisSqm": 40983.8,
      "regionalUnit": "Guntha",
      "regionalValue": "10.13 Acres (405.1 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025012"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-WAR-ELK-880",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-13",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.4321635,
              18.1143673
            ],
            [
              79.4322406,
              18.1143318
            ],
            [
              79.4318936,
              18.1132525
            ],
            [
              79.4317858,
              18.1130379
            ],
            [
              79.4315865,
              18.1131108
            ],
            [
              79.4298872,
              18.1137734
            ],
            [
              79.4297892,
              18.1138116
            ],
            [
              79.4297416,
              18.1138302
            ],
            [
              79.429563,
              18.1139236
            ],
            [
              79.429503,
              18.1139225
            ],
            [
              79.4300005,
              18.1150903
            ],
            [
              79.4300947,
              18.1152137
            ],
            [
              79.4301373,
              18.1153192
            ],
            [
              79.4302704,
              18.1152647
            ],
            [
              79.4304776,
              18.1151461
            ],
            [
              79.430679,
              18.115053
            ],
            [
              79.4321635,
              18.1143673
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-13",
        "ulpin": "14-1187-0013-2026",
        "state_survey_no": "TS-WAR-ELK-880",
        "survey_number": "TS-WAR-ELK-880",
        "state": "Telangana",
        "district": "Warangal_Urban",
        "mandal": "Elkathurthi",
        "village": "Elkathurthi",
        "census_code": "572690",
        "dmv_code": "2051005",
        "owner_name": "Laxmi Venkatesh",
        "owner_masked": "L***i V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 40983.8,
        "gis_area_sqm": 40983.8,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹10,387",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-WAR-ELK-880",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office Elkathurthi / Warangal Urban",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Elkathurthi Mandal Circle / Warangal Urban",
      "distanceKm": 2.8,
      "address": "Near Bus Stand, Huzurabad Highway, Elkathurthi - 505101",
      "officerName": "Sri B. Mallikarjun Reddy",
      "designation": "Joint Sub-Registrar & Public Grievance Officer",
      "phone": "+91 870 244 8920",
      "email": "sro.elkathurthi@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-13-1",
        "name": "Laxmi (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-13-2",
        "name": "Co-owner 13",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-14",
    "ulpin": "14-5815-0014-2026",
    "surveyNumber": "TS-RAN-FAR-33",
    "village": "Nagulapalle",
    "taluk": "Farooqnagar Mandal",
    "district": "Rangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Prabhakar Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 32685.4,
      "gisSqm": 32685.4,
      "regionalUnit": "Guntha",
      "regionalValue": "8.08 Acres (323.1 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025013"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-RAN-FAR-33",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-14",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.2120047,
              17.1036067
            ],
            [
              78.2119449,
              17.1034851
            ],
            [
              78.2114956,
              17.1042482
            ],
            [
              78.2113501,
              17.1059758
            ],
            [
              78.2112404,
              17.1061303
            ],
            [
              78.2112333,
              17.1071158
            ],
            [
              78.2124685,
              17.1067785
            ],
            [
              78.2120047,
              17.1036067
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-14",
        "ulpin": "14-5815-0014-2026",
        "state_survey_no": "TS-RAN-FAR-33",
        "survey_number": "TS-RAN-FAR-33",
        "state": "Telangana",
        "district": "Rangareddy",
        "mandal": "Farooqnagar",
        "village": "Nagulapalle",
        "census_code": "575179",
        "dmv_code": "1412005",
        "owner_name": "Prabhakar Narayana",
        "owner_masked": "P***r N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 32685.4,
        "gis_area_sqm": 32685.4,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹6,015",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-RAN-FAR-33",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Farooqnagar (Shadnagar)",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Farooqnagar Mandal / Shadnagar Revenue Division",
      "distanceKm": 4.5,
      "address": "Near Railway Station Road, Shadnagar, Rangareddy - 509216",
      "officerName": "Sri P. Srinivas Rao",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8548 252230",
      "email": "tah.farooqnagar@telangana.gov.in",
      "grievanceHours": "Monday: 10:00 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-14-1",
        "name": "Prabhakar (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-14-2",
        "name": "Co-owner 14",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-15",
    "ulpin": "14-3162-0015-2026",
    "surveyNumber": "TS-RAN-FAR-34",
    "village": "Nagulapalle",
    "taluk": "Farooqnagar Mandal",
    "district": "Rangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Sudarshan Goud",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 70651,
      "gisSqm": 70651,
      "regionalUnit": "Guntha",
      "regionalValue": "17.46 Acres (698.3 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025014"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-RAN-FAR-34",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-15",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.2141376,
              17.1046907
            ],
            [
              78.2136124,
              17.103907
            ],
            [
              78.213496,
              17.1034904
            ],
            [
              78.2132109,
              17.1020445
            ],
            [
              78.2131281,
              17.1018801
            ],
            [
              78.212039,
              17.1033349
            ],
            [
              78.2119449,
              17.1034851
            ],
            [
              78.2120047,
              17.1036067
            ],
            [
              78.2124685,
              17.1067785
            ],
            [
              78.2133064,
              17.1065123
            ],
            [
              78.2140068,
              17.1048343
            ],
            [
              78.2141376,
              17.1046907
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-15",
        "ulpin": "14-3162-0015-2026",
        "state_survey_no": "TS-RAN-FAR-34",
        "survey_number": "TS-RAN-FAR-34",
        "state": "Telangana",
        "district": "Rangareddy",
        "mandal": "Farooqnagar",
        "village": "Nagulapalle",
        "census_code": "575179",
        "dmv_code": "1412005",
        "owner_name": "Sudarshan Goud",
        "owner_masked": "S***n G***d",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 70651,
        "gis_area_sqm": 70651,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹9,362",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-RAN-FAR-34",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Farooqnagar (Shadnagar)",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Farooqnagar Mandal / Shadnagar Revenue Division",
      "distanceKm": 4.5,
      "address": "Near Railway Station Road, Shadnagar, Rangareddy - 509216",
      "officerName": "Sri P. Srinivas Rao",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8548 252230",
      "email": "tah.farooqnagar@telangana.gov.in",
      "grievanceHours": "Monday: 10:00 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-15-1",
        "name": "Sudarshan (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-15-2",
        "name": "Co-owner 15",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-16",
    "ulpin": "14-1100-0016-2026",
    "surveyNumber": "TS-RAN-FAR-35",
    "village": "Nagulapalle",
    "taluk": "Farooqnagar Mandal",
    "district": "Rangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Narasimha Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 38144.2,
      "gisSqm": 38144.2,
      "regionalUnit": "Guntha",
      "regionalValue": "9.43 Acres (377.0 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025015"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-RAN-FAR-35",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-16",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.2148264,
              17.1077492
            ],
            [
              78.2141376,
              17.1046907
            ],
            [
              78.2140068,
              17.1048343
            ],
            [
              78.2133064,
              17.1065123
            ],
            [
              78.2124685,
              17.1067785
            ],
            [
              78.2125914,
              17.1068716
            ],
            [
              78.2140061,
              17.1078768
            ],
            [
              78.2148264,
              17.1077492
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-16",
        "ulpin": "14-1100-0016-2026",
        "state_survey_no": "TS-RAN-FAR-35",
        "survey_number": "TS-RAN-FAR-35",
        "state": "Telangana",
        "district": "Rangareddy",
        "mandal": "Farooqnagar",
        "village": "Nagulapalle",
        "census_code": "575179",
        "dmv_code": "1412005",
        "owner_name": "Narasimha Venkatesh",
        "owner_masked": "N***a V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 38144.2,
        "gis_area_sqm": 38144.2,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹13,300",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-RAN-FAR-35",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Farooqnagar (Shadnagar)",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Farooqnagar Mandal / Shadnagar Revenue Division",
      "distanceKm": 4.5,
      "address": "Near Railway Station Road, Shadnagar, Rangareddy - 509216",
      "officerName": "Sri P. Srinivas Rao",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8548 252230",
      "email": "tah.farooqnagar@telangana.gov.in",
      "grievanceHours": "Monday: 10:00 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-16-1",
        "name": "Narasimha (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-16-2",
        "name": "Co-owner 16",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-17",
    "ulpin": "14-4260-0017-2026",
    "surveyNumber": "TS-RAN-FAR-36",
    "village": "Nagulapalle",
    "taluk": "Farooqnagar Mandal",
    "district": "Rangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Kavitha Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 73792.7,
      "gisSqm": 73792.7,
      "regionalUnit": "Guntha",
      "regionalValue": "18.23 Acres (729.4 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025016"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-RAN-FAR-36",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-17",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.2152756,
              17.1097236
            ],
            [
              78.2148264,
              17.1077492
            ],
            [
              78.2140061,
              17.1078768
            ],
            [
              78.2125914,
              17.1068716
            ],
            [
              78.2124685,
              17.1067785
            ],
            [
              78.2122039,
              17.1098451
            ],
            [
              78.2152756,
              17.1097236
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-17",
        "ulpin": "14-4260-0017-2026",
        "state_survey_no": "TS-RAN-FAR-36",
        "survey_number": "TS-RAN-FAR-36",
        "state": "Telangana",
        "district": "Rangareddy",
        "mandal": "Farooqnagar",
        "village": "Nagulapalle",
        "census_code": "575179",
        "dmv_code": "1412005",
        "owner_name": "Kavitha Narayana",
        "owner_masked": "K***a N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 73792.7,
        "gis_area_sqm": 73792.7,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹7,460",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-RAN-FAR-36",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Farooqnagar (Shadnagar)",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Farooqnagar Mandal / Shadnagar Revenue Division",
      "distanceKm": 4.5,
      "address": "Near Railway Station Road, Shadnagar, Rangareddy - 509216",
      "officerName": "Sri P. Srinivas Rao",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8548 252230",
      "email": "tah.farooqnagar@telangana.gov.in",
      "grievanceHours": "Monday: 10:00 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-17-1",
        "name": "Kavitha (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-17-2",
        "name": "Co-owner 17",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-18",
    "ulpin": "14-9883-0018-2026",
    "surveyNumber": "TS-RAN-FAR-37",
    "village": "Nagulapalle",
    "taluk": "Farooqnagar Mandal",
    "district": "Rangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Shankar Goud",
      "type": "Individual Freehold (Succession Contested)"
    },
    "area": {
      "rorSqm": 28119.8,
      "gisSqm": 28822.8,
      "regionalUnit": "Guntha",
      "regionalValue": "7.12 Acres (284.9 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Overdue (3 Years Defaulter)",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025017"
    },
    "encumbrances": [
      {
        "date": "2024-11-15",
        "type": "Mutation Dispute Objection",
        "details": "Objection petition filed under ROR Act §5",
        "status": "Active"
      },
      {
        "date": "2020-02-18",
        "type": "Primary Agriculture Co-op Loan",
        "details": "Crop loan hypothecation of ₹1,80,000",
        "status": "Active"
      }
    ],
    "status": "WARNING",
    "trustScore": 58,
    "trustGrade": "C",
    "violations": [
      {
        "id": "vio-18",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 5188,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-18",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.2153934,
              17.1102388
            ],
            [
              78.2152756,
              17.1097236
            ],
            [
              78.2122039,
              17.1098451
            ],
            [
              78.2122329,
              17.1099413
            ],
            [
              78.2128679,
              17.1108717
            ],
            [
              78.2131749,
              17.1108401
            ],
            [
              78.2131904,
              17.1108385
            ],
            [
              78.213266,
              17.1108179
            ],
            [
              78.2153934,
              17.1102388
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-18",
        "ulpin": "14-9883-0018-2026",
        "state_survey_no": "TS-RAN-FAR-37",
        "survey_number": "TS-RAN-FAR-37",
        "state": "Telangana",
        "district": "Rangareddy",
        "mandal": "Farooqnagar",
        "village": "Nagulapalle",
        "census_code": "575179",
        "dmv_code": "1412005",
        "owner_name": "Shankar Goud",
        "owner_masked": "S***r G***d",
        "owner_type": "Individual Freehold (Succession Contested)",
        "legal_ror_area_sqm": 28119.8,
        "gis_area_sqm": 28822.8,
        "area_diff_sqm": 703,
        "area_diff_pct": 2.5,
        "status": "WARNING",
        "trust_score": "C",
        "trust_num": 58,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Agricultural Freehold",
        "tax_status": "Overdue (3 Years Defaulter)",
        "tax_amount": "₹16,083",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "MUTATION_DISPUTE",
        "permit_status": "Agricultural Ryotwari",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-018",
            "severity": "WARNING",
            "type": "MUTATION_CONTESTED",
            "description": "SUCCESSION DISPUTE: Contested mutation application filed before Tahsildar",
            "details": "Succession transfer challenged by legal heirs. Revenue record locked pending DRO inquiry.",
            "encroachment_area_sqm": 0
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2024-11-15",
            "type": "Mutation Dispute Objection",
            "details": "Objection petition filed under ROR Act §5",
            "status": "Active"
          },
          {
            "date": "2020-02-18",
            "type": "Primary Agriculture Co-op Loan",
            "details": "Crop loan hypothecation of ₹1,80,000",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.21190390000001,
                17.1094236
              ],
              [
                78.21569339999999,
                17.1094236
              ],
              [
                78.21569339999999,
                17.11049765
              ],
              [
                78.21190390000001,
                17.11049765
              ],
              [
                78.21190390000001,
                17.1094236
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Farooqnagar (Shadnagar)",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Farooqnagar Mandal / Shadnagar Revenue Division",
      "distanceKm": 4.5,
      "address": "Near Railway Station Road, Shadnagar, Rangareddy - 509216",
      "officerName": "Sri P. Srinivas Rao",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8548 252230",
      "email": "tah.farooqnagar@telangana.gov.in",
      "grievanceHours": "Monday: 10:00 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-18-1",
        "name": "Shankar (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-18-2",
        "name": "Co-owner 18",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-19",
    "ulpin": "14-6373-0019-2026",
    "surveyNumber": "TS-RAN-FAR-38",
    "village": "Nagulapalle",
    "taluk": "Farooqnagar Mandal",
    "district": "Rangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Yadagiri Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 47311.5,
      "gisSqm": 47311.5,
      "regionalUnit": "Guntha",
      "regionalValue": "11.69 Acres (467.6 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025018"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-RAN-FAR-38",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-19",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.2154005,
              17.1102368
            ],
            [
              78.2155559,
              17.110188
            ],
            [
              78.2161553,
              17.109848
            ],
            [
              78.2168359,
              17.1094619
            ],
            [
              78.2170025,
              17.1093684
            ],
            [
              78.2170431,
              17.1093159
            ],
            [
              78.2170731,
              17.109277
            ],
            [
              78.2171551,
              17.109197
            ],
            [
              78.2166909,
              17.1079952
            ],
            [
              78.2165355,
              17.1075931
            ],
            [
              78.2148264,
              17.1077492
            ],
            [
              78.2152756,
              17.1097236
            ],
            [
              78.2153934,
              17.1102388
            ],
            [
              78.2154005,
              17.1102368
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-19",
        "ulpin": "14-6373-0019-2026",
        "state_survey_no": "TS-RAN-FAR-38",
        "survey_number": "TS-RAN-FAR-38",
        "state": "Telangana",
        "district": "Rangareddy",
        "mandal": "Farooqnagar",
        "village": "Nagulapalle",
        "census_code": "575179",
        "dmv_code": "1412005",
        "owner_name": "Yadagiri Venkatesh",
        "owner_masked": "Y***i V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 47311.5,
        "gis_area_sqm": 47311.5,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹9,573",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-RAN-FAR-38",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Farooqnagar (Shadnagar)",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Farooqnagar Mandal / Shadnagar Revenue Division",
      "distanceKm": 4.5,
      "address": "Near Railway Station Road, Shadnagar, Rangareddy - 509216",
      "officerName": "Sri P. Srinivas Rao",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8548 252230",
      "email": "tah.farooqnagar@telangana.gov.in",
      "grievanceHours": "Monday: 10:00 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-19-1",
        "name": "Yadagiri (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-19-2",
        "name": "Co-owner 19",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-20",
    "ulpin": "14-2526-0020-2026",
    "surveyNumber": "TS-NAL-KAN-107",
    "village": "Parvathagiril",
    "taluk": "Kanagal Mandal",
    "district": "Nalgonda",
    "state": "Telangana",
    "owner": {
      "name": "Venkatesh Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 30457,
      "gisSqm": 30457,
      "regionalUnit": "Guntha",
      "regionalValue": "7.53 Acres (301.0 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025019"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-NAL-KAN-107",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-20",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.2090745,
              17.0055173
            ],
            [
              79.2085873,
              17.0038591
            ],
            [
              79.2071669,
              17.0039407
            ],
            [
              79.2073921,
              17.0044959
            ],
            [
              79.2080505,
              17.0061188
            ],
            [
              79.2084717,
              17.0058714
            ],
            [
              79.2090745,
              17.0055173
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-20",
        "ulpin": "14-2526-0020-2026",
        "state_survey_no": "TS-NAL-KAN-107",
        "survey_number": "TS-NAL-KAN-107",
        "state": "Telangana",
        "district": "Nalgonda",
        "mandal": "Kanagal",
        "village": "Parvathagiril",
        "census_code": "577315",
        "dmv_code": "2339010",
        "owner_name": "Venkatesh Narayana",
        "owner_masked": "V***h N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 30457,
        "gis_area_sqm": 30457,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹2,726",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-NAL-KAN-107",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Mandal Revenue Office Kanagal / Nalgonda",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Kanagal Mandal / Nalgonda Division",
      "distanceKm": 3.6,
      "address": "Mandal Complex, Main Road, Kanagal, Nalgonda - 508004",
      "officerName": "Smt. G. Swarna Latha",
      "designation": "Tahsildar & Executive Magistrate",
      "phone": "+91 8682 230114",
      "email": "tah.kanagal@telangana.gov.in",
      "grievanceHours": "Monday & Thursday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-20-1",
        "name": "Venkatesh (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-20-2",
        "name": "Co-owner 20",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-21",
    "ulpin": "14-6888-0021-2026",
    "surveyNumber": "TS-NAL-KAN-108",
    "village": "Parvathagiril",
    "taluk": "Kanagal Mandal",
    "district": "Nalgonda",
    "state": "Telangana",
    "owner": {
      "name": "Mallaiah Goud",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 18008.9,
      "gisSqm": 18008.9,
      "regionalUnit": "Guntha",
      "regionalValue": "4.45 Acres (178.0 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025020"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-NAL-KAN-108",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-21",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.2098146,
              17.0054258
            ],
            [
              79.2097497,
              17.0042376
            ],
            [
              79.2092962,
              17.0043189
            ],
            [
              79.2090532,
              17.0031922
            ],
            [
              79.2085873,
              17.0038591
            ],
            [
              79.2090745,
              17.0055173
            ],
            [
              79.2098146,
              17.0054258
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-21",
        "ulpin": "14-6888-0021-2026",
        "state_survey_no": "TS-NAL-KAN-108",
        "survey_number": "TS-NAL-KAN-108",
        "state": "Telangana",
        "district": "Nalgonda",
        "mandal": "Kanagal",
        "village": "Parvathagiril",
        "census_code": "577315",
        "dmv_code": "2339010",
        "owner_name": "Mallaiah Goud",
        "owner_masked": "M***h G***d",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 18008.9,
        "gis_area_sqm": 18008.9,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹16,088",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-NAL-KAN-108",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Mandal Revenue Office Kanagal / Nalgonda",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Kanagal Mandal / Nalgonda Division",
      "distanceKm": 3.6,
      "address": "Mandal Complex, Main Road, Kanagal, Nalgonda - 508004",
      "officerName": "Smt. G. Swarna Latha",
      "designation": "Tahsildar & Executive Magistrate",
      "phone": "+91 8682 230114",
      "email": "tah.kanagal@telangana.gov.in",
      "grievanceHours": "Monday & Thursday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-21-1",
        "name": "Mallaiah (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-21-2",
        "name": "Co-owner 21",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-22",
    "ulpin": "14-2759-0022-2026",
    "surveyNumber": "TS-NAL-KAN-109",
    "village": "Parvathagiril",
    "taluk": "Kanagal Mandal",
    "district": "Nalgonda",
    "state": "Telangana",
    "owner": {
      "name": "Srinivas Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 20922.3,
      "gisSqm": 20922.3,
      "regionalUnit": "Guntha",
      "regionalValue": "5.17 Acres (206.8 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025021"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-NAL-KAN-109",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-22",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.210225,
              17.0036124
            ],
            [
              79.21022,
              17.003442
            ],
            [
              79.2102178,
              17.003442
            ],
            [
              79.2101967,
              17.0033251
            ],
            [
              79.2101922,
              17.0032999
            ],
            [
              79.2101767,
              17.0031967
            ],
            [
              79.2101735,
              17.0031754
            ],
            [
              79.2101557,
              17.0030575
            ],
            [
              79.2101406,
              17.002957
            ],
            [
              79.2101355,
              17.0029232
            ],
            [
              79.2101323,
              17.0029019
            ],
            [
              79.2101173,
              17.0028245
            ],
            [
              79.2101034,
              17.0027522
            ],
            [
              79.2100854,
              17.0026592
            ],
            [
              79.2100819,
              17.0026413
            ],
            [
              79.2102188,
              17.0026428
            ],
            [
              79.2101578,
              17.0024259
            ],
            [
              79.2093663,
              17.0025916
            ],
            [
              79.2092203,
              17.0026469
            ],
            [
              79.2090532,
              17.0031922
            ],
            [
              79.2092962,
              17.0043189
            ],
            [
              79.2097497,
              17.0042376
            ],
            [
              79.2098993,
              17.0042088
            ],
            [
              79.2101539,
              17.0041395
            ],
            [
              79.2102635,
              17.0041105
            ],
            [
              79.2102773,
              17.0039603
            ],
            [
              79.210225,
              17.0036124
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-22",
        "ulpin": "14-2759-0022-2026",
        "state_survey_no": "TS-NAL-KAN-109",
        "survey_number": "TS-NAL-KAN-109",
        "state": "Telangana",
        "district": "Nalgonda",
        "mandal": "Kanagal",
        "village": "Parvathagiril",
        "census_code": "577315",
        "dmv_code": "2339010",
        "owner_name": "Srinivas Venkatesh",
        "owner_masked": "S***s V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 20922.3,
        "gis_area_sqm": 20922.3,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹8,959",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-NAL-KAN-109",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Mandal Revenue Office Kanagal / Nalgonda",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Kanagal Mandal / Nalgonda Division",
      "distanceKm": 3.6,
      "address": "Mandal Complex, Main Road, Kanagal, Nalgonda - 508004",
      "officerName": "Smt. G. Swarna Latha",
      "designation": "Tahsildar & Executive Magistrate",
      "phone": "+91 8682 230114",
      "email": "tah.kanagal@telangana.gov.in",
      "grievanceHours": "Monday & Thursday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-22-1",
        "name": "Srinivas (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-22-2",
        "name": "Co-owner 22",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-23",
    "ulpin": "14-8264-0023-2026",
    "surveyNumber": "TS-NAL-KAN-106",
    "village": "Parvathagiril",
    "taluk": "Kanagal Mandal",
    "district": "Nalgonda",
    "state": "Telangana",
    "owner": {
      "name": "Laxmi Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 35649.6,
      "gisSqm": 35649.6,
      "regionalUnit": "Guntha",
      "regionalValue": "8.81 Acres (352.4 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025022"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-NAL-KAN-106",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-23",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.2081181,
              17.0015002
            ],
            [
              79.2081024,
              17.0013654
            ],
            [
              79.2068041,
              17.0016883
            ],
            [
              79.2073597,
              17.0030763
            ],
            [
              79.2074336,
              17.0032627
            ],
            [
              79.2073333,
              17.0032799
            ],
            [
              79.2069594,
              17.0034192
            ],
            [
              79.2071669,
              17.0039407
            ],
            [
              79.2085873,
              17.0038591
            ],
            [
              79.2081181,
              17.0015002
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-23",
        "ulpin": "14-8264-0023-2026",
        "state_survey_no": "TS-NAL-KAN-106",
        "survey_number": "TS-NAL-KAN-106",
        "state": "Telangana",
        "district": "Nalgonda",
        "mandal": "Kanagal",
        "village": "Parvathagiril",
        "census_code": "577315",
        "dmv_code": "2339010",
        "owner_name": "Laxmi Narayana",
        "owner_masked": "L***i N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 35649.6,
        "gis_area_sqm": 35649.6,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹14,464",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-NAL-KAN-106",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Mandal Revenue Office Kanagal / Nalgonda",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Kanagal Mandal / Nalgonda Division",
      "distanceKm": 3.6,
      "address": "Mandal Complex, Main Road, Kanagal, Nalgonda - 508004",
      "officerName": "Smt. G. Swarna Latha",
      "designation": "Tahsildar & Executive Magistrate",
      "phone": "+91 8682 230114",
      "email": "tah.kanagal@telangana.gov.in",
      "grievanceHours": "Monday & Thursday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-23-1",
        "name": "Laxmi (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-23-2",
        "name": "Co-owner 23",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-24",
    "ulpin": "14-2903-0024-2026",
    "surveyNumber": "TS-NAL-KAN-105",
    "village": "Parvathagiril",
    "taluk": "Kanagal Mandal",
    "district": "Nalgonda",
    "state": "Telangana",
    "owner": {
      "name": "Prabhakar Goud",
      "type": "Individual Freehold (Succession Contested)"
    },
    "area": {
      "rorSqm": 32683.1,
      "gisSqm": 33500.2,
      "regionalUnit": "Guntha",
      "regionalValue": "8.28 Acres (331.1 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Overdue (3 Years Defaulter)",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025023"
    },
    "encumbrances": [
      {
        "date": "2024-11-15",
        "type": "Mutation Dispute Objection",
        "details": "Objection petition filed under ROR Act §5",
        "status": "Active"
      },
      {
        "date": "2020-02-18",
        "type": "Primary Agriculture Co-op Loan",
        "details": "Crop loan hypothecation of ₹1,80,000",
        "status": "Active"
      }
    ],
    "status": "WARNING",
    "trustScore": 58,
    "trustGrade": "C",
    "violations": [
      {
        "id": "vio-24",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 6030,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-24",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              79.2096161,
              17.0009932
            ],
            [
              79.209616,
              17.0009928
            ],
            [
              79.209616,
              17.0009928
            ],
            [
              79.2081024,
              17.0013654
            ],
            [
              79.2081181,
              17.0015002
            ],
            [
              79.2085873,
              17.0038591
            ],
            [
              79.2090532,
              17.0031922
            ],
            [
              79.2092203,
              17.0026469
            ],
            [
              79.2093663,
              17.0025916
            ],
            [
              79.2101578,
              17.0024259
            ],
            [
              79.2101006,
              17.0022619
            ],
            [
              79.2100976,
              17.0022532
            ],
            [
              79.2099818,
              17.0021877
            ],
            [
              79.2099113,
              17.0021478
            ],
            [
              79.2098168,
              17.0020943
            ],
            [
              79.2095571,
              17.0020786
            ],
            [
              79.2094998,
              17.0019243
            ],
            [
              79.2095484,
              17.0019242
            ],
            [
              79.2096709,
              17.0019241
            ],
            [
              79.2096122,
              17.0018271
            ],
            [
              79.2095116,
              17.0016611
            ],
            [
              79.2094852,
              17.001562
            ],
            [
              79.2094466,
              17.0013449
            ],
            [
              79.2095676,
              17.0013438
            ],
            [
              79.209625,
              17.0013433
            ],
            [
              79.2096637,
              17.0013429
            ],
            [
              79.2096161,
              17.0009932
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-24",
        "ulpin": "14-2903-0024-2026",
        "state_survey_no": "TS-NAL-KAN-105",
        "survey_number": "TS-NAL-KAN-105",
        "state": "Telangana",
        "district": "Nalgonda",
        "mandal": "Kanagal",
        "village": "Parvathagiril",
        "census_code": "577315",
        "dmv_code": "2339010",
        "owner_name": "Prabhakar Goud",
        "owner_masked": "P***r G***d",
        "owner_type": "Individual Freehold (Succession Contested)",
        "legal_ror_area_sqm": 32683.1,
        "gis_area_sqm": 33500.2,
        "area_diff_sqm": 817.1,
        "area_diff_pct": 2.5,
        "status": "WARNING",
        "trust_score": "C",
        "trust_num": 58,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Agricultural Freehold",
        "tax_status": "Overdue (3 Years Defaulter)",
        "tax_amount": "₹9,103",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "MUTATION_DISPUTE",
        "permit_status": "Agricultural Ryotwari",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-024",
            "severity": "WARNING",
            "type": "MUTATION_CONTESTED",
            "description": "SUCCESSION DISPUTE: Contested mutation application filed before Tahsildar",
            "details": "Succession transfer challenged by legal heirs. Revenue record locked pending DRO inquiry.",
            "encroachment_area_sqm": 0
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2024-11-15",
            "type": "Mutation Dispute Objection",
            "details": "Objection petition filed under ROR Act §5",
            "status": "Active"
          },
          {
            "date": "2020-02-18",
            "type": "Primary Agriculture Co-op Loan",
            "details": "Crop loan hypothecation of ₹1,80,000",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                79.2078024,
                17.0006928
              ],
              [
                79.2104578,
                17.0006928
              ],
              [
                79.2104578,
                17.00262595
              ],
              [
                79.2078024,
                17.00262595
              ],
              [
                79.2078024,
                17.0006928
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Mandal Revenue Office Kanagal / Nalgonda",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Kanagal Mandal / Nalgonda Division",
      "distanceKm": 3.6,
      "address": "Mandal Complex, Main Road, Kanagal, Nalgonda - 508004",
      "officerName": "Smt. G. Swarna Latha",
      "designation": "Tahsildar & Executive Magistrate",
      "phone": "+91 8682 230114",
      "email": "tah.kanagal@telangana.gov.in",
      "grievanceHours": "Monday & Thursday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-24-1",
        "name": "Prabhakar (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-24-2",
        "name": "Co-owner 24",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-25",
    "ulpin": "14-3572-0025-2026",
    "surveyNumber": "TS-SAN-AME-453",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Sudarshan Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 19754.8,
      "gisSqm": 19754.8,
      "regionalUnit": "Guntha",
      "regionalValue": "4.88 Acres (195.3 Gunthas)"
    },
    "landUse": "Residential Zone R2",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025024"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SAN-AME-453",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-25",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3264361,
              17.5486605
            ],
            [
              78.3263458,
              17.5485393
            ],
            [
              78.3262224,
              17.5484006
            ],
            [
              78.3260757,
              17.5482836
            ],
            [
              78.3259027,
              17.5482551
            ],
            [
              78.3256621,
              17.5482185
            ],
            [
              78.3254785,
              17.5481884
            ],
            [
              78.3252891,
              17.5481159
            ],
            [
              78.3250726,
              17.5480006
            ],
            [
              78.324486,
              17.5479841
            ],
            [
              78.3240435,
              17.5479747
            ],
            [
              78.3239063,
              17.5479559
            ],
            [
              78.3240458,
              17.548062
            ],
            [
              78.3244264,
              17.5483414
            ],
            [
              78.3246997,
              17.5486207
            ],
            [
              78.3249701,
              17.5489624
            ],
            [
              78.3251412,
              17.5493092
            ],
            [
              78.3251879,
              17.549468
            ],
            [
              78.3253291,
              17.5493798
            ],
            [
              78.3263017,
              17.548731
            ],
            [
              78.3264361,
              17.5486605
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-25",
        "ulpin": "14-3572-0025-2026",
        "state_survey_no": "TS-SAN-AME-453",
        "survey_number": "TS-SAN-AME-453",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Sudarshan Venkatesh",
        "owner_masked": "S***n V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 19754.8,
        "gis_area_sqm": 19754.8,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Residential Zone R2",
        "classification": "Plotted Residential Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹3,772",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SAN-AME-453",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-25-1",
        "name": "Sudarshan (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-25-2",
        "name": "Co-owner 25",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-26",
    "ulpin": "14-2467-0026-2026",
    "surveyNumber": "TS-SAN-AME-454",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Narasimha Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 20931.4,
      "gisSqm": 20931.4,
      "regionalUnit": "Guntha",
      "regionalValue": "5.17 Acres (206.9 Gunthas)"
    },
    "landUse": "Residential Zone R2",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025025"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SAN-AME-454",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-26",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3239063,
              17.5479559
            ],
            [
              78.3235785,
              17.5479245
            ],
            [
              78.3235368,
              17.5489554
            ],
            [
              78.3233289,
              17.5490957
            ],
            [
              78.3232284,
              17.54917
            ],
            [
              78.3232938,
              17.5493826
            ],
            [
              78.3234425,
              17.5493942
            ],
            [
              78.3239444,
              17.5494149
            ],
            [
              78.3250398,
              17.5494595
            ],
            [
              78.3251879,
              17.549468
            ],
            [
              78.3251412,
              17.5493092
            ],
            [
              78.3249701,
              17.5489624
            ],
            [
              78.3246997,
              17.5486207
            ],
            [
              78.3244264,
              17.5483414
            ],
            [
              78.3240458,
              17.548062
            ],
            [
              78.3239063,
              17.5479559
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-26",
        "ulpin": "14-2467-0026-2026",
        "state_survey_no": "TS-SAN-AME-454",
        "survey_number": "TS-SAN-AME-454",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Narasimha Narayana",
        "owner_masked": "N***a N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 20931.4,
        "gis_area_sqm": 20931.4,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Residential Zone R2",
        "classification": "Plotted Residential Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹2,667",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SAN-AME-454",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-26-1",
        "name": "Narasimha (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-26-2",
        "name": "Co-owner 26",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-27",
    "ulpin": "14-8949-0027-2026",
    "surveyNumber": "TS-SAN-AME-455",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Kavitha Goud",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 39500.7,
      "gisSqm": 39500.7,
      "regionalUnit": "Guntha",
      "regionalValue": "9.76 Acres (390.4 Gunthas)"
    },
    "landUse": "Residential Zone R2",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025026"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SAN-AME-455",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-27",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3234425,
              17.5493942
            ],
            [
              78.3232938,
              17.5493826
            ],
            [
              78.3231988,
              17.5494631
            ],
            [
              78.3221515,
              17.5505417
            ],
            [
              78.3220797,
              17.550668
            ],
            [
              78.3221789,
              17.5506793
            ],
            [
              78.323091,
              17.5507131
            ],
            [
              78.3250273,
              17.5507848
            ],
            [
              78.3251545,
              17.5507833
            ],
            [
              78.3251601,
              17.5506272
            ],
            [
              78.3251673,
              17.5503715
            ],
            [
              78.3251876,
              17.5496517
            ],
            [
              78.3251879,
              17.549468
            ],
            [
              78.3250398,
              17.5494595
            ],
            [
              78.3239444,
              17.5494149
            ],
            [
              78.3234425,
              17.5493942
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-27",
        "ulpin": "14-8949-0027-2026",
        "state_survey_no": "TS-SAN-AME-455",
        "survey_number": "TS-SAN-AME-455",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Kavitha Goud",
        "owner_masked": "K***a G***d",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 39500.7,
        "gis_area_sqm": 39500.7,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Residential Zone R2",
        "classification": "Plotted Residential Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹15,149",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SAN-AME-455",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-27-1",
        "name": "Kavitha (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-27-2",
        "name": "Co-owner 27",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-28",
    "ulpin": "14-8829-0028-2026",
    "surveyNumber": "TS-SAN-AME-456",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Shankar Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 56915.7,
      "gisSqm": 56915.7,
      "regionalUnit": "Guntha",
      "regionalValue": "14.06 Acres (562.6 Gunthas)"
    },
    "landUse": "Residential Zone R2",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025027"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SAN-AME-456",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-28",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3229888,
              17.5524245
            ],
            [
              78.3236897,
              17.5520825
            ],
            [
              78.3239393,
              17.5522417
            ],
            [
              78.3243454,
              17.5520996
            ],
            [
              78.3244848,
              17.5520961
            ],
            [
              78.3245583,
              17.5519656
            ],
            [
              78.3251117,
              17.5509055
            ],
            [
              78.3251545,
              17.5507833
            ],
            [
              78.3250273,
              17.5507848
            ],
            [
              78.323091,
              17.5507131
            ],
            [
              78.3221789,
              17.5506793
            ],
            [
              78.3220797,
              17.550668
            ],
            [
              78.3219873,
              17.5507844
            ],
            [
              78.3217181,
              17.5512808
            ],
            [
              78.3217848,
              17.5513606
            ],
            [
              78.3217634,
              17.5516129
            ],
            [
              78.3217306,
              17.5517142
            ],
            [
              78.3216258,
              17.551763
            ],
            [
              78.321762,
              17.551839
            ],
            [
              78.3223197,
              17.5527791
            ],
            [
              78.3224007,
              17.5529153
            ],
            [
              78.3224861,
              17.5528557
            ],
            [
              78.3229888,
              17.5524245
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-28",
        "ulpin": "14-8829-0028-2026",
        "state_survey_no": "TS-SAN-AME-456",
        "survey_number": "TS-SAN-AME-456",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Shankar Venkatesh",
        "owner_masked": "S***r V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 56915.7,
        "gis_area_sqm": 56915.7,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Residential Zone R2",
        "classification": "Plotted Residential Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹12,029",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SAN-AME-456",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-28-1",
        "name": "Shankar (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-28-2",
        "name": "Co-owner 28",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-29",
    "ulpin": "14-9167-0029-2026",
    "surveyNumber": "TS-SAN-AME-451",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Yadagiri Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 16978.7,
      "gisSqm": 16978.7,
      "regionalUnit": "Guntha",
      "regionalValue": "4.20 Acres (167.8 Gunthas)"
    },
    "landUse": "Residential Zone R2",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025028"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SAN-AME-451",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-29",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3275055,
              17.5471812
            ],
            [
              78.3282088,
              17.5466535
            ],
            [
              78.3279661,
              17.5466267
            ],
            [
              78.3270514,
              17.5465726
            ],
            [
              78.326963,
              17.5465674
            ],
            [
              78.3263615,
              17.5465319
            ],
            [
              78.3263198,
              17.5466062
            ],
            [
              78.3262067,
              17.5466035
            ],
            [
              78.3254963,
              17.5469178
            ],
            [
              78.3253648,
              17.5469638
            ],
            [
              78.3255186,
              17.5470612
            ],
            [
              78.3259292,
              17.5472866
            ],
            [
              78.3260565,
              17.547374
            ],
            [
              78.326255,
              17.5473323
            ],
            [
              78.3273437,
              17.5471853
            ],
            [
              78.3275055,
              17.5471812
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-29",
        "ulpin": "14-9167-0029-2026",
        "state_survey_no": "TS-SAN-AME-451",
        "survey_number": "TS-SAN-AME-451",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Yadagiri Narayana",
        "owner_masked": "Y***i N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 16978.7,
        "gis_area_sqm": 16978.7,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Residential Zone R2",
        "classification": "Plotted Residential Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹9,367",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SAN-AME-451",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-29-1",
        "name": "Yadagiri (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-29-2",
        "name": "Co-owner 29",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-30",
    "ulpin": "14-6770-0030-2026",
    "surveyNumber": "TS-SAN-AME-452",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Venkatesh Goud",
      "type": "Individual Freehold (Succession Contested)"
    },
    "area": {
      "rorSqm": 14063.9,
      "gisSqm": 14415.5,
      "regionalUnit": "Guntha",
      "regionalValue": "3.56 Acres (142.5 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Overdue (3 Years Defaulter)",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025029"
    },
    "encumbrances": [
      {
        "date": "2024-11-15",
        "type": "Mutation Dispute Objection",
        "details": "Objection petition filed under ROR Act §5",
        "status": "Active"
      },
      {
        "date": "2020-02-18",
        "type": "Primary Agriculture Co-op Loan",
        "details": "Crop loan hypothecation of ₹1,80,000",
        "status": "Active"
      }
    ],
    "status": "WARNING",
    "trustScore": 58,
    "trustGrade": "C",
    "violations": [
      {
        "id": "vio-30",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 2595,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-30",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3255186,
              17.5470612
            ],
            [
              78.3253648,
              17.5469638
            ],
            [
              78.3252133,
              17.5470225
            ],
            [
              78.324789,
              17.5472319
            ],
            [
              78.3246589,
              17.5472877
            ],
            [
              78.3247615,
              17.5474013
            ],
            [
              78.3253292,
              17.5480623
            ],
            [
              78.3254785,
              17.5481884
            ],
            [
              78.3256621,
              17.5482185
            ],
            [
              78.3259027,
              17.5482551
            ],
            [
              78.3260757,
              17.5482836
            ],
            [
              78.326134,
              17.548183
            ],
            [
              78.3261724,
              17.5479855
            ],
            [
              78.3261646,
              17.5478721
            ],
            [
              78.3261343,
              17.5477511
            ],
            [
              78.3260858,
              17.5474802
            ],
            [
              78.3260565,
              17.547374
            ],
            [
              78.3259292,
              17.5472866
            ],
            [
              78.3255186,
              17.5470612
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-30",
        "ulpin": "14-6770-0030-2026",
        "state_survey_no": "TS-SAN-AME-452",
        "survey_number": "TS-SAN-AME-452",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Venkatesh Goud",
        "owner_masked": "V***h G***d",
        "owner_type": "Individual Freehold (Succession Contested)",
        "legal_ror_area_sqm": 14063.9,
        "gis_area_sqm": 14415.5,
        "area_diff_sqm": 351.6,
        "area_diff_pct": 2.5,
        "status": "WARNING",
        "trust_score": "C",
        "trust_num": 58,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Agricultural Freehold",
        "tax_status": "Overdue (3 Years Defaulter)",
        "tax_amount": "₹12,970",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "MUTATION_DISPUTE",
        "permit_status": "Agricultural Ryotwari",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-030",
            "severity": "WARNING",
            "type": "MUTATION_CONTESTED",
            "description": "SUCCESSION DISPUTE: Contested mutation application filed before Tahsildar",
            "details": "Succession transfer challenged by legal heirs. Revenue record locked pending DRO inquiry.",
            "encroachment_area_sqm": 0
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2024-11-15",
            "type": "Mutation Dispute Objection",
            "details": "Objection petition filed under ROR Act §5",
            "status": "Active"
          },
          {
            "date": "2020-02-18",
            "type": "Primary Agriculture Co-op Loan",
            "details": "Crop loan hypothecation of ₹1,80,000",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.32435890000001,
                17.5466638
              ],
              [
                78.3264724,
                17.5466638
              ],
              [
                78.3264724,
                17.547823700000002
              ],
              [
                78.32435890000001,
                17.547823700000002
              ],
              [
                78.32435890000001,
                17.5466638
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-30-1",
        "name": "Venkatesh (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-30-2",
        "name": "Co-owner 30",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-31",
    "ulpin": "14-2501-0031-2026",
    "surveyNumber": "TS-SAN-AME-458/Kunta",
    "village": "Sultanpur",
    "taluk": "Ameenpur Mandal",
    "district": "Sangareddy",
    "state": "Telangana",
    "owner": {
      "name": "Mallaiah Venkatesh",
      "type": "Government Custody / Contested Encroachment"
    },
    "area": {
      "rorSqm": 44655,
      "gisSqm": 46441.2,
      "regionalUnit": "Guntha",
      "regionalValue": "11.48 Acres (459.0 Gunthas)"
    },
    "landUse": "Waterbody Tank Bed (Kunta Poramboke)",
    "tax": {
      "status": "Not Applicable (Govt Commons)",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025030"
    },
    "encumbrances": [
      {
        "date": "2024-03-10",
        "type": "Revenue Tahsildar Notice",
        "details": "Eviction Notice under Land Encroachment Act §6",
        "status": "Active"
      }
    ],
    "status": "CRITICAL",
    "trustScore": 12,
    "trustGrade": "F",
    "violations": [
      {
        "id": "vio-31",
        "type": "WATERBODY_BUFFER_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Full Tank Level (FTL) Lake Buffer Encroachment",
        "description": "Cadastral parcel intrudes into notified lake/kunta water catchment buffer line.",
        "encroachmentAreaSqm": 8359,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-31",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.3253648,
              17.5469638
            ],
            [
              78.3254963,
              17.5469178
            ],
            [
              78.3262067,
              17.5466035
            ],
            [
              78.3263198,
              17.5466062
            ],
            [
              78.3263615,
              17.5465319
            ],
            [
              78.3237483,
              17.5463776
            ],
            [
              78.3223958,
              17.5471267
            ],
            [
              78.322186,
              17.5474572
            ],
            [
              78.3235785,
              17.5479245
            ],
            [
              78.3239063,
              17.5479559
            ],
            [
              78.3240435,
              17.5479747
            ],
            [
              78.324486,
              17.5479841
            ],
            [
              78.3250726,
              17.5480006
            ],
            [
              78.3252891,
              17.5481159
            ],
            [
              78.3254785,
              17.5481884
            ],
            [
              78.3253292,
              17.5480623
            ],
            [
              78.3247615,
              17.5474013
            ],
            [
              78.3246589,
              17.5472877
            ],
            [
              78.324789,
              17.5472319
            ],
            [
              78.3252133,
              17.5470225
            ],
            [
              78.3253648,
              17.5469638
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-31",
        "ulpin": "14-2501-0031-2026",
        "state_survey_no": "TS-SAN-AME-458/Kunta",
        "survey_number": "TS-SAN-AME-458/Kunta",
        "state": "Telangana",
        "district": "Sangareddy",
        "mandal": "Ameenpur",
        "village": "Sultanpur",
        "census_code": "573930",
        "dmv_code": "1737006",
        "owner_name": "Mallaiah Venkatesh",
        "owner_masked": "M***h V***h",
        "owner_type": "Government Custody / Contested Encroachment",
        "legal_ror_area_sqm": 44655,
        "gis_area_sqm": 46441.2,
        "area_diff_sqm": 1786.2,
        "area_diff_pct": 4,
        "status": "CRITICAL",
        "trust_score": "F",
        "trust_num": 12,
        "zoning": "Waterbody Tank Bed (Kunta Poramboke)",
        "classification": "Waterbody / Government Poramboke",
        "tax_status": "Not Applicable (Govt Commons)",
        "tax_amount": "₹14,701",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "CRITICAL_WATERBODY_ENCROACHMENT",
        "permit_status": "Prohibited / Unsanctioned",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Unauthorized Structure",
            "height": 4.5,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-031",
            "severity": "CRITICAL",
            "type": "WATERBODY_ENCROACHMENT",
            "description": "CRITICAL: Village Irrigation Kunta tank bed encroachment",
            "details": "Survey #458/Kunta is recorded as government Kunta in revenue Sethwar. Unsanctioned fencing detected by survey team.",
            "encroachment_area_sqm": 15629.2
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2024-03-10",
            "type": "Revenue Tahsildar Notice",
            "details": "Eviction Notice under Land Encroachment Act §6",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.321886,
                17.5460776
              ],
              [
                78.3266615,
                17.5460776
              ],
              [
                78.3266615,
                17.547483
              ],
              [
                78.321886,
                17.547483
              ],
              [
                78.321886,
                17.5460776
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Sub-Registrar Office (SRO) Ameenpur / Sangareddy Revenue Division",
      "officeType": "Sub-Registrar Office (Registration Dept)",
      "jurisdiction": "Ameenpur Mandal / Sangareddy Registration Circle",
      "distanceKm": 2.4,
      "address": "Near Old Gram Panchayat Office, Ameenpur, Sangareddy - 502032",
      "officerName": "K. Sridhar Rao, M.A.",
      "designation": "Joint Sub-Registrar & Dharani Nodal Officer",
      "phone": "+91 8455 278110",
      "altPhone": "+91 94401 22910",
      "email": "sro.ameenpur@telangana.gov.in",
      "grievanceHours": "Monday to Friday: 10:30 AM – 1:30 PM",
      "emergencyHelpline": "1800-599-4455 (Dharani Kisan Sahayata)"
    },
    "coOwners": [
      {
        "id": "co-31-1",
        "name": "Mallaiah (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-31-2",
        "name": "Co-owner 31",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-32",
    "ulpin": "14-8084-0032-2026",
    "surveyNumber": "TS-SID-MUL-210",
    "village": "Achaipally",
    "taluk": "Mulug Mandal",
    "district": "Siddipet",
    "state": "Telangana",
    "owner": {
      "name": "Srinivas Narayana",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 92209.2,
      "gisSqm": 92209.2,
      "regionalUnit": "Guntha",
      "regionalValue": "22.79 Acres (911.4 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025031"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SID-MUL-210",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-32",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.5658372,
              17.700329
            ],
            [
              78.5673283,
              17.700093
            ],
            [
              78.5683436,
              17.7006818
            ],
            [
              78.5675488,
              17.6983421
            ],
            [
              78.5661605,
              17.6980903
            ],
            [
              78.5660082,
              17.6981999
            ],
            [
              78.5656047,
              17.6984904
            ],
            [
              78.5637658,
              17.6996031
            ],
            [
              78.5629881,
              17.7000665
            ],
            [
              78.5639235,
              17.7007625
            ],
            [
              78.5658372,
              17.700329
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-32",
        "ulpin": "14-8084-0032-2026",
        "state_survey_no": "TS-SID-MUL-210",
        "survey_number": "TS-SID-MUL-210",
        "state": "Telangana",
        "district": "Siddipet",
        "mandal": "Mulug",
        "village": "Achaipally",
        "census_code": "573701",
        "dmv_code": "1745023",
        "owner_name": "Srinivas Narayana",
        "owner_masked": "S***s N***a",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 92209.2,
        "gis_area_sqm": 92209.2,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹8,284",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SID-MUL-210",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Mulug / Siddipet",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Mulug Mandal / Gajwel Revenue Division",
      "distanceKm": 2.9,
      "address": "R&R Colony Road, Mulug, Siddipet - 502279",
      "officerName": "Sri K. Mahender Reddy",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8454 266400",
      "email": "tah.mulug@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-32-1",
        "name": "Srinivas (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-32-2",
        "name": "Co-owner 32",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-33",
    "ulpin": "14-7799-0033-2026",
    "surveyNumber": "TS-SID-MUL-211/1",
    "village": "Achaipally",
    "taluk": "Mulug Mandal",
    "district": "Siddipet",
    "state": "Telangana",
    "owner": {
      "name": "Laxmi Goud",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 523742.5,
      "gisSqm": 523742.5,
      "regionalUnit": "Guntha",
      "regionalValue": "129.42 Acres (5176.9 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025032"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SID-MUL-211/1",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 88,
    "trustGrade": "B",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-33",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.5775272,
              17.704387
            ],
            [
              78.5768334,
              17.7046745
            ],
            [
              78.5767208,
              17.7045691
            ],
            [
              78.576754,
              17.7040498
            ],
            [
              78.576807,
              17.703961
            ],
            [
              78.5764956,
              17.7040227
            ],
            [
              78.5762755,
              17.7031899
            ],
            [
              78.5766338,
              17.7029142
            ],
            [
              78.5776606,
              17.7017931
            ],
            [
              78.5780827,
              17.7013761
            ],
            [
              78.5782064,
              17.7011489
            ],
            [
              78.5782558,
              17.7010966
            ],
            [
              78.5793695,
              17.69995
            ],
            [
              78.5807678,
              17.6982226
            ],
            [
              78.5811211,
              17.6981422
            ],
            [
              78.581427,
              17.6980783
            ],
            [
              78.5815332,
              17.6980427
            ],
            [
              78.5816194,
              17.6977797
            ],
            [
              78.5817187,
              17.6972728
            ],
            [
              78.5816192,
              17.697361
            ],
            [
              78.5816062,
              17.6973726
            ],
            [
              78.5812417,
              17.6976961
            ],
            [
              78.580482,
              17.6972712
            ],
            [
              78.5799139,
              17.6968429
            ],
            [
              78.5791781,
              17.6965934
            ],
            [
              78.5790428,
              17.697183
            ],
            [
              78.5788887,
              17.697705
            ],
            [
              78.5787325,
              17.6981232
            ],
            [
              78.578557,
              17.6985562
            ],
            [
              78.5778295,
              17.6983864
            ],
            [
              78.5772112,
              17.6980976
            ],
            [
              78.5772259,
              17.6977514
            ],
            [
              78.5764377,
              17.6976685
            ],
            [
              78.5762923,
              17.697677
            ],
            [
              78.5762236,
              17.6982272
            ],
            [
              78.5753092,
              17.6981021
            ],
            [
              78.5743948,
              17.6979922
            ],
            [
              78.5744594,
              17.6974649
            ],
            [
              78.5745515,
              17.6967948
            ],
            [
              78.5742626,
              17.6967815
            ],
            [
              78.5742704,
              17.6958684
            ],
            [
              78.5739183,
              17.69588
            ],
            [
              78.5734077,
              17.695931
            ],
            [
              78.5732427,
              17.6959444
            ],
            [
              78.5731522,
              17.6959561
            ],
            [
              78.5729021,
              17.6959682
            ],
            [
              78.572424,
              17.6959886
            ],
            [
              78.5718885,
              17.6960088
            ],
            [
              78.5717503,
              17.696017
            ],
            [
              78.5707795,
              17.6961517
            ],
            [
              78.5704665,
              17.6962211
            ],
            [
              78.5702717,
              17.6963636
            ],
            [
              78.5701656,
              17.696374
            ],
            [
              78.570061,
              17.6963878
            ],
            [
              78.5699019,
              17.6964097
            ],
            [
              78.5695942,
              17.6964511
            ],
            [
              78.5694984,
              17.696489
            ],
            [
              78.5695141,
              17.6992866
            ],
            [
              78.5700568,
              17.6992896
            ],
            [
              78.5698607,
              17.7001599
            ],
            [
              78.5701217,
              17.7000598
            ],
            [
              78.5701903,
              17.6994771
            ],
            [
              78.5705205,
              17.6992908
            ],
            [
              78.5709232,
              17.6990353
            ],
            [
              78.5711613,
              17.6997212
            ],
            [
              78.5714247,
              17.7005635
            ],
            [
              78.5707828,
              17.7006455
            ],
            [
              78.5703506,
              17.7008342
            ],
            [
              78.5697615,
              17.7011102
            ],
            [
              78.5696452,
              17.7002485
            ],
            [
              78.569507,
              17.7002661
            ],
            [
              78.5695035,
              17.7003846
            ],
            [
              78.5695218,
              17.7005893
            ],
            [
              78.5694517,
              17.7011929
            ],
            [
              78.5693833,
              17.7017034
            ],
            [
              78.57091,
              17.7023562
            ],
            [
              78.5721608,
              17.7019632
            ],
            [
              78.5725573,
              17.7031441
            ],
            [
              78.5726532,
              17.7031337
            ],
            [
              78.5729535,
              17.703022
            ],
            [
              78.5737418,
              17.7028099
            ],
            [
              78.5742312,
              17.7027194
            ],
            [
              78.5747993,
              17.7027879
            ],
            [
              78.5754536,
              17.70338
            ],
            [
              78.5761516,
              17.703344
            ],
            [
              78.5763962,
              17.7038023
            ],
            [
              78.5763068,
              17.7040205
            ],
            [
              78.5765314,
              17.7049395
            ],
            [
              78.5769894,
              17.705019
            ],
            [
              78.5775272,
              17.704387
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-33",
        "ulpin": "14-7799-0033-2026",
        "state_survey_no": "TS-SID-MUL-211/1",
        "survey_number": "TS-SID-MUL-211/1",
        "state": "Telangana",
        "district": "Siddipet",
        "mandal": "Mulug",
        "village": "Achaipally",
        "census_code": "573701",
        "dmv_code": "1745023",
        "owner_name": "Laxmi Goud",
        "owner_masked": "L***i G***d",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 523742.5,
        "gis_area_sqm": 523742.5,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "B",
        "trust_num": 88,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹7,999",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SID-MUL-211/1",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Mulug / Siddipet",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Mulug Mandal / Gajwel Revenue Division",
      "distanceKm": 2.9,
      "address": "R&R Colony Road, Mulug, Siddipet - 502279",
      "officerName": "Sri K. Mahender Reddy",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8454 266400",
      "email": "tah.mulug@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-33-1",
        "name": "Laxmi (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-33-2",
        "name": "Co-owner 33",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-34",
    "ulpin": "14-1966-0034-2026",
    "surveyNumber": "TS-SID-MUL-212",
    "village": "Achaipally",
    "taluk": "Mulug Mandal",
    "district": "Siddipet",
    "state": "Telangana",
    "owner": {
      "name": "Prabhakar Venkatesh",
      "type": "Statutory Freehold"
    },
    "area": {
      "rorSqm": 27320.1,
      "gisSqm": 27320.1,
      "regionalUnit": "Guntha",
      "regionalValue": "6.75 Acres (270.0 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Paid",
      "lastPaidDate": "2025-09-30",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025033"
    },
    "encumbrances": [
      {
        "date": "2022-08-14",
        "type": "Registered Dharani Patta Passbook",
        "details": "Dharani Digital Title Passbook #TS-SID-MUL-212",
        "status": "Clean"
      },
      {
        "date": "2025-06-10",
        "type": "Land Revenue Clearance",
        "details": "Annual land revenue assessed and cleared",
        "status": "Cleared"
      }
    ],
    "status": "CLEAN",
    "trustScore": 94,
    "trustGrade": "A",
    "violations": [],
    "geometry": {
      "type": "Feature",
      "id": "parcel-34",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.5741763,
              17.7036015
            ],
            [
              78.5737418,
              17.7028099
            ],
            [
              78.5729535,
              17.703022
            ],
            [
              78.5726532,
              17.7031337
            ],
            [
              78.572938,
              17.7039475
            ],
            [
              78.5733127,
              17.7047401
            ],
            [
              78.5733796,
              17.7048128
            ],
            [
              78.5743295,
              17.7046442
            ],
            [
              78.5745112,
              17.7044976
            ],
            [
              78.5744803,
              17.7043186
            ],
            [
              78.5741763,
              17.7036015
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-34",
        "ulpin": "14-1966-0034-2026",
        "state_survey_no": "TS-SID-MUL-212",
        "survey_number": "TS-SID-MUL-212",
        "state": "Telangana",
        "district": "Siddipet",
        "mandal": "Mulug",
        "village": "Achaipally",
        "census_code": "573701",
        "dmv_code": "1745023",
        "owner_name": "Prabhakar Venkatesh",
        "owner_masked": "P***r V***h",
        "owner_type": "Statutory Freehold",
        "legal_ror_area_sqm": 27320.1,
        "gis_area_sqm": 27320.1,
        "area_diff_sqm": 0,
        "area_diff_pct": 0,
        "status": "CLEAN",
        "trust_score": "A",
        "trust_num": 94,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Ryotwari Freehold",
        "tax_status": "Paid",
        "tax_amount": "₹2,166",
        "tax_last_paid": "2025-09-30",
        "dispute_tag": "CLEAN",
        "permit_status": "Approved Patta / Dharani Integrated",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2022-08-14",
            "type": "Registered Dharani Patta Passbook",
            "details": "Dharani Digital Title Passbook #TS-SID-MUL-212",
            "status": "Clean"
          },
          {
            "date": "2025-06-10",
            "type": "Land Revenue Clearance",
            "details": "Annual land revenue assessed and cleared",
            "status": "Cleared"
          }
        ]
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Mulug / Siddipet",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Mulug Mandal / Gajwel Revenue Division",
      "distanceKm": 2.9,
      "address": "R&R Colony Road, Mulug, Siddipet - 502279",
      "officerName": "Sri K. Mahender Reddy",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8454 266400",
      "email": "tah.mulug@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-34-1",
        "name": "Prabhakar (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-34-2",
        "name": "Co-owner 34",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-35",
    "ulpin": "14-3797-0035-2026",
    "surveyNumber": "TS-SID-MUL-213",
    "village": "Achaipally",
    "taluk": "Mulug Mandal",
    "district": "Siddipet",
    "state": "Telangana",
    "owner": {
      "name": "Sudarshan Narayana",
      "type": "Contested Encroachment"
    },
    "area": {
      "rorSqm": 27731.1,
      "gisSqm": 29117.7,
      "regionalUnit": "Guntha",
      "regionalValue": "7.20 Acres (287.8 Gunthas)"
    },
    "landUse": "Protected Forest Fringe / Govt Commons",
    "tax": {
      "status": "Defaulter / Disputed",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025034"
    },
    "encumbrances": [
      {
        "date": "2025-02-01",
        "type": "Divisional Revenue Officer Notice",
        "details": "Section 7 Show-Cause Notice for unauthorized occupation",
        "status": "Active"
      }
    ],
    "status": "CRITICAL",
    "trustScore": 22,
    "trustGrade": "F",
    "violations": [
      {
        "id": "vio-35",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 5241,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-35",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.5752341,
              17.7043069
            ],
            [
              78.5753311,
              17.7040765
            ],
            [
              78.5757852,
              17.7040738
            ],
            [
              78.5758754,
              17.7040076
            ],
            [
              78.5763068,
              17.7040205
            ],
            [
              78.5763962,
              17.7038023
            ],
            [
              78.5761516,
              17.703344
            ],
            [
              78.5754536,
              17.70338
            ],
            [
              78.5747993,
              17.7027879
            ],
            [
              78.5742312,
              17.7027194
            ],
            [
              78.5737418,
              17.7028099
            ],
            [
              78.5741763,
              17.7036015
            ],
            [
              78.5744803,
              17.7043186
            ],
            [
              78.5747627,
              17.7041695
            ],
            [
              78.5749442,
              17.7041917
            ],
            [
              78.5749791,
              17.7043698
            ],
            [
              78.5752341,
              17.7043069
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-35",
        "ulpin": "14-3797-0035-2026",
        "state_survey_no": "TS-SID-MUL-213",
        "survey_number": "TS-SID-MUL-213",
        "state": "Telangana",
        "district": "Siddipet",
        "mandal": "Mulug",
        "village": "Achaipally",
        "census_code": "573701",
        "dmv_code": "1745023",
        "owner_name": "Sudarshan Narayana",
        "owner_masked": "S***n N***a",
        "owner_type": "Contested Encroachment",
        "legal_ror_area_sqm": 27731.1,
        "gis_area_sqm": 29117.7,
        "area_diff_sqm": 1386.6,
        "area_diff_pct": 5,
        "status": "CRITICAL",
        "trust_score": "E",
        "trust_num": 22,
        "zoning": "Protected Forest Fringe / Govt Commons",
        "classification": "Government Assigned / Forest Buffer",
        "tax_status": "Defaulter / Disputed",
        "tax_amount": "₹12,997",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "CRITICAL_GOVT_LAND_ENCROACHMENT",
        "permit_status": "Unsanctioned Commercial Operation",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Unauthorized Structure",
            "height": 4.5,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-035",
            "severity": "CRITICAL",
            "type": "GOVT_LAND_ENCROACHMENT",
            "description": "CRITICAL: Boundary extension into notified government land",
            "details": "GIS boundary extends 1386.6 m² into contiguous government revenue land. Show-cause notice required.",
            "encroachment_area_sqm": 1386.6
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2025-02-01",
            "type": "Divisional Revenue Officer Notice",
            "details": "Section 7 Show-Cause Notice for unauthorized occupation",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.5734418,
                17.7024194
              ],
              [
                78.5766962,
                17.7024194
              ],
              [
                78.5766962,
                17.7037446
              ],
              [
                78.5734418,
                17.7037446
              ],
              [
                78.5734418,
                17.7024194
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Mulug / Siddipet",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Mulug Mandal / Gajwel Revenue Division",
      "distanceKm": 2.9,
      "address": "R&R Colony Road, Mulug, Siddipet - 502279",
      "officerName": "Sri K. Mahender Reddy",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8454 266400",
      "email": "tah.mulug@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-35-1",
        "name": "Sudarshan (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-35-2",
        "name": "Co-owner 35",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  },
  {
    "id": "parcel-36",
    "ulpin": "14-3481-0036-2026",
    "surveyNumber": "TS-SID-MUL-214",
    "village": "Achaipally",
    "taluk": "Mulug Mandal",
    "district": "Siddipet",
    "state": "Telangana",
    "owner": {
      "name": "Narasimha Goud",
      "type": "Individual Freehold (Succession Contested)"
    },
    "area": {
      "rorSqm": 13546.1,
      "gisSqm": 13884.8,
      "regionalUnit": "Guntha",
      "regionalValue": "3.43 Acres (137.2 Gunthas)"
    },
    "landUse": "Agricultural Zone AG-1",
    "tax": {
      "status": "Overdue (3 Years Defaulter)",
      "lastPaidDate": "2023-01-15",
      "annualDemandRupees": 8500,
      "receiptNumber": "TS-REV-2025035"
    },
    "encumbrances": [
      {
        "date": "2024-11-15",
        "type": "Mutation Dispute Objection",
        "details": "Objection petition filed under ROR Act §5",
        "status": "Active"
      },
      {
        "date": "2020-02-18",
        "type": "Primary Agriculture Co-op Loan",
        "details": "Crop loan hypothecation of ₹1,80,000",
        "status": "Active"
      }
    ],
    "status": "WARNING",
    "trustScore": 58,
    "trustGrade": "C",
    "violations": [
      {
        "id": "vio-36",
        "type": "ROAD_SETBACK_ENCROACHMENT",
        "severity": "CRITICAL",
        "title": "Highway / Public Reserve Encroachment",
        "description": "Plot boundary intrudes into notified road setback and public domain corridor.",
        "encroachmentAreaSqm": 2499,
        "bufferNotifiedDistanceM": 30,
        "statutoryClause": "Telangana HYDRAA Act / WALTA Act 2002 (Sec 23)"
      }
    ],
    "geometry": {
      "type": "Feature",
      "id": "parcel-36",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              78.5763068,
              17.7040205
            ],
            [
              78.5758754,
              17.7040076
            ],
            [
              78.5757852,
              17.7040738
            ],
            [
              78.5753311,
              17.7040765
            ],
            [
              78.5752341,
              17.7043069
            ],
            [
              78.5749791,
              17.7043698
            ],
            [
              78.5755489,
              17.70517
            ],
            [
              78.5759553,
              17.7049378
            ],
            [
              78.5765314,
              17.7049395
            ],
            [
              78.5763068,
              17.7040205
            ]
          ]
        ]
      },
      "properties": {
        "id": "parcel-36",
        "ulpin": "14-3481-0036-2026",
        "state_survey_no": "TS-SID-MUL-214",
        "survey_number": "TS-SID-MUL-214",
        "state": "Telangana",
        "district": "Siddipet",
        "mandal": "Mulug",
        "village": "Achaipally",
        "census_code": "573701",
        "dmv_code": "1745023",
        "owner_name": "Narasimha Goud",
        "owner_masked": "N***a G***d",
        "owner_type": "Individual Freehold (Succession Contested)",
        "legal_ror_area_sqm": 13546.1,
        "gis_area_sqm": 13884.8,
        "area_diff_sqm": 338.7,
        "area_diff_pct": 2.5,
        "status": "WARNING",
        "trust_score": "C",
        "trust_num": 58,
        "zoning": "Agricultural Zone AG-1",
        "classification": "Agricultural Freehold",
        "tax_status": "Overdue (3 Years Defaulter)",
        "tax_amount": "₹12,681",
        "tax_last_paid": "2023-01-15",
        "dispute_tag": "MUTATION_DISPUTE",
        "permit_status": "Agricultural Ryotwari",
        "building": {
          "sanctioned": null,
          "detected": {
            "type": "Agricultural / Farm Boundary",
            "height": 3,
            "floors": 1,
            "far": 0
          }
        },
        "violations": [
          {
            "id": "V-036",
            "severity": "WARNING",
            "type": "MUTATION_CONTESTED",
            "description": "SUCCESSION DISPUTE: Contested mutation application filed before Tahsildar",
            "details": "Succession transfer challenged by legal heirs. Revenue record locked pending DRO inquiry.",
            "encroachment_area_sqm": 0
          }
        ],
        "buffer_zones": [],
        "encumbrances": [
          {
            "date": "2024-11-15",
            "type": "Mutation Dispute Objection",
            "details": "Objection petition filed under ROR Act §5",
            "status": "Active"
          },
          {
            "date": "2020-02-18",
            "type": "Primary Agriculture Co-op Loan",
            "details": "Crop loan hypothecation of ₹1,80,000",
            "status": "Active"
          }
        ]
      }
    },
    "bufferZone": {
      "name": "Notified Waterbody / Buffer Line (30m Protection Zone)",
      "type": "Waterbody FTL",
      "geometry": {
        "type": "Feature",
        "properties": {
          "name": "Buffer Protection Zone"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.5746791,
                17.7037076
              ],
              [
                78.57683139999999,
                17.7037076
              ],
              [
                78.57683139999999,
                17.7047888
              ],
              [
                78.5746791,
                17.7047888
              ],
              [
                78.5746791,
                17.7037076
              ]
            ]
          ]
        }
      }
    },
    "nearestOffice": {
      "officeName": "Tahsildar & Sub-Registrar Office Mulug / Siddipet",
      "officeType": "Tahsildar / Taluk Revenue Office",
      "jurisdiction": "Mulug Mandal / Gajwel Revenue Division",
      "distanceKm": 2.9,
      "address": "R&R Colony Road, Mulug, Siddipet - 502279",
      "officerName": "Sri K. Mahender Reddy",
      "designation": "Tahsildar & Joint Sub-Registrar",
      "phone": "+91 8454 266400",
      "email": "tah.mulug@telangana.gov.in",
      "grievanceHours": "Monday: 10:30 AM – 1:00 PM",
      "emergencyHelpline": "1800-599-4455"
    },
    "coOwners": [
      {
        "id": "co-36-1",
        "name": "Narasimha (Primary Holder)",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      },
      {
        "id": "co-36-2",
        "name": "Co-owner 36",
        "shareFraction": 0.5,
        "relationship": "Co-heir"
      }
    ]
  }
];
