from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from models.user import User
from schemas.user import UserCreate, UserUpdate
from repositories.user_repo import UserRepository
from core.security import get_password_hash

class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        return await self.repo.get_all(skip=skip, limit=limit)

    async def get_user_by_id(self, user_id: str) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado."
            )
        return user

    async def create_user(self, user_in: UserCreate) -> User:
        existing = await self.repo.get_by_email(user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un usuario con este correo electrónico."
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

    async def update_user(self, user_id: str, user_in: UserUpdate) -> User:
        user = await self.get_user_by_id(user_id)
        update_data = user_in.model_dump(exclude_unset=True)
        if "email" in update_data and update_data["email"] != user.email:
            existing = await self.repo.get_by_email(update_data["email"])
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El correo electrónico ya está registrado por otro usuario."
                )
        return await self.repo.update(user, update_data)

    async def delete_user(self, user_id: str) -> User:
        user = await self.get_user_by_id(user_id)
        return await self.repo.delete(user)
