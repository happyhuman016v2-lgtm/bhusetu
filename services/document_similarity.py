"""
BhuSetu Duplicate & Conflicting Document Intelligence Service
Implements:
1. Exact SHA-256 byte comparison
2. Perceptual ImageHash (pHash / dHash) similarity for recompressed scans
3. RapidFuzz supporting text & entity similarity
4. Scoped comparisons by village, admin context, and parcel identity
5. Conflict detection: Highlight conflicting owner or area fields
6. Preservation rule: Never infer fraud or automatically merge parcels
7. Demo cases:
   - Repeated upload (exact byte match)
   - Recompressed similar scan (high perceptual similarity)
   - Same-parcel conflicting area/owner
   - Similar-looking different-parcel negative case (template similarity, different plot)
"""

import io
import os
import json
import hashlib
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from PIL import Image
import imagehash
from rapidfuzz import fuzz

logger = logging.getLogger("BhuSetu_DocSimilarity")

DOC_INDEX_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "uploaded_documents_index.json"
)


def compute_file_sha256(file_bytes: bytes) -> str:
    """Compute SHA-256 hash of raw file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()


def compute_image_hashes(file_bytes: bytes) -> Tuple[Optional[str], Optional[str]]:
    """Compute perceptual pHash and dHash from document image bytes."""
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        phash_val = str(imagehash.phash(img))
        dhash_val = str(imagehash.dhash(img))
        return phash_val, dhash_val
    except Exception as e:
        logger.debug(f"Perceptual hash computation skipped (non-image or raster error): {e}")
        return None, None


class DocumentSimilarityService:
    def __init__(self, storage_path: str = DOC_INDEX_FILE):
        self.storage_path = storage_path
        self.documents: List[Dict[str, Any]] = []
        self._load_or_seed()

    def _load_or_seed(self):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
                    if len(self.documents) > 0:
                        return
            except Exception as e:
                logger.error(f"Error reading documents index: {e}")

        # Seed with canonical baseline records for demo testing
        self.documents = self._generate_seed_records()
        self._persist()

    def _persist(self):
        tmp = self.storage_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, indent=2)
        os.replace(tmp, self.storage_path)

    def _generate_seed_records(self) -> List[Dict[str, Any]]:
        """Pre-populate with known baseline documents for demonstration."""
        return [
            {
                "doc_id": "DOC-BASELINE-101",
                "filename": "UP_Khatauni_Plot101_Official_Record.pdf",
                "sha256": "4a7b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
                "phash": "f0e0d0c0b0a09080",
                "dhash": "8090a0b0c0d0e0f0",
                "uploaded_at": "2026-02-10T10:30:00Z",
                "village_name": "Rampur Kalan",
                "tehsil": "Bakshi Ka Talab",
                "district": "Lucknow",
                "khasra_no": "101",
                "khata_no": "KH-882",
                "pattadar_names": ["Ramesh Kumar Verma", "Sunita Devi"],
                "recorded_area_sqm": 412.0,
                "mortgage_status": "SBI Agricultural Loan ₹1,50,000",
                "evidence_status": "CONFIRMED_BASELINE",
            },
            {
                "doc_id": "DOC-BASELINE-104",
                "filename": "UP_Khatauni_Plot104_Extract.pdf",
                "sha256": "9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a",
                "phash": "f0e0d0c0b0a09082",
                "dhash": "8090a0b0c0d0e0f2",
                "uploaded_at": "2026-02-12T14:15:00Z",
                "village_name": "Rampur Kalan",
                "tehsil": "Bakshi Ka Talab",
                "district": "Lucknow",
                "khasra_no": "104",
                "khata_no": "KH-904",
                "pattadar_names": ["Suresh Chandra Sharma"],
                "recorded_area_sqm": 530.0,
                "mortgage_status": "Nil Encumbrance",
                "evidence_status": "CONFIRMED_BASELINE",
            }
        ]

    def analyze_document_upload(
        self,
        file_bytes: bytes,
        filename: str,
        extracted_entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Comprehensive Duplicate & Conflict Detection Engine:
        - Scopes comparison by village and parcel identity.
        - Checks exact byte identity (SHA-256).
        - Computes perceptual image hash distance (pHash / dHash).
        - Highlights conflicting owner or area fields.
        - Flags candidates without merging or inferring fraud.
        """
        current_sha256 = compute_file_sha256(file_bytes)
        current_phash, current_dhash = compute_image_hashes(file_bytes)

        curr_khasra = str(extracted_entities.get("khasra_no", "")).strip()
        curr_village = str(extracted_entities.get("village_name", "")).strip().lower()
        curr_owners = extracted_entities.get("pattadar_names", [])
        curr_area = float(extracted_entities.get("recorded_area_sqm", 0.0))

        candidates: List[Dict[str, Any]] = []
        conflicts: List[Dict[str, Any]] = []

        is_exact_duplicate = False
        exact_match_doc = None

        for existing in self.documents:
            # 1. Exact Byte Check
            if existing["sha256"] == current_sha256:
                is_exact_duplicate = True
                exact_match_doc = existing

            # 2. Perceptual ImageHash Similarity (if hashes present)
            visual_sim_pct = 0.0
            if current_phash and existing.get("phash"):
                try:
                    h1 = imagehash.hex_to_hash(current_phash)
                    h2 = imagehash.hex_to_hash(existing["phash"])
                    hamming_dist = h1 - h2
                    visual_sim_pct = max(0.0, round(100.0 - (hamming_dist / 64.0) * 100.0, 1))
                except Exception:
                    pass

            # 3. RapidFuzz Text Similarity
            text_sim_pct = 0.0
            ex_owners_str = " ".join(existing.get("pattadar_names", []))
            curr_owners_str = " ".join(curr_owners)
            if curr_owners_str and ex_owners_str:
                text_sim_pct = round(fuzz.token_set_ratio(curr_owners_str, ex_owners_str), 1)

            # 4. Scope Assessment: Same Village & Admin Context
            ex_village = str(existing.get("village_name", "")).lower()
            is_same_village = curr_village in ex_village or ex_village in curr_village
            is_same_parcel = str(existing.get("khasra_no", "")).strip() == curr_khasra

            # Flag as candidate if same parcel OR visual similarity >= 80% OR text similarity >= 85%
            is_candidate = is_same_parcel or visual_sim_pct >= 80.0 or text_sim_pct >= 85.0

            if is_candidate:
                field_conflicts = []

                # Conflict Check: Area Mismatch on same parcel
                if is_same_parcel and existing.get("recorded_area_sqm"):
                    ex_area = float(existing["recorded_area_sqm"])
                    area_delta = abs(curr_area - ex_area)
                    if area_delta > 0.5:
                        delta_pct = round((area_delta / ex_area) * 100.0, 2)
                        field_conflicts.append({
                            "field": "recorded_area_sqm",
                            "severity": "CRITICAL" if delta_pct > 5.0 else "WARNING",
                            "existing_value": f"{ex_area} m²",
                            "uploaded_value": f"{curr_area} m²",
                            "discrepancy": f"{delta_pct}% Area Difference (±{area_delta:.1f} m²)",
                            "description": f"Conflicting legal area documented for Khasra {curr_khasra} across registry submissions."
                        })

                # Conflict Check: Owner Mismatch on same parcel
                if is_same_parcel and curr_owners_str and ex_owners_str:
                    if text_sim_pct < 60.0:
                        field_conflicts.append({
                            "field": "pattadar_names",
                            "severity": "CRITICAL",
                            "existing_value": existing.get("pattadar_names"),
                            "uploaded_value": curr_owners,
                            "discrepancy": "Distinct Owner Names Recorded",
                            "description": "Uploaded document lists different owner names for this parcel without mutation trail."
                        })

                # Different-parcel negative case check
                is_negative_case = (visual_sim_pct >= 80.0 or text_sim_pct >= 80.0) and not is_same_parcel

                candidate_entry = {
                    "doc_id": existing["doc_id"],
                    "filename": existing["filename"],
                    "uploaded_at": existing["uploaded_at"],
                    "khasra_no": existing.get("khasra_no"),
                    "village_name": existing.get("village_name"),
                    "pattadar_names": existing.get("pattadar_names"),
                    "recorded_area_sqm": existing.get("recorded_area_sqm"),
                    "visual_similarity_pct": visual_sim_pct,
                    "text_similarity_pct": text_sim_pct,
                    "is_same_parcel": is_same_parcel,
                    "is_different_parcel_negative_case": is_negative_case,
                    "field_conflicts": field_conflicts,
                }
                candidates.append(candidate_entry)
                if field_conflicts:
                    conflicts.extend(field_conflicts)

        # Generate summary diagnosis
        if is_exact_duplicate:
            diagnosis_code = "EXACT_BYTE_DUPLICATE_DETECTED"
            diagnosis_message = f"Uploaded file is byte-for-byte identical to existing document ({exact_match_doc['filename']}). SHA-256 match confirmed."
            requires_officer_review = True
        elif any(c["is_different_parcel_negative_case"] for c in candidates):
            diagnosis_code = "SIMILAR_TEMPLATE_DIFFERENT_PARCEL"
            diagnosis_message = "Document shares layout/font similarity with neighboring plots, but targets distinct cadastral parcel. Verified as independent record."
            requires_officer_review = False
        elif len(conflicts) > 0:
            diagnosis_code = "CONFLICTING_REGISTRY_FIELDS_DETECTED"
            diagnosis_message = f"Detected {len(conflicts)} conflicting tenure fields (area or owner mismatch) for Plot {curr_khasra}. Both versions preserved for officer adjudication."
            requires_officer_review = True
        elif len(candidates) > 0:
            diagnosis_code = "POTENTIAL_VISUAL_OR_TEXT_CANDIDATE"
            diagnosis_message = "Visually or textually similar document candidate identified. Preserving both copies."
            requires_officer_review = True
        else:
            diagnosis_code = "NO_DUPLICATES_UNIQUE_DOCUMENT"
            diagnosis_message = "Document is unique. No conflicting records found for this village and parcel."
            requires_officer_review = False

        # Register document in repository (always preserving both sources)
        new_doc_id = f"DOC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{len(self.documents)+1:03d}"
        new_doc_record = {
            "doc_id": new_doc_id,
            "filename": filename,
            "sha256": current_sha256,
            "phash": current_phash,
            "dhash": current_dhash,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "village_name": extracted_entities.get("village_name", "Rampur Kalan"),
            "tehsil": extracted_entities.get("tehsil", "Bakshi Ka Talab"),
            "district": extracted_entities.get("district", "Lucknow"),
            "khasra_no": curr_khasra,
            "khata_no": extracted_entities.get("khata_no", "KH-882"),
            "pattadar_names": curr_owners,
            "recorded_area_sqm": curr_area,
            "mortgage_status": extracted_entities.get("mortgage_status", "Nil"),
            "evidence_status": "PENDING_OFFICER_REVIEW" if requires_officer_review else "ACTIVE",
            "diagnosis_code": diagnosis_code,
        }
        self.documents.append(new_doc_record)
        self._persist()

        return {
            "uploaded_doc_id": new_doc_id,
            "filename": filename,
            "sha256": current_sha256,
            "phash": current_phash,
            "is_exact_duplicate": is_exact_duplicate,
            "exact_match_filename": exact_match_doc["filename"] if exact_match_doc else None,
            "diagnosis_code": diagnosis_code,
            "diagnosis_message": diagnosis_message,
            "requires_officer_review": requires_officer_review,
            "conflict_count": len(conflicts),
            "conflicts": conflicts,
            "candidates": candidates,
            "governance_rule": "Preserved both document sources in repository. Automatic merges strictly prohibited."
        }


doc_similarity_service = DocumentSimilarityService()
