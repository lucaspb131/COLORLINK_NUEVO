# 🎨 COLORLINK: Transformación Digital Inteligente en Pintura y Recubrimientos

## 1. Visión y Arquitectura Empresarial
COLORLINK es una plataforma tecnológica integral diseñada para resolver la falta de trazabilidad, estandarización técnica e inspección forense en la industria de recubrimientos industriales, marinos y comerciales.

La solución combina:
- **Motor de Clasificación y Diagnóstico IA:** Impulsado por Google Gemini (`gemini-3.8-flash`) para determinar esquemas multicapa según la norma **ISO 12944** y preparación de superficie **SSPC / NACE**.
- **Cadena de Custodia Criptográfica:** Cálculo de firmas **SHA-256** para cada fotografía levantada en obra, previniendo litigios y garantizando la integridad pericial.
- **Flujo Guiado (Wizard 9 Pasos):** Asistente paso a paso con alertas inteligentes en tiempo real (humedad crítica > 80%, casos duplicados, metrajes inconsistentes).
- **Línea de Tiempo Interactiva:** Trazabilidad estricta desde la creación de la solicitud hasta el cierre y entrega de póliza de garantía.
- **Doble Modalidad de Despliegue:**
  - Aplicación Web Interactiva lista para ejecución.
  - Orquestación en contenedores con **Docker Compose**, **FastAPI**, **Streamlit** y **MySQL 8.0**.

---

## 2. Diagrama de Arquitectura
```
+-------------------------------------------------------------------------------+
|                             CLIENTE / NAVEGADOR                              |
|   - SPA React + Vite / Tailwind CSS  (Puerto 3000)                             |
|   - Frontend Streamlit SaaS          (Puerto 8501)                             |
+-------------------------------------------------------------------------------+
                                      |
                               REST API / JSON
                                      |
+-------------------------------------------------------------------------------+
|                        BACKEND API GATEWAY (FastAPI)                          |
|   - Servidor Uvicorn / Asíncrono                                              |
|   - Autenticación JWT & Hashing bcrypt                                       |
|   - ORM SQLAlchemy 2.0 & Validaciones Pydantic                                |
|   - Router /api/v1 (auth, clients, projects, evidences, gemini, inventory)    |
+-------------------------------------------------------------------------------+
                  |                                           |
                  v                                           v
+------------------------------------+     +------------------------------------+
|         DATABASE (MySQL 8.0)       |     |        MOTOR IA (Google Gemini)    |
| - Esquema Relacional Normalizado   |     | - Modelo: gemini-3.8-flash          |
| - Llaves Foráneas e Índices B-Tree |     | - Inferencia JSON Estricta         |
| - Registro Inmutable AuditLogs     |     | - Evaluación de Normas ISO 12944   |
+------------------------------------+     +------------------------------------+
```

---

## 3. Modelo Entidad-Relación (MySQL Workbench)
Las tablas principales son:
1. `users`: Gestión de personal y roles RBAC (`SuperAdmin`, `Ingeniero_Tecnico`, `Asesor_Comercial`, `Auditor_Calidad`).
2. `clients`: Directorio empresarial con NIT, contactos, dirección y sector económico.
3. `projects`: Expediente central con código `COL-2026-XXXX`, estado y presupuesto.
4. `project_areas`: Áreas geométricas, sustrato (Acero, Hormigón, etc.), m² y grado de corrosión.
5. `operational_conditions`: Humedad %, temperatura ambiental y de sustrato, corrosividad C1 a C5 y exposición química.
6. `photographic_evidences`: Fotografías periciales con hash SHA-256 y anomalía detectada.
7. `gemini_classifications`: Dictamen técnico de Gemini con sistema multicapa, espesores y recomendaciones.
8. `timeline_events`: Hitos de seguimiento auditados con fecha, hora y responsable.
9. `inventory_items`: Catálogo de pinturas con sólidos por volumen, rendimiento teórico y VOC.
10. `audit_logs`: Registro forense de modificaciones del sistema.

---

## 4. Despliegue Local con Docker Compose
```bash
# Iniciar servicios con Docker
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```
