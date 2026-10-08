"""
BhuSetu Cryptographically Signed QR Evidence Report Service
Implements:
1. Server-side RSA-2048 keypair generation and persistence
2. Canonical evidence snapshot serialization and SHA-256 digital signature (RSASSA-PKCS1-v1_5)
3. QR Code generation with verification URL and tamper-evident payload
4. Strict cryptographic verification:
   - Validates digital signature against public key
   - Detects altered parameters (e.g. changed area value) -> SIGNATURE_INVALID_TAMPERING_DETECTED
   - Distinguishes older report revisions from current revisions
5. Clear statutory labeling: BhuSetu Prototype Evidence Report (Not a government-issued title)
"""

import io
import os
import json
import base64
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
import qrcode
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

logger = logging.getLogger("BhuSetu_EvidenceSigning")

KEYS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "keys"
)
PRIVATE_KEY_PATH = os.path.join(KEYS_DIR, "evidence_signing_private_key.pem")
PUBLIC_KEY_PATH = os.path.join(KEYS_DIR, "evidence_signing_public_key.pem")
REPORTS_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "signed_evidence_reports.json"
)

PROTOTYPE_DISCLAIMER = (
    "BHUSETU PROTOTYPE EVIDENCE REPORT - FOR ADMINISTRATIVE RECONCILIATION & "
    "AUDIT ONLY. NOT A STATUTORY GOVERNMENT-ISSUED TITLE CERTIFICATE."
)


