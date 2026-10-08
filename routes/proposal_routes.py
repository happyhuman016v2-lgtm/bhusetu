"""
Routes for Interactive Boundary Proposals
Endpoints:
- POST /api/proposals/calculate-diff
- POST /api/proposals
- GET /api/proposals
- GET /api/proposals/demo-fixture
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, Depends, status
from pydantic import BaseModel, Field

from services.proposal_engine import proposal_service
from services.spatial_index import spatial_indexer

router = APIRouter(prefix="/api/proposals", tags=["Interactive Boundary Proposals"])


class ProposalDiffRequest(BaseModel):
    parcel_id: str
    original_geometry: Dict[str, Any]
    proposed_geometry: Dict[str, Any]
    sequence_id: int = Field(default=0, description="Client request sequence counter for ignoring stale/superseded responses")


class SaveProposalRequest(BaseModel):
    parcel_id: str
    ulpin: str
    original_geometry: Dict[str, Any]
    proposed_geometry: Dict[str, Any]
    reason: str = Field(..., min_length=5, description="Justification for proposing boundary modification")
    evidence_version: str = Field(default="v1.0-survey", description="Version of UAV survey or registry evidence")
    author_badge_id: Optional[str] = "REV-OFF-UP-042"
    author_name: Optional[str] = "Revenue Officer"


@router.post("/calculate-diff")
def calculate_boundary_diff(req: ProposalDiffRequest):
    """
    Real-time metric recalculation for boundary proposals:
    1. Validates geometry (rejects self-intersections and degenerate rings).
    2. Reprojects to UTM projection for sub-centimeter metric area math.
    3. Calculates genuine symmetric difference geometry (changed-region).
    4. Computes road right-of-way buffer overlap.
    5. Returns client sequence_id so frontend discards superseded responses during rapid dragging.
    """
    road_feats = [
        f for f in spatial_indexer.features
        if f.get("properties", {}).get("land_type") == "Public Road"
    ]

    result = proposal_service.calculate_proposal_diff(
        original_geojson=req.original_geometry,
        proposed_geojson=req.proposed_geometry,
        parcel_id=req.parcel_id,
        sequence_id=req.sequence_id,
        road_features=road_feats,
    )
    return result


@router.post("", status_code=status.HTTP_201_CREATED)
def save_boundary_proposal(req: SaveProposalRequest):
    """
    Save proposed boundary adjustment for statutory review.
    Does NOT mutate the legal stored parcel.
    """
    try:
        record = proposal_service.save_proposal(
            parcel_id=req.parcel_id,
            ulpin=req.ulpin,
            original_geometry=req.original_geometry,
            proposed_geometry=req.proposed_geometry,
            reason=req.reason,
            evidence_version=req.evidence_version,
            author_badge_id=req.author_badge_id or "REV-OFF-UP-042",
            author_name=req.author_name or "Revenue Officer",
        )
        return {
            "status": "PROPOSAL_CREATED",
            "message": "Boundary proposal successfully saved for review without mutating legal parcel.",
            "proposal": record,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
def list_proposals(parcel_id: Optional[str] = Query(None)):
    """List pending and historical boundary proposals."""
    return {
        "status": "success",
        "proposals": proposal_service.get_proposals(parcel_id=parcel_id),
    }


@router.get("/demo-fixture")
def get_demo_fixture(
    origin_lon: float = Query(80.9450),
    origin_lat: float = Query(26.9850)
):
    """
    Returns genuine 20m x 20m demo fixture (one shifted 3m east):
    - Original Square Area = 400.0 m²
    - Proposed Shifted Square Area = 400.0 m²
    - Genuine Symmetric Difference = 120.0 m²
    """
    fixture = proposal_service.generate_demo_shifted_fixture(
        origin_lon=origin_lon, origin_lat=origin_lat
    )
    return fixture
