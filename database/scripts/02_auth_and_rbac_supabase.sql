-- =============================================================================
-- COLORLINK ENTERPRISE - SUPABASE AUTH & RBAC POLICIES (MIGRACIÓN OFICIAL)
-- Arquitectura de Control de Acceso Basado en Roles (RBAC) y Seguridad RLS
-- Roles Oficiales: 'Administrador' | 'Auditor' | 'Cliente'
-- =============================================================================

-- 1. TABLA DE EMPRESAS CORPORATIVAS (COMPANIES)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    tax_id TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    city TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo', 'En Validación')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sincronizar clientes existentes a companies para retrocompatibilidad total
INSERT INTO public.companies (id, company_name, tax_id, email, phone, city, address, status, created_at, updated_at)
SELECT id, company_name, tax_id, email, phone, city, address, status, created_at, updated_at
FROM public.clients
ON CONFLICT (id) DO NOTHING;

-- 2. ACTUALIZACIÓN ESTRUCTURAL DE TABLA USERS
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- PASO A: Eliminar PRIMERO el constraint CHECK antiguo para permitir nuevos valores
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_users_role;

-- Ajustar valor por defecto del campo role
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'Cliente';

-- PASO B: Ejecutar la normalización de roles ahora que no hay restricción activa
UPDATE public.users SET role = 'Administrador' WHERE role IN ('SuperAdmin', 'admin', 'Administrador');
UPDATE public.users SET role = 'Auditor' WHERE role IN ('Ingeniero_Tecnico', 'Auditor_Calidad', 'auditor', 'Auditor');
UPDATE public.users SET role = 'Cliente' WHERE role NOT IN ('Administrador', 'Auditor');

-- PASO C: Crear el NUEVO constraint CHECK con los 3 roles oficiales permitidos
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('Administrador', 'Auditor', 'Cliente'));

-- Asociar usuarios de prueba clientes con sus respectivas empresas
UPDATE public.users 
SET company_id = 'b0000000-0000-0000-0000-000000000001' 
WHERE email = 'rsilva@petrocaribe.com.co';

-- 3. AUDITORÍA FORENSE - TABLA AUDIT_LOGS
-- Validación de eventos requeridos: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, PASSWORD_RESET, USER_CREATED
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_target_type_check;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_target_type_check 
    CHECK (target_type IN ('Proyecto', 'Cliente', 'Clasificación IA', 'Evidencia', 'Sistema', 'Seguridad', 'Empresa'));

-- 4. ÍNDICES DE RENDIMIENTO PARA SEGURIDAD
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_companies_tax ON public.companies(tax_id);

-- 5. FUNCIONES AUXILIARES SECURITY DEFINER PARA RLS (PREVENCIÓN DE RECURSIÓN)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
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

-- 6. CONFIGURACIÓN DE POLÍTICAS ROW LEVEL SECURITY (RLS) BLINDADAS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographic_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemini_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas
DROP POLICY IF EXISTS "Public Manage Companies" ON public.companies;
DROP POLICY IF EXISTS "RBAC Companies Policy" ON public.companies;
DROP POLICY IF EXISTS "RBAC Users Policy" ON public.users;
DROP POLICY IF EXISTS "RBAC Projects Access" ON public.projects;
DROP POLICY IF EXISTS "RBAC Audit Logs Insert" ON public.audit_logs;
DROP POLICY IF EXISTS "RBAC Audit Logs Select" ON public.audit_logs;
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON public.clients;
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
DROP POLICY IF EXISTS "evidences_select_policy" ON public.photographic_evidences;
DROP POLICY IF EXISTS "evidences_insert_policy" ON public.photographic_evidences;
DROP POLICY IF EXISTS "evidences_update_policy" ON public.photographic_evidences;
DROP POLICY IF EXISTS "evidences_delete_policy" ON public.photographic_evidences;

-- A. Clientes / Empresas
CREATE POLICY "clients_select_policy" ON public.clients
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND id = public.get_current_user_company_id())
    );
CREATE POLICY "clients_insert_policy" ON public.clients FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "clients_update_policy" ON public.clients FOR UPDATE 
    USING (public.is_admin() OR (public.is_client() AND id = public.get_current_user_company_id()))
    WITH CHECK (public.is_admin() OR (public.is_client() AND id = public.get_current_user_company_id()));
CREATE POLICY "clients_delete_policy" ON public.clients FOR DELETE USING (public.is_admin());

-- B. Proyectos
CREATE POLICY "projects_select_policy" ON public.projects
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND client_id = public.get_current_user_company_id())
    );
CREATE POLICY "projects_insert_policy" ON public.projects FOR INSERT 
    WITH CHECK (public.is_admin() OR (public.is_client() AND client_id = public.get_current_user_company_id()));
CREATE POLICY "projects_update_policy" ON public.projects FOR UPDATE 
    USING (public.is_admin() OR (public.is_client() AND client_id = public.get_current_user_company_id()))
    WITH CHECK (public.is_admin() OR (public.is_client() AND client_id = public.get_current_user_company_id()));
CREATE POLICY "projects_delete_policy" ON public.projects FOR DELETE USING (public.is_admin());

-- C. Evidencias Fotográficas
CREATE POLICY "evidences_select_policy" ON public.photographic_evidences
    FOR SELECT USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );
CREATE POLICY "evidences_insert_policy" ON public.photographic_evidences FOR INSERT 
    WITH CHECK (public.is_admin() OR (public.is_client() AND project_id IN (
        SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
    )));
CREATE POLICY "evidences_update_policy" ON public.photographic_evidences FOR UPDATE 
    USING (public.is_admin() OR (public.is_client() AND project_id IN (
        SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
    )))
    WITH CHECK (public.is_admin() OR (public.is_client() AND project_id IN (
        SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
    )));
CREATE POLICY "evidences_delete_policy" ON public.photographic_evidences FOR DELETE USING (public.is_admin());

-- D. Auditoría Forense
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
    FOR SELECT USING (public.is_admin() OR public.is_auditor());
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- 7. TRIGGER PARA SINCRONIZACIÓN AUTOMÁTICA AUTH.USERS -> PUBLIC.USERS
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID := NULL;
    v_raw_comp_id TEXT;
BEGIN
    v_raw_comp_id := NEW.raw_user_meta_data->>'company_id';
    IF v_raw_comp_id IS NOT NULL AND v_raw_comp_id ~ '^[0-9a-fA-F-]{36}$' THEN
        v_company_id := v_raw_comp_id::UUID;
    END IF;

    INSERT INTO public.users (
        id,
        auth_user_id,
        name,
        email,
        role,
        department,
        company_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'Cliente'),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Acceso Corporativo'),
        v_company_id,
        true,
        now(),
        now()
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        auth_user_id = EXCLUDED.auth_user_id,
        company_id = COALESCE(public.users.company_id, EXCLUDED.company_id),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador en auth.users (si está disponible en el entorno)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
