from pydantic import BaseModel
from typing import List, Optional, Any
from schemas.project import ProjectAreaCreate, ConditionsCreate

class GeminiClassificationRequest(BaseModel):
    client: Optional[dict] = {}
    project: Optional[dict] = {}
    areas: List[ProjectAreaCreate]
    conditions: ConditionsCreate
    evidenceNotes: Optional[str] = ""

class GeminiClassificationResponse(BaseModel):
    success: bool
    source: str
    classification: dict
