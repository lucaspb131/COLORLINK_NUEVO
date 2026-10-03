from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

# --- ÁREAS ---
class ProjectAreaBase(BaseModel):
    name: str
    substrate: str
    sqm: float
    location: str = "Exterior"
    height_meters: float = 0.0
    initial_condition: str = "Nuevo sin pintar"

class ProjectAreaCreate(ProjectAreaBase):
    pass

class ProjectAreaOut(ProjectAreaBase):
    id: str

    class Config:
        from_attributes = True

# --- CONDICIONES OPERATIVAS ---
class ConditionsBase(BaseModel):
    humidity: float
    ambient_temp: float
    surface_temp: float
    corrosivity: str
    chemical_exposure: Optional[List[str]] = []
    traffic_type: str = "Peatonal Ligero"
    uv_exposure: str = "Alta Radiación Solar"
    special_requirements: Optional[str] = None

class ConditionsCreate(ConditionsBase):
    pass

class ConditionsOut(ConditionsBase):
    id: str

    class Config:
        from_attributes = True

# --- EVIDENCIAS ---
class PhotographicEvidenceBase(BaseModel):
    file_name: str
    file_url: str
    thumbnail_url: Optional[str] = None
    caption: str
    anomaly_detected: str
    sha256_hash: str
    file_size_kb: int = 0
    status: str = "Verificada"
    technical_notes: Optional[str] = None

class PhotographicEvidenceCreate(PhotographicEvidenceBase):
    pass

class PhotographicEvidenceOut(PhotographicEvidenceBase):
    id: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- CLASIFICACIÓN IA ---
class CoatingStep(BaseModel):
    step: str
    action: str
    standard: str

class GeminiClassificationBase(BaseModel):
    category: str
    coating_type: str
    confidence_score: float
    complexity: str
    recommended_system: List[CoatingStep]
    detected_conditions: List[str]
    missing_data: Optional[List[str]] = []
    observations: str
    estimated_yield_gallons: int
    voc_compliance: str
    model_used: str = "gemini-3.8-flash"

class GeminiClassificationCreate(GeminiClassificationBase):
    pass

class GeminiClassificationOut(GeminiClassificationBase):
    id: str
    classified_at: datetime

    class Config:
        from_attributes = True

# --- EVENTOS TIMELINE ---
class TimelineEventBase(BaseModel):
    status: str
    label: str
    description: str
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    completed: bool = True

class TimelineEventCreate(TimelineEventBase):
    pass

class TimelineEventOut(TimelineEventBase):
    id: str
    event_timestamp: datetime

    class Config:
        from_attributes = True

# --- PROYECTO COMPLETO ---
class ProjectBase(BaseModel):
    title: str
    city: str
    project_type: str = "Industrial"
    priority: str = "Media"
    budget_estimated: float = 0.0
    status: str = "Borrador"
    total_sqm: float = 0.0
    deadline: Optional[str] = None

class ProjectCreate(ProjectBase):
    client_id: str
    areas: Optional[List[ProjectAreaCreate]] = []
    conditions: Optional[ConditionsCreate] = None
    evidences: Optional[List[PhotographicEvidenceCreate]] = []
    classification: Optional[GeminiClassificationCreate] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    city: Optional[str] = None
    project_type: Optional[str] = None
    priority: Optional[str] = None
    budget_estimated: Optional[float] = None
    status: Optional[str] = None
    total_sqm: Optional[float] = None
    deadline: Optional[str] = None

class ProjectOut(ProjectBase):
    id: str
    code: str
    client_id: str
    client_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    areas: List[ProjectAreaOut] = []
    conditions: Optional[ConditionsOut] = None
    evidences: List[PhotographicEvidenceOut] = []
    classification: Optional[GeminiClassificationOut] = None
    timeline: List[TimelineEventOut] = []

    class Config:
        from_attributes = True
