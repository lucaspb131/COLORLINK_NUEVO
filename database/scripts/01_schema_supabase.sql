-- =============================================================================
-- COLORLINK PLATFORM - SUPABASE POSTGRESQL SCHEMA COMPATIBLE (VERSIÓN AUDITADA)
-- Plataforma de Transformación Digital Inteligente en Pintura y Recubrimientos
-- =============================================================================

-- Habilitar extensión para generación de identificadores universales únicos (UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLA: users (Usuarios y Roles RBAC)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Asesor_Comercial' 
        CHECK (role IN ('SuperAdmin', 'Ingeniero_Tecnico', 'Asesor_Comercial', 'Auditor_Calidad')),
    department TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. TABLA: clients (Clientes Corporativos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_id TEXT NOT NULL UNIQUE, -- NIT / RUC
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    industry TEXT NOT NULL 
        CHECK (industry IN ('Industrial', 'Construcción', 'Marino', 'Infraestructura', 'Petroquímica', 'Comercial')),
    status TEXT NOT NULL DEFAULT 'Activo' 
        CHECK (status IN ('Activo', 'Inactivo', 'En Validación')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. TABLA: projects (Proyectos Principales de Recubrimiento)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- Formato: COL-2026-XXXX
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
    assigned_engineer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_salesperson_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_engineer TEXT,
    assigned_salesperson TEXT,
    total_sqm NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    active_alerts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 4. TABLA: project_areas (Áreas y Geometrías del Proyecto)
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
-- 5. TABLA: operational_conditions (Condiciones Ambientales e ISO 12944)
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
    uploaded_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    file_size_kb INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Verificada' 
        CHECK (status IN ('Verificada', 'Pendiente', 'Rechazada')),
    technical_notes TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 7. TABLA: gemini_classifications (Diagnóstico Multicapa Gemini 3.8 Flash)
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
-- 8. TABLA: timeline_events (Trazabilidad y Línea de Tiempo del Proyecto)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL 
        CHECK (status IN ('Borrador', 'En Validación', 'Clasificado IA', 'Revisión Técnica', 'Presupuesto', 'Aprobado', 'En Ejecución', 'Cierre')),
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    author TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    role TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 9. TABLA: inventory_items (Catálogo de Pinturas y Recubrimientos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL 
        CHECK (category IN ('Primers Epóxicos', 'Acabados Poliuretano', 'Selladores', 'Esmaltes Alquídicos', 'Revestimientos Alto Desempeño', 'Diluyentes')),
    brand TEXT NOT NULL,
    solids_by_volume NUMERIC(5, 2) NOT NULL,
    theoretical_yield_sqm_gal NUMERIC(6, 2) NOT NULL,
    drying_time_touch_hours NUMERIC(4, 2) NOT NULL,
    recoat_time_hours TEXT NOT NULL,
    voc_grams_liter NUMERIC(6, 2) NOT NULL,
    current_stock_gallons INT NOT NULL DEFAULT 0,
    unit_price_usd NUMERIC(10, 2) NOT NULL,
    technical_sheet_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 10. TABLA: audit_logs (Auditoría Forense y Logs de Seguridad)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name TEXT,
    role TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL 
        CHECK (target_type IN ('Proyecto', 'Cliente', 'Clasificación IA', 'Evidencia', 'Sistema')),
    target_id TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- ÍNDICES DE RENDIMIENTO
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_clients_tax_id ON public.clients(tax_id);
CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_areas_project ON public.project_areas(project_id);
CREATE INDEX IF NOT EXISTS idx_evidences_project ON public.photographic_evidences(project_id);
CREATE INDEX IF NOT EXISTS idx_evidences_hash ON public.photographic_evidences(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_timeline_project ON public.timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);

-- =============================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS) PARA SUPABASE
-- Permite lectura y escritura desde la aplicación web COLORLINK mediante la Anon Key
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographic_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemini_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Manage Users" ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Manage Clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Project Areas" ON public.project_areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Conditions" ON public.operational_conditions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Evidences" ON public.photographic_evidences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Classifications" ON public.gemini_classifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Timeline" ON public.timeline_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Inventory" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Audit" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- DATOS INICIALES (SEED DATA VALIDADO AL 100% CON TODOS LOS CHECK CONSTRAINTS)
-- =============================================================================

-- 1. users: CHECK (role IN ('SuperAdmin', 'Ingeniero_Tecnico', 'Asesor_Comercial', 'Auditor_Calidad'))
INSERT INTO public.users (id, name, email, password_hash, role, department, is_active)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Ing. Carlos Mendoza', 'carlos.mendoza@colorlink.tech', '$2b$12$wK7VpG7V.qM1qJ5N6Z/R4eP1C9uU5J7N6B4G1K2M3N4P5Q6R7S8T9', 'SuperAdmin', 'Dirección de Operaciones', true),
    ('a0000000-0000-0000-0000-000000000002', 'Ing. Laura Pardo', 'laura.pardo@colorlink.tech', '$2b$12$wK7VpG7V.qM1qJ5N6Z/R4eP1C9uU5J7N6B4G1K2M3N4P5Q6R7S8T9', 'Ingeniero_Tecnico', 'Ingeniería y Corrosión NACE', true),
    ('a0000000-0000-0000-0000-000000000003', 'David Cardona', 'david.cardona@colorlink.tech', '$2b$12$wK7VpG7V.qM1qJ5N6Z/R4eP1C9uU5J7N6B4G1K2M3N4P5Q6R7S8T9', 'Asesor_Comercial', 'Ventas Técnicas Industriales', true)
ON CONFLICT (id) DO NOTHING;

-- 2. clients: CHECK industry, status
INSERT INTO public.clients (id, tax_id, company_name, contact_name, email, phone, city, address, industry, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', '900.845.120-4', 'Petroquímica del Caribe S.A.', 'Ing. Roberto Silva', 'rsilva@petrocaribe.com.co', '+57 310 445 8899', 'Cartagena', 'Zona Industrial Mamonal Km 7', 'Petroquímica', 'Activo'),
    ('b0000000-0000-0000-0000-000000000002', '860.012.399-1', 'Constructora Metrópoli & Infraestructura', 'Arq. Mariana Restrepo', 'mrestrepo@metropoli-infra.co', '+57 315 889 0012', 'Medellín', 'Cra 43A # 1Sur - 100, El Poblado', 'Construcción', 'Activo'),
    ('b0000000-0000-0000-0000-000000000003', '800.223.771-8', 'Terminal Marítimo del Pacífico S.A.', 'Cap. Andrés Valencia', 'avalencia@termpacifico.com', '+57 320 671 2244', 'Barranquilla', 'Puerto Industrial Vía 40 # 85-20', 'Marino', 'Activo')
ON CONFLICT (id) DO NOTHING;

-- 3. projects: CHECK project_type, priority, status
INSERT INTO public.projects (id, code, title, client_id, client_name, city, project_type, priority, budget_estimated, status, total_sqm, deadline, assigned_engineer, assigned_salesperson)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'COL-2026-0842', 'Protección Anticorrosiva Tanques de Almacenamiento T-104 y T-105', 'b0000000-0000-0000-0000-000000000001', 'Petroquímica del Caribe S.A.', 'Cartagena', 'Petroquímica', 'Alta', 85000000.00, 'Revisión Técnica', 3450.00, '2026-11-15', 'Ing. Carlos Mendoza', 'David Cardona'),
    ('c0000000-0000-0000-0000-000000000002', 'COL-2026-1129', 'Recubrimiento Epóxico Grado Sanitario Planta Procesadora', 'b0000000-0000-0000-0000-000000000002', 'Constructora Metrópoli & Infraestructura', 'Bogotá', 'Industrial', 'Media', 42000000.00, 'Presupuesto', 1820.00, '2026-10-30', 'Ing. Laura Pardo', 'David Cardona')
ON CONFLICT (id) DO NOTHING;

-- 4. project_areas: CHECK substrate, location, initial_condition
INSERT INTO public.project_areas (id, project_id, name, substrate, sqm, location, height_meters, initial_condition)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Cuerpo Cilíndrico Exterior Tanque T-104', 'Acero al Carbono', 2100.00, 'Exterior', 14.50, 'Óxido Severo Grado C/D'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Techo Flotante y Domo Geodésico', 'Acero al Carbono', 1350.00, 'Exterior', 16.00, 'Pintura Envejecida Fisurada')
ON CONFLICT (id) DO NOTHING;

-- 5. operational_conditions: CHECK corrosivity, traffic_type, uv_exposure
INSERT INTO public.operational_conditions (id, project_id, humidity, ambient_temp, surface_temp, corrosivity, chemical_exposure, traffic_type, uv_exposure, special_requirements)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 84.00, 31.50, 38.00, 'C5 (Muy Alta - Marina/Industrial)', '["Vapor de Hidrocarburos", "Niebla Salina Costera"]'::jsonb, 'Peatonal Ligero', 'Alta Radiación Solar', 'Aplicación con equipo Airless alta presión sin dilución excesiva.')
ON CONFLICT (id) DO NOTHING;

-- 6. photographic_evidences: CHECK status, anomaly_detected
INSERT INTO public.photographic_evidences (id, project_id, file_name, file_url, thumbnail_url, caption, anomaly_detected, sha256_hash, uploaded_by, uploaded_by_id, file_size_kb, status, technical_notes)
VALUES 
    ('f1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'inspeccion_corrosion_manto_tk101.jpg', 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f', 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f', 'Desprendimiento de recubrimiento previo y corrosión laminar en zona de traslape.', 'Corrosión Puntual', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Ing. Carlos Mendoza', 'a0000000-0000-0000-0000-000000000001', 3420, 'Verificada', 'Profundidad de picadura estimada en 0.8 mm. Requiere granallado SSPC-SP 10.'),
    ('f1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'cubeto_hormigon_grietas.jpg', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 'Fisuras por contracción y ataque químico superficial en hormigón del cubeto.', 'Fisuración', 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', 'Ing. Laura Pardo', 'a0000000-0000-0000-0000-000000000002', 2890, 'Verificada', 'Aplicar mortero epóxico de reparación antes del recubrimiento autonivelante.')
ON CONFLICT (id) DO NOTHING;

-- 7. gemini_classifications: CHECK complexity
INSERT INTO public.gemini_classifications (id, project_id, category, coating_type, confidence_score, complexity, recommended_system, detected_conditions, missing_data, observations, estimated_yield_gallons, voc_compliance, model_used)
VALUES 
    ('f2000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Sistema Tri-Capa Epoxi-Zinc / Epoxi Alto Sólidos / Poliuretano Alifático', 'Poliamida Epoxi + Topcoat Uretano UV', 97.00, 'Crítica', '[{"step": "1. Preparación de Superficie", "action": "Granallado abrasivo al metal cercano al blanco según SSPC-SP 10", "standard": "SSPC-SP 10"}, {"step": "2. Capa Imprimante", "action": "Epóxico Rico en Zinc de 3 mils EPS", "standard": "SSPC-Paint 20"}, {"step": "3. Capa Barrera", "action": "Epóxico MIO de 5 mils EPS", "standard": "ISO 12944-5"}, {"step": "4. Capa Acabado", "action": "Poliuretano Alifático de 2.5 mils EPS", "standard": "ASTM D4541"}]'::jsonb, '["Ambiente Marino C5 con HR 82%", "Contaminación salina"]'::jsonb, '["Curva horaria de punto de rocío"]'::jsonb, 'El régimen de aplicación no debe superar el 85% de humedad relativa.', 245, 'Bajo VOC (< 220 g/L) certificado ISO 14001', 'gemini-3.8-flash')
ON CONFLICT (id) DO NOTHING;

-- 8. timeline_events: CHECK status
INSERT INTO public.timeline_events (id, project_id, status, label, description, author, author_id, role, completed)
VALUES 
    ('f3000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Borrador', 'Creación de Solicitud', 'Ingreso inicial por asistente guiado COLORLINK.', 'David Cardona', 'a0000000-0000-0000-0000-000000000003', 'Asesor Comercial', true),
    ('f3000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'En Validación', 'Validación Técnica Inicial', 'Revisión de parámetros de humedad y sustrato en Cartagena.', 'Ing. Laura Pardo', 'a0000000-0000-0000-0000-000000000002', 'Ingeniero Técnico', true),
    ('f3000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Clasificado IA', 'Diagnóstico Multicapa Gemini 3.8 Flash', 'Sistema Epóxico Altos Sólidos + Uretano C5 con 97% de confianza.', 'Motor Gemini IA', NULL, 'Sistema IA', true),
    ('f3000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Revisión Técnica', 'Aprobación de Ingeniería', 'Revisión final de especificaciones según pliego técnico NACE SP0188.', 'Ing. Carlos Mendoza', 'a0000000-0000-0000-0000-000000000001', 'Director Técnico', true)
ON CONFLICT (id) DO NOTHING;

-- 9. inventory_items: CHECK category
INSERT INTO public.inventory_items (id, sku, name, category, brand, solids_by_volume, theoretical_yield_sqm_gal, drying_time_touch_hours, recoat_time_hours, voc_grams_liter, current_stock_gallons, unit_price_usd)
VALUES 
    ('f0000000-0000-0000-0000-000000000001', 'COL-EPX-801', 'ColorLink Epoxy Barrier HS', 'Primers Epóxicos', 'ColorLink Pro', 82.00, 31.00, 2.50, '4 - 24 horas', 180.00, 450, 78.50),
    ('f0000000-0000-0000-0000-000000000002', 'COL-PUR-900', 'ColorLink Urethane Shield 2K', 'Acabados Poliuretano', 'ColorLink Pro', 68.00, 25.50, 1.50, '3 - 18 horas', 220.00, 320, 94.00),
    ('f0000000-0000-0000-0000-000000000003', 'COL-ZNC-705', 'ColorLink Zinc Rich Silicate', 'Primers Epóxicos', 'ColorLink Industrial', 85.00, 32.50, 0.75, '2 - 12 horas', 140.00, 180, 125.00)
ON CONFLICT (id) DO NOTHING;

-- 10. audit_logs: CHECK target_type
INSERT INTO public.audit_logs (id, user_id, user_name, role, action, target_type, target_id, details, ip_address)
VALUES 
    ('f4000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Ing. Carlos Mendoza', 'SuperAdmin', 'CREATE_PROJECT', 'Proyecto', 'c0000000-0000-0000-0000-000000000001', 'Creación y registro formal del proyecto COL-2026-0842 en plataforma.', '190.157.34.12'),
    ('f4000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'David Cardona', 'Asesor_Comercial', 'REGISTER_CLIENT', 'Cliente', 'b0000000-0000-0000-0000-000000000001', 'Alta corporativa del cliente Petroquímica del Caribe S.A.', '186.84.110.55')
ON CONFLICT (id) DO NOTHING;
