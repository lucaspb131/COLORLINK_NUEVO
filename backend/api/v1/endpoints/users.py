from fastapi import APIRouter, Depends, Query, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from schemas.user import UserCreate, UserUpdate, UserOut
from services.user_service import UserService
from core.deps import get_current_user, require_roles
from models.user import User

router = APIRouter()

@router.get("/", response_model=List[UserOut], summary="Listar usuarios del sistema")
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todos los colaboradores, supervisores y técnicos registrados."""
    service = UserService(db)
    return await service.get_all_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserOut, summary="Obtener usuario por ID")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retorna el perfil detallado de un usuario."""
    service = UserService(db)
    return await service.get_user_by_id(user_id)

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED, summary="Crear nuevo usuario (Admin)")
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SuperAdmin", "Director_Operaciones"]))
):
    """Registra un nuevo usuario con hash bcrypt seguro."""
    service = UserService(db)
    return await service.create_user(user_in)

@router.put("/{user_id}", response_model=UserOut, summary="Actualizar perfil de usuario")
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualiza datos del usuario. Solo administradores o el propio usuario pueden editar."""
    service = UserService(db)
    return await service.update_user(user_id, user_in)

@router.delete("/{user_id}", response_model=UserOut, summary="Eliminar usuario del sistema")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SuperAdmin"]))
):
    """Elimina permanentemente un usuario (Solo SuperAdmin)."""
    service = UserService(db)
    return await service.delete_user(user_id)
