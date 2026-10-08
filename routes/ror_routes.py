"""
BhuSetu Record of Rights (RoR) & Digital Property Card API Routes
Endpoints:
- POST /api/ror/derive-from-parcels
- GET /api/ror/parcel/{id}
- GET /api/ror/parcel/{id}/property-card
"""

import os
import json
import hashlib
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel, Field

from services.ror_engine import derive_ror_record_for_parcel, derive_all_village_rors

router = APIRouter(prefix="/api/ror", tags=["Record of Rights (RoR) & Title Cards"])

from services.survey_source_service import survey_source_service

DATA_RAW_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw", "drone_parcels_raw.geojson")
DATA_ROR_CACHE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "reconciled_ror.json")

# In-memory storage for reconciled RoR dossiers
_reconciled_cache: Dict[str, Dict[str, Any]] = {}


def load_raw_features() -> List[Dict[str, Any]]:
    """Retrieve currently active survey features from survey source service."""
    return survey_source_service.get_active_parcels()


def ensure_reconciled_cache(force: bool = False):
    """Ensure RoR dossiers are derived fresh from currently active survey features."""
    global _reconciled_cache
    if _reconciled_cache and not force:
        return

    _reconciled_cache.clear()
    features = load_raw_features()
    derived = derive_all_village_rors(features)
    for r in derived:
        _reconciled_cache[r["parcel_id"]] = r


class DeriveRoRRequest(BaseModel):
    parcel_ids: Optional[List[str]] = Field(default=None, description="Optional list of parcel IDs to derive. If empty, derives all.")
    force_recompute: bool = Field(default=False, description="Force re-derivation and overwrite cache")


@router.post("/derive-from-parcels")
def post_derive_from_parcels(req: DeriveRoRRequest):
    """
    Derives deterministic ULPINs, Chauhaddi neighbors, area variances, and legal tenure for drone parcels.
    Stores and returns the reconciled RoR records.
    """
    global _reconciled_cache
    features = load_raw_features()

    if req.force_recompute:
        _reconciled_cache.clear()

    ensure_reconciled_cache()

    target_features = features
    if req.parcel_ids:
        target_features = [
            f for f in features
            if f.get("id") in req.parcel_ids or f.get("properties", {}).get("property_id") in req.parcel_ids
        ]

    results = []
    for f in target_features:
        f_id = f.get("id") or f.get("properties", {}).get("property_id")
        if req.force_recompute or f_id not in _reconciled_cache:
            record = derive_ror_record_for_parcel(f, features)
            _reconciled_cache[f_id] = record
        results.append(_reconciled_cache[f_id])

    # Save to disk
    with open(DATA_ROR_CACHE, "w", encoding="utf-8") as f:
        json.dump(list(_reconciled_cache.values()), f, indent=2)

    return {
        "status": "success",
        "total_reconciled": len(results),
        "village": "Rampur Kalan (Abadi Area)",
        "district": "Lucknow",
        "records": results
    }


@router.get("/parcel/{parcel_id}")
def get_ror_by_parcel_id(
    parcel_id: str = Path(..., description="Unique parcel ID (e.g. svamitva-101) or Property ID (UP-LKO-BKT-ABADI-0101)")
):
    """
    Returns comprehensive RoR Land Title Dossier:
    - ULPIN (Bhu-Aadhaar)
    - Ownership & Shareholding table
    - Drone Area vs. Registry Area variance
    - Chauhaddi (4-Point Boundary Neighbors)
    - Encumbrances & Dispute flags
    - Title Confidence Score & Grade
    """
    ensure_reconciled_cache()

    # Search in cache by id or property_id
    if parcel_id in _reconciled_cache:
        return _reconciled_cache[parcel_id]

    for rec in _reconciled_cache.values():
        if rec.get("parcel_id") == parcel_id or rec.get("ulpin") == parcel_id or rec.get("survey_plot_no") == parcel_id:
            return rec

    # If not in cache, check raw features and derive on demand
    features = load_raw_features()
    for f in features:
        if f.get("id") == parcel_id or f.get("properties", {}).get("property_id") == parcel_id:
            rec = derive_ror_record_for_parcel(f, features)
            _reconciled_cache[rec["parcel_id"]] = rec
            return rec

    raise HTTPException(status_code=404, detail=f"RoR record for parcel ID '{parcel_id}' not found.")


