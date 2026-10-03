from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from core.config import settings

Base = declarative_base()

# Utiliza la URL resuelta desde el archivo .env (DATABASE_URL / settings.ASYNC_DATABASE_URL)
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=False,
    future=True,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db():
    """Dependency para inyección de sesión de base de datos en endpoints FastAPI."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    """Inicialización de esquemas DDL en base de datos si no existen."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Nota de conexión a BD MySQL: {e}")
