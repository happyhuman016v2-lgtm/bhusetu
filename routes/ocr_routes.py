"""
RoR Document Upload & Digitization Routes
Endpoint:
- POST /api/documents/upload-ror
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from services.ocr_service import process_uploaded_document

logger = logging.getLogger("BhuSetu_OCRRoutes")
router = APIRouter(prefix="/api/documents", tags=["RoR Document OCR & Digitization"])


@router.post("/upload-ror")
async def upload_ror_document(file: UploadFile = File(...)):
    """
    Upload physical RoR document (PDF, PNG, JPG).
    Runs:
    1. OpenCV image preprocessing (Grayscale + Otsu thresholding + noise reduction)
    2. OCR text extraction
    3. Structured entity parsing (Khasra No, Village, Pattadars, Area, Mortgage)
    4. Auto-link to Drone Survey Spatial Polygon
    """
    valid_exts = [".pdf", ".png", ".jpg", ".jpeg", ".tiff"]
    filename = file.filename or "uploaded_ror.png"
    ext = filename[filename.rfind("."):].lower() if "." in filename else ""

    if ext not in valid_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, PNG, JPG, JPEG."
        )

    try:
        content_bytes = await file.read()
        if len(content_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        result = process_uploaded_document(content_bytes, filename)
        return {
            "status": "success",
            "message": "Document successfully digitized and linked to drone survey ground truth.",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error processing uploaded RoR document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


@router.get("/index")
def get_documents_index():
    """Retrieve full indexed document database with hashes and tenure links."""
    from services.document_similarity import doc_similarity_service
    return {
        "status": "success",
        "total_documents": len(doc_similarity_service.documents),
        "documents": doc_similarity_service.documents
    }


@router.get("/demo-scenarios")
def get_demo_scenarios():
    """
    Returns 4 test demonstration scenarios:
    1. Repeated upload (identical file bytes / SHA-256)
    2. Recompressed similar scan (ImageHash visual match)
    3. Same-parcel conflicting area/owner
    4. Similar-looking different-parcel negative case (layout match, distinct plot)
    """
    return {
        "status": "success",
        "scenarios": [
            {
                "id": "scenario-1",
                "label": "1. Exact Repeated Upload",
                "description": "Uploading the exact same document bytes triggers byte-for-byte SHA-256 duplicate flag.",
                "filename": "UP_Khatauni_Plot101_Official_Record.pdf",
                "expected_outcome": "EXACT_BYTE_DUPLICATE_DETECTED",
                "conflicting_fields": []
            },
            {
                "id": "scenario-2",
                "label": "2. Recompressed Scanned Copy",
                "description": "A WhatsApp/recompressed photo of the same land card matches perceptual ImageHash (pHash).",
                "filename": "UP_Khatauni_Plot101_Compressed_Scan.jpg",
                "expected_outcome": "POTENTIAL_VISUAL_OR_TEXT_CANDIDATE",
                "conflicting_fields": []
            },
            {
                "id": "scenario-3",
                "label": "3. Same-Parcel Conflicting Area & Owner",
                "description": "Upload asserts 450.0 m² and new unmutated co-heir name on Plot 101 (Baseline: 412.0 m²).",
                "filename": "Disputed_Plot101_Claim.pdf",
                "expected_outcome": "CONFLICTING_REGISTRY_FIELDS_DETECTED",
                "conflicting_fields": ["recorded_area_sqm", "pattadar_names"]
            },
            {
                "id": "scenario-4",
                "label": "4. Similar-Looking Different-Parcel (Negative Case)",
                "description": "Document uses the identical Board of Revenue template, but pertains to Plot 104 (distinct owner and boundaries). Never auto-merged.",
                "filename": "UP_Khatauni_Plot104_Extract.pdf",
                "expected_outcome": "SIMILAR_TEMPLATE_DIFFERENT_PARCEL",
                "conflicting_fields": []
            }
        ]
    }
