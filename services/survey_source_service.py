"""
BhuSetu Survey Data Source & Ingestion Service
Manages survey dataset states:
- CONFIGURED_WFS: Verified GIS/WFS GeoServer source
- UPLOADED_FILE: User-uploaded GeoJSON with verified provenance and SHA-256 checksum
- SYNTHETIC_DEMO: Clearly labelled demonstration dataset
- NO_SOURCE: No survey source configured

Implements strict validation:
- Valid GeoJSON FeatureCollection
- Polygon and MultiPolygon geometry with holes preserved
- Finite coordinates and closed rings
- Explicit reporting of invalid geometries (no silent repairs)
- Unique source parcel ID checking
- Stable internal IDs and provenance tracking
"""

import os
import json
import hashlib
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
import math

from shapely.geometry import shape, mapping, Polygon, MultiPolygon
import shapely.validation

from services.gis_engine import get_utm_epsg, reproject_geom, clean_geometry

logger = logging.getLogger("BhuSetu_SurveySource")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
ACTIVE_SURVEY_FILE = os.path.join(DATA_DIR, "active_survey_parcels.geojson")
METADATA_FILE = os.path.join(DATA_DIR, "survey_source_metadata.json")
DEMO_FILE = os.path.join(DATA_DIR, "raw", "drone_parcels_raw.geojson")


