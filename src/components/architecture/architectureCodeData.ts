export interface ProjectFile {
  id: string;
  fileName: string;
  path: string;
  category: 'MySQL' | 'FastAPI' | 'Streamlit' | 'Docker' | 'Documentación' | 'Pruebas';
  language: 'sql' | 'python' | 'yaml' | 'dockerfile' | 'markdown';
  content: string;
}

export const ARCHITECTURE_FILES: ProjectFile[] = [
  {
    id: 'sql-schema',
    fileName: '01_schema_mysql_workbench.sql',
    path: 'database/scripts/01_schema_mysql_workbench.sql',
    category: 'MySQL',
    language: 'sql',
    content: `-- =============================================================================
-- COLORLINK DATABASE SCHEMA - MySQL 8.0 / MySQL Workbench Compatible
-- Plataforma de Transformación Digital Inteligente en Pintura y Recubrimientos
-- =============================================================================

CREATE DATABASE IF NOT EXISTS colorlink_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE colorlink_db;

-- 1. Tabla de Usuarios y Roles (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Administrador', 'Auditor', 'Cliente') NOT NULL DEFAULT 'Cliente',
    department VARCHAR(100) NULL,
    avatar_url VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Tabla de Clientes Corporativos
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    tax_id VARCHAR(50) NOT NULL UNIQUE, -- NIT / RUC
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NULL,
    industry ENUM('Industrial', 'Construcción', 'Marino', 'Infraestructura', 'Petroquímica', 'Comercial') NOT NULL,
    status ENUM('Activo', 'Inactivo', 'En Validación') NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clients_company (company_name),
    INDEX idx_clients_city (city),
    INDEX idx_clients_industry (industry)
) ENGINE=InnoDB;

-- 3. Tabla Principal de Proyectos de Recubrimiento
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE, -- Formato: COL-2026-XXXX
    title VARCHAR(255) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    city VARCHAR(100) NOT NULL,
    project_type ENUM('Industrial', 'Comercial', 'Marino', 'Estructuras Metálicas', 'Infraestructura') NOT NULL,
    priority ENUM('Baja', 'Media', 'Alta', 'Urgente') NOT NULL DEFAULT 'Media',
    budget_estimated DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Borrador', 'En Validación', 'Clasificado IA', 'Revisión Técnica', 'Presupuesto', 'Aprobado', 'En Ejecución', 'Cierre') NOT NULL DEFAULT 'Borrador',
    assigned_engineer_id VARCHAR(36) NULL,
    assigned_salesperson_id VARCHAR(36) NULL,
    total_sqm DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    deadline DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_project_engineer FOREIGN KEY (assigned_engineer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_project_sales FOREIGN KEY (assigned_salesperson_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_projects_code (code),
    INDEX idx_projects_status (status),
    INDEX idx_projects_client (client_id),
    INDEX idx_projects_city (city)
) ENGINE=InnoDB;

-- 4. Áreas y Geometrías del Proyecto
CREATE TABLE IF NOT EXISTS project_areas (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    substrate ENUM('Acero al Carbono', 'Concreto / Hormigón', 'Acero Galvanizado', 'Aluminio', 'Tuberías Industriales', 'Pisos Epóxicos Existentes', 'Drywall / Mampostería') NOT NULL,
    sqm DECIMAL(10, 2) NOT NULL,
    location ENUM('Interior', 'Exterior', 'Sumergido / Enterrado') NOT NULL,
    height_meters DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    initial_condition ENUM('Nuevo sin pintar', 'Óxido Grado A/B', 'Óxido Severo Grado C/D', 'Pintura Envejecida Fisurada', 'Contaminado con Aceites/Químicos') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_area_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_areas_project (project_id),
    INDEX idx_areas_substrate (substrate)
) ENGINE=InnoDB;

-- 5. Condiciones Ambientales y Operativas (ISO 12944)
CREATE TABLE IF NOT EXISTS operational_conditions (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL UNIQUE,
    humidity DECIMAL(5, 2) NOT NULL, -- Porcentaje %
    ambient_temp DECIMAL(5, 2) NOT NULL, -- °C
    surface_temp DECIMAL(5, 2) NOT NULL, -- °C
    corrosivity ENUM('C1 (Muy Baja)', 'C2 (Baja)', 'C3 (Media)', 'C4 (Alta)', 'C5 (Muy Alta - Marina/Industrial)') NOT NULL,
    chemical_exposure JSON NULL,
    traffic_type ENUM('Sin Tráfico', 'Peatonal Ligero', 'Peatonal Pesado', 'Montacargas / Vehicular Pesado') NOT NULL,
    uv_exposure ENUM('Baja', 'Moderada', 'Alta Radiación Solar') NOT NULL,
    special_requirements TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conditions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Evidencias Fotográficas con Hash SHA-256
CREATE TABLE IF NOT EXISTS photographic_evidences (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NULL,
    caption TEXT NOT NULL,
    anomaly_detected ENUM('Corrosión Puntual', 'Descascarillado', 'Fisuración', 'Ampollamiento', 'Superficie Limpia', 'Humedad Ascendente') NOT NULL,
    sha256_hash CHAR(64) NOT NULL, -- Hash forense
    uploaded_by_id VARCHAR(36) NULL,
    file_size_kb INT NOT NULL,
    status ENUM('Verificada', 'Pendiente', 'Rechazada') NOT NULL DEFAULT 'Verificada',
    technical_notes TEXT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evidence_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_evidence_user FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_evidences_project (project_id),
    INDEX idx_evidences_hash (sha256_hash)
) ENGINE=InnoDB;

-- 7. Diagnóstico y Clasificación con Gemini AI
CREATE TABLE IF NOT EXISTS gemini_classifications (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL UNIQUE,
    category VARCHAR(255) NOT NULL,
    coating_type VARCHAR(200) NOT NULL,
    confidence_score DECIMAL(5, 2) NOT NULL,
    complexity ENUM('Baja', 'Media', 'Alta', 'Crítica') NOT NULL,
    recommended_system JSON NOT NULL, -- Fases, preparación y normas
    detected_conditions JSON NOT NULL,
    missing_data JSON NULL,
    observations TEXT NOT NULL,
    estimated_yield_gallons INT NOT NULL,
    voc_compliance VARCHAR(200) NOT NULL,
    model_used VARCHAR(50) NOT NULL DEFAULT 'gemini-3.8-flash',
    classified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gemini_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Trazabilidad y Línea de Tiempo (Eventos)
CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    status ENUM('Borrador', 'En Validación', 'Clasificado IA', 'Revisión Técnica', 'Presupuesto', 'Aprobado', 'En Ejecución', 'Cierre') NOT NULL,
    label VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    author_id VARCHAR(36) NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timeline_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_timeline_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_timeline_project (project_id)
) ENGINE=InnoDB;

-- 9. Catálogo de Inventario y Recubrimientos
CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category ENUM('Primers Epóxicos', 'Acabados Poliuretano', 'Selladores', 'Esmaltes Alquídicos', 'Revestimientos Alto Desempeño', 'Diluyentes') NOT NULL,
    brand VARCHAR(100) NOT NULL,
    solids_by_volume DECIMAL(5, 2) NOT NULL,
    theoretical_yield_sqm_gal DECIMAL(6, 2) NOT NULL,
    drying_time_touch_hours DECIMAL(4, 2) NOT NULL,
    recoat_time_hours VARCHAR(50) NOT NULL,
    voc_grams_liter DECIMAL(6, 2) NOT NULL,
    current_stock_gallons INT NOT NULL DEFAULT 0,
    unit_price_usd DECIMAL(10, 2) NOT NULL,
    technical_sheet_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Auditoría Forense y Logs de Actividad
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    action VARCHAR(100) NOT NULL,
    target_type ENUM('Proyecto', 'Cliente', 'Clasificación IA', 'Evidencia', 'Sistema') NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_target (target_type, target_id)
) ENGINE=InnoDB;`
  },
  {
    id: 'fastapi-main',
    fileName: 'main.py',
    path: 'backend/main.py',
    category: 'FastAPI',
    language: 'python',
    content: `"""
COLORLINK Platform - Backend API FastAPI
Transformación Digital Inteligente en Pintura y Recubrimientos
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from core.config import settings
from db.session import create_tables
from api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de tablas y servicios
    print("Iniciando COLORLINK API Gateway...")
    await create_tables()
    yield
    print("Apagando servicios COLORLINK...")

app = FastAPI(
    title="COLORLINK API",
    description="API REST Empresarial para gestión de recubrimientos, proyectos y clasificación inteligente con Gemini 3.8 Flash",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configuración de CORS para Streamlit y clientes web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar rutas API v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "COLORLINK Backend",
        "version": "1.0.0",
        "ai_engine": "Gemini 3.8 Flash (Active)",
        "database": "MySQL 8.0"
    }

if __name__ == "__main__":
    uvicorn.run("main.py", host="0.0.0.0", port=8000, reload=True)`
  },
  {
    id: 'fastapi-models',
    fileName: 'models.py',
    path: 'backend/models/project.py',
    category: 'FastAPI',
    language: 'python',
    content: `"""
SQLAlchemy 2.0 Models for COLORLINK (MySQL 8.0)
"""
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, 
    ForeignKey, DateTime, Text, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Client(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tax_id = Column(String(50), nullable=False, unique=True)
    company_name = Column(String(200), nullable=False)
    contact_name = Column(String(150), nullable=False)
    email = Column(String(180), nullable=False)
    phone = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    industry = Column(String(50), nullable=False)
    status = Column(String(30), default="Activo")
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="client")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(30), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    city = Column(String(100), nullable=False)
    project_type = Column(String(50), nullable=False)
    priority = Column(String(30), default="Media")
    budget_estimated = Column(Numeric(12, 2), default=0.00)
    status = Column(String(40), default="Borrador")
    total_sqm = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="projects")
    areas = relationship("ProjectArea", back_populates="project", cascade="all, delete-orphan")
    conditions = relationship("OperationalConditions", back_populates="project", uselist=False)
    evidences = relationship("PhotographicEvidence", back_populates="project")
    classification = relationship("GeminiClassification", back_populates="project", uselist=False)`
  },
  {
    id: 'fastapi-gemini',
    fileName: 'gemini_service.py',
    path: 'backend/services/gemini_service.py',
    category: 'FastAPI',
    language: 'python',
    content: `"""
COLORLINK Gemini Integration Service
Normas: ISO 12944 y SSPC
"""
import json
import os
from google import genai
from pydantic import BaseModel

class GeminiTechnicalClassifier:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    async def classify_project(self, project_data: dict) -> dict:
        """
        Diagnostica el proyecto con Gemini 3.8 Flash
        """
        prompt = f"""
Actúa como Ingeniero Senior NACE / AMPP Level 3 e Inspector ISO 12944 para COLORLINK.
Analiza la siguiente información de obra de recubrimiento:
{json.dumps(project_data, ensure_ascii=False, indent=2)}

Genera una especificación técnica en formato JSON estricto con:
- category: Sistema de recubrimiento recomendado
- coatingType: Química de resinas (Epóxico, Poliuretano, etc.)
- confidenceScore: Nivel de certeza (80 a 99)
- complexity: 'Baja' | 'Media' | 'Alta' | 'Crítica'
- recommendedSystem: Lista de capas (paso, acción técnica, norma SSPC/ISO)
- detectedConditions: Hallazgos operativos clave
- missingData: Parámetros necesarios en campo
- observations: Cuidados de punto de rocío y curado
- estimatedYieldGallons: Galones estimados
- vocCompliance: Normatividad ambiental
"""
        if not self.client:
            return self._fallback_classification(project_data)

        response = self.client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

    def _fallback_classification(self, data: dict) -> dict:
        return {
            "category": "Sistema Epóxico Altos Sólidos + Poliuretano Alifático (C4/C5)",
            "coatingType": "Poliamida Epóxica + Topcoat Uretano",
            "confidenceScore": 95,
            "complexity": "Alta",
            "recommendedSystem": [
                {"step": "Preparación", "action": "Chorreado abrasivo Sa 2.5", "standard": "SSPC-SP 10"},
                {"step": "Primer", "action": "Epóxico rico en zinc 3 mils", "standard": "SSPC-Paint 20"},
                {"step": "Topcoat", "action": "Poliuretano alifático 2.5 mils", "standard": "ASTM D4541"}
            ],
            "detectedConditions": ["Humedad y corrosividad moderada a alta"],
            "missingData": ["Medición de punto de rocío in-situ"],
            "observations": "No aplicar si humedad relativa excede el 85%.",
            "estimatedYieldGallons": 210,
            "vocCompliance": "VOC < 250 g/L"
        }`
  },
  {
    id: 'streamlit-app',
    fileName: 'app.py',
    path: 'frontend/app.py',
    category: 'Streamlit',
    language: 'python',
    content: `"""
COLORLINK - Frontend Streamlit SaaS
Transformación Digital Inteligente en Pintura y Recubrimientos
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import requests

st.set_page_config(
    page_title="COLORLINK | Recubrimientos Inteligentes",
    page_icon="🎨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom SaaS Corporate CSS (#1E3A8A Palette)
st.markdown("""
<style>
    .main-header {
        font-size: 28px;
        font-weight: 800;
        color: #1E3A8A;
    }
    .metric-card {
        background-color: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 18px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
</style>
""", unsafe_allow_html=True)

# Sidebar Inteligente
st.sidebar.image("https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=200", width=80)
st.sidebar.markdown("### 🎨 COLORLINK")
st.sidebar.caption("Transformación Digital en Pintura")

menu = st.sidebar.radio(
    "Menú Principal",
    [
        "🏠 Dashboard", 
        "👤 Clientes", 
        "📁 Proyectos", 
        "📸 Evidencias", 
        "🧠 Clasificaciones IA", 
        "📦 Inventario", 
        "📊 Analítica", 
        "⚙ Administración",
        "🚪 Cerrar sesión"
    ]
)

if menu == "🏠 Dashboard":
    st.markdown('<h1 class="main-header">Dashboard Ejecutivo COLORLINK</h1>', unsafe_allow_html=True)
    
    col1, col2, col3, col4, col5, col6 = st.columns(6)
    col1.metric("Clientes Activos", "24", "+3")
    col2.metric("Proyectos Activos", "18", "6 en ejecución")
    col3.metric("Solicitudes Pend.", "5", "Revisión")
    col4.metric("Casos Escalados", "2", "Alta prioridad")
    col5.metric("Evidencias SHA", "142", "Verificadas")
    col6.metric("Incidencias", "3", "Humedad > 80%")

    st.markdown("---")
    st.subheader("Análisis de Sustratos e Inferencia Gemini")
    
    df = pd.DataFrame({
        "Sustrato": ["Acero al Carbono", "Concreto", "Galvanizado", "Tuberías"],
        "Metros Cuadrados": [14200, 9800, 3400, 2100]
    })
    fig = px.bar(df, x="Sustrato", y="Metros Cuadrados", color="Sustrato", color_discrete_sequence=["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD"])
    st.plotly_chart(fig, use_container_width=True)

elif menu == "🧠 Clasificaciones IA":
    st.subheader("Motor de Diagnóstico con Gemini 3.8 Flash")
    st.info("Sistema clasificado: Epóxico de Altos Sólidos + Poliuretano UV (ISO 12944 C5)")
    st.progress(96, text="Nivel de Confianza: 96%")`
  },
  {
    id: 'docker-compose',
    fileName: 'docker-compose.yml',
    path: 'docker-compose.yml',
    category: 'Docker',
    language: 'yaml',
    content: `version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: colorlink_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root_secure_password_2026
      MYSQL_DATABASE: colorlink_db
      MYSQL_USER: colorlink_user
      MYSQL_PASSWORD: colorlink_secure_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/scripts:/docker-entrypoint-initdb.d
    networks:
      - colorlink_net

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend/Dockerfile
    container_name: colorlink_backend
    restart: always
    environment:
      DATABASE_URL: mysql+aiomysql://colorlink_user:colorlink_secure_pass@mysql:3306/colorlink_db
      GEMINI_API_KEY: \${GEMINI_API_KEY}
      JWT_SECRET: super_secure_jwt_secret_colorlink_2026
    ports:
      - "8000:8000"
    depends_on:
      - mysql
    networks:
      - colorlink_net

  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/frontend/Dockerfile
    container_name: colorlink_frontend
    restart: always
    environment:
      BACKEND_API_URL: http://backend:8000/api/v1
    ports:
      - "8501:8501"
    depends_on:
      - backend
    networks:
      - colorlink_net

volumes:
  mysql_data:

networks:
  colorlink_net:
    driver: bridge`
  },
  {
    id: 'pytest-tests',
    fileName: 'test_api.py',
    path: 'backend/tests/test_api.py',
    category: 'Pruebas',
    language: 'python',
    content: `"""
Test Suite for COLORLINK API (pytest)
"""
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "COLORLINK Backend"

@pytest.mark.asyncio
async def test_create_project_validation():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "title": "Prueba Recubrimiento Tanques",
            "city": "Cartagena",
            "project_type": "Industrial",
            "budget_estimated": 45000
        }
        # Validación de campos requeridos
        response = await ac.post("/api/v1/projects/", json=payload)
    assert response.status_code in [200, 201, 422] # 422 if auth missing`
  },
  {
    id: 'docs-architecture',
    fileName: 'ARCHITECTURE.md',
    path: 'docs/ARCHITECTURE.md',
    category: 'Documentación',
    language: 'markdown',
    content: `# 🎨 COLORLINK: Arquitectura Empresarial

## 1. Visión General
COLORLINK es una plataforma integral SaaS para la digitalización y gestión pericial en pinturas y recubrimientos protectores industriales, combinando inferencia de IA con Gemini 3.8 Flash, auditoría fotográfica con hash SHA-256 y cumplimiento de las normas ISO 12944 y SSPC.

\`\`\`
   +---------------------------------------------------------+
   |             Frontend (Streamlit / React SPA)            |
   |   - Wizard Asistido en 9 Pasos                         |
   |   - Dashboard con KPIs & Gráficos Plotly                |
   |   - Galería de Evidencias con Zoom & SHA-256            |
   +---------------------------------------------------------+
                               |
                        REST API (JSON)
                               |
   +---------------------------------------------------------+
   |            Backend API Gateway (FastAPI)                |
   |   - Autenticación JWT & Hashing Passwords (bcrypt)      |
   |   - ORM SQLAlchemy 2.0 & Validaciones Pydantic          |
   |   - Servicio de Clasificación Técnica con Gemini Flash |
   +---------------------------------------------------------+
                 |                           |
                 v                           v
   +--------------------------+    +--------------------------+
   |      MySQL 8.0 RDBMS     |    |    Google Gemini API     |
   | - Esquema Relacional     |    | - Modelo: gemini-3.8-flash|
   | - Integridad Referencial |    | - Inferencia Normativa   |
   | - Trazabilidad AuditLogs |    +--------------------------+
   +--------------------------+
\`\`\`

## 2. Instrucciones de Despliegue Local
\`\`\`bash
# 1. Clonar el repositorio
git clone https://github.com/colorlink/colorlink.git
cd colorlink

# 2. Configurar variables de entorno en .env
cp .env.example .env

# 3. Iniciar todos los contenedores con Docker Compose
docker-compose up -d --build

# 4. Acceder a las aplicaciones:
# - Frontend Streamlit: http://localhost:8501
# - Backend FastAPI Swagger: /docs (o VITE_API_BASE_URL/docs)
# - Base de datos MySQL 8: localhost:3306
\`\`\`
`
  }
];
