from datetime import timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from models.user import User
from schemas.user import UserCreate, LoginRequest
from repositories.user_repo import UserRepository
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings

class AuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register_user(self, user_in: UserCreate) -> User:
        existing = await self.repo.get_by_email(user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya se encuentra registrado."
            )
        
        user_db = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            role=user_in.role,
            department=user_in.department,
            avatar_url=user_in.avatar_url,
            is_active=user_in.is_active
        )
        return await self.repo.create(user_db)

    async def authenticate(self, credentials: LoginRequest) -> dict:
        user = await self.repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales de acceso inválidas."
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo en el sistema."
            )
        
        access_token = create_access_token(
            subject=user.id,
            role=user.role,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
