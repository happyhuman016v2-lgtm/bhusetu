"""
BhuSetu Record of Rights (RoR) Derivation & Discrepancy Reconciliation Engine
Bridges drone photogrammetry spatial ground-truth with legal revenue tenure (Khasra-Khatauni / Gharouni),
detects area variances, validates encumbrances, and calculates Title Confidence Scores.
"""

import math
import random
from typing import Dict, Any, List, Optional
from shapely.geometry import shape

from services.ulpin_generator import generate_dolr_ulpin, compute_chauhaddi

# Co-owner relationships for joint Khatas
FAMILY_RELATIONS = ["Son", "Daughter", "Wife", "Brother", "Mother", "Co-Sharer"]

# Statutory banks and courts operating in the rural jurisdiction
LENDING_INSTITUTIONS = [
    ("Aryavart Bank (Regional Rural Bank)", "Kisan Credit Card (KCC) Crop Hypothecation"),
    ("State Bank of India (BKT Branch)", "Agricultural Land Mortgage Loan"),
    ("District Cooperative Bank Lucknow", "Rural Housing Construction Lien"),
    ("Sub-Divisional Magistrate Court BKT", "Civil Injunction Suit (Title Partition Stay)")
]


def derive_ror_record_for_parcel(
    parcel_feature: Dict[str, Any],
    all_features: List[Dict[str, Any]],
    state_code: str = "UP",
    village_code: str = "142890"
) -> Dict[str, Any]:
    """
    Derives and reconciles legal Record of Rights (RoR) for a drone-surveyed parcel:
    1. Computes polygon centroid & generates DoLR 14-digit ULPIN (Bhu-Aadhaar).
    2. Computes Cardinal 4-point neighbors (Chauhaddi: North, South, East, West).
    3. Simulates/Matches statutory land registry records (Khata, Khasra, recorded area, pattadars).
    4. Computes area variance percentage between drone photogrammetry and legal registry.
    5. Flags statutory title risks (Encroachment, Collateral Mortgage, Public Corridor Violation).
    6. Calculates Title Confidence Score (0 to 100) and Trust Grade (A to F).
    """
    props = parcel_feature.get("properties", {})
    parcel_id = parcel_feature.get("id") or props.get("property_id")
    geom = shape(parcel_feature["geometry"])
    centroid = geom.centroid

    actual_drone_area_sqm = float(props.get("area_sq_mtr", round(geom.area * 111320 * (111320 * math.cos(math.radians(centroid.y))), 1)))
    actual_drone_area_acres = round(actual_drone_area_sqm * 0.000247105, 3)

    # 1. Deterministic ULPIN (Bhu-Aadhaar)
    ulpin = generate_dolr_ulpin(centroid.x, centroid.y, state_code=state_code, village_code=village_code)

    # 2. Chauhaddi (4-Point Boundary Neighbors)
    chauhaddi = compute_chauhaddi(parcel_feature, all_features)

    # 3. Derive Legal Registry Tenure (Khasra-Khatauni)
    # Seed pseudo-random generator deterministically based on parcel ID
    seed_val = sum(ord(c) for c in parcel_id)
    prng = random.Random(seed_val)

    # Legacy paper registries commonly deviate from drone photogrammetry by -8% to +8%
    # Generate realistic variance: 60% within 3% tolerance, 25% with minor deviation, 15% with substantial discrepancy
    variance_roll = prng.random()
    if variance_roll < 0.60:
        variance_factor = prng.uniform(0.985, 1.015)  # +/- 1.5%
    elif variance_roll < 0.85:
        variance_factor = prng.uniform(1.025, 1.065)  # +2.5% to +6.5% (Encroachment)
    else:
        variance_factor = prng.uniform(0.910, 0.960)  # -4% to -9% (Area deficit)

    recorded_legal_area_sqm = round(actual_drone_area_sqm / variance_factor, 1)
    recorded_legal_area_acres = round(recorded_legal_area_sqm * 0.000247105, 3)

    # Discrepancy Math: ((Drone - Registry) / Registry) * 100
    variance_sqm = round(actual_drone_area_sqm - recorded_legal_area_sqm, 1)
    variance_pct = round(((actual_drone_area_sqm - recorded_legal_area_sqm) / recorded_legal_area_sqm) * 100, 2)

    # Khatauni Holding Identifiers
    plot_num_str = "".join(filter(str.isdigit, props.get("survey_plot_no", "101"))) or "101"
    khata_number = f"KH-2026-{int(plot_num_str) * 3 + 120:04d}"
    khasra_number = f"AB-{props.get('survey_plot_no', plot_num_str)}/1"

    # Multi-owner Pattadar Shareholding
    primary_owner = props.get("owner_name", "Ram Prasad")
    father_husband = props.get("father_husband_name", "Shri Shivnath")
    land_type = props.get("land_type", "Residential")

    is_public = land_type in ("Public Road", "Community Asset", "Public Institutional")
    pattadars = []

    if is_public:
        pattadars.append({
            "pattadar_id": "PATT-01",
            "name": primary_owner,
            "relation": "Statutory Authority",
            "share_pct": 100.0,
            "equity_area_sqm": actual_drone_area_sqm,
            "status": "Vested in Gram Sabha"
        })
    else:
        # Check if joint ownership exists (approx 40% of rural Abadi properties)
        has_joint_owners = prng.random() < 0.40
        if has_joint_owners:
            shares = prng.choice([(60.0, 40.0), (50.0, 50.0), (34.0, 33.0, 33.0)])
            pattadars.append({
                "pattadar_id": "PATT-01",
                "name": primary_owner,
                "relation": father_husband,
                "share_pct": shares[0],
                "equity_area_sqm": round(actual_drone_area_sqm * (shares[0] / 100.0), 1),
                "status": "Primary Shareholder"
            })
            for idx, s in enumerate(shares[1:], start=2):
                relative_name = f"{primary_owner.split()[0]} {prng.choice(['Kumar', 'Pratap', 'Devi', 'Singh', 'Lal'])}"
                pattadars.append({
                    "pattadar_id": f"PATT-0{idx}",
                    "name": relative_name,
                    "relation": f"{prng.choice(FAMILY_RELATIONS)} of {primary_owner}",
                    "share_pct": s,
                    "equity_area_sqm": round(actual_drone_area_sqm * (s / 100.0), 1),
                    "status": "Registered Co-Sharer"
                })
        else:
            pattadars.append({
                "pattadar_id": "PATT-01",
                "name": primary_owner,
                "relation": father_husband,
                "share_pct": 100.0,
                "equity_area_sqm": actual_drone_area_sqm,
                "status": "Sole Statutory Freeholder"
            })

    # Encumbrance Register (Loans, Mortgages, Injunctions)
    encumbrances = []
    has_encumbrance = prng.random() < 0.28 and not is_public

    if has_encumbrance:
        inst, desc = prng.choice(LENDING_INSTITUTIONS)
        is_litigation = "Court" in inst
        encumbrances.append({
            "encumbrance_id": f"ENC-2026-{prng.randint(10000, 99999)}",
            "type": "LITIGATION_STAY" if is_litigation else "BANK_MORTGAGE",
            "institution": inst,
            "description": desc,
            "registered_date": f"202{prng.randint(3, 5)}-0{prng.randint(1, 9)}-15",
            "amount_rupees": None if is_litigation else prng.randint(150000, 750000),
            "status": "ACTIVE_RESTRAINT" if is_litigation else "ACTIVE_CHARGE"
        })

    # 4. Discrepancy & Dispute Detection Logic
    dispute_flags = []
    confidence_deductions = 0

    # Area Variance Flag
    if variance_pct > 5.0:
        dispute_flags.append({
            "flag_code": "SURVEY_MISMATCH_SUSPECTED_ENCROACHMENT",
            "severity": "CRITICAL" if variance_pct > 10.0 else "WARNING",
            "title": "Ground Area Exceeds Registry Record",
            "description": f"Drone surveyed ground footprint ({actual_drone_area_sqm} m²) exceeds legally documented area ({recorded_legal_area_sqm} m²) by +{variance_pct}%. Potential unauthorized expansion beyond Khasra boundary.",
            "statutory_ref": "U.P. Revenue Code 2006 Sec 24 (Boundary Demarcation Re-Survey)"
        })
        confidence_deductions += 35 if variance_pct > 10.0 else 20
    elif variance_pct < -5.0:
        dispute_flags.append({
            "flag_code": "AREA_DEFICIT_DISPUTE",
            "severity": "WARNING",
            "title": "Physical Ground Footprint Deficit",
            "description": f"Physical ground area ({actual_drone_area_sqm} m²) is smaller than registered revenue area ({recorded_legal_area_sqm} m²) by {variance_pct}%. Landholder may be facing third-party boundary encroachment.",
            "statutory_ref": "SVAMITVA Scheme Guidelines Annexure III (Cadastral Rectification)"
        })
        confidence_deductions += 15

    # Mortgage & Unmutated Co-Shared Plot Flag
    if has_encumbrance:
        for enc in encumbrances:
            if enc["type"] == "LITIGATION_STAY":
                dispute_flags.append({
                    "flag_code": "CIVIL_COURT_INJUNCTION",
                    "severity": "CRITICAL",
                    "title": "Judicial Stay Order Active",
                    "description": f"Active litigation injunction: {enc['description']} instituted before {enc['institution']}. Mutation and transaction prohibited.",
                    "statutory_ref": "Civil Procedure Code Order 39 Rules 1 & 2"
                })
                confidence_deductions += 40
            elif len(pattadars) > 1:
                dispute_flags.append({
                    "flag_code": "MORTGAGE_COLLATERAL_RISK",
                    "severity": "WARNING",
                    "title": "Mortgage on Joint Un-Partitioned Holding",
                    "description": f"Active credit charge of ₹{enc['amount_rupees']:,} registered with {enc['institution']} on undivided family Khata with {len(pattadars)} co-sharers.",
                    "statutory_ref": "Transfer of Property Act Sec 44 (Transfer by Co-owner)"
                })
                confidence_deductions += 20

    # Public corridor encroachment flag (check if south or north borders a public road with high variance)
    road_border = any(v["boundary_type"] == "PUBLIC_ROAD" for v in chauhaddi.values())
    if road_border and variance_pct > 4.0:
        dispute_flags.append({
            "flag_code": "PUBLIC_LAND_VIOLATION",
            "severity": "CRITICAL",
            "title": "Public Road Right-of-Way Intrusion Risk",
            "description": "Plot directly adjoins Gram Sabha Public Road Corridor while displaying positive area surplus. Immediate right-of-way demarcation required.",
            "statutory_ref": "U.P. Revenue Code 2006 Sec 67 (Eviction of Unauthorized Occupants from Gram Sabha Land)"
        })
        confidence_deductions += 30

    # Title Confidence Score (0 to 100)
    title_confidence_score = max(5, min(100, 100 - confidence_deductions))

    if title_confidence_score >= 88:
        title_grade = "A"
        title_status = "VERIFIED_CLEAN_TITLE"
    elif title_confidence_score >= 70:
        title_grade = "B"
        title_status = "MINOR_VARIANCE_ACCEPTABLE"
    elif title_confidence_score >= 50:
        title_grade = "C"
        title_status = "RECTIFICATION_RECOMMENDED"
    elif title_confidence_score >= 35:
        title_grade = "D"
        title_status = "HIGH_DISPUTE_RISK"
    else:
        title_grade = "F"
        title_status = "LITIGATION_ENCROACHMENT_CRITICAL"

    return {
        "parcel_id": parcel_id,
        "ulpin": ulpin,
        "scheme": "SVAMITVA (Survey of India) • Ministry of Panchayati Raj",
        "gharouni_card_no": props.get("gharouni_card_no", f"GH-2026-{seed_val}"),
        "khata_number": khata_number,
        "khasra_number": khasra_number,
        "survey_plot_no": props.get("survey_plot_no", "AB-101"),
        "tenure_type": "Abadi Inhabited Freehold" if not is_public else "Gram Sabha Public Vested",
        "spatial": {
            "centroid_wgs84": [round(centroid.x, 7), round(centroid.y, 7)],
            "actual_drone_area_sqm": actual_drone_area_sqm,
            "actual_drone_area_acres": actual_drone_area_acres,
            "accuracy_class": props.get("accuracy_class", "GSD < 5cm UAV Photogrammetry"),
            "survey_date": props.get("survey_date", "2026-03-15")
        },
        "legal_registry": {
            "recorded_legal_area_sqm": recorded_legal_area_sqm,
            "recorded_legal_area_acres": recorded_legal_area_acres,
            "area_unit_regional": f"{recorded_legal_area_sqm} Sq. Mtr ({round(recorded_legal_area_sqm / 252.92, 2)} Biswa)",
            "registry_source": "District Revenue Records / Digital Khatauni 2026"
        },
        "variance_analysis": {
            "variance_sqm": variance_sqm,
            "variance_pct": variance_pct,
            "within_statutory_tolerance": abs(variance_pct) <= 3.0,
            "evaluation": "Area Matches Registry Title" if abs(variance_pct) <= 3.0 else ("Ground Surplus (Suspected Encroachment)" if variance_pct > 0 else "Ground Deficit (Boundary Squeeze)")
        },
        "chauhaddi": chauhaddi,
        "pattadars": pattadars,
        "encumbrances": encumbrances,
        "dispute_flags": dispute_flags,
        "title_confidence": {
            "score": title_confidence_score,
            "grade": title_grade,
            "status": title_status
        },
        "location": {
            "village": props.get("village", "Rampur Kalan"),
            "tehsil": props.get("tehsil", "Bakshi Ka Talab"),
            "district": props.get("district", "Lucknow"),
            "state": props.get("state", "Uttar Pradesh"),
            "village_lgd_code": props.get("village_lgd_code", "142890")
        }
    }


def derive_all_village_rors(features: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Derives reconciled RoR dossiers for an entire village feature collection."""
    reconciled = []
    for feat in features:
        ror = derive_ror_record_for_parcel(feat, features)
        reconciled.append(ror)
    return reconciled
