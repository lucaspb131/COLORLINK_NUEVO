export type UserRole = 'Administrador' | 'Auditor' | 'Cliente';

export interface User {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  companyId?: string;
  companyName?: string;
  clientId?: string;
  lastLogin?: string;
}

export interface Company {
  id: string;
  companyName: string;
  taxId: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  status: 'Activo' | 'Inactivo' | 'En Validación';
}

export interface Client {
  id: string;
  taxId: string; // NIT / RUC
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  industry: 'Industrial' | 'Construcción' | 'Marino' | 'Infraestructura' | 'Petroquímica' | 'Comercial';
  status: 'Activo' | 'Inactivo' | 'En Validación';
  createdAt: string;
  totalProjects: number;
}

export type SubstrateType = 
  | 'Acero al Carbono' 
  | 'Concreto / Hormigón' 
  | 'Acero Galvanizado' 
  | 'Aluminio' 
  | 'Tuberías Industriales' 
  | 'Pisos Epóxicos Existentes' 
  | 'Drywall / Mampostería';

export interface ProjectArea {
  id: string;
  name: string;
  substrate: SubstrateType;
  sqm: number; // m²
  location: 'Interior' | 'Exterior' | 'Sumergido / Enterrado';
  heightMeters: number;
  initialCondition: 'Nuevo sin pintar' | 'Óxido Grado A/B' | 'Óxido Severo Grado C/D' | 'Pintura Envejecida Fisurada' | 'Contaminado con Aceites/Químicos';
}

export type CorrosivityCategory = 'C1 (Muy Baja)' | 'C2 (Baja)' | 'C3 (Media)' | 'C4 (Alta)' | 'C5 (Muy Alta - Marina/Industrial)';

export interface OperationalConditions {
  humidity: number; // %
  ambientTemp: number; // °C
  surfaceTemp: number; // °C
  corrosivity: CorrosivityCategory;
  chemicalExposure: string[]; // e.g. ["Ácidos", "Solventes", "Gases de Azufre", "Salinidad"]
  trafficType: 'Sin Tráfico' | 'Peatonal Ligero' | 'Peatonal Pesado' | 'Montacargas / Vehicular Pesado';
  uvExposure: 'Baja' | 'Moderada' | 'Alta Radiación Solar';
  specialRequirements?: string;
}

export interface PhotographicEvidence {
  id: string;
  projectId?: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string;
  caption: string;
  anomalyDetected: 'Corrosión Puntual' | 'Descascarillado' | 'Fisuración' | 'Ampollamiento' | 'Superficie Limpia' | 'Humedad Ascendente';
  sha256Hash: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSizeKb: number;
  status: 'Verificada' | 'Pendiente' | 'Rechazada';
  technicalNotes?: string;
}

export interface CoatingSystemStep {
  step: string;
  action: string;
  standard: string;
  filmThicknessMicrons?: string;
}

export interface GeminiClassification {
  category: string;
  coatingType: string;
  confidenceScore: number;
  complexity: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  recommendedSystem: CoatingSystemStep[];
  detectedConditions: string[];
  missingData: string[];
  observations: string;
  estimatedYieldGallons: number;
  vocCompliance: string;
  classificationDate: string;
  modelUsed: string;
}

export type ProjectStatus = 
  | 'Borrador' 
  | 'En Validación' 
  | 'Clasificado IA' 
  | 'Revisión Técnica' 
  | 'Presupuesto' 
  | 'Aprobado' 
  | 'En Ejecución' 
  | 'Cierre';

export interface TimelineEvent {
  id: string;
  status: ProjectStatus;
  label: string;
  description: string;
  date: string;
  author: string;
  role: string;
  completed: boolean;
  notes?: string;
}

export interface Project {
  id: string;
  code: string; // COL-2026-XXXX
  title: string;
  clientId: string;
  clientName: string;
  city: string;
  projectType: 'Industrial' | 'Comercial' | 'Marino' | 'Estructuras Metálicas' | 'Infraestructura';
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  budgetEstimated: number; // USD / Local
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  areas: ProjectArea[];
  conditions: OperationalConditions;
  evidences: PhotographicEvidence[];
  classification?: GeminiClassification;
  timeline: TimelineEvent[];
  assignedEngineer: string;
  assignedSalesperson: string;
  totalSqm: number;
  activeAlerts: string[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Primers Epóxicos' | 'Acabados Poliuretano' | 'Selladores' | 'Esmaltes Alquídicos' | 'Revestimientos Alto Desempeño' | 'Diluyentes';
  brand: string;
  solidsByVolume: number; // %
  theoreticalYieldSqmGal: number; // m²/gal a 1 mil espesor seco
  dryingTimeTouchHours: number;
  recoatTimeHours: string;
  vocGramsLiter: number;
  currentStockGallons: number;
  unitPriceUSD: number;
  technicalSheetUrl: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  targetType: 'Proyecto' | 'Cliente' | 'Clasificación IA' | 'Evidencia' | 'Sistema';
  targetId: string;
  details: string;
  ipAddress: string;
}
