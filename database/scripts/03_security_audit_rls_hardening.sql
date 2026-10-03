-- =============================================================================
-- COLORLINK ENTERPRISE - AUDITORÍA DE SEGURIDAD Y POLÍTICAS RLS BLINDADAS
-- Archivo: database/scripts/03_security_audit_rls_hardening.sql
-- Propósito: Garantizar aislamiento estricto Multi-Inquilino (Multi-Tenancy)
-- y cumplimiento de privilegios RBAC:
--   1. Administrador: Control Total (SELECT, INSERT, UPDATE, DELETE)
--   2. Auditor: Solo Lectura (SELECT en proyectos, clientes, evidencias, reportes, logs)
--               Sin permisos de eliminación (DELETE) ni modificación destructiva.
--   3. Cliente: Aislamiento estricto por company_id (Solo ve y gestiona sus propios
--               proyectos, evidencias y reportes técnicos; NUNCA de terceros).
-- =============================================================================

-- =============================================================================
-- PASO 1: FUNCIONES AUXILIARES SECURITY DEFINER (Prevención de Recursión RLS)
-- =============================================================================

-- Obtiene el rol del usuario autenticado actual desde public.users
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Obtiene el company_id asignado al usuario autenticado actual
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Funciones booleanas de validación rápida
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
-- PASO 2: ACTIVACIÓN OBLIGATORIA DE RLS EN TODAS LAS TABLAS
-- =============================================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographic_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemini_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PASO 3: ELIMINACIÓN DE POLÍTICAS INSEGURAS / PERMISIVAS ANTERIORES
-- (Eliminación de cualquier política con "auth.role() = 'authenticated'" o "USING (true)")
-- =============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- =============================================================================
-- PASO 4: POLÍTICAS RLS BLINDADAS POR TABLA
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. TABLA: clients & companies (Empresas y Clientes Corporativos)
-- Regla:
--   - Administrador y Auditor pueden consultar todos los clientes.
--   - Cliente SOLO puede consultar su propia empresa (id = current_user_company_id).
--   - Solo Administrador puede crear o eliminar clientes.
-- -----------------------------------------------------------------------------
CREATE POLICY "clients_select_policy" ON public.clients
    FOR SELECT
    USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND id = public.get_current_user_company_id())
    );

CREATE POLICY "clients_insert_policy" ON public.clients
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "clients_update_policy" ON public.clients
    FOR UPDATE
    USING (
        public.is_admin() OR 
        (public.is_client() AND id = public.get_current_user_company_id())
    )
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND id = public.get_current_user_company_id())
    );

CREATE POLICY "clients_delete_policy" ON public.clients
    FOR DELETE
    USING (public.is_admin());

