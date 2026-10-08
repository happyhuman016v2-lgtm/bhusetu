"""
Automated Test Suite for BhuSetu SVAMITVA Survey Repair & Validation
HACKITON'26 Review 3 Requirements:
1. Metric area math on 20m x 20m square (400 m2)
2. Two 20m x 20m squares shifted 3m east: area diff 0%, intersection 340 m2, symmetric diff 120 m2
3. Strict discrepancy math (|survey - reg| / reg * 100):
   - 390m2 reg vs 412m2 survey -> 5.641% (>5% triggers dispute)
   - 400m2 reg vs 420m2 survey -> 5.0% (strictly <=5% acceptable)
   - None / 0 reg area -> verification state without ZeroDivisionError
4. Strict GeoJSON validation: hole retention, unclosed ring rejection, non-finite coord rejection,
   invalid geometry reporting without silent repair
5. Source states: NO_SOURCE, UPLOADED_FILE, SYNTHETIC_DEMO, CONFIGURED_WFS with SHA-256 provenance
6. WFS connector: UNAVAILABLE with configuration guide for unconfigured, host whitelist enforcement
7. RBAC: Citizen cannot dispatch officer actions / orders
"""

import os
import sys
import json
from shapely.geometry import Polygon, MultiPolygon, shape
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
from services.gis_engine import (
    calculate_area_discrepancy,
    calculate_metric_area_sqm,
    get_utm_epsg,
    generate_parcel_buffer
)
from services.survey_source_service import survey_source_service
from services.wfs_connector import wfs_connector_service
from routes.auth_routes import create_access_token

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test 1: 20m x 20m Metric Square Reference Math
# ---------------------------------------------------------------------------
def test_metric_reference_square_area():
    """Verify 20m x 20m square calculates exactly 400.0 m2 in planar metric coordinates."""
    poly_20m = Polygon([
        (0.0, 0.0),
        (20.0, 0.0),
        (20.0, 20.0),
        (0.0, 20.0),
        (0.0, 0.0)
    ])
    assert poly_20m.is_valid
    assert round(poly_20m.area, 2) == 400.0


# ---------------------------------------------------------------------------
# Test 2: Two 20m x 20m Squares Shifted 3m East (Benchmark Fixture)
# ---------------------------------------------------------------------------
def test_two_squares_symmetric_difference():
    """
    Two 20m x 20m squares, one shifted 3m east:
    - Square A: [0, 0] to [20, 20], area = 400 m2
    - Square B: [3, 0] to [23, 20], area = 400 m2
    - Intersection: [3, 0] to [20, 20] -> width 17m, height 20m = 340 m2
    - Union: [0, 0] to [23, 20] -> width 23m, height 20m = 460 m2
    - Symmetric difference: (400 - 340) + (400 - 340) = 120 m2
    - Area change: 0 m2 (0.0%)
    """
    sq_a = Polygon([(0.0, 0.0), (20.0, 0.0), (20.0, 20.0), (0.0, 20.0), (0.0, 0.0)])
    sq_b = Polygon([(3.0, 0.0), (23.0, 0.0), (23.0, 20.0), (3.0, 20.0), (3.0, 0.0)])

    assert round(sq_a.area, 2) == 400.0
    assert round(sq_b.area, 2) == 400.0

    area_change = abs(sq_b.area - sq_a.area)
    assert round(area_change, 2) == 0.0

    intersection = sq_a.intersection(sq_b)
    assert round(intersection.area, 2) == 340.0

    union = sq_a.union(sq_b)
    assert round(union.area, 2) == 460.0

    symmetric_diff = sq_a.symmetric_difference(sq_b)
    assert round(symmetric_diff.area, 2) == 120.0

    # Also test through proposals endpoint
    res = client.get("/api/proposals/demo-fixture")
    assert res.status_code == 200
    data = res.json()
    assert data["symmetric_difference"]["area_sqm"] == 120.0
    assert data["original_square"]["area_sqm"] == 400.0
    assert data["proposed_shifted_square"]["area_sqm"] == 400.0


