from sqlalchemy import (
    Column, String, Numeric, Integer, Boolean, 
    ForeignKey, DateTime, Text, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(30), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    client_id = Column(String(36), ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    project_type = Column(String(50), nullable=False)
    priority = Column(String(30), nullable=False, default="Media")
    budget_estimated = Column(Numeric(12, 2), nullable=False, default=0.00)
    status = Column(String(40), nullable=False, default="Borrador", index=True)
    assigned_engineer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_salesperson_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    total_sqm = Column(Numeric(10, 2), nullable=False, default=0.00)
    deadline = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="projects", lazy="selectin")
    areas = relationship("ProjectArea", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    conditions = relationship("OperationalConditions", back_populates="project", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    evidences = relationship("PhotographicEvidence", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    classification = relationship("GeminiClassification", back_populates="project", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    timeline = relationship("TimelineEvent", back_populates="project", cascade="all, delete-orphan", lazy="selectin", order_by="TimelineEvent.event_timestamp")


class ProjectArea(Base):
    __tablename__ = "project_areas"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    substrate = Column(String(100), nullable=False, index=True)
    sqm = Column(Numeric(10, 2), nullable=False, default=0.00)
    location = Column(String(50), nullable=False)
    height_meters = Column(Numeric(5, 2), nullable=False, default=0.00)
    initial_condition = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="areas")


class OperationalConditions(Base):
    __tablename__ = "operational_conditions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    humidity = Column(Numeric(5, 2), nullable=False)
    ambient_temp = Column(Numeric(5, 2), nullable=False)
    surface_temp = Column(Numeric(5, 2), nullable=False)
    corrosivity = Column(String(100), nullable=False)
    chemical_exposure = Column(JSON, nullable=True)
    traffic_type = Column(String(100), nullable=False)
    uv_exposure = Column(String(50), nullable=False)
    special_requirements = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="conditions")


class PhotographicEvidence(Base):
    __tablename__ = "photographic_evidences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    caption = Column(Text, nullable=False)
    anomaly_detected = Column(String(100), nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    uploaded_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_size_kb = Column(Integer, nullable=False, default=0)
    status = Column(String(30), nullable=False, default="Verificada")
    technical_notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="evidences")


class GeminiClassification(Base):
    __tablename__ = "gemini_classifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    category = Column(String(255), nullable=False)
    coating_type = Column(String(200), nullable=False)
    confidence_score = Column(Numeric(5, 2), nullable=False)
    complexity = Column(String(30), nullable=False)
    recommended_system = Column(JSON, nullable=False)
    detected_conditions = Column(JSON, nullable=False)
    missing_data = Column(JSON, nullable=True)
    observations = Column(Text, nullable=False)
    estimated_yield_gallons = Column(Integer, nullable=False, default=0)
    voc_compliance = Column(String(200), nullable=False)
    model_used = Column(String(50), nullable=False, default="gemini-3.8-flash")
    classified_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="classification")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(40), nullable=False)
    label = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    author_name = Column(String(150), nullable=True)
    author_role = Column(String(100), nullable=True)
    completed = Column(Boolean, nullable=False, default=False)
    event_timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="timeline")
