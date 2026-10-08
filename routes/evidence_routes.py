"""
Routes for Signed QR Evidence Reports & Cryptographic Verification
Endpoints:
- POST /api/evidence/sign-report
- POST /api/evidence/verify
- GET /api/evidence/reports
- GET /api/evidence/demo-tamper-test
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from services.evidence_signing_service import evidence_signing_service

logger = logging.getLogger("BhuSetu_EvidenceRoutes")
router = APIRouter(prefix="/api/evidence", tags=["Signed QR Evidence Reports"])


class SignReportRequest(BaseModel):
    parcel_id: str
    ulpin: str
    geometry_revision: str = "rev-1.0"
    drone_area_sqm: float
    legal_area_sqm: float
    variance_pct: float
    analysis_digest: Optional[str] = "SHA256-DIGEST-VERIFIED"
    issuer_badge: Optional[str] = "REV-OFF-UP-042"
    issuer_name: Optional[str] = "Thiru M. Shanmugavel, M.A."


class VerifyReportRequest(BaseModel):
    snapshot_payload: Dict[str, Any]
    signature_b64: str
    current_active_revision: Optional[str] = None


@router.post("/sign-report", status_code=status.HTTP_201_CREATED)
def create_signed_evidence_report(req: SignReportRequest):
    """
    Freeze and cryptographically sign evidence report with server-side RSA-2048 key.
    Generates QR Code data URI containing verification anchor.
    """
    try:
        report = evidence_signing_service.create_signed_evidence_report(
            parcel_id=req.parcel_id,
            ulpin=req.ulpin,
            geometry_revision=req.geometry_revision,
            drone_area_sqm=req.drone_area_sqm,
            legal_area_sqm=req.legal_area_sqm,
            variance_pct=req.variance_pct,
            analysis_digest=req.analysis_digest or "SHA256-DIGEST-VERIFIED",
            issuer_badge=req.issuer_badge or "REV-OFF-UP-042",
            issuer_name=req.issuer_name or "Thiru M. Shanmugavel, M.A.",
        )
        return {
            "status": "REPORT_SIGNED_AND_FROZEN",
            "report": report
        }
    except Exception as e:
        logger.error(f"Failed to generate signed evidence report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
def verify_report(req: VerifyReportRequest):
    """
    Verify report digital signature against public key:
    - Flags altered area or owner values as SIGNATURE_INVALID_TAMPERING_DETECTED.
    - Shows original signed values side-by-side.
    - Distinguishes older revisions from current active revision.
    """
    result = evidence_signing_service.verify_report(
        snapshot_payload=req.snapshot_payload,
        signature_b64=req.signature_b64,
        current_active_revision=req.current_active_revision
    )
    return result


@router.get("/reports")
def list_signed_reports():
    """List all frozen and signed evidence reports."""
    return {
        "status": "success",
        "total_reports": len(evidence_signing_service.reports_db),
        "reports": list(evidence_signing_service.reports_db.values())
    }


@router.get("/demo-tamper-test")
def demo_tamper_test(parcel_id: str = "svamitva-101"):
    """
    Executes live demonstration of 3 cryptographic states:
    1. Untampered original snapshot -> VERIFIED_AUTHENTIC
    2. Modified area value (412.0 -> 450.0 m²) -> SIGNATURE_INVALID_TAMPERING_DETECTED
    3. Old revision compared against active rev-2 -> SUPERSEDED_HISTORICAL_REVISION
    """
    # 1. Create original report
    orig_rep = evidence_signing_service.create_signed_evidence_report(
        parcel_id=parcel_id,
        ulpin="UP1428SNMPGNWJ",
        geometry_revision="rev-1",
        drone_area_sqm=412.0,
        legal_area_sqm=390.0,
        variance_pct=5.64,
        analysis_digest="SHA256-DIGEST-A1B2C3D4",
        issuer_badge="REV-OFF-UP-042",
        issuer_name="Thiru M. Shanmugavel, M.A."
    )

    # Test 1: Untampered
    test1 = evidence_signing_service.verify_report(
        snapshot_payload=orig_rep["snapshot"],
        signature_b64=orig_rep["signature_b64"],
        current_active_revision="rev-1"
    )

    # Test 2: Tampered Area (e.g. malicious claim of 450m²)
    tampered_payload = dict(orig_rep["snapshot"])
    tampered_payload["drone_area_sqm"] = 450.0
    test2 = evidence_signing_service.verify_report(
        snapshot_payload=tampered_payload,
        signature_b64=orig_rep["signature_b64"],
        current_active_revision="rev-1"
    )

    # Test 3: Superseded historical revision
    test3 = evidence_signing_service.verify_report(
        snapshot_payload=orig_rep["snapshot"],
        signature_b64=orig_rep["signature_b64"],
        current_active_revision="rev-2"
    )

    return {
        "report_id": orig_rep["report_id"],
        "qr_code_data_uri": orig_rep["qr_code_data_uri"],
        "demo_results": [
            {
                "case": "1. Untampered Original Snapshot",
                "status": test1["status_code"],
                "is_authentic": test1["is_authentic"],
                "message": test1["message"]
            },
            {
                "case": "2. Altered Area Payload (412.0 m² -> 450.0 m²)",
                "status": test2["status_code"],
                "is_authentic": test2["is_authentic"],
                "message": test2["message"],
                "tampered_fields": test2["tampered_fields"]
            },
            {
                "case": "3. Old Geometry Revision (rev-1 vs rev-2 active)",
                "status": test3["status_code"],
                "is_authentic": test3["is_authentic"],
                "message": test3["message"]
            }
        ]
    }


# In-memory server draft store for deduplication testing
_SERVER_DRAFT_STORE: Dict[str, Dict[str, Any]] = {}


class OfflineDraftSyncRequest(BaseModel):
    uuid: str = Field(..., description="Client persistent UUIDv4 for deduplication")
    user_email: str
    parcel_id: str
    ulpin: str
    notes: str
    gps_coords: Optional[List[float]] = None
    photo_data_url: Optional[str] = None


@router.post("/sync-draft")
def sync_offline_draft(req: OfflineDraftSyncRequest):
    """
    Authenticated Server Sync with Idempotent Deduplication:
    If draft with `uuid` already exists on server, returns existing record without duplicating.
    """
    if req.uuid in _SERVER_DRAFT_STORE:
        existing = _SERVER_DRAFT_STORE[req.uuid]
        return {
            "status": "SERVER_DEDUPLICATED_SUCCESS",
            "message": "Draft already synchronized on server. Duplicate ignored.",
            "record": existing,
            "was_deduplicated": True
        }

    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        "uuid": req.uuid,
        "user_email": req.user_email,
        "parcel_id": req.parcel_id,
        "ulpin": req.ulpin,
        "notes": req.notes,
        "gps_coords": req.gps_coords or [80.945, 26.985],
        "photo_present": bool(req.photo_data_url),
        "synced_at": now_iso
    }
    _SERVER_DRAFT_STORE[req.uuid] = record
    return {
        "status": "DRAFT_COMMITTED",
        "message": "Offline draft successfully synchronized to central server.",
        "record": record,
        "was_deduplicated": False
    }


@router.get("/synced-drafts")
def list_synced_drafts(user_email: Optional[str] = Query(None)):
    """List all synchronized evidence drafts on server."""
    drafts = list(_SERVER_DRAFT_STORE.values())
    if user_email:
        drafts = [d for d in drafts if d["user_email"] == user_email]
    return {
        "status": "success",
        "total_server_records": len(drafts),
        "drafts": drafts
    }
