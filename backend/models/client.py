from sqlalchemy import (
    Column, String, DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Client(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tax_id = Column(String(50), nullable=False, unique=True, index=True)
    company_name = Column(String(200), nullable=False, index=True)
    contact_name = Column(String(150), nullable=False)
    email = Column(String(180), nullable=False)
    phone = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    industry = Column(String(50), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="Activo")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("Project", back_populates="client", lazy="selectin")
