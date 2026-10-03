from sqlalchemy import (
    Column, String, Text, DateTime
)
from datetime import datetime
import uuid
from db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    user_name = Column(String(150), nullable=True)
    user_role = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False, index=True)
    target_id = Column(String(100), nullable=False, index=True)
    details = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
