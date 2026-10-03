from fastapi import APIRouter, HTTPException, status
from schemas.gemini import GeminiClassificationRequest, GeminiClassificationResponse
from services.gemini_service import GeminiTechnicalService

router = APIRouter()

@router.post("/classify", response_model=GeminiClassificationResponse, summary="Clasificación de sistema multicapa con Gemini 3.8 Flash")
async def classify_coating(payload: GeminiClassificationRequest):
    service = GeminiTechnicalService()
    
    result = await service.classify_coating_system(
        client_data=payload.client or {},
        project_data=payload.project or {},
        areas=[a.model_dump() for a in payload.areas],
        conditions=payload.conditions.model_dump(),
        evidence_notes=payload.evidenceNotes or ""
    )

    return {
        "success": True,
        "source": "gemini-3.8-flash" if service.client else "rule-engine-fallback",
        "classification": result
    }