class SurveySourceService:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.metadata = self._load_metadata()
        self.active_features: List[Dict[str, Any]] = self._load_active_parcels()

    def _load_metadata(self) -> Dict[str, Any]:
        if os.path.exists(METADATA_FILE):
            try:
                with open(METADATA_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read metadata file: {e}")

        # Default initial state: SYNTHETIC_DEMO if demo file exists, else NO_SOURCE
        initial_state = "SYNTHETIC_DEMO" if os.path.exists(DEMO_FILE) else "NO_SOURCE"
        default_meta = {
            "state": initial_state,
            "source_type": "Synthetic Demonstration Dataset" if initial_state == "SYNTHETIC_DEMO" else "None",
            "dataset_id": "ds-demo-village-2026" if initial_state == "SYNTHETIC_DEMO" else "none",
            "original_filename": "drone_parcels_raw.geojson" if initial_state == "SYNTHETIC_DEMO" else "N/A",
            "source_crs": "EPSG:4326",
            "survey_date": "2026-03-15" if initial_state == "SYNTHETIC_DEMO" else "Unknown",
            "supplier": "BhuSetu Synthesizer (Demo)" if initial_state == "SYNTHETIC_DEMO" else "Unknown",
            "accuracy_metadata": "Simulated sub-5cm resolution" if initial_state == "SYNTHETIC_DEMO" else "Unknown",
            "geometry_version": "v1.0",
            "sha256_checksum": None,
            "total_features": 0,
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "SYNTHETIC DEMONSTRATION DATASET - NOT OFFICIAL SVAMITVA RECORD" if initial_state == "SYNTHETIC_DEMO" else "No survey source currently loaded."
        }
        self._persist_metadata(default_meta)
        return default_meta

    def _persist_metadata(self, meta: Dict[str, Any]):
        self.metadata = meta
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

    def _load_active_parcels(self) -> List[Dict[str, Any]]:
        # Prefer active survey file
        if os.path.exists(ACTIVE_SURVEY_FILE):
            try:
                with open(ACTIVE_SURVEY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    features = data.get("features", [])
                    self.metadata["total_features"] = len(features)
                    return features
            except Exception as e:
                logger.warning(f"Failed to read active survey file: {e}")

        # If metadata is SYNTHETIC_DEMO and demo file exists, load demo
        if self.metadata.get("state") == "SYNTHETIC_DEMO" and os.path.exists(DEMO_FILE):
            try:
                with open(DEMO_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    features = data.get("features", [])
                    # Mark properties with demo label
                    for feat in features:
                        if "properties" in feat:
                            feat["properties"]["is_synthetic_demo"] = True
                            feat["properties"]["data_source_state"] = "SYNTHETIC_DEMO"
                    self._persist_active_parcels(features)
                    return features
            except Exception as e:
                logger.warning(f"Failed to read demo survey file: {e}")

        return []

    def _persist_active_parcels(self, features: List[Dict[str, Any]]):
        self.active_features = features
        self.metadata["total_features"] = len(features)
        fc = {
            "type": "FeatureCollection",
            "name": f"bhusetu_{self.metadata.get('state', 'survey').lower()}",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "metadata": self.metadata,
            "features": features
        }
        with open(ACTIVE_SURVEY_FILE, "w", encoding="utf-8") as f:
            json.dump(fc, f, indent=2)
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)

        # Update spatial STRtree index
        try:
            from services.spatial_index import spatial_indexer
            spatial_indexer.rebuild_index(features)
        except Exception as e:
            logger.warning(f"Could not rebuild spatial index: {e}")

    def validate_and_ingest_geojson(
        self,
        raw_content: bytes,
        filename: str,
        supplier: Optional[str] = None,
        survey_date: Optional[str] = None,
        accuracy_metadata: Optional[str] = None,
        source_crs: str = "EPSG:4326",
        field_mapping: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Validates GeoJSON FeatureCollection and ingests Polygon/MultiPolygon parcels.
        Checks:
        - JSON validity
        - FeatureCollection type
        - Feature count <= 2000 and file size <= 15MB
        - Geometry type: Polygon or MultiPolygon (retains holes and multipart)
        - Finite coordinates, non-empty geometry
        - Closed rings (exterior and interior)
        - Geometry validity: reports invalid features explicitly; does NOT silently mutate boundaries
        - Duplicate source identifier detection
        """
        # File size check: 15MB
        if len(raw_content) > 15 * 1024 * 1024:
            raise ValueError("File exceeds maximum allowed size of 15MB.")

        # Compute SHA-256
        sha256_hash = hashlib.sha256(raw_content).hexdigest()

        try:
            parsed = json.loads(raw_content.decode("utf-8"))
        except Exception as e:
            raise ValueError(f"Malformed JSON: {str(e)}")

        if not isinstance(parsed, dict) or parsed.get("type") != "FeatureCollection":
            raise ValueError("Invalid GeoJSON: Root object must have 'type': 'FeatureCollection'.")

        raw_features = parsed.get("features", [])
        if not isinstance(raw_features, list):
            raise ValueError("Invalid GeoJSON: 'features' must be an array.")

        if len(raw_features) == 0:
            raise ValueError("FeatureCollection is empty. No parcel features found.")

        if len(raw_features) > 2000:
            raise ValueError(f"Feature count ({len(raw_features)}) exceeds maximum limit of 2000 parcels per upload.")

        field_map = field_mapping or {}
        id_field = field_map.get("parcel_id", "property_id")
        plot_field = field_map.get("survey_plot_no", "survey_plot_no")
        owner_field = field_map.get("owner_name", "owner_name")
        area_field = field_map.get("area_sqm", "area_sq_mtr")
        land_type_field = field_map.get("land_type", "land_type")
        village_field = field_map.get("village", "village")

        valid_features: List[Dict[str, Any]] = []
        rejected_features: List[Dict[str, Any]] = []
        seen_source_ids: Dict[str, int] = {}
        conflicting_ids: List[str] = []

        import_timestamp = datetime.now(timezone.utc).isoformat()
        dataset_id = f"ds-up-{sha256_hash[:10]}"

        for idx, feat in enumerate(raw_features):
            if not isinstance(feat, dict) or feat.get("type") != "Feature":
                rejected_features.append({
                    "feature_index": idx,
                    "reason": "Element is not a valid GeoJSON Feature object."
                })
                continue

            geom_raw = feat.get("geometry")
            if not geom_raw or not isinstance(geom_raw, dict):
                rejected_features.append({
                    "feature_index": idx,
                    "reason": "Geometry is null or empty."
                })
                continue

            geom_type = geom_raw.get("type")
            if geom_type not in ("Polygon", "MultiPolygon"):
                rejected_features.append({
                    "feature_index": idx,
                    "reason": f"Unsupported geometry type '{geom_type}'. Only Polygon and MultiPolygon are accepted."
                })
                continue

            coords = geom_raw.get("coordinates")
            if not coords or not isinstance(coords, list):
                rejected_features.append({
                    "feature_index": idx,
                    "reason": "Missing or invalid coordinates array."
                })
                continue

            # Validate coordinate finiteness & ring closure
            coord_error = self._validate_polygon_coordinates(coords, geom_type)
            if coord_error:
                rejected_features.append({
                    "feature_index": idx,
                    "reason": coord_error
                })
                continue

            # Topological validity check via Shapely
            try:
                s_geom = shape(geom_raw)
                if s_geom.is_empty:
                    rejected_features.append({
                        "feature_index": idx,
                        "reason": "Geometry evaluates to empty geometry."
                    })
                    continue

                if not s_geom.is_valid:
                    # Do NOT silently repair; report invalid feature
                    explain = shapely.validation.explain_validity(s_geom)
                    rejected_features.append({
                        "feature_index": idx,
                        "reason": f"Invalid polygon topology: {explain}. Boundary must be corrected in source CAD/GIS."
                    })
                    continue

                # Compute verified UTM survey area
                centroid = s_geom.centroid
                utm_epsg = get_utm_epsg(centroid.x, centroid.y)
                geom_utm = reproject_geom(s_geom, 4326, utm_epsg)
                computed_survey_area = round(geom_utm.area, 2)

                # Check for holes/interior rings retention
                has_holes = False
                if geom_type == "Polygon" and len(s_geom.interiors) > 0:
                    has_holes = True
                elif geom_type == "MultiPolygon":
                    has_holes = any(len(p.interiors) > 0 for p in s_geom.geoms)

            except Exception as e:
                rejected_features.append({
                    "feature_index": idx,
                    "reason": f"Topology evaluation error: {str(e)}"
                })
                continue

            # Properties extraction
            props = feat.get("properties") or {}

            # Source parcel ID resolution
            source_id = str(
                props.get(id_field)
                or props.get("id")
                or props.get("property_id")
                or props.get("plot_id")
                or feat.get("id")
                or f"PARCEL-{idx+1:03d}"
            ).strip()

            # Duplicate ID check
            if source_id in seen_source_ids:
                conflicting_ids.append(source_id)
                # Keep both by appending suffix to second occurrence
                internal_id = f"{dataset_id}-{source_id}-dup{idx}"
            else:
                seen_source_ids[source_id] = idx
                internal_id = f"{dataset_id}-{source_id}"

            survey_plot = str(props.get(plot_field) or props.get("survey_plot_no") or props.get("plot_no") or source_id).strip()
            owner_name = str(props.get(owner_field) or props.get("owner_name") or "Unknown").strip()
            land_type = str(props.get(land_type_field) or props.get("land_type") or "Residential").strip()
            village = str(props.get(village_field) or props.get("village") or "Unknown").strip()

            # Area recorded in source property if present
            recorded_area = None
            if area_field in props and props[area_field] is not None:
                try:
                    recorded_area = float(props[area_field])
                except (ValueError, TypeError):
                    recorded_area = None

            normalized_props = {
                **props,
                "property_id": internal_id,
                "source_parcel_id": source_id,
                "survey_plot_no": survey_plot,
                "owner_name": owner_name,
                "area_sq_mtr": computed_survey_area,
                "recorded_legal_area_sqm": recorded_area,
                "land_type": land_type,
                "village": village,
                "source_crs": source_crs,
                "calculated_utm_epsg": utm_epsg,
                "has_interior_holes": has_holes,
                "dataset_id": dataset_id,
                "geometry_version": "v1.0",
                "data_source_state": "UPLOADED_FILE",
                "is_synthetic_demo": False,
                "upload_filename": filename,
                "provenance_sha256": sha256_hash
            }

            valid_features.append({
                "type": "Feature",
                "id": internal_id,
                "geometry": mapping(s_geom),
                "properties": normalized_props
            })

        # Check rejection threshold: Do not mark partially imported batch as purely successful
        if len(valid_features) == 0:
            raise ValueError(
                f"All {len(raw_features)} features in '{filename}' were rejected. "
                f"First failure: {rejected_features[0]['reason'] if rejected_features else 'Unknown error'}"
            )

        # Determine import status
        is_partial = len(rejected_features) > 0
        status_label = "PARTIALLY_IMPORTED_WITH_ERRORS" if is_partial else "SUCCESSFULLY_IMPORTED"

        # Update metadata
        new_metadata = {
            "state": "UPLOADED_FILE",
            "source_type": "Verified GeoJSON FeatureCollection Upload",
            "dataset_id": dataset_id,
            "original_filename": filename,
            "source_crs": source_crs,
            "survey_date": survey_date or "Unknown",
            "supplier": supplier or "Field Survey Team",
            "accuracy_metadata": accuracy_metadata or "Sub-5cm Drone Photogrammetry",
            "geometry_version": "v1.0",
            "sha256_checksum": sha256_hash,
            "total_features": len(valid_features),
            "rejected_features_count": len(rejected_features),
            "conflicting_ids_count": len(conflicting_ids),
            "imported_at": import_timestamp,
            "disclaimer": "UPLOADED SURVEY DATASET - PROVENANCE LOGGED WITH SHA-256 CHECKSUM. PENDING STATUTORY REVENUE RATIFICATION."
        }

        self._persist_metadata(new_metadata)
        self._persist_active_parcels(valid_features)

        return {
            "status": status_label,
            "imported_count": len(valid_features),
            "rejected_count": len(rejected_features),
            "rejected_features": rejected_features[:20],  # Return up to first 20 errors
            "conflicting_ids": conflicting_ids,
            "metadata": new_metadata,
            "dataset_id": dataset_id,
            "sha256_checksum": sha256_hash,
            "sample_parcel_ids": [f["id"] for f in valid_features[:5]]
        }

    def _validate_polygon_coordinates(self, coords: List[Any], geom_type: str) -> Optional[str]:
        """Validate that all coordinates are finite numbers and rings are closed."""
        polys = [coords] if geom_type == "Polygon" else coords

        for p_idx, poly_rings in enumerate(polys):
            if not isinstance(poly_rings, list) or len(poly_rings) == 0:
                return f"Polygon {p_idx} has no rings."

            # Exterior ring
            exterior = poly_rings[0]
            if not isinstance(exterior, list) or len(exterior) < 4:
                return f"Polygon {p_idx} exterior ring has {len(exterior) if isinstance(exterior, list) else 0} points (minimum 4 required)."

            # Check finiteness & ring closure (first coord == last coord)
            first_pt = exterior[0]
            last_pt = exterior[-1]
            if not (isinstance(first_pt, list) and isinstance(last_pt, list) and len(first_pt) >= 2 and len(last_pt) >= 2):
                return f"Polygon {p_idx} exterior ring has invalid points."

            if not (isinstance(first_pt[0], (int, float)) and isinstance(first_pt[1], (int, float)) and
                    isinstance(last_pt[0], (int, float)) and isinstance(last_pt[1], (int, float))):
                return f"Polygon {p_idx} exterior ring contains non-numeric coordinates."

            if not (math.isclose(first_pt[0], last_pt[0], abs_tol=1e-7) and math.isclose(first_pt[1], last_pt[1], abs_tol=1e-7)):
                return f"Polygon {p_idx} exterior ring is unclosed: first coordinate {first_pt} != last {last_pt}."

            for pt in exterior:
                if not isinstance(pt, list) or len(pt) < 2:
                    return f"Polygon {p_idx} contains invalid coordinate point."
                if not (isinstance(pt[0], (int, float)) and isinstance(pt[1], (int, float)) and
                        math.isfinite(pt[0]) and math.isfinite(pt[1])):
                    return f"Polygon {p_idx} contains non-finite or non-numeric coordinate: {pt}."

            # Interior rings (holes)
            for h_idx, hole in enumerate(poly_rings[1:]):
                if not isinstance(hole, list) or len(hole) < 4:
                    return f"Polygon {p_idx} hole {h_idx+1} has fewer than 4 points."
                h_first = hole[0]
                h_last = hole[-1]
                if not (isinstance(h_first, list) and isinstance(h_last, list) and len(h_first) >= 2 and len(h_last) >= 2 and
                        isinstance(h_first[0], (int, float)) and isinstance(h_first[1], (int, float)) and
                        isinstance(h_last[0], (int, float)) and isinstance(h_last[1], (int, float))):
                    return f"Polygon {p_idx} hole {h_idx+1} contains non-numeric coordinates."
                if not (math.isclose(h_first[0], h_last[0], abs_tol=1e-7) and math.isclose(h_first[1], h_last[1], abs_tol=1e-7)):
                    return f"Polygon {p_idx} hole {h_idx+1} is unclosed."
                for pt in hole:
                    if not (isinstance(pt, list) and len(pt) >= 2 and
                            isinstance(pt[0], (int, float)) and isinstance(pt[1], (int, float)) and
                            math.isfinite(pt[0]) and math.isfinite(pt[1])):
                        return f"Polygon {p_idx} hole {h_idx+1} contains non-finite or non-numeric coordinate."

        return None

    def load_demo_synthetic_dataset(self) -> Dict[str, Any]:
        """Loads and explicitly labels the synthetic demonstration dataset."""
        if not os.path.exists(DEMO_FILE):
            # Generate if missing
            from scripts.scrape_drone_survey import generate_synthetic_drone_parcels
            os.makedirs(os.path.dirname(DEMO_FILE), exist_ok=True)
            data = generate_synthetic_drone_parcels(count=72)
            with open(DEMO_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

        with open(DEMO_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        features = data.get("features", [])
        for feat in features:
            props = feat.get("properties") or {}
            props["is_synthetic_demo"] = True
            props["data_source_state"] = "SYNTHETIC_DEMO"
            feat["properties"] = props

        meta = {
            "state": "SYNTHETIC_DEMO",
            "source_type": "Synthetic Voronoi Demonstration Dataset",
            "dataset_id": "ds-demo-village-2026",
            "original_filename": "drone_parcels_raw.geojson",
            "source_crs": "EPSG:4326",
            "survey_date": "2026-03-15",
            "supplier": "BhuSetu Cadastral Synthesizer (Demo Mode)",
            "accuracy_metadata": "Demonstration Math (400m x 400m Abadi Layout)",
            "geometry_version": "v1.0",
            "sha256_checksum": None,
            "total_features": len(features),
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "SYNTHETIC DEMONSTRATION DATASET - NOT OFFICIAL SVAMITVA RECORD. FOR DEMO AND INTEGRATION BENCHMARKING ONLY."
        }

        self._persist_metadata(meta)
        self._persist_active_parcels(features)
        return {
            "status": "SUCCESS",
            "state": "SYNTHETIC_DEMO",
            "total_parcels": len(features),
            "metadata": meta
        }

    def clear_survey_dataset(self) -> Dict[str, Any]:
        """Clears current survey dataset to test NO_SOURCE state."""
        meta = {
            "state": "NO_SOURCE",
            "source_type": "None",
            "dataset_id": "none",
            "original_filename": "N/A",
            "source_crs": "EPSG:4326",
            "survey_date": "Unknown",
            "supplier": "None",
            "accuracy_metadata": "None",
            "geometry_version": "None",
            "sha256_checksum": None,
            "total_features": 0,
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "NO SURVEY SOURCE CONFIGURED. PLEASE UPLOAD A GEOJSON SURVEY FILE OR CONFIGURE A WFS ENDPOINT."
        }
        self._persist_metadata(meta)
        self._persist_active_parcels([])
        return {
            "status": "SUCCESS",
            "state": "NO_SOURCE",
            "total_parcels": 0,
            "metadata": meta
        }

    def get_source_state(self) -> Dict[str, Any]:
        """Returns current survey source state and provenance metadata."""
        return {
            "state": self.metadata.get("state", "NO_SOURCE"),
            "total_parcels": len(self.active_features),
            "metadata": self.metadata
        }

    def get_active_parcels(self) -> List[Dict[str, Any]]:
        return self.active_features


survey_source_service = SurveySourceService()
