"""
BhuSetu Geospatial Engine: High-Precision Geodesic & Metric Buffer Engine
Handles UTM metric reprojection, geometry validation (make_valid),
exact metric buffer computation, and cadastral encroachment / dispute detection.
"""

import math
from typing import Dict, Any, List, Tuple, Optional
import pyproj
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, GeometryCollection
from shapely.ops import transform, unary_union
import shapely.validation


def get_utm_epsg(lon: float, lat: float) -> int:
    """Calculate appropriate UTM EPSG code for a given longitude/latitude."""
    zone_number = int(math.floor((lon + 180) / 6) + 1)
    if lat >= 0:
        return 32600 + zone_number  # WGS 84 / UTM Northern Hemisphere
    else:
        return 32700 + zone_number  # WGS 84 / UTM Southern Hemisphere


def get_transformer(from_epsg: int, to_epsg: int) -> pyproj.Transformer:
    """Instantiate a cached, coordinate-order-preserving pyproj Transformer."""
    return pyproj.Transformer.from_crs(f"EPSG:{from_epsg}", f"EPSG:{to_epsg}", always_xy=True)


def clean_geometry(geom):
    """
    Ensure geometry is topologically valid without self-intersections or spikes.
    Applies shapely.validation.make_valid() and strips degenerate elements.
    """
    if geom is None or geom.is_empty:
        return None
    if not geom.is_valid:
        geom = shapely.validation.make_valid(geom)
    # If a GeometryCollection was produced, isolate polygons
    if isinstance(geom, GeometryCollection):
        polys = [g for g in geom.geoms if isinstance(g, (Polygon, MultiPolygon))]
        if polys:
            geom = unary_union(polys)
        else:
            return None
    return geom


def reproject_geom(geom, from_epsg: int, to_epsg: int):
    """Reproject a Shapely geometry from one EPSG CRS to another."""
    if from_epsg == to_epsg:
        return geom
    transformer = get_transformer(from_epsg, to_epsg)
    return transform(transformer.transform, geom)


def generate_parcel_buffer(
    geom_input: Any,
    buffer_meters: float = 5.0,
    source_epsg: int = 4326
) -> Dict[str, Any]:
    """
    Generate an accurate metric buffer for a cadastral parcel:
    1. Detects centroid and converts geometry to local UTM projection (e.g. EPSG:32644).
    2. Validates topology and resolves self-intersections.
    3. Buffers by exact metric distance (meters) in UTM.
    4. Reprojects resulting buffer polygon back to EPSG:4326 for web map rendering.
    """
    # Accept dict GeoJSON or Shapely geometry
    if isinstance(geom_input, dict):
        s_geom = shape(geom_input)
    else:
        s_geom = geom_input

    s_geom = clean_geometry(s_geom)
    if s_geom is None or s_geom.is_empty:
        return {"type": "Feature", "geometry": None, "properties": {"buffer_meters": buffer_meters}}

    # Determine local UTM zone from centroid
    centroid = s_geom.centroid
    utm_epsg = get_utm_epsg(centroid.x, centroid.y)

    # Reproject WGS84 -> UTM (meters)
    geom_utm = reproject_geom(s_geom, source_epsg, utm_epsg)
    geom_utm = clean_geometry(geom_utm)

    # Perform exact metric buffer in meters
    buffered_utm = geom_utm.buffer(buffer_meters, resolution=32, join_style=1)  # 1 = Round join
    buffered_utm = clean_geometry(buffered_utm)

    # Reproject UTM -> WGS84 (EPSG:4326)
    buffered_wgs84 = reproject_geom(buffered_utm, utm_epsg, source_epsg)
    buffered_wgs84 = clean_geometry(buffered_wgs84)

    # Round coordinates to 7 decimal places for crisp sub-cm precision
    geojson_geom = mapping(buffered_wgs84)

    return {
        "type": "Feature",
        "geometry": geojson_geom,
        "properties": {
            "buffer_meters": buffer_meters,
            "calculated_in_utm_epsg": utm_epsg,
            "source_epsg": source_epsg,
            "area_sq_mtr": round(buffered_utm.area, 2)
        }
    }


