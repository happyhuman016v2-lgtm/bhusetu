"""
Immutable Ledger & Officer Statutory Order Routes
Endpoints:
- GET /api/ledger/blocks
- GET /api/ledger/verify
- POST /api/officer/orders/drone-resurvey (Protected by verify_officer)
"""

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field

from routes.auth_routes import verify_officer
from services.immutable_ledger import ledger_service

logger = logging.getLogger("BhuSetu_LedgerRoutes")
router = APIRouter(tags=["Immutable Audit Ledger & Statutory Orders"])


class DroneResurveyOrderRequest(BaseModel):
    parcel_id: str = Field(..., description="Target cadastral parcel ID")
    ulpin: str = Field(..., description="Bhu-Aadhaar 14-char ULPIN")
    discrepancy_reason: str = Field(..., min_length=10, description="Detailed reason for ordering UAV drone resurvey")
    target_accuracy: str = Field(default="< 3cm GSD UAV Photogrammetry", description="Drone survey GSD tolerance")
    statutory_clause: str = Field(
        default="Uttar Pradesh Revenue Code 2006 (Sec 67-A) / SVAMITVA Directive",
        description="Legal statutory clause"
    )
    coordinates_centroid: Optional[List[float]] = None


@router.get("/api/ledger/blocks")
def get_ledger_blocks():
    """
    Retrieve all blocks from the immutable cryptographic ledger (chronological newest first).
    Open to citizens and revenue officers for public auditability.
    """
    return {
        "status": "success",
        "total_blocks": len(ledger_service.chain),
        "blocks": ledger_service.get_blocks()
    }


@router.get("/api/ledger/verify")
def verify_ledger_integrity():
    """
    Tamper-Evident Verification:
    Traverses the cryptographic chain from genesis to tip, verifying all SHA-256 hashes
    and block pointers. Detects any database manipulation or unauthorized modification.
    """
    verification_result = ledger_service.verify_ledger()
    return verification_result


@router.post("/api/officer/orders/drone-resurvey", status_code=status.HTTP_201_CREATED)
def issue_drone_resurvey_order(
    req: DroneResurveyOrderRequest,
    officer: Dict[str, Any] = Depends(verify_officer)
):
    """
    Privileged GovTech Endpoint:
    Issues an official Drone Resurvey Order and cryptographically binds it to the
    immutable SHA-256 ledger.
    Protected by RBAC: only REVENUE_OFFICER (Tahsildar / Patwari) can execute this.
    """
    badge_id = officer.get("badge_id", "REV-OFF-UP-001")
    officer_name = officer.get("full_name", "Revenue Officer")

    new_block = ledger_service.append_resurvey_order(
        parcel_id=req.parcel_id,
        ulpin=req.ulpin,
        officer_badge_id=badge_id,
        officer_name=officer_name,
        discrepancy_reason=req.discrepancy_reason,
        target_accuracy=req.target_accuracy,
        statutory_clause=req.statutory_clause,
        coordinates_centroid=req.coordinates_centroid
    )

    return {
        "status": "ORDER_COMMITTED_TO_LEDGER",
        "message": f"Statutory Drone Resurvey Order cryptographically sealed in Block #{new_block['index']}",
        "block": new_block
    }
