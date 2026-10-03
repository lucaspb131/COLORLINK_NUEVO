-- =============================================================================
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
    role ENUM('SuperAdmin', 'Ingeniero_Tecnico', 'Asesor_Comercial', 'Auditor_Calidad') NOT NULL DEFAULT 'Asesor_Comercial',
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
) ENGINE=InnoDB;
