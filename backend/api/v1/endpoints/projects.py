from fastapi import APIRouter, Depends, Query, status, Body
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectOut, 
    ProjectAreaCreate, ProjectAreaOut,
    PhotographicEvidenceCreate, PhotographicEvidenceOut,
    GeminiClassificationCreate, GeminiClassificationOut,
    TimelineEventCreate, TimelineEventOut
)
from pydantic import BaseModel
from services.project_service import ProjectService
from core.deps import get_current_user
from models.user import User

router = APIRouter()

class StatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    author_name: Optional[str] = "Supervisor Técnico"
    author_role: Optional[str] = "Ingeniero de Calidad"

# --- PROYECTOS CRUD ---
@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED, summary="Crear proyecto de recubrimiento")
async def create_project(
    project_in: ProjectCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Crea una nueva solicitud técnica de proyecto vinculada a un cliente."""
    service = ProjectService(db)
    user_id = current_user.id if current_user else None
    return await service.create_project(project_in, current_user_id=user_id)

@router.get("/", response_model=List[ProjectOut], summary="Listar proyectos")
async def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene la lista paginada de todos los proyectos de pintura y recubrimientos."""
    service = ProjectService(db)
    return await service.get_all_projects(skip=skip, limit=limit)

@router.get("/{project_id}", response_model=ProjectOut, summary="Obtener proyecto por ID")
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Retorna la ficha técnica integral del proyecto incluyendo áreas, condiciones, evidencias y timeline."""
    service = ProjectService(db)
    return await service.get_project_by_id(project_id)

@router.put("/{project_id}", response_model=ProjectOut, summary="Actualizar proyecto")
async def update_project(
    project_id: str, 
    project_in: ProjectUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Actualiza campos generales del proyecto."""
    service = ProjectService(db)
    return await service.update_project(project_id, project_in)

@router.delete("/{project_id}", response_model=ProjectOut, summary="Eliminar proyecto")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Elimina un proyecto y todas sus relaciones asociadas en cascada."""
    service = ProjectService(db)
    return await service.delete_project(project_id)

# --- ESTADOS & TRAZABILIDAD AUTOMÁTICA ---
@router.patch("/{project_id}/status", response_model=ProjectOut, summary="Actualizar estado del proyecto con trazabilidad")
async def update_project_status(
    project_id: str,
    payload: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Avanza o retrocede el estado del proyecto y añade automáticamente un evento al historial de auditoría."""
    service = ProjectService(db)
    return await service.update_status(
        project_id=project_id,
        new_status=payload.status,
        notes=payload.notes,
        author_name=payload.author_name or "Supervisor",
        author_role=payload.author_role or "Ingeniero"
    )

# --- ÁREAS CRUD ---
@router.get("/{project_id}/areas", response_model=List[ProjectAreaOut], summary="Listar áreas del proyecto")
async def list_project_areas(project_id: str, db: AsyncSession = Depends(get_db)):
    service = ProjectService(db)
    return await service.list_areas(project_id)

@router.post("/{project_id}/areas", response_model=ProjectAreaOut, status_code=status.HTTP_201_CREATED, summary="Agregar área técnica")
async def add_project_area(project_id: str, area_in: ProjectAreaCreate, db: AsyncSession = Depends(get_db)):
    service = ProjectService(db)
    return await service.add_area(project_id, area_in)

@router.delete("/{project_id}/areas/{area_id}", response_model=ProjectAreaOut, summary="Eliminar área técnica")
async def delete_project_area(project_id: str, area_id: str, db: AsyncSession = Depends(get_db)):
    service = ProjectService(db)
    return await service.delete_area(project_id, area_id)

# --- EVIDENCIAS CRUD ---
@router.get("/{project_id}/evidences", response_model=List[PhotographicEvidenceOut], summary="Listar evidencias fotográficas")
async def list_project_evidences(project_id: str, db: AsyncSession = Depends(get_db)):
    service = ProjectService(db)
    return await service.list_evidences(project_id)

@router.post("/{project_id}/evidences", response_model=PhotographicEvidenceOut, status_code=status.HTTP_201_CREATED, summary="Cargar evidencia fotográfica")
async def add_evidence(
    project_id: str, 
    evidence_in: PhotographicEvidenceCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    service = ProjectService(db)
    user_id = current_user.id if current_user else None
    return await service.add_evidence(project_id, evidence_in, user_id=user_id)

@router.delete("/{project_id}/evidences/{evidence_id}", response_model=PhotographicEvidenceOut, summary="Eliminar evidencia fotográfica")
async def delete_evidence(project_id: str, evidence_id: str, db: AsyncSession = Depends(get_db)):
    service = ProjectService(db)
    return await service.delete_evidence(project_id, evidence_id)

# --- CLASIFICACIÓN GEMINI ---
@router.get("/{project_id}/classification", response_model=GeminiClassificationOut, summary="Obtener clasificación IA")
async def get_classification(project_id: str, db: AsyncSession = Depends(get_db)):
    service = ProjectService(db)
    return await service.get_classification(project_id)

@router.post("/{project_id}/classification", response_model=GeminiClassificationOut, summary="Registrar o actualizar clasificación IA")
async def set_classification(
    project_id: str, 
    classification_in: GeminiClassificationCreate, 
    db: AsyncSession = Depends(get_db)
):
    service = ProjectService(db)
    return await service.set_classification(project_id, classification_in)

# --- TRAZABILIDAD (TIMELINE / HISTORIAL) ---
@router.get("/{project_id}/timeline", response_model=List[TimelineEventOut], summary="Consultar línea de tiempo y trazabilidad")
async def get_project_timeline(project_id: str, db: AsyncSession = Depends(get_db)):
    service = ProjectService(db)
    return await service.get_timeline(project_id)

@router.post("/{project_id}/timeline", response_model=TimelineEventOut, status_code=status.HTTP_201_CREATED, summary="Registrar evento en la línea de tiempo")
async def add_timeline_event(
    project_id: str, 
    event_in: TimelineEventCreate, 
    db: AsyncSession = Depends(get_db)
):
    service = ProjectService(db)
    return await service.add_timeline_event(project_id, event_in)
