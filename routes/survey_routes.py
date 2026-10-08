"""
BhuSetu Survey Routes
Endpoints for:
- POST /api/survey/upload: Ingest GeoJSON FeatureCollection with strict geometry validation
- GET /api/survey/source-state: Current survey data source state & provenance
- POST /api/survey/wfs-test: OGC WFS 2.0.0 GetCapabilities & DescribeFeatureType testing
- POST /api/survey/wfs-connect: Bounded WFS feature fetching
- POST /api/survey/load-demo: Load labelled synthetic demonstration dataset
- POST /api/survey/clear: Reset to NO_SOURCE state
- GET /api/survey/parcels: Active survey FeatureCollection
- POST /api/survey/calculate-discrepancy: Verified metric area discrepancy calculator
"""

import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel, Field

from services.survey_source_service import survey_source_service
from services.road_source_service import road_source_service
from services.wfs_connector import wfs_connector_service
from services.gis_engine import calculate_area_discrepancy

logger = logging.getLogger("BhuSetu_SurveyRoutes")
router = APIRouter(prefix="/api/survey", tags=["Survey Ingestion & WFS Management"])



class WFSTestRequest(BaseModel):
    wfs_url: str = Field(..., description="WFS endpoint URL (e.g. https://geoserver.local/geoserver/wfs)")
    layer_name: Optional[str] = Field(None, description="Target feature type / layer name")
    auth_user: Optional[str] = Field(None, description="Optional Basic Auth username")
    auth_password: Optional[str] = Field(None, description="Optional Basic Auth password")
    timeout_seconds: Optional[int] = Field(6, ge=2, le=30)


class WFSFetchRequest(BaseModel):
    wfs_url: str
    layer_name: str
    auth_user: Optional[str] = None
    auth_password: Optional[str] = None
    max_features: Optional[int] = Field(100, ge=1, le=1000)


class DiscrepancyCalcRequest(BaseModel):
    survey_area_sqm: float = Field(..., ge=0.1, description="Metric area from surveyed geometry in m²")
    registered_area_sqm: Optional[float] = Field(None, description="Recorded legal area from revenue record in m²")
    parcel_id: Optional[str] = None
    ulpin: Optional[str] = None


@router.get("/source-state")
def get_survey_source_state():
    """Retrieve active survey data source state and provenance metadata."""
    return survey_source_service.get_source_state()


@router.post("/upload")
async def upload_survey_geojson(
    file: UploadFile = File(...),
    supplier: Optional[str] = Form(None),
    survey_date: Optional[str] = Form(None),
    accuracy_metadata: Optional[str] = Form(None),
    source_crs: Optional[str] = Form("EPSG:4326"),
    id_field: Optional[str] = Form("property_id"),
    plot_field: Optional[str] = Form("survey_plot_no"),
    owner_field: Optional[str] = Form("owner_name"),
    area_field: Optional[str] = Form("area_sq_mtr")
):
    """
    Upload and validate an authoritative or field-collected GeoJSON FeatureCollection.
    Validates rings, finite coordinates, geometry validity, and duplicate source IDs.
    Returns status, imported count, rejected feature list, and provenance checksum.
    """
    try:
        content = await file.read()
        field_mapping = {
            "parcel_id": id_field or "property_id",
            "survey_plot_no": plot_field or "survey_plot_no",
            "owner_name": owner_field or "owner_name",
            "area_sqm": area_field or "area_sq_mtr"
        }

        result = survey_source_service.validate_and_ingest_geojson(
            raw_content=content,
            filename=file.filename or "uploaded_survey.geojson",
            supplier=supplier,
            survey_date=survey_date,
            accuracy_metadata=accuracy_metadata,
            source_crs=source_crs or "EPSG:4326",
            field_mapping=field_mapping
        )
        return result
    except ValueError as e:
        logger.warning(f"GeoJSON validation error in upload '{file.filename}': {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error ingesting GeoJSON: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Survey file ingestion failed: {str(e)}")


@router.post("/wfs-test")
def test_wfs_endpoint(req: WFSTestRequest):
    """
    Test connectivity, capabilities, and layer presence on a remote or local WFS GeoServer.
    Restricts URLs to configured allowed hosts. Never silently returns fake data.
    """
    result = wfs_connector_service.test_wfs_connection(
        wfs_url=req.wfs_url,
        layer_name=req.layer_name,
        auth_user=req.auth_user,
        auth_password=req.auth_password,
        timeout_seconds=req.timeout_seconds or 6
    )
    return result


