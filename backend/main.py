"""
BhuSetu SVAMITVA Drone Survey API Server (FastAPI)
Exposes REST endpoints for:
- GET /api/parcels
- GET /api/parcels/{id}/buffer?distance=5.0
- POST /api/parcels/analyze-encroachments
- POST /api/parcels/scrape-fresh
"""

import os
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.gis_engine import generate_parcel_buffer, analyze_encroachments

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BhuSetu_API")

app = FastAPI(
    title="BhuSetu SVAMITVA Drone Cadastral API",
    description="High-precision sub-5cm rural drone parcel processing & buffer conflict analysis engine",
    version="2.0.0"
)

# Enable CORS for Vite dev server & frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.ror_routes import router as ror_router
from routes.auth_routes import router as auth_router
from routes.spatial_routes import router as spatial_router
from routes.ocr_routes import router as ocr_router
from routes.ledger_routes import router as ledger_router
from routes.proposal_routes import router as proposal_router
from routes.evidence_routes import router as evidence_router
from routes.survey_routes import router as survey_router
from services.survey_source_service import survey_source_service

app.include_router(auth_router)
app.include_router(spatial_router)
app.include_router(ocr_router)
app.include_router(ledger_router)
app.include_router(ror_router)
app.include_router(proposal_router)
app.include_router(evidence_router)
app.include_router(survey_router)

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw", "drone_parcels_raw.geojson")


def load_parcels_geojson() -> Dict[str, Any]:
    """Retrieve active survey parcels from the managed survey source service."""
    features = survey_source_service.get_active_parcels()
    meta = survey_source_service.metadata
    return {
        "type": "FeatureCollection",
        "name": f"bhusetu_{meta.get('state', 'survey').lower()}",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "metadata": meta,
        "features": features
    }


class EncroachmentRequest(BaseModel):
    buffer_meters: float = Field(default=3.0, ge=0.5, le=30.0, description="Buffer distance in meters in local UTM projection")
    parcel_ids: Optional[List[str]] = Field(default=None, description="Optional subset of parcel IDs to analyze")


@app.get("/api/health")
def health_check():
    meta = survey_source_service.metadata
    return {
        "status": "healthy",
        "service": "BhuSetu SVAMITVA Geospatial Engine",
        "survey_source_state": meta.get("state", "NO_SOURCE"),
        "total_active_parcels": len(survey_source_service.get_active_parcels()),
        "source_type": meta.get("source_type"),
        "utm_projection_support": True,
        "crs": "EPSG:4326 <-> Local Metric UTM"
    }


@app.get("/api/parcels")
def get_parcels(
    land_type: Optional[str] = Query(None, description="Filter by land type: Residential, Open Land, Public Road, etc."),
    limit: Optional[int] = Query(None, ge=1, le=500)
):
    """
    Returns active surveyed rural cadastral parcels as a standard GeoJSON FeatureCollection,
    with explicit provenance and data-source state.
    """
    data = load_parcels_geojson()
    features = data.get("features", [])

    if land_type:
        features = [f for f in features if f.get("properties", {}).get("land_type", "").lower() == land_type.lower()]

    if limit:
        features = features[:limit]

    return {
        "type": "FeatureCollection",
        "name": data.get("name", "active_survey_parcels"),
        "crs": data.get("crs"),
        "features": features,
        "metadata": {
            **data.get("metadata", {}),
            "filtered_parcels": len(features)
        }
    }


@app.get("/api/parcels/{parcel_id}")
def get_parcel_by_id(parcel_id: str = Path(..., description="Unique parcel ID or property ID")):
    """
    Retrieve single parcel by id or property_id.
    """
    data = load_parcels_geojson()
    for feat in data.get("features", []):
        if feat.get("id") == parcel_id or feat.get("properties", {}).get("property_id") == parcel_id:
            return feat
    raise HTTPException(status_code=404, detail=f"Parcel with ID '{parcel_id}' not found.")


@app.get("/api/parcels/{parcel_id}/buffer")
def get_parcel_buffer(
    parcel_id: str = Path(..., description="Unique parcel ID or property ID"),
    distance: float = Query(5.0, ge=0.5, le=30.0, description="Buffer distance in exact metric meters in UTM")
):
    """
    Computes an exact metric buffer around a parcel polygon:
    Reprojects WGS84 -> UTM, calculates distance in meters, reprojects back to WGS84.
    """
    data = load_parcels_geojson()
    target_feat = None
    for feat in data.get("features", []):
        if feat.get("id") == parcel_id or feat.get("properties", {}).get("property_id") == parcel_id:
            target_feat = feat
            break

    if not target_feat:
        raise HTTPException(status_code=404, detail=f"Parcel with ID '{parcel_id}' not found.")

    buffer_feature = generate_parcel_buffer(target_feat["geometry"], buffer_meters=distance)
    buffer_feature["properties"]["target_parcel_id"] = parcel_id
    buffer_feature["properties"]["target_owner"] = target_feat.get("properties", {}).get("owner_name")
    buffer_feature["properties"]["survey_plot_no"] = target_feat.get("properties", {}).get("survey_plot_no")

    return buffer_feature


@app.post("/api/parcels/analyze-encroachments")
def post_analyze_encroachments(req: EncroachmentRequest):
    """
    Runs spatial intersection between private parcel buffers and public right-of-way corridors.
    Returns detected conflict polygons and dispute risk scores.
    """
    data = load_parcels_geojson()
    features = data.get("features", [])

    if req.parcel_ids:
        features = [f for f in features if f.get("id") in req.parcel_ids or f.get("properties", {}).get("property_id") in req.parcel_ids]

    results = analyze_encroachments(features, buffer_meters=req.buffer_meters)
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
