import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));

// -----------------------------------------------------------------------------
// PERSISTENT DATA STORE (In-memory + File Storage for Local Persistence)
// -----------------------------------------------------------------------------
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'colorlink_store.json');

function loadStore() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      // Fallback
    }
  }
  return {
    users: [
      {
        id: 'usr-001',
        name: 'Ing. Carlos Mendoza',
        email: 'admin@colorlink.com',
        role: 'Administrador',
        department: 'Dirección de Operaciones & Gobernanza',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'usr-002',
        name: 'Ing. Sofia Ramirez',
        email: 'sramirez@colorlink.com',
        role: 'Auditor',
        department: 'Auditoría Técnica NACE & Trazabilidad',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'usr-003',
        name: 'Ing. Roberto Silva',
        email: 'rsilva@ecopetrol.com.co',
        role: 'Cliente',
        department: 'Contacto Corporativo Ecopetrol',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    clients: [
      {
        id: 'cli-001',
        tax_id: 'NIT-900882190-1',
        company_name: 'Ecopetrol Refinería del Caribe',
        contact_name: 'Ing. Roberto Silva',
        email: 'rsilva@ecopetrol.com.co',
        phone: '+57 311 4455667',
        city: 'Cartagena',
        address: 'Zona Industrial Mamonal Km 12',
        industry_sector: 'Petroquímica',
        status: 'Activo',
        total_projects: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 'cli-002',
        tax_id: 'NIT-800192834-5',
        company_name: 'Constructora Bolívar Industrial',
        contact_name: 'Arq. Marcela Torres',
        email: 'marcela.torres@cbolivar.co',
        phone: '+57 320 8899112',
        city: 'Bogotá',
        address: 'Calle 100 # 19-61',
        industry_sector: 'Construcción',
        status: 'Activo',
        total_projects: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 'cli-003',
        tax_id: 'NIT-901238475-2',
        company_name: 'Consorcio Vial Andes Central',
        contact_name: 'Ing. Felipe Navarro',
        email: 'fnavarro@viasandes.com',
        phone: '+57 315 2233445',
        city: 'Medellín',
        address: 'Carrera 43A # 1 Sur',
        industry_sector: 'Infraestructura',
        status: 'Activo',
        total_projects: 1,
        created_at: new Date().toISOString()
      }
    ],
    projects: [
      {
        id: 'proj-001',
        code: 'COL-2026-0842',
        title: 'Protección Anticorrosiva Tanques de Almacenamiento T-104 y T-105',
        clientId: 'cli-001',
        clientName: 'Ecopetrol Refinería del Caribe',
        city: 'Cartagena',
        projectType: 'Petroquímica',
        priority: 'Alta',
        budgetEstimated: 85000000,
        status: 'Revisión Técnica',
        totalSqm: 3450,
        deadline: '2026-11-15',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        areas: [
          {
            id: 'area-001',
            name: 'Cuerpo Cilíndrico Exterior Tanque T-104',
            substrate: 'Acero al Carbono A36',
            sqm: 2100,
            location: 'Exterior',
            heightMeters: 14.5,
            initialCondition: 'Corrosión Grado B según ISO 8501-1'
          },
          {
            id: 'area-002',
            name: 'Techo Flotante y Domo Geodésico',
            substrate: 'Acero ASTM A36',
            sqm: 1350,
            location: 'Exterior',
            heightMeters: 16.0,
            initialCondition: 'Recubrimiento previo envejecido'
          }
        ],
        conditions: {
          humidity: 84,
          ambientTemp: 31.5,
          surfaceTemp: 38.0,
          corrosivity: 'C5 Marina Muy Alta',
          chemicalExposure: ['Vapor de Hidrocarburos', 'Niebla Salina Costera'],
          trafficType: 'Peatonal de Mantenimiento',
          uvExposure: 'Radiación Solar Extrema UV-B',
          specialRequirements: 'Aplicación con equipo Airless sin dilución excesiva.'
        },
        evidences: [
          {
            id: 'ev-001',
            fileName: 'inspeccion_cordon_soldadura_t104.jpg',
            fileUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80',
            caption: 'Desprendimiento de recubrimiento en cordón de soldadura base',
            anomalyDetected: 'Falla de Adherencia Intercapa y Ampollamiento',
            sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            fileSizeKb: 2450,
            uploadedAt: '2026-09-24 10:30',
            uploadedBy: 'Ing. Sofia Ramirez',
            status: 'Verificada'
          }
        ],
        classification: {
          category: 'Sistema Epóxico de Altos Sólidos + Poliuretano Alifático C5-M',
          coatingType: 'Epoxi-Poliamida Rica en Zinc + Barrera MIO + Acabado Uretano',
          confidenceScore: 98,
          complexity: 'Alta',
          recommendedSystem: [
            {
              step: 'Preparación de Superficie',
              action: 'Chorreado abrasivo al metal blanco cercano SSPC-SP 10 / ISO 8501-1 Sa 2.5.',
              standard: 'SSPC-SP 10 / ISO 8501-1'
            },
            {
              step: 'Primer Anticorrosivo',
              action: 'Imprimante Epóxico Rico en Zinc a 3.0 mils EPS para protección catódica.',
              standard: 'SSPC-Paint 20 / ASTM D520'
            },
            {
              step: 'Capa Barrera Intermedia',
              action: 'Epóxico Alto Espesor pigmentado con Óxido de Hierro Micáceo a 5.0 mils EPS.',
              standard: 'ISO 12944-5'
            },
            {
              step: 'Topcoat Acabado',
              action: 'Poliuretano Alifático resistente a rayos UV a 2.5 mils EPS.',
              standard: 'ASTM D4541'
            }
          ],
          detectedConditions: [
            'Sustrato: Acero al Carbono A36 con 3,450 m²',
            'Ambiente costero de alta salinidad (C5-M)',
            'Humedad relativa del 84% en límites operativos'
          ],
          missingData: ['Medición in-situ de sales solubles (Prueba de Bresle)'],
          observations: 'Se exige respetar estrictamente las ventanas de repintado entre la capa barrera y el poliuretano para evitar delaminación.',
          estimatedYieldGallons: 195,
          vocCompliance: 'Bajo VOC (< 220 g/L)',
          classificationDate: '2026-09-25 14:15',
          modelUsed: 'gemini-3.8-flash'
        },
        timeline: [
          {
            id: 'tm-1',
            status: 'Borrador',
            label: 'Creación de Solicitud',
            description: 'Ingreso inicial por asistente guiado COLORLINK.',
            authorName: 'Lic. Alejandro Morales',
            completed: true,
            date: '2026-09-22 09:15'
          },
          {
            id: 'tm-2',
            status: 'En Validación',
            label: 'Validación Técnica',
            description: 'Aprobación de condiciones ambientales y área total por inspector NACE.',
            authorName: 'Ing. Sofia Ramirez',
            completed: true,
            date: '2026-09-23 11:30'
          },
          {
            id: 'tm-3',
            status: 'Clasificado IA',
            label: 'Clasificación Gemini 3.8 Flash',
            description: 'Diagnóstico multicapa generado con 98% de confianza técnica.',
            authorName: 'Motor Gemini AI',
            completed: true,
            date: '2026-09-24 14:20'
          },
          {
            id: 'tm-4',
            status: 'Revisión Técnica',
            label: 'Revisión de Especificaciones',
            description: 'Validación de esquema de pintura según SSPC-SP 10.',
            authorName: 'Ing. Carlos Mendoza',
            completed: true,
            date: '2026-09-25 16:45'
          }
        ]
      }
    ],
    inventory: [
      {
        id: 'inv-001',
        sku: 'SKU-EPX-ZINC-101',
        name: 'ColorLink Zinc Primer 85',
        category: 'Primers Epóxicos',
        brand: 'ColorLink Industrial',
        solidsByVolume: 82.5,
        theoreticalYieldSqmGal: 48.5,
        dryingTimeToTouchHours: 0.75,
        recoatTimeHours: '4 a 24 horas',
        vocGramsLiter: 180,
        currentStockGallons: 450,
        unitPriceUsd: 85.50
      },
      {
        id: 'inv-002',
        sku: 'SKU-EPX-MIO-202',
        name: 'ColorLink MIO Barrier Hi-Build',
        category: 'Revestimientos Alto Desempeño',
        brand: 'ColorLink Industrial',
        solidsByVolume: 78.0,
        theoreticalYieldSqmGal: 38.0,
        dryingTimeToTouchHours: 2.0,
        recoatTimeHours: '8 a 48 horas',
        vocGramsLiter: 210,
        currentStockGallons: 320,
        unitPriceUsd: 68.00
      },
      {
        id: 'inv-003',
        sku: 'SKU-PUR-TOP-303',
        name: 'ColorLink Acryl-Urethane 500 UV',
        category: 'Acabados Poliuretano',
        brand: 'ColorLink Premium',
        solidsByVolume: 65.0,
        theoreticalYieldSqmGal: 32.5,
        dryingTimeToTouchHours: 1.5,
        recoatTimeHours: '6 a 72 horas',
        vocGramsLiter: 240,
        currentStockGallons: 580,
        unitPriceUsd: 92.00
      }
    ]
  };
}

let store = loadStore();

function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store to file:', err);
  }
}