# ---------------------------------------------------------------------------
# Test 3: Strict Discrepancy Formula & >5.0% Policy
# ---------------------------------------------------------------------------
def test_strict_area_discrepancy_formula():
    """
    Discrepancy Formula: |survey_area - registered_area| / registered_area * 100
    - 390m2 reg vs 412m2 survey:
      |412 - 390| / 390 * 100 = 22 / 390 * 100 = 5.6410256% (>5% -> DISCREPANCY_EXCEEDS_TOLERANCE)
    - 400m2 reg vs 420m2 survey:
      |420 - 400| / 400 * 100 = 20 / 400 * 100 = 5.0% (<=5% -> TOLERANCE_ACCEPTABLE)
    - Missing registered area:
      survey 412, reg None -> REGISTERED_AREA_UNAVAILABLE, discrepancy None, no crash
    """
    # Case 1: 390 vs 412 -> 5.641%
    res1 = calculate_area_discrepancy(survey_area_sqm=412.0, registered_area_sqm=390.0)
    assert res1["status"] == "DISCREPANCY_EXCEEDS_TOLERANCE"
    assert res1["exceeds_threshold"] is True
    assert res1["requires_review"] is True
    assert abs(res1["absolute_discrepancy_pct"] - 5.6410256) < 0.001
    assert res1["signed_area_change_sqm"] == 22.0

    # Case 2: 400 vs 420 -> exactly 5.0%
    res2 = calculate_area_discrepancy(survey_area_sqm=420.0, registered_area_sqm=400.0)
    assert res2["status"] == "TOLERANCE_ACCEPTABLE"
    assert res2["exceeds_threshold"] is False
    assert res2["requires_review"] is False
    assert round(res2["absolute_discrepancy_pct"], 2) == 5.00
    assert res2["signed_area_change_sqm"] == 20.0

    # Case 3: Missing registered area
    res3 = calculate_area_discrepancy(survey_area_sqm=412.0, registered_area_sqm=None)
    assert res3["status"] == "REGISTERED_AREA_UNAVAILABLE"
    assert res3["absolute_discrepancy_pct"] is None
    assert res3["exceeds_threshold"] is False

    # Case 4: Zero registered area
    res4 = calculate_area_discrepancy(survey_area_sqm=412.0, registered_area_sqm=0.0)
    assert res4["status"] == "REGISTERED_AREA_UNAVAILABLE"
    assert res4["absolute_discrepancy_pct"] is None


# ---------------------------------------------------------------------------
# Test 4: Strict GeoJSON Ingestion & Validation
# ---------------------------------------------------------------------------
def test_geojson_hole_retention():
    """Verify polygons with interior rings (holes) retain their hole without collapsing."""
    exterior = [(80.940, 26.980), (80.945, 26.980), (80.945, 26.985), (80.940, 26.985), (80.940, 26.980)]
    interior_hole = [(80.941, 26.981), (80.943, 26.981), (80.943, 26.983), (80.941, 26.983), (80.941, 26.981)]

    fc_with_hole = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "parcel-hole-01",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [exterior, interior_hole]
                },
                "properties": {
                    "survey_plot_no": "999",
                    "owner_name": "Test Courtyard Parcel",
                    "land_type": "Residential"
                }
            }
        ]
    }

    res = survey_source_service.validate_and_ingest_geojson(
        raw_content=json.dumps(fc_with_hole).encode("utf-8"),
        filename="test_hole.geojson"
    )
    assert res["imported_count"] == 1
    assert res["rejected_count"] == 0

    active = survey_source_service.get_active_parcels()
    geom = shape(active[0]["geometry"])
    assert len(geom.interiors) == 1
    assert geom.is_valid


def test_geojson_rejects_unclosed_rings():
    """Verify coordinate rings where first != last point are rejected with explicit error."""
    unclosed_ring = [(80.940, 26.980), (80.945, 26.980), (80.945, 26.985), (80.940, 26.985)]  # missing closing point
    fc_unclosed = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "parcel-unclosed-01",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [unclosed_ring]
                },
                "properties": {"survey_plot_no": "998"}
            }
        ]
    }
    # Direct service call raises informative ValueError when all features rejected
    try:
        survey_source_service.validate_and_ingest_geojson(
            raw_content=json.dumps(fc_unclosed).encode("utf-8"),
            filename="test_unclosed.geojson"
        )
        assert False, "Expected ValueError on unclosed ring"
    except ValueError as e:
        assert "unclosed" in str(e).lower()

    # HTTP endpoint returns 400 Bad Request with actionable explanation
    http_res = client.post(
        "/api/survey/upload",
        files={"file": ("unclosed.geojson", json.dumps(fc_unclosed), "application/json")}
    )
    assert http_res.status_code == 400
    assert "unclosed" in http_res.json()["detail"].lower()


