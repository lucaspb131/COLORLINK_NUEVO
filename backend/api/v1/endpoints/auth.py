from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from schemas.user import UserCreate, UserOut, Token, LoginRequest
from services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED, summary="Registro de usuario con bcrypt")
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Registra un nuevo usuario con contraseña hasheada y asignación de rol RBAC."""
    service = AuthService(db)
    return await service.register_user(user_in)

@router.post("/login", response_model=Token, summary="Inicio de sesión y entrega de JWT")
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Autentica las credenciales y devuelve el token JWT firmado."""
    service = AuthService(db)
    return await service.authenticate(credentials)
