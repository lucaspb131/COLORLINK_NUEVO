from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Asesor_Comercial"
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