def test_geojson_rejects_non_finite_coordinates():
    """Verify non-finite coordinates are rejected with explicit error."""
    bad_geojson_str = '{"type":"FeatureCollection","features":[{"type":"Feature","id":"p-nan","geometry":{"type":"Polygon","coordinates":[[[80.94,26.98],[null,26.98],[80.945,26.985],[80.94,26.98]]]},"properties":{}}]}'
    try:
        survey_source_service.validate_and_ingest_geojson(
            raw_content=bad_geojson_str.encode("utf-8"),
            filename="test_nan.geojson"
        )
        assert False, "Expected ValueError on null/non-finite coord"
    except ValueError as e:
        assert "finite" in str(e).lower() or "rejected" in str(e).lower()


def test_geojson_reports_invalid_geometry_without_silent_repair():
    """
    Verify self-intersecting 'bowtie' polygon is reported as invalid with reason,
    rather than silently repaired behind the user's back.
    Tests mixed dataset: 1 valid parcel + 1 invalid bowtie parcel.
    """
    valid_coords = [(80.940, 26.980), (80.945, 26.980), (80.945, 26.985), (80.940, 26.985), (80.940, 26.980)]
    bowtie_coords = [
        (80.940, 26.980),
        (80.945, 26.985),
        (80.940, 26.985),
        (80.945, 26.980),
        (80.940, 26.980)  # Self-intersection in center
    ]
    fc_mixed = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "parcel-valid-01",
                "geometry": {"type": "Polygon", "coordinates": [valid_coords]},
                "properties": {"survey_plot_no": "995", "land_type": "Residential"}
            },
            {
                "type": "Feature",
                "id": "parcel-bowtie-01",
                "geometry": {"type": "Polygon", "coordinates": [bowtie_coords]},
                "properties": {"survey_plot_no": "996", "land_type": "Residential"}
            }
        ]
    }
    res = survey_source_service.validate_and_ingest_geojson(
        raw_content=json.dumps(fc_mixed).encode("utf-8"),
        filename="test_mixed.geojson"
    )
    assert res["status"] == "PARTIALLY_IMPORTED_WITH_ERRORS"
    assert res["imported_count"] == 1
    assert res["rejected_count"] == 1
    err = res["rejected_features"][0]["reason"].lower()
    assert "invalid" in err or "self-intersection" in err


# ---------------------------------------------------------------------------
# Test 5: Survey Source States & Provenance Tracking
# ---------------------------------------------------------------------------
def test_survey_source_state_transitions():
    """Verify source lifecycle: NO_SOURCE -> UPLOADED_FILE -> SYNTHETIC_DEMO."""
    # 1. Clear source -> NO_SOURCE
    meta_clear = survey_source_service.clear_survey_dataset()
    assert meta_clear["state"] == "NO_SOURCE"
    assert meta_clear["total_parcels"] == 0

    state_res = client.get("/api/survey/source-state")
    assert state_res.status_code == 200
    assert state_res.json()["state"] == "NO_SOURCE"

    # 2. Upload valid survey
    poly_coords = [(80.940, 26.980), (80.945, 26.980), (80.945, 26.985), (80.940, 26.985), (80.940, 26.980)]
    fc_upload = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "upload-p-01",
                "geometry": {"type": "Polygon", "coordinates": [poly_coords]},
                "properties": {
                    "survey_plot_no": "101",
                    "owner_name": "Ramesh Kumar",
                    "land_type": "Residential",
                    "area_sq_mtr": 412.0
                }
            }
        ]
    }
    geojson_str = json.dumps(fc_upload)
    upload_res = client.post(
        "/api/survey/upload",
        files={"file": ("survey_field.geojson", geojson_str, "application/json")},
        data={"supplier": "Drone Agency Pvt Ltd", "survey_date": "2026-03-15"}
    )
    assert upload_res.status_code == 200
    up_data = upload_res.json()
    assert up_data["status"] == "SUCCESSFULLY_IMPORTED"
    assert up_data["imported_count"] == 1
    assert len(up_data["sha256_checksum"]) == 64

    # 3. Transition to SYNTHETIC_DEMO
    demo_res = client.post("/api/survey/load-demo")
    assert demo_res.status_code == 200
    demo_data = demo_res.json()
    assert demo_data["state"] == "SYNTHETIC_DEMO"
    assert demo_data["total_parcels"] > 0