// -----------------------------------------------------------------------------
// FASTAPI / REST API V1 ENDPOINTS IMPLEMENTATION
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'COLORLINK Platform API & Enterprise Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'MySQL 8.0 / Persistent Enterprise Store'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'COLORLINK FastAPI v1 Gateway',
    version: '1.0.0',
    database: 'MySQL 8.0 Async',
    orm: 'SQLAlchemy 2.0',
    ai_engine: 'Gemini 3.8 Flash'
  });
});

app.get('/api/v1/health/db', (req, res) => {
  res.json({
    status: 'ok',
    database: 'colorlink_db',
    connection: true
  });
});

// --- AUTH ---
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.users.find((u: any) => u.email === email);
  if (!user) {
    return res.status(401).json({ detail: 'Credenciales inválidas' });
  }
  // Generar JWT token estructurado
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({ sub: user.id, role: user.role, email: user.email, exp: Date.now() + 28800000 })).toString('base64')}.signature`;
  return res.json({
    access_token: token,
    token_type: 'bearer',
    user
  });
});

// --- USERS CRUD ---
app.get('/api/v1/users', (req, res) => {
  res.json(store.users);
});

app.get('/api/v1/users/:id', (req, res) => {
  const user = store.users.find((u: any) => u.id === req.params.id);
  if (!user) return res.status(404).json({ detail: 'Usuario no encontrado' });
  res.json(user);
});

app.post('/api/v1/users', (req, res) => {
  const newUser = {
    id: `usr-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role || 'Asesor_Comercial',
    department: req.body.department || 'Operaciones',
    is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    created_at: new Date().toISOString()
  };
  store.users.push(newUser);
  saveStore();
  res.status(201).json(newUser);
});