@router.get("/parcel/{parcel_id}/property-card")
def get_property_card(
    parcel_id: str = Path(..., description="Unique parcel ID or Property ID")
):
    """
    Generates a verifiable SVAMITVA Digital Property Card (Gharouni) certificate:
    Includes DoLR Bhu-Aadhaar ULPIN, Chauhaddi boundary clause, QR verification hash,
    and statutory validity memorandum under Ministry of Panchayati Raj.
    """
    ensure_reconciled_cache()
    record = None
    if parcel_id in _reconciled_cache:
        record = _reconciled_cache[parcel_id]
    else:
        for rec in _reconciled_cache.values():
            if rec.get("parcel_id") == parcel_id or rec.get("ulpin") == parcel_id:
                record = rec
                break

    if not record:
        features = load_raw_features()
        for f in features:
            if f.get("id") == parcel_id or f.get("properties", {}).get("property_id") == parcel_id:
                record = derive_ror_record_for_parcel(f, features)
                _reconciled_cache[record["parcel_id"]] = record
                break

    if not record:
        raise HTTPException(status_code=404, detail=f"Parcel with ID '{parcel_id}' not found.")

    # Cryptographic hash representing blockchain/revenue ledger immutability
    hash_payload = f"{record['ulpin']}:{record['gharouni_card_no']}:{record['khata_number']}:{record['spatial']['actual_drone_area_sqm']}:{record['location']['village_lgd_code']}"
    qr_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

    ch = record["chauhaddi"]
    chauhaddi_clause = (
        f"Uttar (North): {ch['north']['description']}; "
        f"Dakshin (South): {ch['south']['description']}; "
        f"Poorv (East): {ch['east']['description']}; "
        f"Paschim (West): {ch['west']['description']}."
    )

    return {
        "certificate_type": "SVAMITVA DIGITAL PROPERTY CARD (GHAROUNI)",
        "issuing_authority": "Ministry of Panchayati Raj • Government of India & Board of Revenue, Uttar Pradesh",
        "ulpin": record["ulpin"],
        "gharouni_card_no": record["gharouni_card_no"],
        "khata_number": record["khata_number"],
        "khasra_number": record["khasra_number"],
        "survey_plot_no": record["survey_plot_no"],
        "tenure_category": record["tenure_type"],
        "pattadar_summary": record["pattadars"],
        "primary_owner": record["pattadars"][0]["name"] if record["pattadars"] else "N/A",
        "father_husband_name": record["pattadars"][0]["relation"] if record["pattadars"] else "N/A",
        "spatial_footprint": {
            "uav_drone_area_sqm": record["spatial"]["actual_drone_area_sqm"],
            "uav_drone_area_acres": record["spatial"]["actual_drone_area_acres"],
            "regional_area_display": record["legal_registry"]["area_unit_regional"],
            "centroid_coordinates": record["spatial"]["centroid_wgs84"],
            "accuracy_class": record["spatial"]["accuracy_class"],
            "survey_date": record["spatial"]["survey_date"]
        },
        "variance_audit": {
            "recorded_revenue_area_sqm": record["legal_registry"]["recorded_legal_area_sqm"],
            "variance_percentage": f"{record['variance_analysis']['variance_pct']:+0.2f}%",
            "statutory_tolerance_status": "WITHIN_PERMISSIBLE_LIMITS" if record["variance_analysis"]["within_statutory_tolerance"] else "VARIANCE_FLAGGED"
        },
        "chauhaddi_boundaries": chauhaddi_clause,
        "title_confidence": record["title_confidence"],
        "encumbrance_status": "ENCUMBRANCE_FREE" if not record["encumbrances"] else f"ACTIVE_CHARGE ({len(record['encumbrances'])} Recorded)",
        "qr_verification": {
            "qr_hash": qr_hash,
            "verification_url": f"https://svamitva.nic.in/verify?ulpin={record['ulpin']}&hash={qr_hash[:16]}",
            "ledger_anchor": f"BLOCK-LKO-2026-{qr_hash[:8].upper()}"
        },
        "statutory_memorandum": (
            "This Gharouni Property Card constitutes statutory conclusive title of rural Abadi inhabited land tenure, "
            "surveyed and demarcated using sub-5cm Drone Photogrammetry under the SVAMITVA Scheme (Survey of India). "
            "Valid for financial collateral borrowing, municipal tax registry, property transfer, and civil partition."
        ),
        "location": record["location"]
    }
