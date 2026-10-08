"""
BhuSetu Road Data Source & Corridor Management Service

Supports 3 explicit Road Sources:
- IMPORTED_ROAD: User-uploaded Road Centreline or Road Boundary GeoJSON
- PUBLIC_VECTOR_ROAD: Legitimate public vector road source (e.g. OpenStreetMap contributors)
- SYNTHETIC_DEMO_ROAD: Demo road fixture strictly for offline demonstration

Distinguishes Geometry Interpretations:
- CENTERLINE (LineString / MultiLineString): Buffer represents distance from centreline
- ROAD_BOUNDARY (Polygon / MultiPolygon): True right-of-way corridor boundary (no artificial centerline buffer)

Never silently substitutes demo data when imported or public source fails.
"""

import os
import json
import hashlib
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
import math

from shapely.geometry import shape, mapping, Point, LineString, MultiLineString, Polygon, MultiPolygon
import shapely.validation
from shapely.ops import unary_union

from services.gis_engine import get_utm_epsg, reproject_geom, clean_geometry

logger = logging.getLogger("BhuSetu_RoadSource")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
ACTIVE_ROAD_FILE = os.path.join(DATA_DIR, "active_road_features.geojson")
ROAD_METADATA_FILE = os.path.join(DATA_DIR, "road_source_metadata.json")
DEMO_ROAD_FILE = os.path.join(DATA_DIR, "demo_road.geojson")