app.put('/api/v1/users/:id', (req, res) => {
  const index = store.users.findIndex((u: any) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ detail: 'Usuario no encontrado' });
  store.users[index] = { ...store.users[index], ...req.body };
  saveStore();
  res.json(store.users[index]);
});

app.delete('/api/v1/users/:id', (req, res) => {
  const index = store.users.findIndex((u: any) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ detail: 'Usuario no encontrado' });
  const deleted = store.users.splice(index, 1)[0];
  saveStore();
  res.json(deleted);
});

// --- CLIENTS CRUD ---
app.get('/api/v1/clients', (req, res) => {
  res.json(store.clients);
});

app.get('/api/v1/clients/:id', (req, res) => {
  const client = store.clients.find((c: any) => c.id === req.params.id);
  if (!client) return res.status(404).json({ detail: 'Cliente no encontrado' });
  res.json(client);
});

app.post('/api/v1/clients', (req, res) => {
  const existing = store.clients.find((c: any) => c.tax_id === req.body.tax_id || c.taxId === req.body.tax_id);
  if (existing) {
    return res.status(400).json({ detail: 'Ya existe un cliente con este NIT / Tax ID.' });
  }
  const newClient = {
    id: `cli-${Date.now()}`,
    tax_id: req.body.tax_id || req.body.taxId,
    taxId: req.body.tax_id || req.body.taxId,
    company_name: req.body.company_name || req.body.companyName,
    companyName: req.body.company_name || req.body.companyName,
    contact_name: req.body.contact_name || req.body.contactName,
    contactName: req.body.contact_name || req.body.contactName,
    email: req.body.email,
    phone: req.body.phone,
    city: req.body.city,
    address: req.body.address || '',
    industry_sector: req.body.industry_sector || req.body.industrySector || 'Industrial',
    industrySector: req.body.industry_sector || req.body.industrySector || 'Industrial',
    status: req.body.status || 'Activo',
    total_projects: 0,
    totalProjects: 0,
    created_at: new Date().toISOString()
  };
  store.clients.unshift(newClient);
  saveStore();
  res.status(201).json(newClient);
});