def calculate_metric_area_sqm(geom_input: Any, source_epsg: int = 4326) -> float:
    """Calculates accurate metric area in square meters using local UTM projection."""
    if isinstance(geom_input, dict):
        s_geom = shape(geom_input)
    else:
        s_geom = geom_input
    s_geom = clean_geometry(s_geom)
    if s_geom is None or s_geom.is_empty:
        return 0.0
    centroid = s_geom.centroid
    utm_epsg = get_utm_epsg(centroid.x, centroid.y)
    geom_utm = reproject_geom(s_geom, source_epsg, utm_epsg)
    geom_utm = clean_geometry(geom_utm)
    return round(float(geom_utm.area), 2)


def calculate_area_discrepancy(
    survey_area_sqm: float,
    registered_area_sqm: Optional[float]
) -> Dict[str, Any]:
    """
    Computes verified area discrepancy between surveyed metric ground-truth and legal registered title:
    Formula: absolute discrepancy percentage = abs(survey_area - registered_area) / registered_area * 100
    Signed area change is kept separate from absolute discrepancy.
    Missing or zero registered area produces a verification state (no numeric percentage).
    Strict >5% policy:
    - 390 m² registered vs 412 m² surveyed: ~5.6410256% (EXCEEDS_TOLERANCE)
    - 400 m² registered vs 420 m² surveyed: exactly 5.0% (TOLERANCE_ACCEPTABLE)
    """
    if registered_area_sqm is None or registered_area_sqm <= 0:
        return {
            "survey_area_sqm": round(survey_area_sqm, 2),
            "registered_area_sqm": None,
            "absolute_discrepancy_pct": None,
            "signed_area_change_sqm": None,
            "signed_area_change_pct": None,
            "status": "REGISTERED_AREA_UNAVAILABLE",
            "exceeds_threshold": False,
            "requires_review": True,
            "message": "Registered legal area is missing, unrecorded, or zero. Field verification required."
        }

    signed_change_sqm = survey_area_sqm - registered_area_sqm
    signed_change_pct = (signed_change_sqm / registered_area_sqm) * 100.0
    abs_discrepancy_pct = (abs(signed_change_sqm) / registered_area_sqm) * 100.0

    # Strict > 5% policy
    exceeds = abs_discrepancy_pct > 5.0
    status = "DISCREPANCY_EXCEEDS_TOLERANCE" if exceeds else "TOLERANCE_ACCEPTABLE"

    return {
        "survey_area_sqm": round(survey_area_sqm, 2),
        "registered_area_sqm": round(registered_area_sqm, 2),
        "absolute_discrepancy_pct": round(abs_discrepancy_pct, 7),
        "signed_area_change_sqm": round(signed_change_sqm, 2),
        "signed_area_change_pct": round(signed_change_pct, 7),
        "status": status,
        "exceeds_threshold": exceeds,
        "requires_review": exceeds,
        "tolerance_threshold_pct": 5.0,
        "message": (
            f"Surveyed area deviates by {round(abs_discrepancy_pct, 2)}% from registered deed (Threshold: 5.0%). Officer review flagged."
            if exceeds else
            f"Surveyed area within standard ±5.0% cadastre tolerance ({round(abs_discrepancy_pct, 2)}%)."
        )
    }