# ---------------------------------------------------------------------------
# Test 6: WFS Connector Diagnostic & Host Whitelist
# ---------------------------------------------------------------------------
def test_wfs_connector_diagnostic_and_whitelist():
    """
    Verify WFS connector:
    - Returns UNAVAILABLE with configuration guide for unconfigured servers
    - Enforces host whitelist against untrusted URLs
    """
    connector = wfs_connector_service

    # 1. Reject untrusted host
    bad_res = connector.test_wfs_connection(wfs_url="https://untrusted-third-party.io/wfs", layer_name="test:layer")
    assert bad_res["connected"] is False
    assert "whitelist" in bad_res["message"].lower()

    # 2. Test unconfigured endpoint -> returns UNAVAILABLE with required keys guide
    unconfig_res = connector.test_wfs_connection(wfs_url="", layer_name="")
    assert unconfig_res["connected"] is False
    assert unconfig_res["status"] == "UNAVAILABLE"
    assert "configuration_guide" in unconfig_res
    req_keys = unconfig_res["configuration_guide"]["required_keys"]
    assert any("WFS_SERVER_URL" in k for k in req_keys)
    assert any("WFS_LAYER_NAME" in k for k in req_keys)

    # 3. Test unreachable gov endpoint -> returns UNREACHABLE/TIMEOUT without fake data
    gov_res = connector.test_wfs_connection(wfs_url="https://svamitva.nic.in/geoserver/wfs", layer_name="svamitva:cadastral", timeout_seconds=2)
    assert gov_res["connected"] is False
    assert gov_res["status"] in ("UNREACHABLE", "TIMEOUT", "CONNECTION_FAILED")


# ---------------------------------------------------------------------------
# Test 7: Role-Based Access Control (RBAC) Enforcement
# ---------------------------------------------------------------------------
def test_rbac_citizen_vs_officer_permissions():
    """
    Verify RBAC security:
    - CITIZEN role cannot execute officer-only routes (e.g. resurvey orders)
    - REVENUE_OFFICER role can execute officer routes
    """
    citizen_token = create_access_token(data={"sub": "citizen@bhusetu.gov.in", "role": "CITIZEN"})
    officer_token = create_access_token(data={"sub": "patwari@bhusetu.gov.in", "role": "REVENUE_OFFICER"})

    # Order drone resurvey endpoint (Officer only)
    order_payload = {
        "parcel_id": "svamitva-01",
        "ulpin": "UP1428SNMPGN101",
        "discrepancy_reason": "Ground dispute detected; redemarcation ordered under Sec 24.",
        "target_accuracy": "< 3cm GSD UAV Photogrammetry"
    }

    # 1. Citizen attempt -> 403 Forbidden
    citizen_res = client.post(
        "/api/officer/orders/drone-resurvey",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json=order_payload
    )
    assert citizen_res.status_code == 403
    assert "officer" in citizen_res.json()["detail"].lower()

    # 2. Officer attempt -> 201 Created
    officer_res = client.post(
        "/api/officer/orders/drone-resurvey",
        headers={"Authorization": f"Bearer {officer_token}"},
        json=order_payload
    )
    assert officer_res.status_code == 201
    assert officer_res.json()["status"] == "ORDER_COMMITTED_TO_LEDGER"


if __name__ == "__main__":
    print("Executing BhuSetu SVAMITVA Survey Repair & Validation Test Suite...")
    tests = [
        ("Test 1: Metric Reference Square Area", test_metric_reference_square_area),
        ("Test 2: Two Squares Symmetric Difference", test_two_squares_symmetric_difference),
        ("Test 3: Strict Discrepancy Formula & >5.0% Policy", test_strict_area_discrepancy_formula),
        ("Test 4a: GeoJSON Hole Retention", test_geojson_hole_retention),
        ("Test 4b: GeoJSON Reject Unclosed Rings", test_geojson_rejects_unclosed_rings),
        ("Test 4c: GeoJSON Reject Non-Finite Coordinates", test_geojson_rejects_non_finite_coordinates),
        ("Test 4d: GeoJSON Report Invalid Geometry (No Silent Repair)", test_geojson_reports_invalid_geometry_without_silent_repair),
        ("Test 5: Source State Transitions & SHA-256 Provenance", test_survey_source_state_transitions),
        ("Test 6: WFS Connector Diagnostic & Host Whitelist", test_wfs_connector_diagnostic_and_whitelist),
        ("Test 7: RBAC Citizen vs Officer Permissions", test_rbac_citizen_vs_officer_permissions),
    ]

    passed = 0
    for name, test_fn in tests:
        try:
            test_fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name} -> {e}")
            raise e

    print(f"\nSUCCESS: All {passed}/{len(tests)} survey repair and validation tests passed!")