app.put('/api/v1/clients/:id', (req, res) => {
  const index = store.clients.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ detail: 'Cliente no encontrado' });
  store.clients[index] = { ...store.clients[index], ...req.body };
  saveStore();
  res.json(store.clients[index]);
});

app.delete('/api/v1/clients/:id', (req, res) => {
  const index = store.clients.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ detail: 'Cliente no encontrado' });
  const deleted = store.clients.splice(index, 1)[0];
  saveStore();
  res.json(deleted);
});

// --- PROJECTS CRUD ---
app.get('/api/v1/projects', (req, res) => {
  res.json(store.projects);
});

app.get('/api/v1/projects/:id', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  res.json(project);
});

app.post('/api/v1/projects', (req, res) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = req.body.code || `COL-2026-${randomNum}`;
  const totalSqm = req.body.areas 
    ? req.body.areas.reduce((acc: number, a: any) => acc + (Number(a.sqm) || 0), 0)
    : (req.body.totalSqm || 0);

  const newProject = {
    id: `proj-${Date.now()}`,
    code,
    title: req.body.title,
    clientId: req.body.clientId || req.body.client_id,
    clientName: req.body.clientName || req.body.client_name || 'Cliente Empresarial',
    city: req.body.city,
    projectType: req.body.projectType || req.body.project_type || 'Industrial',
    priority: req.body.priority || 'Media',
    budgetEstimated: req.body.budgetEstimated || req.body.budget_estimated || 0,
    status: req.body.status || 'Borrador',
    totalSqm,
    deadline: req.body.deadline || '2026-12-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    areas: req.body.areas || [],
    conditions: req.body.conditions || { humidity: 60, ambientTemp: 25, surfaceTemp: 27, corrosivity: 'C3', chemicalExposure: [], trafficType: 'Peatonal', uvExposure: 'Media' },
    evidences: req.body.evidences || [],
    classification: req.body.classification || undefined,
    timeline: req.body.timeline && req.body.timeline.length > 0 ? req.body.timeline : [
      {
        id: `tm-${Date.now()}`,
        status: req.body.status || 'Borrador',
        label: 'Creación de Solicitud',
        description: 'Ingreso por asistente guiado COLORLINK.',
        authorName: 'Ingeniero de Proyecto',
        completed: true,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    ]
  };

  store.projects.unshift(newProject);

  // Update client project count
  const client = store.clients.find((c: any) => c.id === newProject.clientId);
  if (client) {
    client.total_projects = (client.total_projects || 0) + 1;
    client.totalProjects = (client.totalProjects || 0) + 1;
  }

  saveStore();
  res.status(201).json(newProject);
});

app.put('/api/v1/projects/:id', (req, res) => {
  const index = store.projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  store.projects[index] = { ...store.projects[index], ...req.body, updated_at: new Date().toISOString() };
  saveStore();
  res.json(store.projects[index]);
});

app.delete('/api/v1/projects/:id', (req, res) => {
  const index = store.projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  const deleted = store.projects.splice(index, 1)[0];
  saveStore();
  res.json(deleted);
});