class EvidenceSigningService:
    def __init__(self):
        self._load_or_generate_keys()
        self.reports_db: Dict[str, Dict[str, Any]] = {}
        self._load_reports()

    def _load_or_generate_keys(self):
        os.makedirs(KEYS_DIR, exist_ok=True)
        if os.path.exists(PRIVATE_KEY_PATH) and os.path.exists(PUBLIC_KEY_PATH):
            try:
                with open(PRIVATE_KEY_PATH, "rb") as f:
                    self.private_key = serialization.load_pem_private_key(
                        f.read(), password=None
                    )
                with open(PUBLIC_KEY_PATH, "rb") as f:
                    self.public_key = serialization.load_pem_public_key(f.read())
                logger.info("Loaded persisted RSA-2048 evidence signing keys.")
                return
            except Exception as e:
                logger.error(f"Error loading signing keys: {e}. Generating new keys.")

        # Generate fresh RSA-2048 keypair
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()

        # Persist PEM files
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(
                self.private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                )
            )

        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(
                self.public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                )
            )
        logger.info("Minted and saved new RSA-2048 signing keypair.")

    def _load_reports(self):
        if os.path.exists(REPORTS_DB_PATH):
            try:
                with open(REPORTS_DB_PATH, "r", encoding="utf-8") as f:
                    self.reports_db = json.load(f)
                    return
            except Exception as e:
                logger.error(f"Error loading reports db: {e}")
        self.reports_db = {}

    def _persist_reports(self):
        tmp = REPORTS_DB_PATH + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(self.reports_db, f, indent=2)
        os.replace(tmp, REPORTS_DB_PATH)

    def canonical_snapshot_string(self, snapshot: Dict[str, Any]) -> bytes:
        """Deterministically format canonical JSON for signing."""
        return json.dumps(snapshot, sort_keys=True, separators=(",", ":")).encode("utf-8")

    def create_signed_evidence_report(
        self,
        parcel_id: str,
        ulpin: str,
        geometry_revision: str,
        drone_area_sqm: float,
        legal_area_sqm: float,
        variance_pct: float,
        analysis_digest: str,
        issuer_badge: str = "REV-OFF-UP-042",
        issuer_name: str = "Thiru M. Shanmugavel, M.A.",
    ) -> Dict[str, Any]:
        """
        Freeze and sign evidence snapshot.
        """
        report_id = f"EV-REP-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{parcel_id[-4:].upper()}"
        issued_at = datetime.now(timezone.utc).isoformat()

        snapshot_payload = {
            "report_id": report_id,
            "parcel_id": parcel_id,
            "ulpin": ulpin,
            "geometry_revision": geometry_revision,
            "drone_area_sqm": float(drone_area_sqm),
            "legal_area_sqm": float(legal_area_sqm),
            "variance_pct": float(variance_pct),
            "analysis_digest": analysis_digest,
            "issuer_badge": issuer_badge,
            "issuer_name": issuer_name,
            "issued_at": issued_at,
            "prototype_disclaimer": PROTOTYPE_DISCLAIMER
        }

        canonical_bytes = self.canonical_snapshot_string(snapshot_payload)

        # RSA-SHA256 signature
        raw_signature = self.private_key.sign(
            canonical_bytes,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        sig_b64 = base64.b64encode(raw_signature).decode("ascii")

        # Generate QR Code image
        qr_content = json.dumps({
            "report_id": report_id,
            "ulpin": ulpin,
            "area_sqm": drone_area_sqm,
            "sig": sig_b64[:32] + "...",
            "verification_url": f"/api/evidence/verify?report_id={report_id}"
        })

        qr_img = qrcode.make(qr_content)
        buffered = io.BytesIO()
        qr_img.save(buffered, format="PNG")
        qr_base64_data_uri = "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode("ascii")

        record = {
            "report_id": report_id,
            "snapshot": snapshot_payload,
            "signature_b64": sig_b64,
            "algorithm": "RSASSA-PKCS1-v1_5-SHA256",
            "qr_code_data_uri": qr_base64_data_uri,
            "public_key_fingerprint": "RSA-2048-BHUSETU-AUTHORITY-ROOT",
            "verification_status": "AUTHENTIC_SIGNED",
            "prototype_disclaimer": PROTOTYPE_DISCLAIMER
        }

        self.reports_db[report_id] = record
        self._persist_reports()
        return record

    def verify_report(
        self,
        snapshot_payload: Dict[str, Any],
        signature_b64: str,
        current_active_revision: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verify evidence report:
        1. Validates signature with public key.
        2. Detects altered values (e.g. area tampered).
        3. Compares against server stored original snapshot.
        4. Detects whether report is an older revision.
        """
        try:
            raw_sig = base64.b64decode(signature_b64)
            canonical_bytes = self.canonical_snapshot_string(snapshot_payload)

            # Public key verification
            self.public_key.verify(
                raw_sig,
                canonical_bytes,
                padding.PKCS1v15(),
                hashes.SHA256()
            )
            cryptographic_valid = True
        except Exception as e:
            logger.warning(f"Signature verification failure: {e}")
            cryptographic_valid = False

        report_id = snapshot_payload.get("report_id")
        stored_record = self.reports_db.get(report_id)

        # Field-by-field tamper check against original stored copy
        tampered_fields = []
        if stored_record:
            stored_snapshot = stored_record["snapshot"]
            for key, val in snapshot_payload.items():
                if key in stored_snapshot and stored_snapshot[key] != val:
                    tampered_fields.append({
                        "field": key,
                        "stored_original_value": stored_snapshot[key],
                        "submitted_value": val,
                        "description": f"Mismatch in signed parameter '{key}'. Document text may have been altered."
                    })

        # Revision check
        doc_rev = snapshot_payload.get("geometry_revision", "v1.0")
        is_superseded_revision = False
        if current_active_revision and doc_rev != current_active_revision:
            is_superseded_revision = True

        if not cryptographic_valid or len(tampered_fields) > 0:
            status_code = "SIGNATURE_INVALID_TAMPERING_DETECTED"
            message = "Cryptographic signature failed or parameters were altered! Report has been tampered with."
            is_authentic = False
        elif is_superseded_revision:
            status_code = "SUPERSEDED_HISTORICAL_REVISION"
            message = f"Report signature is authentic, but geometry revision {doc_rev} is superseded by current revision {current_active_revision}."
            is_authentic = True
        else:
            status_code = "VERIFIED_AUTHENTIC"
            message = "Evidence report signature is cryptographically valid and untampered."
            is_authentic = True

        return {
            "is_authentic": is_authentic,
            "status_code": status_code,
            "message": message,
            "report_id": report_id,
            "verified_snapshot": snapshot_payload,
            "stored_original_snapshot": stored_record["snapshot"] if stored_record else None,
            "tampered_fields": tampered_fields,
            "is_superseded_revision": is_superseded_revision,
            "algorithm": "RSASSA-PKCS1-v1_5-SHA256",
            "prototype_disclaimer": PROTOTYPE_DISCLAIMER
        }


evidence_signing_service = EvidenceSigningService()
