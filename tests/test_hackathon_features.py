"""
Automated Test Suite for BhuSetu Hackathon Features
1. Interactive Boundary Proposals & 20m x 20m Benchmark Fixture
2. Duplicate & Conflicting Document Checks (ImageHash, RapidFuzz, SHA-256)
3. Cryptographically Signed QR Evidence Reports & Tamper Attack Sandbox
4. Offline Evidence Capture & Idempotent Deduplication (Dexie.js / IndexedDB)
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_proposals_benchmark_fixture():
    res = client.get("/api/proposals/demo-fixture")
    assert res.status_code == 200
    data = res.json()
    assert data["verification_status"] == "GENUINELY_COMPUTED_MATCH"
    assert data["square_side_meters"] == 20.0
    assert data["shift_meters_east"] == 3.0
    assert data["original_square"]["area_sqm"] == 400.0
    assert data["proposed_shifted_square"]["area_sqm"] == 400.0
    assert data["symmetric_difference"]["area_sqm"] == 120.0


def test_document_similarity_scenarios():
    res = client.get("/api/documents/demo-scenarios")
    assert res.status_code == 200
    data = res.json()
    scenarios = data.get("scenarios", [])
    assert len(scenarios) == 4

    outcomes = [s["expected_outcome"] for s in scenarios]
    assert "EXACT_BYTE_DUPLICATE_DETECTED" in outcomes
    assert "POTENTIAL_VISUAL_OR_TEXT_CANDIDATE" in outcomes
    assert "CONFLICTING_REGISTRY_FIELDS_DETECTED" in outcomes
    assert "SIMILAR_TEMPLATE_DIFFERENT_PARCEL" in outcomes


def test_evidence_signing_and_tamper_detection():
    # 1. Sign canonical report
    sign_payload = {
        "parcel_id": "plot-001",
        "ulpin": "UP1428SNMPGN101",
        "geometry_revision": "rev-1.0",
        "drone_area_sqm": 412.0,
        "legal_area_sqm": 375.0,
        "variance_pct": 9.87,
        "issuer_badge": "REV-OFF-UP-042",
        "issuer_name": "Thiru M. Shanmugavel, M.A."
    }
    sign_res = client.post("/api/evidence/sign-report", json=sign_payload)
    assert sign_res.status_code == 201
    report = sign_res.json()["report"]
    assert "signature_b64" in report
    assert "qr_code_data_uri" in report

    # 2. Verify authentic snapshot
    verify_res = client.post("/api/evidence/verify", json={
        "snapshot_payload": report["snapshot"],
        "signature_b64": report["signature_b64"]
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["status_code"] == "VERIFIED_AUTHENTIC"
    assert verify_res.json()["is_authentic"] is True

    # 3. Simulate Area Tampering Attack (412.0 sqm -> 450.0 sqm)
    tampered_snapshot = dict(report["snapshot"])
    tampered_snapshot["drone_area_sqm"] = 450.0

    tamper_res = client.post("/api/evidence/verify", json={
        "snapshot_payload": tampered_snapshot,
        "signature_b64": report["signature_b64"]
    })
    assert tamper_res.status_code == 200
    tamper_data = tamper_res.json()
    assert tamper_data["status_code"] == "SIGNATURE_INVALID_TAMPERING_DETECTED"
    assert tamper_data["is_authentic"] is False
    assert len(tamper_data["tampered_fields"]) > 0
    assert tamper_data["tampered_fields"][0]["field"] == "drone_area_sqm"


def test_offline_draft_sync_and_idempotent_deduplication():
    client_uuid = "pytest-dedup-client-uuid-777"
    sync_payload = {
        "uuid": client_uuid,
        "user_email": "patwari@bhusetu.gov.in",
        "parcel_id": "plot-002",
        "ulpin": "UP1428SNMPGN102",
        "notes": "Field mark stone relocated by 1.2m.",
        "gps_coords": [80.9455, 26.9859]
    }

    # First sync: newly ingested
    res1 = client.post("/api/evidence/sync-draft", json=sync_payload)
    assert res1.status_code == 200
    assert res1.json()["was_deduplicated"] is False

    # Second sync: idempotent deduplication safely triggered
    res2 = client.post("/api/evidence/sync-draft", json=sync_payload)
    assert res2.status_code == 200
    assert res2.json()["was_deduplicated"] is True

    # Check listing
    list_res = client.get("/api/evidence/synced-drafts?user_email=patwari@bhusetu.gov.in")
    assert list_res.status_code == 200
    matches = [d for d in list_res.json().get("drafts", []) if d["uuid"] == client_uuid]
    assert len(matches) == 1


if __name__ == "__main__":
    test_proposals_benchmark_fixture()
    test_document_similarity_scenarios()
    test_evidence_signing_and_tamper_detection()
    test_offline_draft_sync_and_idempotent_deduplication()
    print("ALL TESTS PASSED SUCCESSFULLY!")
