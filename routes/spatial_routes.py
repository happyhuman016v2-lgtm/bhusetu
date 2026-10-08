"""
Spatial Routes for BhuSetu High-Performance Map Streaming
Endpoints:
- GET /api/parcels/bbox?minLat=&minLng=&maxLat=&maxLng=&land_type=&limit=
- GET /api/parcels/bounds
"""

from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from services.spatial_index import spatial_indexer

router = APIRouter(prefix="/api/parcels", tags=["Spatial & Map Engine"])


@router.get("/bbox")
def get_parcels_by_bbox(
    minLng: float = Query(..., description="Minimum Longitude (West bounding)"),
    minLat: float = Query(..., description="Minimum Latitude (South bounding)"),
    maxLng: float = Query(..., description="Maximum Longitude (East bounding)"),
    maxLat: float = Query(..., description="Maximum Latitude (North bounding)"),
    land_type: Optional[str] = Query(None, description="Optional filter by land use category"),
    limit: Optional[int] = Query(500, ge=1, le=2000, description="Max feature count limit")
):
    """
    Sub-millisecond R-Tree indexed viewport endpoint.
    Returns only visible cadastral parcels for smooth 60fps pan/zoom on Mapbox/MapLibre.
    """
    try:
        features, query_time_ms = spatial_indexer.query_bbox(
            min_lng=minLng,
            min_lat=minLat,
            max_lng=maxLng,
            max_lat=maxLat,
            land_type=land_type,
            limit=limit
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "type": "FeatureCollection",
        "name": "svamitva_bbox_stream",
        "features": features,
        "metadata": {
            "query_time_ms": round(query_time_ms, 3),
            "total_matched": len(features),
            "viewport_bbox": [minLng, minLat, maxLng, maxLat],
            "index_type": "Shapely STRtree 2D R-Tree",
            "fps_target": "60fps zero-lag streaming"
        }
    }


@router.get("/bounds")
def get_dataset_bounds():
    """Retrieve full spatial extents of the cadastral dataset."""
    bounds = spatial_indexer.dataset_bounds
    if not bounds:
        return {"bounds": None, "center": None}

    min_x, min_y, max_x, max_y = bounds
    center = [(min_x + max_x) / 2.0, (min_y + max_y) / 2.0]

    return {
        "bounds": [min_x, min_y, max_x, max_y],
        "center": center,
        "crs": "EPSG:4326",
        "total_parcels": len(spatial_indexer.features)
    }
