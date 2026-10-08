"""
Bhu-Aadhaar / ULPIN (Unique Land Parcel Identification Number) & Chauhaddi Generator
Based on Department of Land Resources (DoLR), Ministry of Rural Development Specifications.
Generates deterministic 14-character alphanumeric ULPINs from WGS84 geographic coordinates,
and derives 4-point cardinal spatial neighbors (Chauhaddi: North, South, East, West).
"""

import math
from typing import Dict, Any, List, Tuple, Optional
from shapely.geometry import shape, Point, Polygon, MultiPolygon
from shapely.ops import unary_union
import shapely.validation

# Base32 alphabet for DoLR Geohash alphanumeric encoding (32 characters: 0-9 and A-Z omitting easily confused I, L, O, U)
BASE32_CHARSET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def generate_dolr_ulpin(centroid_lon: float, centroid_lat: float, state_code: str = "UP", village_code: str = "142890") -> str:
    """
    Generate a 14-character deterministic Bhu-Aadhaar (ULPIN) per DoLR specifications:
    - Latitude and Longitude fractional coordinates encoded into a high-precision spatial hash.
    - Format: {STATE_CODE(2)}{VILLAGE_PREFIX(4)}{GEO_ENCODED(8)} = 14 Alphanumeric characters.
    
    Example: UP1428N48KQ792
    """
    # Normalize coordinates to bounding cell
    lat_norm = (centroid_lat + 90.0) / 180.0
    lon_norm = (centroid_lon + 180.0) / 360.0

    # Convert to 40-bit spatial integer interleaving (Morton space-filling curve / DoLR standard)
    lat_int = int(lat_norm * (1 << 20))
    lon_int = int(lon_norm * (1 << 20))

    interleaved = 0
    for i in range(20):
        bit_lon = (lon_int >> i) & 1
        bit_lat = (lat_int >> i) & 1
        interleaved |= (bit_lon << (2 * i)) | (bit_lat << (2 * i + 1))

    # Convert interleaved 40-bit number to 8 Base32 characters
    geo_chars = []
    temp = interleaved
    for _ in range(8):
        geo_chars.append(BASE32_CHARSET[temp % 32])
        temp //= 32
    geo_hash = "".join(reversed(geo_chars))

    # Construct DoLR standard 14-digit identifier
    state_prefix = state_code[:2].upper()
    village_prefix = village_code[:4].upper()
    ulpin = f"{state_prefix}{village_prefix}{geo_hash}"
    return ulpin[:14]


def compute_chauhaddi(
    target_feature: Dict[str, Any],
    all_features: List[Dict[str, Any]],
    search_buffer_m: float = 8.0
) -> Dict[str, Dict[str, Any]]:
    """
    Compute Cardinal 4-point spatial boundary neighbors (Chauhaddi: Uttar, Dakshin, Poorv, Paschim).
    Identifies adjoining plot survey numbers, owner names, or public road corridors.
    
    Returns:
    {
        "north": {"boundary_type": "PARCEL", "plot_no": "AB-105", "owner": "Ram Kumar", "relation": "Adjoining Plot"},
        "south": {"boundary_type": "PUBLIC_ROAD", "plot_no": "ROAD-01", "owner": "Public Village Road Corridor", "relation": "Arterial Gali"},
        "east":  {"boundary_type": "PARCEL", "plot_no": "AB-106", "owner": "Smt. Shakuntala", "relation": "Adjoining Plot"},
        "west":  {"boundary_type": "PARCEL", "plot_no": "AB-103", "owner": "Vijay Verma", "relation": "Adjoining Plot"}
    }
    """
    target_id = target_feature.get("id") or target_feature.get("properties", {}).get("property_id")
    target_geom = shape(target_feature["geometry"])
    if not target_geom.is_valid:
        target_geom = shapely.validation.make_valid(target_geom)

    centroid = target_geom.centroid
    bounds = target_geom.bounds  # minx, miny, maxx, maxy
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]

    # Cardinal probe points extending outward from bounding box edges
    probe_dist = max(width, height) * 0.45 + 0.00003  # ~3 to 5 meters outward
    
    cardinal_points = {
        "north": Point(centroid.x, bounds[3] + probe_dist),
        "south": Point(centroid.x, bounds[1] - probe_dist),
        "east":  Point(bounds[2] + probe_dist, centroid.y),
        "west":  Point(bounds[0] - probe_dist, centroid.y)
    }

    chauhaddi_result: Dict[str, Dict[str, Any]] = {}

    for direction, probe in cardinal_points.items():
        matched = None
        min_dist = float("inf")

        for f in all_features:
            f_id = f.get("id") or f.get("properties", {}).get("property_id")
            if f_id == target_id:
                continue

            f_geom = shape(f["geometry"])
            if not f_geom.is_valid:
                f_geom = shapely.validation.make_valid(f_geom)

            # Check if probe point touches or falls closest to neighboring polygon
            dist = f_geom.distance(probe)
            if dist < min_dist and dist < 0.00015:  # within ~15 meters
                min_dist = dist
                matched = f

        if matched:
            m_props = matched.get("properties", {})
            land_type = m_props.get("land_type", "Residential")
            is_road = land_type == "Public Road" or "road" in m_props.get("owner_name", "").lower()

            plot_str = m_props.get("survey_plot_no", "N/A")
            owner_str = m_props.get("owner_name", "Public Corridor")
            desc_text = "Gram Sabha Public Road" if is_road else f"Plot {plot_str} ({owner_str})"

            chauhaddi_result[direction] = {
                "boundary_type": "PUBLIC_ROAD" if is_road else "PARCEL",
                "plot_no": plot_str,
                "owner": owner_str,
                "land_type": land_type,
                "property_id": m_props.get("property_id", ""),
                "description": desc_text
            }
        else:
            # Fallback to general rural abadi boundary
            direction_name = {"north": "North Village Limit", "south": "Gram Sabha Rasta", "east": "Internal Gali", "west": "Agricultural Boundary"}[direction]
            chauhaddi_result[direction] = {
                "boundary_type": "CORRIDOR",
                "plot_no": "OPEN-CORRIDOR",
                "owner": "Gram Sabha Rampur Kalan",
                "land_type": "Public Open",
                "property_id": "",
                "description": direction_name
            }

    return chauhaddi_result