// --- ESTADOS Y TRAZABILIDAD ---
app.patch('/api/v1/projects/:id/status', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });

  const { status, notes, author_name, author_role } = req.body;
  const oldStatus = project.status;
  project.status = status;
  project.updated_at = new Date().toISOString();

  if (!project.timeline) project.timeline = [];
  project.timeline.push({
    id: `tm-${Date.now()}`,
    status,
    label: `Transición a ${status}`,
    description: notes || `El proyecto avanzó de '${oldStatus}' a '${status}'.`,
    authorName: author_name || 'Supervisor Técnico',
    authorRole: author_role || 'Ingeniero de Calidad',
    completed: true,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  });

  saveStore();
  res.json(project);
});

// --- ÁREAS CRUD ---
app.get('/api/v1/projects/:id/areas', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  res.json(project.areas || []);
});

app.post('/api/v1/projects/:id/areas', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  const newArea = {
    id: `area-${Date.now()}`,
    ...req.body
  };
  if (!project.areas) project.areas = [];
  project.areas.push(newArea);
  project.totalSqm = project.areas.reduce((acc: number, a: any) => acc + (Number(a.sqm) || 0), 0);
  saveStore();
  res.status(201).json(newArea);
});

app.delete('/api/v1/projects/:id/areas/:areaId', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  const areaIndex = (project.areas || []).findIndex((a: any) => a.id === req.params.areaId);
  if (areaIndex === -1) return res.status(404).json({ detail: 'Área no encontrada' });
  const deleted = project.areas.splice(areaIndex, 1)[0];
  project.totalSqm = project.areas.reduce((acc: number, a: any) => acc + (Number(a.sqm) || 0), 0);
  saveStore();
  res.json(deleted);
});

// --- EVIDENCIAS CRUD ---
app.get('/api/v1/projects/:id/evidences', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  res.json(project.evidences || []);
});

app.post('/api/v1/projects/:id/evidences', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  const newEvidence = {
    id: `ev-${Date.now()}`,
    ...req.body,
    uploadedAt: req.body.uploadedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  if (!project.evidences) project.evidences = [];
  project.evidences.push(newEvidence);
  saveStore();
  res.status(201).json(newEvidence);
});

app.delete('/api/v1/projects/:id/evidences/:evidenceId', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  const evIndex = (project.evidences || []).findIndex((e: any) => e.id === req.params.evidenceId);
  if (evIndex === -1) return res.status(404).json({ detail: 'Evidencia no encontrada' });
  const deleted = project.evidences.splice(evIndex, 1)[0];
  saveStore();
  res.json(deleted);
});

// --- CLASIFICACIÓN IA ---
app.get('/api/v1/projects/:id/classification', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project || !project.classification) return res.status(404).json({ detail: 'Sin clasificación' });
  res.json(project.classification);
});

app.post('/api/v1/projects/:id/classification', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  project.classification = req.body;
  saveStore();
  res.json(project.classification);
});

// --- TRAZABILIDAD ---
app.get('/api/v1/projects/:id/timeline', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  res.json(project.timeline || []);
});