@router.post("/wfs-connect")
def connect_and_fetch_wfs(req: WFSFetchRequest):
    """
    Fetch features from a verified WFS endpoint and ingest them as active survey data.
    """
    try:
        wfs_data = wfs_connector_service.fetch_wfs_parcels(
            wfs_url=req.wfs_url,
            layer_name=req.layer_name,
            auth_user=req.auth_user,
            auth_password=req.auth_password,
            max_features=req.max_features or 100
        )

        import json
        raw_bytes = json.dumps(wfs_data).encode("utf-8")
        ingest_result = survey_source_service.validate_and_ingest_geojson(
            raw_content=raw_bytes,
            filename=f"wfs_{req.layer_name}.geojson",
            supplier=f"WFS: {req.wfs_url}",
            accuracy_metadata="WFS Published Geospatial Cadastre"
        )

        # Update metadata state to CONFIGURED_WFS
        meta = survey_source_service.metadata
        meta["state"] = "CONFIGURED_WFS"
        meta["source_type"] = f"OGC WFS: {req.layer_name}"
        survey_source_service._persist_metadata(meta)

        return {
            "status": "SUCCESS",
            "state": "CONFIGURED_WFS",
            "layer_name": req.layer_name,
            "ingest_result": ingest_result
        }
    except Exception as e:
        logger.warning(f"WFS fetch error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/load-demo")
def load_demo_survey():
    """Explicitly load the clearly labelled synthetic demonstration dataset."""
    return survey_source_service.load_demo_synthetic_dataset()


@router.post("/clear")
def clear_survey():
    """Clear survey source to test NO_SOURCE state."""
    return survey_source_service.clear_survey_dataset()


@router.get("/parcels")
def get_survey_parcels():
    """Retrieve active survey FeatureCollection with full provenance metadata."""
    state_info = survey_source_service.get_source_state()
    features = survey_source_service.get_active_parcels()
    return {
        "type": "FeatureCollection",
        "name": f"bhusetu_{state_info['state'].lower()}",
        "metadata": state_info["metadata"],
        "total_parcels": len(features),
        "features": features
    }


@router.post("/calculate-discrepancy")
def calculate_discrepancy_endpoint(req: DiscrepancyCalcRequest):
    """
    Computes verified metric area discrepancy:
    abs(survey_area - registered_area) / registered_area * 100
    Separates signed area change from absolute discrepancy.
    Missing or zero registered area returns REGISTERED_AREA_UNAVAILABLE state.
    """
    return calculate_area_discrepancy(
        survey_area_sqm=req.survey_area_sqm,
        registered_area_sqm=req.registered_area_sqm
    )


# --- ROAD SOURCE ENDPOINTS ---

@router.get("/road-source-state")
def get_road_source_state():
    """Retrieve active road data source state and metadata."""
    return road_source_service.get_source_state()


@router.get("/roads")
def get_active_roads():
    """Retrieve active road FeatureCollection."""
    state_info = road_source_service.get_source_state()
    features = road_source_service.get_active_roads()
    return {
        "type": "FeatureCollection",
        "name": f"bhusetu_roads_{state_info['state'].lower()}",
        "metadata": state_info["metadata"],
        "total_roads": len(features),
        "features": features
    }


@router.post("/upload-road")
async def upload_road_geojson(
    file: UploadFile = File(...),
    supplier: Optional[str] = Form(None),
    road_name: Optional[str] = Form(None)
):
    """
    Ingest Road/Corridor GeoJSON:
    - LineString / MultiLineString: CENTERLINE (buffer represents corridor distance)
    - Polygon / MultiPolygon: ROAD_BOUNDARY
    """
    if not file.filename.lower().endswith((".geojson", ".json")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a .geojson or .json document."
        )

    content = await file.read()
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds maximum allowed upload size (15MB)."
        )

    try:
        result = road_source_service.ingest_road_file(
            raw_content=content,
            filename=file.filename,
            supplier=supplier or "User Upload",
            road_name_override=road_name
        )
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        logger.error(f"Failed to ingest road GeoJSON: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal road ingestion error: {str(exc)}"
        )


@router.post("/load-demo-road")
def load_demo_road_endpoint():
    """Restores synthetic demonstration road geometry."""
    return road_source_service.load_demo_road()


@router.post("/clear-road")
def clear_road_endpoint():
    """Clears road source to NO_ROAD_DATA."""
    return road_source_service.clear_road_source()

