from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from models.project import (
    Project, ProjectArea, OperationalConditions, 
    PhotographicEvidence, GeminiClassification, TimelineEvent
)
from repositories.base import BaseRepository

class ProjectRepository(BaseRepository[Project]):
    def __init__(self, db: AsyncSession):
        super().__init__(Project, db)

    async def get_by_code(self, code: str) -> Optional[Project]:
        stmt = select(Project).where(Project.code == code)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_client_id(self, client_id: str) -> List[Project]:
        stmt = select(Project).where(Project.client_id == client_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def check_duplicate(self, client_id: str, city: str, project_type: str) -> Optional[Project]:
        stmt = select(Project).where(
            Project.client_id == client_id,
            Project.city.ilike(city),
            Project.project_type == project_type
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    # --- ÁREAS ---
    async def get_areas_by_project(self, project_id: str) -> List[ProjectArea]:
        stmt = select(ProjectArea).where(ProjectArea.project_id == project_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_area_by_id(self, area_id: str) -> Optional[ProjectArea]:
        stmt = select(ProjectArea).where(ProjectArea.id == area_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def add_area(self, area: ProjectArea) -> ProjectArea:
        self.db.add(area)
        await self.db.commit()
        await self.db.refresh(area)
        return area

    async def delete_area(self, area: ProjectArea) -> ProjectArea:
        await self.db.delete(area)
        await self.db.commit()
        return area

    # --- EVIDENCIAS ---
    async def get_evidences_by_project(self, project_id: str) -> List[PhotographicEvidence]:
        stmt = select(PhotographicEvidence).where(PhotographicEvidence.project_id == project_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_evidence_by_id(self, evidence_id: str) -> Optional[PhotographicEvidence]:
        stmt = select(PhotographicEvidence).where(PhotographicEvidence.id == evidence_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def add_evidence(self, evidence: PhotographicEvidence) -> PhotographicEvidence:
        self.db.add(evidence)
        await self.db.commit()
        await self.db.refresh(evidence)
        return evidence

    async def delete_evidence(self, evidence: PhotographicEvidence) -> PhotographicEvidence:
        await self.db.delete(evidence)
        await self.db.commit()
        return evidence

    # --- CLASIFICACIONES ---
    async def get_classification_by_project(self, project_id: str) -> Optional[GeminiClassification]:
        stmt = select(GeminiClassification).where(GeminiClassification.project_id == project_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def save_classification(self, classification: GeminiClassification) -> GeminiClassification:
        self.db.add(classification)
        await self.db.commit()
        await self.db.refresh(classification)
        return classification

    # --- TRAZABILIDAD (TIMELINE) ---
    async def get_timeline_by_project(self, project_id: str) -> List[TimelineEvent]:
        stmt = select(TimelineEvent).where(TimelineEvent.project_id == project_id).order_by(TimelineEvent.event_timestamp.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def add_timeline_event(self, event: TimelineEvent) -> TimelineEvent:
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event