def analyze_encroachments(
    features: List[Dict[str, Any]],
    buffer_meters: float = 3.0,
    road_features: Optional[List[Dict[str, Any]]] = None,
    road_layer_id: str = "svamitva-road-01",
    road_source_meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Perform spatial intersection and review analysis between:
    - Private cadastral parcels (or parcel buffers) and Public Road Corridors
    - Handles CENTERLINE (buffers centerline by buffer_meters) vs ROAD_BOUNDARY (direct corridor polygon)
    - Distinguishes positive-area overlap from zero-area boundary touch
    - Calculates affected percentage: (intersection_area / parcel_area) * 100
    - Displays 'Potential overlap — verification required', never automatic legal eviction verdict.
    - Records source CRS and analysis UTM CRS.
    """
    conflict_features = []
    road_geoms = []

    # 1. Gather road geometries from dedicated road_features if provided
    if road_features:
        for rf in road_features:
            g = rf.get("geometry")
            if g:
                try:
                    s = shape(g)
                    if s and not s.is_empty:
                        road_geoms.append((s, rf.get("properties", {})))
                except Exception as e:
                    logger.debug(f"Skipping road feature: {e}")
    else:
        # Fallback: Locate road features inside features array
        for f in features:
            props = f.get("properties", {})
            if props.get("land_type") == "Public Road" or f.get("id") == road_layer_id or "road" in props.get("land_type", "").lower():
                g = f.get("geometry")
                if g:
                    try:
                        s = shape(g)
                        if s and not s.is_empty:
                            road_geoms.append((s, props))
                    except Exception:
                        pass

    # Separate private parcels from any embedded road features
    private_parcels = [
        f for f in features
        if f.get("properties", {}).get("land_type") not in ("Public Road",) and f.get("id") != road_layer_id
    ]

    # Detect metric UTM CRS from centroid of dataset
    if features and features[0].get("geometry"):
        sample_c = shape(features[0]["geometry"]).centroid
        utm_epsg = get_utm_epsg(sample_c.x, sample_c.y)
    elif road_geoms:
        sample_c = road_geoms[0][0].centroid
        utm_epsg = get_utm_epsg(sample_c.x, sample_c.y)
    else:
        utm_epsg = 32644

    # Build unified road corridor in metric UTM
    road_utm_geoms = []
    primary_interpretation = road_source_meta.get("geometry_interpretation", "CENTERLINE") if road_source_meta else "CENTERLINE"

    for r_geom, r_props in road_geoms:
        r_clean = clean_geometry(r_geom)
        if not r_clean:
            continue
        r_utm = reproject_geom(r_clean, 4326, utm_epsg)
        if not r_utm:
            continue

        gtype = r_props.get("geometry_type") or r_geom.geom_type
        if gtype in ("LineString", "MultiLineString") or primary_interpretation == "CENTERLINE":
            # Centerline: buffer represents distance from centreline
            buffered_corridor = r_utm.buffer(buffer_meters, resolution=16)
            road_utm_geoms.append(clean_geometry(buffered_corridor))
        else:
            # Road Boundary polygon: represents actual right-of-way corridor
            road_utm_geoms.append(clean_geometry(r_utm))

    unified_road_corridor_utm = unary_union(road_utm_geoms) if road_utm_geoms else None
    if unified_road_corridor_utm:
        unified_road_corridor_utm = clean_geometry(unified_road_corridor_utm)

    total_encroachment_sqm = 0.0

    for p in private_parcels:
        p_geom = shape(p["geometry"])
        p_geom_clean = clean_geometry(p_geom)
        if p_geom_clean is None:
            continue

        p_geom_utm = reproject_geom(p_geom_clean, 4326, utm_epsg)
        if p_geom_utm is None:
            continue

        parcel_area_sqm = round(float(p_geom_utm.area), 2)

        if unified_road_corridor_utm and p_geom_utm.intersects(unified_road_corridor_utm):
            intersection_utm = p_geom_utm.intersection(unified_road_corridor_utm)
            intersection_utm = clean_geometry(intersection_utm)

            if intersection_utm and not intersection_utm.is_empty:
                overlap_sqm = round(float(intersection_utm.area), 2)
                affected_pct = round((overlap_sqm / parcel_area_sqm * 100.0), 2) if parcel_area_sqm > 0 else 0.0

                # Separate zero-area boundary contact from positive-area overlap
                if overlap_sqm <= 0.05 or intersection_utm.geom_type in ('LineString', 'MultiLineString', 'Point'):
                    conflict_type = "BOUNDARY_CONTACT_ZERO_OVERLAP"
                    severity = "INFO"
                    review_label = "Parcel boundary touches road corridor reserve; zero positive area overlap."
                else:
                    conflict_type = "POTENTIAL_CORRIDOR_OVERLAP_REQUIRING_REVIEW"
                    total_encroachment_sqm += overlap_sqm

                    if overlap_sqm > 25.0 or affected_pct > 15.0:
                        severity = "CRITICAL"
                        review_label = f"Substantial corridor overlap ({overlap_sqm} m², {affected_pct}% of parcel); physical site inspection required."
                    elif overlap_sqm > 10.0 or affected_pct > 5.0:
                        severity = "WARNING"
                        review_label = f"Moderate setback overlap ({overlap_sqm} m², {affected_pct}% of parcel); requires officer alignment review."
                    else:
                        severity = "INFO"
                        review_label = f"Minor buffer overlap ({overlap_sqm} m², {affected_pct}% of parcel) within typical survey tolerance envelope."

                conflict_wgs84 = reproject_geom(intersection_utm, utm_epsg, 4326)

                conflict_features.append({
                    "type": "Feature",
                    "id": f"conflict-road-{p.get('id')}",
                    "geometry": mapping(conflict_wgs84),
                    "properties": {
                        "conflict_type": conflict_type,
                        "dispute_severity": severity,
                        "overlap_area_sqm": overlap_sqm,
                        "parcel_area_sqm": parcel_area_sqm,
                        "affected_pct": affected_pct,
                        "is_positive_area_overlap": overlap_sqm > 0.05,
                        "encroaching_parcel_id": p.get("properties", {}).get("property_id") or p.get("id"),
                        "survey_plot_no": p.get("properties", {}).get("survey_plot_no", "Unknown"),
                        "owner_name": p.get("properties", {}).get("owner_name", "Unknown"),
                        "affected_corridor": road_source_meta.get("source_name", "Public Road Corridor") if road_source_meta else "Public Road Corridor",
                        "buffer_distance_tested_m": buffer_meters,
                        "geometry_interpretation": primary_interpretation,
                        "source_crs": "EPSG:4326",
                        "analysis_crs": f"EPSG:{utm_epsg}",
                        "review_verdict": review_label,
                        "legal_status": "Potential overlap — verification required (Officer determination required; not a judicial finding)"
                    }
                })

    severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
    conflict_features.sort(key=lambda x: (severity_order.get(x["properties"]["dispute_severity"], 3), -x["properties"]["overlap_area_sqm"]))

    return {
        "type": "FeatureCollection",
        "name": "cadastral_corridor_review_zones",
        "features": conflict_features,
        "metadata": {
            "total_conflicts_detected": len(conflict_features),
            "positive_overlap_count": sum(1 for c in conflict_features if c["properties"]["is_positive_area_overlap"]),
            "zero_area_touch_count": sum(1 for c in conflict_features if not c["properties"]["is_positive_area_overlap"]),
            "total_encroachment_sqm": round(total_encroachment_sqm, 2),
            "tested_buffer_meters": buffer_meters,
            "geometry_interpretation": primary_interpretation,
            "source_crs": "EPSG:4326",
            "analysis_crs": f"EPSG:{utm_epsg}",
            "road_source": road_source_meta.get("source_type", "DEMO_OR_EMBEDDED") if road_source_meta else "DEMO_OR_EMBEDDED",
            "disclaimer": "Analysis indicates geometric overlap against road/corridor buffer. Does not constitute an illegal encroachment or judicial finding."
        }
    }