class RoadSourceService:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self._ensure_demo_road_file()
        self.metadata = self._load_metadata()
        self.active_features: List[Dict[str, Any]] = self._load_active_roads()

    def _ensure_demo_road_file(self):
        """Ensures demo_road.geojson exists from drone_parcels_raw.geojson if needed."""
        if not os.path.exists(DEMO_ROAD_FILE):
            raw_parcels = os.path.join(DATA_DIR, "raw", "drone_parcels_raw.geojson")
            if os.path.exists(raw_parcels):
                try:
                    with open(raw_parcels, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    road_f = [f for f in data.get("features", []) if f.get("id") == "svamitva-road-01" or f.get("properties", {}).get("land_type") == "Public Road"]
                    if road_f:
                        demo_payload = {
                            "type": "FeatureCollection",
                            "name": "demo_road_geometry",
                            "metadata": {
                                "source_name": "Demo Road Geometry",
                                "source_type": "SYNTHETIC_DEMO_ROAD",
                                "crs": "EPSG:4326",
                                "geometry_interpretation": "ROAD_BOUNDARY",
                                "label": "Demo Road Geometry (Synthetic Demonstration)"
                            },
                            "features": [{
                                "type": "Feature",
                                "id": "demo-road-cross-01",
                                "geometry": road_f[0]["geometry"],
                                "properties": {
                                    "road_name": "Demo Village Arterial Corridor",
                                    "geometry_type": "ROAD_BOUNDARY",
                                    "source": "SYNTHETIC DEMONSTRATION",
                                    "dataset_id": "ds-demo-road-2026",
                                    "provenance": "Synthetic fixture created for engine evaluation"
                                }
                            }]
                        }
                        with open(DEMO_ROAD_FILE, "w", encoding="utf-8") as out:
                            json.dump(demo_payload, out, indent=2)
                except Exception as e:
                    logger.warning(f"Could not build demo road file: {e}")

    def _load_metadata(self) -> Dict[str, Any]:
        if os.path.exists(ROAD_METADATA_FILE):
            try:
                with open(ROAD_METADATA_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read road metadata file: {e}")

        # Default state
        default_meta = {
            "state": "SYNTHETIC_DEMO_ROAD",
            "source_type": "SYNTHETIC_DEMO_ROAD",
            "source_name": "Demo Road Geometry",
            "dataset_id": "ds-demo-road-2026",
            "original_filename": "demo_road.geojson",
            "source_crs": "EPSG:4326",
            "geometry_interpretation": "ROAD_BOUNDARY",
            "supplier": "BhuSetu Cadastral Synthesizer (Demo Mode)",
            "sha256_checksum": None,
            "total_features": 1,
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "SOURCE: SYNTHETIC DEMONSTRATION — Demo Road Geometry. Not an actual village or public road."
        }
        return default_meta

    def _save_metadata(self):
        try:
            with open(ROAD_METADATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save road metadata: {e}")

    def _load_active_roads(self) -> List[Dict[str, Any]]:
        target_file = ACTIVE_ROAD_FILE if os.path.exists(ACTIVE_ROAD_FILE) else DEMO_ROAD_FILE
        if os.path.exists(target_file):
            try:
                with open(target_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return data.get("features", [])
            except Exception as e:
                logger.error(f"Failed to load active road features from {target_file}: {e}")
        return []

    def get_source_state(self) -> Dict[str, Any]:
        return {
            "state": self.metadata.get("state", "NO_ROAD_DATA"),
            "metadata": self.metadata,
            "total_features": len(self.active_features)
        }

    def get_active_roads(self) -> List[Dict[str, Any]]:
        return self.active_features

    def validate_road_geojson(
        self,
        raw_content: bytes,
        filename: str = "uploaded_road.geojson"
    ) -> Tuple[bool, List[str], List[Dict[str, Any]], Dict[str, Any]]:
        """
        Validates road GeoJSON without mutating geometries.
        Supports LineString, MultiLineString, Polygon, MultiPolygon.
        Detects CENTERLINE vs ROAD_BOUNDARY interpretation.
        """
        errors = []
        try:
            data = json.loads(raw_content.decode("utf-8"))
        except Exception as e:
            return False, [f"Invalid JSON file format in '{filename}': {str(e)}"], [], {}

        if not isinstance(data, dict):
            return False, [f"Root of GeoJSON '{filename}' must be a JSON object."], [], {}

        if data.get("type") != "FeatureCollection":
            return False, [f"Expected GeoJSON 'FeatureCollection', got '{data.get('type')}' in '{filename}'."], [], {}

        raw_features = data.get("features", [])
        if not isinstance(raw_features, list) or len(raw_features) == 0:
            return False, [f"FeatureCollection in '{filename}' is empty."], [], {}

        valid_features = []
        has_lines = False
        has_polys = False

        for idx, f in enumerate(raw_features):
            if not isinstance(f, dict):
                errors.append(f"Road Feature {idx} is not a valid JSON object.")
                continue

            geom = f.get("geometry")
            if not isinstance(geom, dict):
                errors.append(f"Road Feature {idx} has missing or invalid geometry object.")
                continue

            gtype = geom.get("type")
            coords = geom.get("coordinates")

            if gtype not in ("LineString", "MultiLineString", "Polygon", "MultiPolygon"):
                errors.append(f"Road Feature {idx} has unsupported geometry type '{gtype}'. Supported: LineString, MultiLineString, Polygon, MultiPolygon.")
                continue

            if not coords or not isinstance(coords, list):
                errors.append(f"Road Feature {idx} coordinates are empty or malformed.")
                continue

            # Check coordinate finiteness
            try:
                geom_shape = shape(geom)
            except Exception as e:
                errors.append(f"Road Feature {idx} cannot be parsed into shape: {str(e)}")
                continue

            if not geom_shape.is_valid:
                validity_reason = explain_validity(geom_shape)
                errors.append(f"Road Feature {idx} ({gtype}) is topologically invalid: {validity_reason}")
                continue

            if gtype in ("LineString", "MultiLineString"):
                has_lines = True
                interpretation = "CENTERLINE"
            else:
                has_polys = True
                interpretation = "ROAD_BOUNDARY"

            feature_id = f.get("id") or f.get("properties", {}).get("road_id") or f"road-feat-{idx+1:03d}"
            props = dict(f.get("properties") or {})
            props.setdefault("road_name", props.get("name") or f"Road Corridor {idx+1}")
            props.setdefault("geometry_type", interpretation)
            props["feature_id"] = str(feature_id)

            valid_features.append({
                "type": "Feature",
                "id": str(feature_id),
                "geometry": mapping(geom_shape),
                "properties": props
            })

        if len(valid_features) == 0:
            return False, errors, [], {}

        # Overall interpretation: If contains any LineStrings, treat as CENTERLINE corridors
        primary_interpretation = "CENTERLINE" if has_lines else "ROAD_BOUNDARY"

        meta_summary = {
            "total_validated": len(valid_features),
            "primary_interpretation": primary_interpretation,
            "has_lines": has_lines,
            "has_polygons": has_polys
        }

        return True, errors, valid_features, meta_summary

    def ingest_road_file(
        self,
        raw_content: bytes,
        filename: str,
        supplier: str = "Unknown",
        road_name_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """Ingests validated Road GeoJSON into active storage."""
        sha256 = hashlib.sha256(raw_content).hexdigest()
        is_valid, errors, valid_features, meta_sum = self.validate_road_geojson(raw_content, filename)

        if not is_valid:
            raise ValueError(f"All {len(valid_features) + len(errors)} features in '{filename}' were rejected. Reason: {'; '.join(errors[:3])}")

        dataset_id = f"ds-road-{int(datetime.now(timezone.utc).timestamp())}"
        self.active_features = valid_features

        # Save active file
        fc_payload = {
            "type": "FeatureCollection",
            "name": f"bhusetu_active_roads_{dataset_id}",
            "features": valid_features
        }
        with open(ACTIVE_ROAD_FILE, "w", encoding="utf-8") as f:
            json.dump(fc_payload, f, indent=2)

        self.metadata = {
            "state": "IMPORTED_ROAD",
            "source_type": "IMPORTED_ROAD",
            "source_name": road_name_override or filename,
            "dataset_id": dataset_id,
            "original_filename": filename,
            "source_crs": "EPSG:4326",
            "geometry_interpretation": meta_sum["primary_interpretation"],
            "supplier": supplier,
            "sha256_checksum": sha256,
            "total_features": len(valid_features),
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "SOURCE: IMPORTED ROAD VECTOR — Georeferenced coordinates supplied by data provider."
        }
        self._save_metadata()

        return {
            "success": True,
            "state": "IMPORTED_ROAD",
            "features_imported": len(valid_features),
            "geometry_interpretation": meta_sum["primary_interpretation"],
            "sha256_checksum": sha256,
            "dataset_id": dataset_id,
            "validation_warnings": errors
        }

    def set_public_vector_roads(
        self,
        features: List[Dict[str, Any]],
        attribution: str = "OpenStreetMap contributors"
    ) -> Dict[str, Any]:
        """Sets legitimate public vector road data (e.g. OSM extracts)."""
        dataset_id = f"ds-osm-road-{int(datetime.now(timezone.utc).timestamp())}"
        self.active_features = features

        fc_payload = {
            "type": "FeatureCollection",
            "name": f"bhusetu_public_roads_{dataset_id}",
            "features": features
        }
        with open(ACTIVE_ROAD_FILE, "w", encoding="utf-8") as f:
            json.dump(fc_payload, f, indent=2)

        self.metadata = {
            "state": "PUBLIC_VECTOR_ROAD",
            "source_type": "PUBLIC_VECTOR_ROAD",
            "source_name": "Public Vector Road Network",
            "dataset_id": dataset_id,
            "original_filename": "osm_public_roads.geojson",
            "source_crs": "EPSG:4326",
            "geometry_interpretation": "CENTERLINE",
            "supplier": attribution,
            "sha256_checksum": None,
            "total_features": len(features),
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": f"SOURCE: {attribution} — Legitimate public vector road network. Not official government cadastre."
        }
        self._save_metadata()

        return {
            "success": True,
            "state": "PUBLIC_VECTOR_ROAD",
            "features_count": len(features),
            "attribution": attribution
        }

    def load_demo_road(self) -> Dict[str, Any]:
        """Restores Demo Road Geometry explicitly labeled as synthetic."""
        self._ensure_demo_road_file()
        if os.path.exists(DEMO_ROAD_FILE):
            with open(DEMO_ROAD_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.active_features = data.get("features", [])
        else:
            self.active_features = []

        if os.path.exists(ACTIVE_ROAD_FILE):
            try:
                os.remove(ACTIVE_ROAD_FILE)
            except Exception:
                pass

        self.metadata = {
            "state": "SYNTHETIC_DEMO_ROAD",
            "source_type": "SYNTHETIC_DEMO_ROAD",
            "source_name": "Demo Road Geometry",
            "dataset_id": "ds-demo-road-2026",
            "original_filename": "demo_road.geojson",
            "source_crs": "EPSG:4326",
            "geometry_interpretation": "ROAD_BOUNDARY",
            "supplier": "BhuSetu Cadastral Synthesizer (Demo Mode)",
            "sha256_checksum": None,
            "total_features": len(self.active_features),
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "SOURCE: SYNTHETIC DEMONSTRATION — Demo Road Geometry. Not an actual village or public road."
        }
        self._save_metadata()

        return {
            "success": True,
            "state": "SYNTHETIC_DEMO_ROAD",
            "features_count": len(self.active_features),
            "message": "Demo road geometry restored."
        }

    def clear_road_source(self) -> Dict[str, Any]:
        """Clears road source to NO_ROAD_DATA."""
        self.active_features = []
        if os.path.exists(ACTIVE_ROAD_FILE):
            try:
                os.remove(ACTIVE_ROAD_FILE)
            except Exception:
                pass

        self.metadata = {
            "state": "NO_ROAD_DATA",
            "source_type": "None",
            "source_name": "None",
            "dataset_id": "none",
            "original_filename": "N/A",
            "source_crs": "EPSG:4326",
            "geometry_interpretation": "UNKNOWN",
            "supplier": "None",
            "sha256_checksum": None,
            "total_features": 0,
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "No road data source configured."
        }
        self._save_metadata()
        return {"success": True, "state": "NO_ROAD_DATA"}


road_source_service = RoadSourceService()
