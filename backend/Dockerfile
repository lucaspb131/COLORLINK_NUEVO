# ==============================================================================
# COLORLINK Backend - Dockerfile (FastAPI + SQLAlchemy 2 + Python 3.11)
# ==============================================================================
FROM python:3.11-slim as base

# Variables de entorno para Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100

WORKDIR /app

# Instalar dependencias del sistema requeridas para compilación y MySQL C client
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y construir dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente del backend
COPY . .

# Exponer puerto FastAPI
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando de inicio
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
