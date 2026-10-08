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