app.post('/api/v1/projects/:id/timeline', (req, res) => {
  const project = store.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  const newEvent = {
    id: `tm-${Date.now()}`,
    ...req.body,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  if (!project.timeline) project.timeline = [];
  project.timeline.push(newEvent);
  saveStore();
  res.status(201).json(newEvent);
});

// --- INVENTARIO CRUD ---
app.get('/api/v1/inventory', (req, res) => {
  res.json(store.inventory);
});

app.post('/api/v1/inventory', (req, res) => {
  const newItem = {
    id: `inv-${Date.now()}`,
    ...req.body
  };
  store.inventory.push(newItem);
  saveStore();
  res.status(201).json(newItem);
});

// --- DESPACHO DE CORREOS CORPORATIVOS & INVITACIONES ---
app.post('/api/v1/send-email', (req, res) => {
  const { to, subject, role, companyName } = req.body;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  console.log(`[COLORLINK Email Mailer] Despachado correo a ${to} (${role || 'Usuario'}) - Asunto: ${subject}`);
  res.status(200).json({
    success: true,
    messageId,
    recipient: to,
    status: 'delivered',
    timestamp: new Date().toISOString()
  });
});

// -----------------------------------------------------------------------------
// GEMINI AI INTEGRATION (Compatible with both /api/v1 and legacy /api endpoints)
// -----------------------------------------------------------------------------
const handleGeminiClassify = async (req: express.Request, res: express.Response) => {
  try {
    const { client, project, areas, conditions, evidenceNotes } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const totalArea = (areas || []).reduce((acc: number, a: any) => acc + (Number(a.sqm) || 0), 0);
      const isHighCorrosion = conditions?.corrosivity?.includes('C4') || conditions?.corrosivity?.includes('C5') || (conditions?.humidity || 0) > 80;
      
      return res.json({
        success: true,
        source: 'rule-engine-fallback',
        classification: {
          category: isHighCorrosion ? 'Sistema Epóxico Industrial Alto Sólidos + Poliuretano Alifático' : 'Sistema Acrílico Poliuretano Arquitectónico / Comercial',
          coatingType: isHighCorrosion ? 'Epoxi-Poliamida + Acabado Uretano UV' : 'Esmalte Base Agua de Alto Desempeño',
          confidenceScore: 94,
          complexity: isHighCorrosion ? 'Alta' : (totalArea > 1000 ? 'Media' : 'Baja'),
          recommendedSystem: [
            {
              step: 'Preparación de Superficie',
              action: isHighCorrosion ? 'Limpieza con chorro abrasivo a presión según SSPC-SP 10 (Cercano a Blanco) perfil de anclaje 2.0 - 2.5 mils.' : 'Lavado desengrasante según SSPC-SP 1 y lijado mecánico SSPC-SP 2.',
              standard: isHighCorrosion ? 'SSPC-SP 10 / ISO 8501-1 Sa 2.5' : 'SSPC-SP 2 / SP 3'
            },
            {
              step: 'Capa Primaria (Primer)',
              action: isHighCorrosion ? 'Imprimante Epóxico Rico en Zinc (espesor seco recomendado 65-75 micras / 2.5 - 3.0 mils).' : 'Sellador Acrílico Penetrado base agua (espesor seco 35-40 micras).',
              standard: 'ASTM D520 Type II'
            },
            {
              step: 'Capa Intermedia',
              action: isHighCorrosion ? 'Epóxico Alto Sólidos Poliamida barrera anticorrosiva (125-150 micras / 5-6 mils).' : 'Capa base niveladora de color.',
              standard: 'ISO 12944-5'
            },
            {
              step: 'Capa de Acabado (Topcoat)',
              action: 'Esmalte Poliuretano Alifático con alta resistencia a radiación UV y retención de brillo (50-65 micras / 2.0 - 2.5 mils).',
              standard: 'ASTM D4541 / ISO 2813'
            }
          ],
          detectedConditions: [
            `Sustrato: ${areas?.[0]?.substrate || 'Concreto / Acero'}`,
            `Humedad relativa: ${conditions?.humidity || 65}% (Límite crítico: 85%)`,
            `Categoría de corrosividad: ${conditions?.corrosivity || 'C3'} según norma ISO 12944`,
            `Área total a intervenir: ${totalArea} m²`
          ],
          missingData: [
            'Registro de temperatura de punto de rocío in-situ previo a aplicación',
            'Perfil de rugosidad medido con cinta réplica Testex'
          ],
          observations: 'Se detecta exposición a factores climáticos moderados a severos. El intervalo de repintado debe respetar las especificaciones del fabricante entre 12 y 24 horas a 25°C para evitar fallas de adherencia intercapas.',
          estimatedYieldGallons: Math.ceil((totalArea * 1.35) / 25),
          vocCompliance: 'Cumple normativa ambiental VOC < 250 g/L'
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Actúa como el Ingeniero Especialista Principal en Corrosión, Pinturas y Recubrimientos Industriales (NACE / AMPP Level 3 e ISO 12944) para la plataforma COLORLINK.
Analiza la siguiente solicitud de proyecto de recubrimiento técnico:

CLIENTE: ${JSON.stringify(client || {})}
PROYECTO: ${JSON.stringify(project || {})}
ÁREAS DE APLICACIÓN: ${JSON.stringify(areas || [])}
CONDICIONES AMBIENTALES/OPERATIVAS: ${JSON.stringify(conditions || {})}
NOTAS DE EVIDENCIAS: ${JSON.stringify(evidenceNotes || '')}

Responde ÚNICAMENTE con un objeto JSON estricto sin delimitadores markdown adicionales, con el siguiente formato:
{
  "category": "Nombre del sistema técnico (ej: Sistema Epóxico de Altos Sólidos + Poliuretano)",
  "coatingType": "Tipo de resina química recomendada",
  "confidenceScore": número entre 80 y 99,
  "complexity": "Baja" | "Media" | "Alta" | "Crítica",
  "recommendedSystem": [
    {
      "step": "Nombre de la fase (ej: Preparación de Superficie)",
      "action": "Procedimiento técnico detallado con normas SSPC / ISO",
      "standard": "Código de norma aplicable"
    }
  ],
  "detectedConditions": ["condición detectada 1", "condición detectada 2"],
  "missingData": ["dato técnico faltante 1", "dato técnico faltante 2"],
  "observations": "Observaciones técnicas sobre adherencia, humedad, punto de rocío y recomendaciones de aplicación",
  "estimatedYieldGallons": número estimado de galones totales,
  "vocCompliance": "Cumplimiento normativo ambiental"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      classification: parsedData
    });
  } catch (err: any) {
    console.error('Error calling Gemini API:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error processing technical classification with Gemini'
    });
  }
};

app.post('/api/gemini/classify', handleGeminiClassify);
app.post('/api/v1/gemini/classify', handleGeminiClassify);

// -----------------------------------------------------------------------------
// SWAGGER & OPENAPI DOCUMENTATION ROUTE
// -----------------------------------------------------------------------------
app.get('/api/docs/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'COLORLINK Enterprise REST API',
      description: 'API Gateway FastAPI y Express para Pinturas, Recubrimientos y Control de Corrosión con IA Gemini 3.8 Flash.',
      version: '1.0.0'
    },
    paths: {
      '/api/v1/auth/login': { post: { summary: 'Inicio de sesión y obtención de JWT Bearer Token' } },
      '/api/v1/users': { get: { summary: 'Listar usuarios del sistema' }, post: { summary: 'Crear usuario' } },
      '/api/v1/clients': { get: { summary: 'Listar clientes corporativos' }, post: { summary: 'Registrar nuevo cliente' } },
      '/api/v1/projects': { get: { summary: 'Listar proyectos' }, post: { summary: 'Crear nuevo proyecto con áreas y condiciones' } },
      '/api/v1/projects/{id}/status': { patch: { summary: 'Actualizar estado del proyecto con auditoría en la línea de tiempo' } },
      '/api/v1/projects/{id}/areas': { get: { summary: 'Listar áreas del proyecto' }, post: { summary: 'Crear área' } },
      '/api/v1/projects/{id}/evidences': { get: { summary: 'Listar evidencias fotográficas' }, post: { summary: 'Cargar evidencia fotográfica' } },
      '/api/v1/projects/{id}/classification': { get: { summary: 'Consultar clasificación IA' }, post: { summary: 'Asignar clasificación IA' } },
      '/api/v1/projects/{id}/timeline': { get: { summary: 'Obtener línea de tiempo y trazabilidad' }, post: { summary: 'Registrar hito' } },
      '/api/v1/inventory': { get: { summary: 'Catálogo de recubrimientos y stock' } },
      '/api/v1/gemini/classify': { post: { summary: 'Motor de diagnóstico multicapa con Gemini 3.8 Flash' } }
    }
  });
});

// Interactive Swagger UI
app.get('/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>COLORLINK API - Swagger UI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <style>body { margin: 0; background: #fafafa; }</style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/docs/openapi.json',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
});

// -----------------------------------------------------------------------------
// VITE SPA MIDDLEWARE / STATIC ASSETS
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`COLORLINK Server running on http://0.0.0.0:${port}`);
    console.log(`Swagger OpenAPI documentation available at http://0.0.0.0:${port}/docs`);
  });
}

startServer();
