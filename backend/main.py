"""
COLORLINK Platform - Backend API Gateway FastAPI
Transformación Digital Inteligente en Pintura y Recubrimientos
"""
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import uvicorn
import time

from core.config import settings
from db.session import create_tables, get_db
from api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando COLORLINK API Gateway...")
    await create_tables()
    yield
    print("Apagando servicios COLORLINK...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# 🎨 COLORLINK REST API Gateway
### Transformación Digital Inteligente en Pintura y Recubrimientos
- **Arquitectura Empresarial:** FastAPI + SQLAlchemy 2.0 (Async) + MySQL 8.0.
- **Motor de Inferencia:** Google Gemini 3.8 Flash para diagnóstico multicapa según normas **ISO 12944** y **SSPC**.
- **Seguridad:** JWT (JSON Web Tokens) con cifrado **bcrypt** y control de accesos basado en roles (RBAC).
- **Cadena de Custodia:** Registro inmutable de evidencias con huella criptográfica **SHA-256**.
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware con validación rigurosa de orígenes
origins = settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else [settings.BACKEND_CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para logging y auditoría de tiempo de respuesta
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Montar Router de la API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Monitoreo & Salud"])
async def health_check():
    return {
        "status": "healthy",
        "service": "COLORLINK Enterprise Backend",
        "version": settings.VERSION,
        "database": settings.MYSQL_DB,
        "orm": "SQLAlchemy 2.0 (Async)",
        "ai_engine": "Gemini 3.8 Flash"
    }

# Endpoint para validar conexión real a MySQL Workbench
@app.get("/api/v1/health/db", tags=["Monitoreo & Salud"])
async def health_database_check(db: AsyncSession = Depends(get_db)):
    """
    Verifica la conexión activa contra MySQL 8 y la base de datos colorlink_db.
    Ejecuta SELECT 1 y valida el catálogo activo.
    """
    try:
        result = await db.execute(text("SELECT 1"))
        scalar_val = result.scalar()
        if scalar_val != 1:
            raise Exception("Respuesta inesperada al ejecutar SELECT 1")
            
        return {
            "status": "ok",
            "database": settings.MYSQL_DB,
            "connection": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "database": settings.MYSQL_DB,
                "connection": False,
                "error": str(e)
            }
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
