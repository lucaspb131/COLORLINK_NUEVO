import random
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from models.project import (
    Project, 
    ProjectArea, 
    OperationalConditions, 
    PhotographicEvidence, 
    GeminiClassification, 
    TimelineEvent
)
from schemas.project import (
    ProjectCreate, 
    ProjectUpdate, 
    ProjectAreaCreate,
    PhotographicEvidenceCreate,
    GeminiClassificationCreate,
    TimelineEventCreate
)
from repositories.project_repo import ProjectRepository
from repositories.client_repo import ClientRepository

class ProjectService:
    def __init__(self, db: AsyncSession):
        self.repo = ProjectRepository(db)
        self.client_repo = ClientRepository(db)
        self.db = db

    async def create_project(self, project_in: ProjectCreate, current_user_id: Optional[str] = None) -> Project:
        # 1. Verificar existencia del cliente
        client = await self.client_repo.get_by_id(project_in.client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El cliente especificado no existe."
            )

        # 2. Detección de casos duplicados
        duplicate = await self.repo.check_duplicate(
            client_id=project_in.client_id,
            city=project_in.city,
            project_type=project_in.project_type
        )
        if duplicate:
            # Caso con alerta de duplicidad detectada
            pass

        # 3. Generación de código normativo COL-2026-XXXX
        random_num = random.randint(1000, 9999)
        code = f"COL-2026-{random_num}"

        # 4. Calcular suma de áreas
        total_sqm = sum(area.sqm for area in (project_in.areas or []))

        # 5. Instanciar entidad Proyecto
        project = Project(
            code=code,
            title=project_in.title,
            client_id=project_in.client_id,
            city=project_in.city,
            project_type=project_in.project_type,
            priority=project_in.priority,
            budget_estimated=project_in.budget_estimated,
            status=project_in.status or "Borrador",
            total_sqm=total_sqm,
            deadline=project_in.deadline
        )

        # Áreas
        if project_in.areas:
            project.areas = [ProjectArea(**a.model_dump()) for a in project_in.areas]

        # Condiciones
        if project_in.conditions:
            project.conditions = OperationalConditions(**project_in.conditions.model_dump())

        # Evidencias
        if project_in.evidences:
            project.evidences = [
                PhotographicEvidence(**ev.model_dump(), uploaded_by_id=current_user_id)
                for ev in project_in.evidences
            ]

        # Clasificación Gemini
        if project_in.classification:
            project.classification = GeminiClassification(**project_in.classification.model_dump())

        # Timeline inicial (Hito 1: Creación)
        project.timeline = [
            TimelineEvent(
                status="Borrador",
                label="Creación de Solicitud",
                description="Ingreso de solicitud técnica a través del Asistente Guiado COLORLINK.",
                author_id=current_user_id,
                author_name="Ingeniero de Proyecto",
                author_role="Asesor Técnico",
                completed=True
            )
        ]

        created = await self.repo.create(project)
        created.client_name = client.company_name
        return created

    async def get_all_projects(self, skip: int = 0, limit: int = 100) -> List[Project]:
        projects = await self.repo.get_all(skip, limit)
        for p in projects:
            if p.client:
                p.client_name = p.client.company_name
        return projects

    async def get_project_by_id(self, project_id: str) -> Project:
        project = await self.repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proyecto no encontrado."
            )
        if project.client:
            project.client_name = project.client.company_name
        return project

    async def update_project(self, project_id: str, project_in: ProjectUpdate) -> Project:
        project = await self.get_project_by_id(project_id)
        return await self.repo.update(project, project_in.model_dump(exclude_unset=True))

    async def delete_project(self, project_id: str) -> Project:
        project = await self.get_project_by_id(project_id)
        return await self.repo.delete(project)

    # --- CAMBIO DE ESTADO Y FLUJO ---
    async def update_status(self, project_id: str, new_status: str, notes: Optional[str] = None, author_name: str = "Supervisor Técnico", author_role: str = "Ingeniero de Calidad") -> Project:
        project = await self.get_project_by_id(project_id)
        old_status = project.status
        project.status = new_status
        await self.db.commit()

        # Registro automático en la línea de tiempo de trazabilidad
        event = TimelineEvent(
            project_id=project.id,
            status=new_status,
            label=f"Transición a {new_status}",
            description=notes or f"El proyecto avanzó de '{old_status}' a '{new_status}'.",
            author_name=author_name,
            author_role=author_role,
            completed=True
        )
        await self.repo.add_timeline_event(event)
        return project

    # --- ÁREAS CRUD ---
    async def list_areas(self, project_id: str) -> List[ProjectArea]:
        await self.get_project_by_id(project_id)
        return await self.repo.get_areas_by_project(project_id)

    async def add_area(self, project_id: str, area_in: ProjectAreaCreate) -> ProjectArea:
        project = await self.get_project_by_id(project_id)
        area = ProjectArea(project_id=project.id, **area_in.model_dump())
        created_area = await self.repo.add_area(area)
        # Recalcular total_sqm del proyecto
        areas = await self.repo.get_areas_by_project(project_id)
        project.total_sqm = sum(a.sqm for a in areas)
        await self.db.commit()
        return created_area

    async def delete_area(self, project_id: str, area_id: str) -> ProjectArea:
        await self.get_project_by_id(project_id)
        area = await self.repo.get_area_by_id(area_id)
        if not area or area.project_id != project_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Área no encontrada en este proyecto.")
        deleted = await self.repo.delete_area(area)
        # Recalcular total_sqm
        areas = await self.repo.get_areas_by_project(project_id)
        project = await self.get_project_by_id(project_id)
        project.total_sqm = sum(a.sqm for a in areas)
        await self.db.commit()
        return deleted

    # --- EVIDENCIAS CRUD ---
    async def list_evidences(self, project_id: str) -> List[PhotographicEvidence]:
        await self.get_project_by_id(project_id)
        return await self.repo.get_evidences_by_project(project_id)

    async def add_evidence(self, project_id: str, evidence_in: PhotographicEvidenceCreate, user_id: Optional[str] = None) -> PhotographicEvidence:
        project = await self.get_project_by_id(project_id)
        evidence = PhotographicEvidence(
            project_id=project.id,
            uploaded_by_id=user_id,
            **evidence_in.model_dump()
        )
        return await self.repo.add_evidence(evidence)

    async def delete_evidence(self, project_id: str, evidence_id: str) -> PhotographicEvidence:
        await self.get_project_by_id(project_id)
        evidence = await self.repo.get_evidence_by_id(evidence_id)
        if not evidence or evidence.project_id != project_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidencia no encontrada en este proyecto.")
        return await self.repo.delete_evidence(evidence)

    # --- CLASIFICACIÓN GEMINI ---
    async def get_classification(self, project_id: str) -> GeminiClassification:
        await self.get_project_by_id(project_id)
        classification = await self.repo.get_classification_by_project(project_id)
        if not classification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El proyecto aún no cuenta con clasificación técnica Gemini.")
        return classification

    async def set_classification(self, project_id: str, classification_in: GeminiClassificationCreate) -> GeminiClassification:
        project = await self.get_project_by_id(project_id)
        existing = await self.repo.get_classification_by_project(project_id)
        if existing:
            for k, v in classification_in.model_dump().items():
                setattr(existing, k, v)
            await self.db.commit()
            await self.db.refresh(existing)
            return existing
        else:
            classification = GeminiClassification(project_id=project.id, **classification_in.model_dump())
            return await self.repo.save_classification(classification)

    # --- TRAZABILIDAD (HISTORIAL Y TIMELINE) ---
    async def get_timeline(self, project_id: str) -> List[TimelineEvent]:
        await self.get_project_by_id(project_id)
        return await self.repo.get_timeline_by_project(project_id)

    async def add_timeline_event(self, project_id: str, event_in: TimelineEventCreate) -> TimelineEvent:
        project = await self.get_project_by_id(project_id)
        event = TimelineEvent(
            project_id=project.id,
            status=event_in.status,
            label=event_in.label,
            description=event_in.description,
            author_name=event_in.author_name,
            author_role=event_in.author_role,
            completed=event_in.completed
        )
        if event_in.status and event_in.status != project.status:
            project.status = event_in.status
            await self.db.commit()

        return await self.repo.add_timeline_event(event)
