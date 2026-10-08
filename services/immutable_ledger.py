"""
BhuSetu Immutable Resurvey Order Ledger
Implements:
- Cryptographic SHA-256 hash-chain architecture for statutory Drone Resurvey Orders
- Tamper-evident verification engine traversing genesis to tip
- Persistent ledger storage in data/immutable_ledger.json
"""

import os
import json
import uuid
import hashlib
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone

logger = logging.getLogger("BhuSetu_Ledger")

LEDGER_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "immutable_ledger.json"
)

GENESIS_PREV_HASH = "0" * 64


def calculate_block_hash(payload: Dict[str, Any], prev_hash: str) -> str:
    """
    Compute cryptographic SHA-256 hash over canonical JSON representation of block payload + prev_hash.
    """
    canonical_dict = {
        "prev_hash": prev_hash,
        "payload": payload
    }
    canonical_json = json.dumps(canonical_dict, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()


class ImmutableLedgerService:
    def __init__(self, storage_path: str = LEDGER_FILE_PATH):
        self.storage_path = storage_path
        self.chain: List[Dict[str, Any]] = []
        self._load_or_initialize()

    def _load_or_initialize(self):
        """Load ledger from disk or initialize with genesis block."""
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.chain = json.load(f)
                if len(self.chain) > 0:
                    logger.info(f"Loaded existing immutable ledger with {len(self.chain)} blocks.")
                    return
            except Exception as e:
                logger.error(f"Error reading ledger file: {e}. Reinitializing...")

        # Initialize Genesis Block
        self.chain = []
        self._create_genesis_block()
        self._persist()

    def _create_genesis_block(self):
        """Create the immutable Genesis block anchored to Survey of India & DoLR."""
        genesis_payload = {
            "index": 0,
            "order_id": "00000000-0000-0000-0000-000000000000",
            "timestamp": "2026-01-01T00:00:00Z",
            "type": "GENESIS_ANCHOR",
            "issuing_authority": "Ministry of Panchayati Raj • Survey of India • DoLR",
            "scheme": "SVAMITVA Large-Scale UAV Mapping",
            "jurisdiction": "National Cadastral Trust Network",
            "memo": "Genesis Root Anchor for BhuSetu Resurvey & Discrepancy Order Ledger"
        }
        genesis_hash = calculate_block_hash(genesis_payload, GENESIS_PREV_HASH)
        genesis_block = {
            "index": 0,
            "timestamp": genesis_payload["timestamp"],
            "prev_hash": GENESIS_PREV_HASH,
            "hash": genesis_hash,
            "payload": genesis_payload
        }
        self.chain.append(genesis_block)
        logger.info(f"Genesis block minted. Hash: {genesis_hash}")

    def _persist(self):
        """Atomic write to disk."""
        tmp_path = self.storage_path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(self.chain, f, indent=2)
        os.replace(tmp_path, self.storage_path)

    def append_resurvey_order(
        self,
        parcel_id: str,
        ulpin: str,
        officer_badge_id: str,
        officer_name: str,
        discrepancy_reason: str,
        target_accuracy: str = "< 3cm GSD UAV Photogrammetry",
        statutory_clause: str = "Uttar Pradesh Revenue Code 2006 (Sec 67-A) / SVAMITVA Directive",
        coordinates_centroid: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Cryptographically append an official Drone Resurvey Order to the ledger.
        """
        prev_block = self.chain[-1]
        prev_hash = prev_block["hash"]
        new_index = len(self.chain)
        order_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        order_payload = {
            "index": new_index,
            "order_id": order_id,
            "timestamp": timestamp,
            "type": "DRONE_RESURVEY_STATUTORY_ORDER",
            "parcel_id": parcel_id,
            "ulpin": ulpin,
            "officer_badge_id": officer_badge_id,
            "officer_name": officer_name,
            "discrepancy_reason": discrepancy_reason,
            "target_accuracy": target_accuracy,
            "statutory_clause": statutory_clause,
            "coordinates_centroid": coordinates_centroid or [80.943, 26.986],
            "status": "ORDER_ACTIVE_DISPATCHED",
            "action_mandate": "Direct Survey of India UAV Pilot Unit to conduct high-density sub-3cm drone flight over disputed boundary polygon."
        }

        block_hash = calculate_block_hash(order_payload, prev_hash)

        block = {
            "index": new_index,
            "timestamp": timestamp,
            "order_id": order_id,
            "parcel_id": parcel_id,
            "ulpin": ulpin,
            "officer_badge_id": officer_badge_id,
            "prev_hash": prev_hash,
            "hash": block_hash,
            "payload": order_payload
        }

        self.chain.append(block)
        self._persist()
        logger.info(f"MINTED BLOCK #{new_index} (Order {order_id}) -> Hash: {block_hash[:16]}...")
        return block

    def verify_ledger(self) -> Dict[str, Any]:
        """
        Traverse the entire hash chain from Genesis to tip.
        Verifies:
        1. Genesis block has prev_hash == 64 zeroes.
        2. Every block's calculated SHA-256 hash matches its stored hash.
        3. Every block's prev_hash matches the previous block's hash.
        """
        if not self.chain:
            return {"is_valid": False, "error": "Ledger is empty", "total_blocks": 0}

        tampered_blocks = []

        # Check Genesis
        genesis = self.chain[0]
        if genesis["prev_hash"] != GENESIS_PREV_HASH:
            tampered_blocks.append({"index": 0, "reason": "Invalid genesis prev_hash"})
        recalc_gen_hash = calculate_block_hash(genesis["payload"], GENESIS_PREV_HASH)
        if recalc_gen_hash != genesis["hash"]:
            tampered_blocks.append({"index": 0, "reason": "Genesis payload hash mismatch"})

        # Traverse subsequent blocks
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]

            # 1. Chain link check
            if curr["prev_hash"] != prev["hash"]:
                tampered_blocks.append({
                    "index": i,
                    "reason": f"Hash chain break: prev_hash does not match block #{i-1} hash"
                })

            # 2. Block content integrity check
            recalc_hash = calculate_block_hash(curr["payload"], curr["prev_hash"])
            if recalc_hash != curr["hash"]:
                tampered_blocks.append({
                    "index": i,
                    "reason": f"Tampered block payload: computed hash {recalc_hash[:12]} != stored hash {curr['hash'][:12]}"
                })

        is_valid = len(tampered_blocks) == 0

        return {
            "is_valid": is_valid,
            "total_blocks": len(self.chain),
            "genesis_hash": self.chain[0]["hash"],
            "tip_hash": self.chain[-1]["hash"],
            "tampered_blocks": tampered_blocks,
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "status": "LEDGER_CRYPTOGRAPHICALLY_VERIFIED" if is_valid else "LEDGER_TAMPERING_DETECTED"
        }

    def get_blocks(self) -> List[Dict[str, Any]]:
        """Return full chain (newest first)."""
        return list(reversed(self.chain))


# Global singleton instance
ledger_service = ImmutableLedgerService()
