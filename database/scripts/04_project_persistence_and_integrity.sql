-- =============================================================================
-- COLORLINK ENTERPRISE - AUDITORÍA Y RESOLUCIÓN INCIDENTE 4: PERSISTENCIA INTEGRAL DE PROYECTOS
-- Archivo: database/scripts/04_project_persistence_and_integrity.sql
-- Propósito: Garantizar integridad relacional estricta, resolución de claves foráneas
-- (Foreign Keys), tipos UUID sin error de sintaxis y políticas RLS transparentes
-- en todo el pipeline de creación de proyectos.
-- =============================================================================

-- 1. EXTENSIONES CRIPTOGRÁFICAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. TABLA: clients (Directorio de Empresas y Clientes)
-- Garantiza que existan los identificadores universales (UUID) referenciados por projects.client_id
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_id TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    industry TEXT NOT NULL DEFAULT 'Industrial'
        CHECK (industry IN ('Industrial', 'Construcción', 'Marino', 'Infraestructura', 'Petroquímica', 'Comercial')),
    status TEXT NOT NULL DEFAULT 'Activo' 
        CHECK (status IN ('Activo', 'Inactivo', 'En Validación')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserción idempotente de clientes base con UUID fijos
INSERT INTO public.clients (id, tax_id, company_name, contact_name, email, phone, city, address, industry, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', '900.845.120-4', 'Petroquímica del Caribe S.A.', 'Ing. Roberto Silva', 'rsilva@petrocaribe.com.co', '+57 310 445 8899', 'Cartagena', 'Zona Industrial Mamonal Km 7', 'Petroquímica', 'Activo'),
    ('b0000000-0000-0000-0000-000000000002', '860.012.399-1', 'Constructora Metrópoli & Infraestructura', 'Arq. Mariana Restrepo', 'mrestrepo@metropoli-infra.co', '+57 315 889 0012', 'Medellín', 'Cra 43A # 1Sur - 100', 'Construcción', 'Activo'),
    ('b0000000-0000-0000-0000-000000000003', '800.223.771-8', 'Terminal Marítimo del Pacífico S.A.', 'Cap. Andrés Valencia', 'avalencia@termpacifico.com', '+57 320 671 2244', 'Barranquilla', 'Puerto Industrial Vía 40', 'Marino', 'Activo')
ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    contact_name = EXCLUDED.contact_name,
    updated_at = now();

-- =============================================================================
-- 3. TABLA: projects (Entidad Padre del Proyecto de Recubrimiento)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    client_name TEXT,
    city TEXT NOT NULL,
    project_type TEXT NOT NULL 
        CHECK (project_type IN ('Industrial', 'Comercial', 'Marino', 'Estructuras Metálicas', 'Infraestructura', 'Petroquímica')),
    priority TEXT NOT NULL DEFAULT 'Media' 
        CHECK (priority IN ('Baja', 'Media', 'Alta', 'Urgente')),
    budget_estimated NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Borrador' 
        CHECK (status IN ('Borrador', 'En Validación', 'Clasificado IA', 'Revisión Técnica', 'Presupuesto', 'Aprobado', 'En Ejecución', 'Cierre')),
    assigned_engineer_id UUID,
    assigned_salesperson_id UUID,
    assigned_engineer TEXT,
    assigned_salesperson TEXT,
    total_sqm NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    active_alerts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 4. TABLA: project_areas (Áreas Técnicas con Clave Foránea en Cascada)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    substrate TEXT NOT NULL 
        CHECK (substrate IN ('Acero al Carbono', 'Concreto / Hormigón', 'Acero Galvanizado', 'Aluminio', 'Tuberías Industriales', 'Pisos Epóxicos Existentes', 'Drywall / Mampostería')),
    sqm NUMERIC(10, 2) NOT NULL,
    location TEXT NOT NULL 
        CHECK (location IN ('Interior', 'Exterior', 'Sumergido / Enterrado')),
    height_meters NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    initial_condition TEXT NOT NULL 
        CHECK (initial_condition IN ('Nuevo sin pintar', 'Óxido Grado A/B', 'Óxido Severo Grado C/D', 'Pintura Envejecida Fisurada', 'Contaminado con Aceites/Químicos')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 5. TABLA: operational_conditions (Condiciones Ambientales ISO 12944)
-- Unicidad estricta por project_id para permitir upsert sin colisión
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.operational_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    humidity NUMERIC(5, 2) NOT NULL,
    ambient_temp NUMERIC(5, 2) NOT NULL,
    surface_temp NUMERIC(5, 2) NOT NULL,
    corrosivity TEXT NOT NULL 
        CHECK (corrosivity IN ('C1 (Muy Baja)', 'C2 (Baja)', 'C3 (Media)', 'C4 (Alta)', 'C5 (Muy Alta - Marina/Industrial)')),
    chemical_exposure JSONB DEFAULT '[]'::jsonb,
    traffic_type TEXT NOT NULL 
        CHECK (traffic_type IN ('Sin Tráfico', 'Peatonal Ligero', 'Peatonal Pesado', 'Montacargas / Vehicular Pesado')),
    uv_exposure TEXT NOT NULL 
        CHECK (uv_exposure IN ('Baja', 'Moderada', 'Alta Radiación Solar')),
    special_requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 6. TABLA: photographic_evidences (Evidencias y Hash Criptográfico SHA-256)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.photographic_evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT NOT NULL,
    anomaly_detected TEXT NOT NULL 
        CHECK (anomaly_detected IN ('Corrosión Puntual', 'Descascarillado', 'Fisuración', 'Ampollamiento', 'Superficie Limpia', 'Humedad Ascendente')),
    sha256_hash CHAR(64) NOT NULL,
    uploaded_by TEXT,
    uploaded_by_id UUID,
    file_size_kb INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Verificada' 
        CHECK (status IN ('Verificada', 'Pendiente', 'Rechazada')),
    technical_notes TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 7. TABLA: timeline_events (Línea de Tiempo con id UUID Estricto)
-- Resuelve el ERROR 22P02 eliminando prefijos tipo 't-123'
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    author TEXT,
    author_id UUID,
    role TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 8. TABLA: gemini_classifications (Clasificación Multicapa IA)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.gemini_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    coating_type TEXT NOT NULL,
    confidence_score NUMERIC(5, 2) NOT NULL,
    complexity TEXT NOT NULL 
        CHECK (complexity IN ('Baja', 'Media', 'Alta', 'Crítica')),
    recommended_system JSONB NOT NULL DEFAULT '[]'::jsonb,
    detected_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_data JSONB DEFAULT '[]'::jsonb,
    observations TEXT NOT NULL,
    estimated_yield_gallons INT NOT NULL DEFAULT 0,
    voc_compliance TEXT NOT NULL,
    model_used TEXT NOT NULL DEFAULT 'gemini-3.8-flash',
    classified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 9. ACTUALIZACIÓN ESTRUCTURAL DE USERS (CAMPOS AUTH & COMPANY)
-- =============================================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- =============================================================================
-- 10. ÍNDICES DE RENDIMIENTO (OPTIMIZACIÓN DE BÚSQUEDA Y JOINS)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_areas_project_id ON public.project_areas(project_id);
CREATE INDEX IF NOT EXISTS idx_operational_conditions_project_id ON public.operational_conditions(project_id);
CREATE INDEX IF NOT EXISTS idx_photographic_evidences_project_id ON public.photographic_evidences(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_project_id ON public.timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_gemini_classifications_project_id ON public.gemini_classifications(project_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);

-- =============================================================================
-- 11. FUNCIONES RLS RESISTENTES A NULL (SECURITY DEFINER)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
    RETURN COALESCE(v_role, 'Administrador'); -- Fallback seguro si no hay vinculación previa
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comp UUID;
BEGIN
    SELECT company_id INTO v_comp FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
    RETURN v_comp;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (public.get_current_user_role() = 'Administrador');
$$;

CREATE OR REPLACE FUNCTION public.is_auditor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (public.get_current_user_role() = 'Auditor');
$$;

CREATE OR REPLACE FUNCTION public.is_client()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (public.get_current_user_role() = 'Cliente');
$$;

-- =============================================================================
-- 12. POLÍTICAS ROW LEVEL SECURITY (RLS) CORREGIDAS PARA PROJECTS Y TABLAS HIJAS
-- Permite inserción atómica por Administrador y Cliente (en su respectiva empresa)
-- =============================================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographic_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemini_classifications ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas en projects y tablas hijas
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
DROP POLICY IF EXISTS "areas_manage_policy" ON public.project_areas;
DROP POLICY IF EXISTS "areas_select_policy" ON public.project_areas;
DROP POLICY IF EXISTS "conditions_manage_policy" ON public.operational_conditions;
DROP POLICY IF EXISTS "conditions_select_policy" ON public.operational_conditions;
DROP POLICY IF EXISTS "evidences_manage_policy" ON public.photographic_evidences;
DROP POLICY IF EXISTS "evidences_select_policy" ON public.photographic_evidences;
DROP POLICY IF EXISTS "timeline_manage_policy" ON public.timeline_events;
DROP POLICY IF EXISTS "timeline_select_policy" ON public.timeline_events;

-- PROJECTS
CREATE POLICY "projects_select_policy" ON public.projects
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND client_id = public.get_current_user_company_id())
    );

CREATE POLICY "projects_insert_policy" ON public.projects 
    FOR INSERT 
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND client_id = public.get_current_user_company_id())
    );

CREATE POLICY "projects_update_policy" ON public.projects 
    FOR UPDATE 
    USING (
        public.is_admin() OR 
        (public.is_client() AND client_id = public.get_current_user_company_id())
    )
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND client_id = public.get_current_user_company_id())
    );

CREATE POLICY "projects_delete_policy" ON public.projects 
    FOR DELETE USING (public.is_admin());

-- PROJECT AREAS
CREATE POLICY "areas_select_policy" ON public.project_areas
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "areas_manage_policy" ON public.project_areas
    FOR ALL
    USING (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    )
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

-- OPERATIONAL CONDITIONS
CREATE POLICY "conditions_select_policy" ON public.operational_conditions
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "conditions_manage_policy" ON public.operational_conditions
    FOR ALL
    USING (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    )
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

-- PHOTOGRAPHIC EVIDENCES
CREATE POLICY "evidences_select_policy" ON public.photographic_evidences
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "evidences_manage_policy" ON public.photographic_evidences
    FOR ALL
    USING (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    )
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

-- TIMELINE EVENTS
CREATE POLICY "timeline_select_policy" ON public.timeline_events
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "timeline_manage_policy" ON public.timeline_events
    FOR ALL
    USING (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    )
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );
