from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ClientBase(BaseModel):
    tax_id: str
    company_name: str
    contact_name: str
    email: EmailStr
    phone: str
    city: str
    address: Optional[str] = None
    industry: str = "Industrial"
    status: str = "Activo"

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    tax_id: Optional[str] = None
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None

class ClientOut(ClientBase):
    id: str
    created_at: datetime
    total_projects: Optional[int] = 0

    class Config:
        from_attributes = True