-- Replicar en tabla companies si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        EXECUTE '
        CREATE POLICY "companies_select_policy" ON public.companies
            FOR SELECT
            USING (
                public.is_admin() OR 
                public.is_auditor() OR 
                (public.is_client() AND id = public.get_current_user_company_id())
            );

        CREATE POLICY "companies_insert_policy" ON public.companies
            FOR INSERT
            WITH CHECK (public.is_admin());

        CREATE POLICY "companies_update_policy" ON public.companies
            FOR UPDATE
            USING (
                public.is_admin() OR 
                (public.is_client() AND id = public.get_current_user_company_id())
            )
            WITH CHECK (
                public.is_admin() OR 
                (public.is_client() AND id = public.get_current_user_company_id())
            );

        CREATE POLICY "companies_delete_policy" ON public.companies
            FOR DELETE
            USING (public.is_admin());
        ';
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- B. TABLA: projects (Proyectos Principales)
-- Regla:
--   - Administrador: Acceso total (SELECT, INSERT, UPDATE, DELETE).
--   - Auditor: Consulta total (SELECT), sin permisos de INSERT, UPDATE ni DELETE.
--   - Cliente: Consulta y creación ÚNICAMENTE de proyectos de su empresa (client_id = current_user_company_id).
-- -----------------------------------------------------------------------------
CREATE POLICY "projects_select_policy" ON public.projects
    FOR SELECT
    USING (
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
    FOR DELETE
    USING (public.is_admin()); -- Auditor y Cliente bloqueados para eliminación

-- -----------------------------------------------------------------------------
-- C. TABLA: photographic_evidences (Evidencias y Hash Criptográfico SHA-256)
-- Regla:
--   - Administrador: Total.
--   - Auditor: Solo lectura de evidencias.
--   - Cliente: Solo evidencias de proyectos pertenecientes a su empresa.
-- -----------------------------------------------------------------------------
CREATE POLICY "evidences_select_policy" ON public.photographic_evidences
    FOR SELECT
    USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "evidences_insert_policy" ON public.photographic_evidences
    FOR INSERT
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "evidences_update_policy" ON public.photographic_evidences
    FOR UPDATE
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

CREATE POLICY "evidences_delete_policy" ON public.photographic_evidences
    FOR DELETE
    USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- D. TABLA: gemini_classifications (Reportes Técnicos y Diagnósticos IA)
-- Regla:
--   - Administrador: Total.
--   - Auditor: Solo lectura de reportes técnicos.
--   - Cliente: Solo reportes de proyectos pertenecientes a su empresa.
-- -----------------------------------------------------------------------------
CREATE POLICY "classifications_select_policy" ON public.gemini_classifications
    FOR SELECT
    USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "classifications_insert_policy" ON public.gemini_classifications
    FOR INSERT
    WITH CHECK (
        public.is_admin() OR 
        (public.is_client() AND project_id IN (
            SELECT id FROM public.projects WHERE client_id = public.get_current_user_company_id()
        ))
    );

CREATE POLICY "classifications_update_policy" ON public.gemini_classifications
    FOR UPDATE
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

CREATE POLICY "classifications_delete_policy" ON public.gemini_classifications
    FOR DELETE
    USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- E. TABLAS HIJAS: project_areas, operational_conditions, timeline_events
-- Regla: Heredan el aislamiento por project_id del cliente correspondiente.
-- -----------------------------------------------------------------------------
CREATE POLICY "areas_select_policy" ON public.project_areas
    FOR SELECT
    USING (
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

CREATE POLICY "conditions_select_policy" ON public.operational_conditions
    FOR SELECT
    USING (
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

CREATE POLICY "timeline_select_policy" ON public.timeline_events
    FOR SELECT
    USING (
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

-- -----------------------------------------------------------------------------
-- F. TABLA: users (Directorio de Usuarios y Cuentas)
-- Regla:
--   - Administrador: Gestiona todos los usuarios.
--   - Auditor: Consulta directorio técnico.
--   - Cliente: Solo puede ver su propio usuario o usuarios de su misma empresa.
-- -----------------------------------------------------------------------------
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT
    USING (
        public.is_admin() OR 
        public.is_auditor() OR 
        auth_user_id = auth.uid() OR
        (public.is_client() AND company_id = public.get_current_user_company_id())
    );

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT
    WITH CHECK (public.is_admin() OR auth_user_id = auth.uid());

CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE
    USING (public.is_admin() OR auth_user_id = auth.uid())
    WITH CHECK (public.is_admin() OR auth_user_id = auth.uid());

CREATE POLICY "users_delete_policy" ON public.users
    FOR DELETE
    USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- G. TABLA: audit_logs (Bitácora Forense y Gobernanza)
-- Regla:
--   - Administrador y Auditor: Pueden consultar la bitácora de eventos.
--   - Cliente: ACCESO DENEGADO (No puede consultar registros forenses globales).
--   - Inserción permitida para registrar eventos de seguridad y logins.
--   - Inmutabilidad estricta: NADIE puede modificar ni borrar registros de auditoría.
-- -----------------------------------------------------------------------------
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
    FOR SELECT
    USING (public.is_admin() OR public.is_auditor());

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
    FOR INSERT
    WITH CHECK (true); -- Permite registro de eventos del sistema y autenticación

-- Modificación y eliminación bloqueadas expresamente (inmutabilidad forense)
-- (Al no existir UPDATE ni DELETE policy, PostgreSQL deniega ambas por defecto con RLS activado)

-- -----------------------------------------------------------------------------
-- H. TABLA: inventory_items (Insumos y Pinturas Industriales)
-- Regla:
--   - Administrador: Gestión total.
--   - Auditor y Cliente: Consulta de especificaciones técnicas.
-- -----------------------------------------------------------------------------
CREATE POLICY "inventory_select_policy" ON public.inventory_items
    FOR SELECT
    USING (true); -- Catálogo técnico consultable por usuarios autenticados

CREATE POLICY "inventory_manage_policy" ON public.inventory_items
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =============================================================================
-- PASO 5: DISPARADOR DE SINCRONIZACIÓN AUTOMÁTICA AUTH.USERS -> PUBLIC.USERS
-- Sincroniza id, auth_user_id, rol, empresa y metadatos con aislamiento estricto
-- =============================================================================
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

