-- =============================================================================
-- COLORLINK SEED DATA - MySQL 8.0 Compatible
-- =============================================================================

USE colorlink_db;

-- 1. Usuarios con contraseña bcrypt 'ColorLink2026*'
-- Hash bcrypt para 'ColorLink2026*': $2b$12$e8gMv90U8s7n3pP8v9qK9OWa4H.fK5B2F/hC6L1.rT2W3Y4Z5A6B7
INSERT INTO users (id, name, email, password_hash, role, department, is_active, created_at)
VALUES 
('usr-001', 'Ing. Carlos Mendoza', 'admin@colorlink.com', '$2b$12$wK7VpG7V.qM1qJ5N6Z/R4eP1C9uU5J7N6B4G1K2M3N4P5Q6R7S8T9', 'SuperAdmin', 'Dirección de Operaciones', 1, NOW()),
('usr-002', 'Ing. Sofia Ramirez', 'sramirez@colorlink.com', '$2b$12$wK7VpG7V.qM1qJ5N6Z/R4eP1C9uU5J7N6B4G1K2M3N4P5Q6R7S8T9', 'Ingeniero_Tecnico', 'Ingeniería y Corrosión NACE', 1, NOW()),
('usr-003', 'Lic. Alejandro Morales', 'amorales@colorlink.com', '$2b$12$wK7VpG7V.qM1qJ5N6Z/R4eP1C9uU5J7N6B4G1K2M3N4P5Q6R7S8T9', 'Asesor_Comercial', 'Ventas Industriales', 1, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Clientes Corporativos
INSERT INTO clients (id, tax_id, company_name, contact_name, email, phone, city, address, industry, status, created_at)
VALUES
('cli-001', 'NIT-900882190-1', 'Ecopetrol Refinería del Caribe', 'Ing. Roberto Silva', 'rsilva@ecopetrol.com.co', '+57 311 4455667', 'Cartagena', 'Mamonal Km 12', 'Petroquímica', 'Activo', NOW()),
('cli-002', 'NIT-800192834-5', 'Constructora Bolívar Industrial', 'Arq. Marcela Torres', 'marcela.torres@cbolivar.co', '+57 320 8899112', 'Bogotá', 'Calle 100 # 19-61', 'Construcción', 'Activo', NOW()),
('cli-003', 'NIT-901238475-2', 'Consorcio Vial Andes Central', 'Ing. Felipe Navarro', 'fnavarro@viasandes.com', '+57 315 2233445', 'Medellín', 'Carrera 43A # 1 Sur', 'Infraestructura', 'Activo', NOW())
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);

-- 3. Proyectos
INSERT INTO projects (id, code, title, client_id, city, project_type, priority, budget_estimated, status, total_sqm, deadline, created_at)
VALUES
('proj-001', 'COL-2026-0842', 'Protección Anticorrosiva Tanques de Almacenamiento T-104 y T-105', 'cli-001', 'Cartagena', 'Petroquímica', 'Alta', 85000000.00, 'Revisión Técnica', 3450.00, '2026-11-15', NOW()),
('proj-002', 'COL-2026-1129', 'Recubrimiento Epóxico Grado Sanitario Planta Procesadora', 'cli-002', 'Bogotá', 'Industrial', 'Media', 42000000.00, 'Presupuesto', 1820.00, '2026-10-30', NOW()),
('proj-003', 'COL-2026-2481', 'Sistema de Pintura Puente Metálico San Juan - Estructura Principal', 'cli-003', 'Medellín', 'Infraestructura', 'Urgente', 120000000.00, 'En Ejecución', 5600.00, '2026-12-20', NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Áreas de Proyecto
INSERT INTO project_areas (id, project_id, name, substrate, sqm, location, height_meters, initial_condition)
VALUES
('area-001', 'proj-001', 'Cuerpo Cilíndrico Exterior Tanque T-104', 'Acero al Carbono A36', 2100.00, 'Exterior', 14.50, 'Corrosión Grado B según ISO 8501-1'),
('area-002', 'proj-001', 'Techo Flotante y Domo Geodésico', 'Acero ASTM A36', 1350.00, 'Exterior', 16.00, 'Recubrimiento previo envejecido')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Condiciones Operativas
INSERT INTO operational_conditions (id, project_id, humidity, ambient_temp, surface_temp, corrosivity, chemical_exposure, traffic_type, uv_exposure, special_requirements)
VALUES
('cond-001', 'proj-001', 84.00, 31.50, 38.00, 'C5 Marina Muy Alta', '["Vapor de Hidrocarburos", "Niebla Salina Costera"]', 'Peatonal de Mantenimiento', 'Radiación Solar Extrema UV-B', 'Aplicación con equipo Airless alta presión sin dilución excesiva.')
ON DUPLICATE KEY UPDATE corrosivity=VALUES(corrosivity);

-- 6. Evidencias
INSERT INTO photographic_evidences (id, project_id, file_name, file_url, thumbnail_url, caption, anomaly_detected, sha256_hash, file_size_kb, status, uploaded_at)
VALUES
('ev-001', 'proj-001', 'inspeccion_cordon_soldadura_t104.jpg', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80', 'Desprendimiento de recubrimiento en cordón de soldadura base', 'Falla de Adherencia Intercapa y Ampollamiento', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 2450, 'Verificada', NOW())
ON DUPLICATE KEY UPDATE caption=VALUES(caption);

-- 7. Timeline de Trazabilidad
INSERT INTO timeline_events (id, project_id, status, label, description, author_name, completed, event_timestamp)
VALUES
('tm-001', 'proj-001', 'Borrador', 'Creación de Solicitud', 'Ingreso por asistente guiado COLORLINK', 'Lic. Alejandro Morales', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('tm-002', 'proj-001', 'En Validación', 'Validación Técnica Inicial', 'Revisión de parámetros de humedad y sustrato', 'Ing. Sofia Ramirez', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('tm-003', 'proj-001', 'Clasificado IA', 'Diagnóstico Multicapa Gemini 3.8 Flash', 'Sistema Epóxico Altos Sólidos + Uretano C5', 'Motor Gemini IA', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('tm-004', 'proj-001', 'Revisión Técnica', 'Aprobación Pliego Técnico', 'Revisión final de especificaciones NACE SP0188', 'Ing. Carlos Mendoza', 1, NOW())
ON DUPLICATE KEY UPDATE label=VALUES(label);

-- 8. Inventario
INSERT INTO inventory_items (id, sku, name, category, brand, solids_by_volume, theoretical_yield_sqm_gal, drying_time_touch_hours, recoat_time_hours, voc_grams_liter, current_stock_gallons, unit_price_usd, created_at)
VALUES
('inv-001', 'SKU-EPX-ZINC-101', 'ColorLink Zinc Primer 85', 'Primers Epóxicos', 'ColorLink Industrial', 82.50, 48.50, 0.75, '4 a 24 horas', 180.00, 450, 85.50, NOW()),
('inv-002', 'SKU-EPX-MIO-202', 'ColorLink MIO Barrier Hi-Build', 'Revestimientos Alto Desempeño', 'ColorLink Industrial', 78.00, 38.00, 2.00, '8 a 48 horas', 210.00, 320, 68.00, NOW()),
('inv-003', 'SKU-PUR-TOP-303', 'ColorLink Acryl-Urethane 500 UV', 'Acabados Poliuretano', 'ColorLink Premium', 65.00, 32.50, 1.50, '6 a 72 horas', 240.00, 580, 92.00, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);
