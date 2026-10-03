from sqlalchemy import (
    Column, String, Boolean, DateTime
)
from datetime import datetime
import uuid
from db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False)
    email = Column(String(180), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Asesor_Comercial", index=True)
    department = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
