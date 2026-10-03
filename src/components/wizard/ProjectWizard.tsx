import React, { useState, useMemo } from 'react';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  AlertTriangle, 
  Camera, 
  Plus, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  User, 
  Building, 
  Layers, 
  Droplets, 
  Thermometer, 
  Hash, 
  Download,
  X
} from 'lucide-react';
import { 
  Client, 
  Project, 
  ProjectArea, 
  OperationalConditions, 
  PhotographicEvidence, 
  GeminiClassification, 
  SubstrateType, 
  CorrosivityCategory 
} from '../../types';
import { requestGeminiClassification } from '../../services/geminiService';
import { calculateSha256, generateMockSha256 } from '../../services/hashService';
import { GeminiPanel } from './GeminiPanel';
import { BudgetInputField } from '../common/BudgetInputField';
import { generateUUID } from '../../services/apiService';

interface ProjectWizardProps {
  clients: Client[];
  existingProjects: Project[];
  onComplete: (newProject: Project) => void;
  onCancel: () => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({
  clients,
  existingProjects,
  onComplete,
  onCancel,
}) => {
  // Current wizard step 1 to 9
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 9;

  // Step 1: Client data
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'new');
  const [clientData, setClientData] = useState({
    companyName: clients[0]?.companyName || '',
    taxId: clients[0]?.taxId || '',
    contactName: clients[0]?.contactName || '',
    email: clients[0]?.email || '',
    phone: clients[0]?.phone || '',
    city: clients[0]?.city || 'Bogotá',
    industry: clients[0]?.industry || 'Industrial',
  });

  // Step 2: Project general data
  const [projectData, setProjectData] = useState({
    title: '',
    city: 'Bogotá',
    projectType: 'Industrial' as const,
    priority: 'Media' as const,
    budgetEstimated: 25000,
    deadline: '2026-11-30',
  });

  // Step 3: Areas list
  const [areas, setAreas] = useState<ProjectArea[]>([
    {
      id: 'area-new-1',
      name: 'Estructura Principal / Cubierta',
      substrate: 'Acero al Carbono',
      sqm: 1200,
      location: 'Exterior',
      heightMeters: 6,
      initialCondition: 'Óxido Grado A/B',
    }
  ]);

  // Step 4: Conditions
  const [conditions, setConditions] = useState<OperationalConditions>({
    humidity: 72,
    ambientTemp: 24,
    surfaceTemp: 27,
    corrosivity: 'C3 (Media)',
    chemicalExposure: ['Gases Industriales', 'Lluvia Ácida'],
    trafficType: 'Peatonal Ligero',
    uvExposure: 'Alta Radiación Solar',
    specialRequirements: 'Aplicar según especificaciones de la norma SSPC / ISO 12944.',
  });

  // Step 5: Evidences
  const [evidences, setEvidences] = useState<PhotographicEvidence[]>([
    {
      id: 'ev-wiz-1',
      fileName: 'inspeccion_previa_superficie.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=200',
      caption: 'Descascarillado de pintura existente y corrosión localizada en uniones soldadas.',
      anomalyDetected: 'Corrosión Puntual',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadedBy: 'Ingeniero Evaluador',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileSizeKb: 2450,
      status: 'Verificada',
      technicalNotes: 'Superficie requiere preparación mecánica rigurosa.',
    }
  ]);

  // Step 7: Gemini AI classification state
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [classification, setClassification] = useState<GeminiClassification | null>(null);

  // Step 9: Confirmed project result
  const [confirmedProject, setConfirmedProject] = useState<Project | null>(null);

  // Dynamic Intelligent Alerts based on inputs
  const dynamicAlerts = useMemo(() => {
    const alerts: string[] = [];

    // Alert 1: High Humidity
    if (conditions.humidity >= 80) {
      alerts.push(`⚠ Humedad detectada (${conditions.humidity}%): Crítica. Riesgo severo de condensación o desprendimiento intercapas.`);
    }

    // Alert 2: Technical Evaluation Required
    const isCriticalCorrosion = conditions.corrosivity.includes('C4') || conditions.corrosivity.includes('C5');
    const hasSeverelyRustedArea = areas.some(a => a.initialCondition.includes('Óxido Severo'));
    if (isCriticalCorrosion || hasSeverelyRustedArea) {
      alerts.push('⚠ Posible evaluación técnica especializada requerida (NACE / AMPP Level 3).');
    }

    // Alert 3: Duplicate Case Detection
    const duplicateMatch = existingProjects.find(p => 
      p.clientName.toLowerCase() === clientData.companyName.toLowerCase() &&
      p.city.toLowerCase() === projectData.city.toLowerCase() &&
      p.projectType === projectData.projectType
    );
    if (duplicateMatch) {
      alerts.push(`⚠ Posible caso duplicado detectado con el proyecto existente "${duplicateMatch.title}" (${duplicateMatch.code}).`);
    }

    // Alert 4: Area Inconsistency
    const totalSqm = areas.reduce((acc, a) => acc + (Number(a.sqm) || 0), 0);
    if (totalSqm <= 0) {
      alerts.push('⚠ Área inconsistente: El metraje total debe ser mayor a 0 m².');
    } else if (totalSqm > 30000) {
      alerts.push('⚠ Área inconsistente o de escala mega-industrial (> 30,000 m²): Se sugiere fraccionar por fases.');
    }

    return alerts;
  }, [conditions.humidity, conditions.corrosivity, areas, existingProjects, clientData.companyName, projectData.city, projectData.projectType]);

  // Step Names
  const stepTitles = [
    'Datos del Cliente',
    'Datos del Proyecto',
    'Áreas',
    'Condiciones',
    'Evidencias',
    'Validación',
    'Clasificación IA',
    'Resumen',
    'Confirmación'
  ];

  // Handler when changing client in dropdown
  const handleClientSelectChange = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'new') {
      setClientData({
        companyName: '',
        taxId: '',
        contactName: '',
        email: '',
        phone: '',
        city: 'Bogotá',
        industry: 'Industrial',
      });
    } else {
      const found = clients.find(c => c.id === clientId);
      if (found) {
        setClientData({
          companyName: found.companyName,
          taxId: found.taxId,
          contactName: found.contactName,
          email: found.email,
          phone: found.phone,
          city: found.city,
          industry: found.industry,
        });
        setProjectData(prev => ({ ...prev, city: found.city }));
      }
    }
  };

  // Add Area
  const handleAddArea = () => {
    const newArea: ProjectArea = {
      id: `area-new-${areas.length + 1}`,
      name: `Área Intervención #${areas.length + 1}`,
      substrate: 'Concreto / Hormigón',
      sqm: 450,
      location: 'Interior',
      heightMeters: 3,
      initialCondition: 'Nuevo sin pintar',
    };
    setAreas([...areas, newArea]);
  };

  // Remove Area
  const handleRemoveArea = (id: string) => {
    if (areas.length > 1) {
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  // Update Area field
  const handleUpdateArea = (id: string, field: keyof ProjectArea, value: any) => {
    setAreas(areas.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // File upload simulation with SHA-256 hash
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const hash = await calculateSha256(file);
      const url = URL.createObjectURL(file);

      const newEvidence: PhotographicEvidence = {
        id: `ev-${Date.now()}`,
        fileName: file.name,
        fileUrl: url,
        thumbnailUrl: url,
        caption: 'Evidencia fotográfica levantada en inspección inicial',
        anomalyDetected: 'Corrosión Puntual',
        sha256Hash: hash,
        uploadedBy: 'Ing. Evaluador COLORLINK',
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        fileSizeKb: Math.round(file.size / 1024),
        status: 'Verificada',
        technicalNotes: 'Archivo íntegro con firma criptográfica SHA-256 generada.',
      };

      setEvidences([...evidences, newEvidence]);
    }
  };

  // Run Gemini AI Classification on step 7
  const triggerAiClassification = async () => {
    setIsAiLoading(true);
    try {
      const res = await requestGeminiClassification({
        client: clientData,
        project: projectData,
        areas,
        conditions,
        evidenceNotes: evidences.map(e => `${e.caption} (${e.anomalyDetected})`).join('; ')
      });
      setClassification(res.classification);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Step 9: Finalize project creation
  const handleFinalizeProject = () => {
    const projectCode = `COL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalSqm = areas.reduce((acc, a) => acc + (Number(a.sqm) || 0), 0);

    const resolvedClient = selectedClientId !== 'new' 
      ? clients.find(c => c.id === selectedClientId)
      : null;

    const resolvedClientId = resolvedClient 
      ? resolvedClient.id 
      : generateUUID();

    const resolvedClientName = resolvedClient 
      ? resolvedClient.companyName 
      : (clientData.companyName || 'Cliente Industrial');

    const newProject: Project = {
      id: generateUUID(),
      code: projectCode,
      title: projectData.title || `Proyecto de Recubrimiento ${resolvedClientName}`,
      clientId: resolvedClientId,
      clientName: resolvedClientName,
      city: projectData.city,
      projectType: projectData.projectType,
      priority: projectData.priority,
      budgetEstimated: projectData.budgetEstimated !== undefined && projectData.budgetEstimated !== null 
        ? Number(projectData.budgetEstimated) 
        : 0,
      status: 'Clasificado IA',
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
      deadline: projectData.deadline,
      areas: areas.map(a => ({
        ...a,
        id: a.id && !a.id.startsWith('area-') ? a.id : generateUUID(),
        sqm: Number(a.sqm) || 0,
        heightMeters: Number(a.heightMeters) || 0,
      })),
      conditions,
      evidences: evidences.map(e => ({
        ...e,
        id: e.id && !e.id.startsWith('ev-') ? e.id : generateUUID(),
      })),
      classification: classification || undefined,
      totalSqm,
      activeAlerts: dynamicAlerts,
      assignedEngineer: 'Ing. Carlos Mendoza',
      assignedSalesperson: 'David Cardona',
      timeline: [
        {
          id: generateUUID(),
          status: 'Borrador',
          label: 'Creación de Solicitud',
          description: 'Ingreso oficial a través del Wizard asistido en 9 pasos.',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: 'Usuario Activo',
          role: 'Asesor Técnico',
          completed: true,
        },
        {
          id: generateUUID(),
          status: 'En Validación',
          label: 'Validación Técnica Inicial',
          description: 'Validaciones de humedad y sustrato aprobadas.',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: 'Motor de Validación COLORLINK',
          role: 'Sistema',
          completed: true,
        },
        {
          id: generateUUID(),
          status: 'Clasificado IA',
          label: 'Clasificación Gemini AI',
          description: `Sistema multicapa asignado (${classification?.category || 'Epóxico'}).`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: 'Motor IA Gemini 3.8 Flash',
          role: 'Motor IA',
          completed: true,
        }
      ]
    };

    setConfirmedProject(newProject);
    onComplete(newProject);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-5xl mx-auto my-4 transition-all">
      {/* Wizard Header with Progress Bar */}
      <div className="bg-slate-900 text-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Asistente Guiado de Captura Técnica</span>
            </div>
            <h2 className="text-xl font-black mt-0.5 tracking-tight">
              Paso {currentStep} de {totalSteps}: {stepTitles[currentStep - 1]}
            </h2>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Track */}
        <div className="relative">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step circles */}
          <div className="flex justify-between items-center mt-3 text-[10px] font-semibold text-slate-400">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isPast = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center cursor-pointer transition-colors ${
                    isCurrent ? 'text-blue-400 font-bold' : isPast ? 'text-slate-300' : 'text-slate-600'
                  }`}
                  onClick={() => {
                    // Allow navigating backwards or forwards if valid
                    if (stepNumber <= currentStep || (stepNumber === currentStep + 1)) {
                      setCurrentStep(stepNumber);
                    }
                  }}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 transition-all ${
                    isCurrent 
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                      : isPast 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isPast ? <Check className="w-3 h-3" /> : stepNumber}
                  </div>
                  <span className="hidden md:inline truncate max-w-[70px] text-center">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Alerts Banner if any */}
      {dynamicAlerts.length > 0 && currentStep >= 4 && (
        <div className="bg-amber-50 border-y border-amber-200 px-6 py-2.5 space-y-1">
          {dynamicAlerts.map((alert, i) => (
            <div key={i} className="flex items-center text-xs font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 shrink-0 animate-pulse" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Wizard Content Body */}
      <div className="p-6 md:p-8 min-h-[420px] bg-slate-50/50">
        {/* STEP 1: Datos del Cliente */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Información del Cliente Corporativo</h3>
                <p className="text-xs text-slate-500">Seleccione un cliente registrado en CRM o cree una nueva ficha de cliente.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Paso 1 / 9
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cliente Existente
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelectChange(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="new">+ Crear Nuevo Cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} (NIT: {c.taxId}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razón Social / Empresa *</label>
                <input
                  type="text"
                  value={clientData.companyName}
                  onChange={(e) => setClientData({ ...clientData, companyName: e.target.value })}
                  placeholder="Ej: Ecopetrol / Cervecería Unión"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Identificación Tributaria (NIT / RUC) *</label>
                <input
                  type="text"
                  value={clientData.taxId}
                  onChange={(e) => setClientData({ ...clientData, taxId: e.target.value })}
                  placeholder="Ej: 900.845.120-4"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Persona de Contacto / Cargo *</label>
                <input
                  type="text"
                  value={clientData.contactName}
                  onChange={(e) => setClientData({ ...clientData, contactName: e.target.value })}
                  placeholder="Ej: Ing. Mauricio Peña - Director de Planta"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  placeholder="contacto@empresa.com"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Móvil / PBX</label>
                <input
                  type="text"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  placeholder="+57 300 000 0000"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Segmento Industrial</label>
                <select
                  value={clientData.industry}
                  onChange={(e) => setClientData({ ...clientData, industry: e.target.value as any })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Industrial">Industrial & Manufactura</option>
                  <option value="Construcción">Construcción & Obras Civiles</option>
                  <option value="Marino">Marino & Portuario</option>
                  <option value="Petroquímica">Petroquímica & Gas</option>
                  <option value="Comercial">Comercial & Logístico</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Datos del Proyecto */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Datos Generales del Proyecto</h3>
                <p className="text-xs text-slate-500">Defina el alcance, ciudad de intervención, plazo y presupuesto preliminar.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Paso 2 / 9
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Descriptivo del Proyecto *</label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  placeholder="Ej: Recubrimiento Epóxico y Poliuretano para Estructura de Silos 101-104"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad / Municipio de Ubicación *</label>
                <input
                  type="text"
                  value={projectData.city}
                  onChange={(e) => setProjectData({ ...projectData, city: e.target.value })}
                  placeholder="Ej: Cartagena, Barranquilla, Medellín, Bogotá, Cali"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Proyecto</label>
                <select
                  value={projectData.projectType}
                  onChange={(e) => setProjectData({ ...projectData, projectType: e.target.value as any })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Industrial">Industrial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Marino">Marino / Costero</option>
                  <option value="Estructuras Metálicas">Estructuras Metálicas</option>
                  <option value="Infraestructura">Infraestructura Vial / Pública</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad Operativa</label>
                <select
                  value={projectData.priority}
                  onChange={(e) => setProjectData({ ...projectData, priority: e.target.value as any })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Baja">Baja (Mantenimiento Rutinario)</option>
                  <option value="Media">Media (Programado)</option>
                  <option value="Alta">Alta (Parada de Planta Próxima)</option>
                  <option value="Urgente">Urgente (Falla de Recubrimiento / Corrosión Activa)</option>
                </select>
              </div>

              <div>
                <BudgetInputField
                  value={projectData.budgetEstimated}
                  onChange={(val) => setProjectData({ ...projectData, budgetEstimated: val })}
                  label="Presupuesto Estimado"
                  currency="USD"
                  helperText="Valor de referencia para cotización de insumos y mano de obra."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Límite Estimada (Deadline)</label>
                <input
                  type="date"
                  value={projectData.deadline}
                  onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Áreas */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Desglose de Áreas y Sustratos</h3>
                <p className="text-xs text-slate-500">Agregue cada elemento geométrico a pintar con su tipo de material y estado.</p>
              </div>
              <button
                onClick={handleAddArea}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Área</span>
              </button>
            </div>

            <div className="space-y-3">
              {areas.map((area, index) => (
                <div key={area.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <span>Identificador de Zona</span>
                    </span>
                    {areas.length > 1 && (
                      <button
                        onClick={() => handleRemoveArea(area.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 text-xs cursor-pointer"
                        title="Eliminar área"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="lg:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre de la Zona</label>
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => handleUpdateArea(area.id, 'name', e.target.value)}
                        placeholder="Ej: Manto tanques o Vigas IPE"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Sustrato</label>
                      <select
                        value={area.substrate}
                        onChange={(e) => handleUpdateArea(area.id, 'substrate', e.target.value as SubstrateType)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="Acero al Carbono">Acero al Carbono</option>
                        <option value="Concreto / Hormigón">Concreto / Hormigón</option>
                        <option value="Acero Galvanizado">Acero Galvanizado</option>
                        <option value="Aluminio">Aluminio</option>
                        <option value="Tuberías Industriales">Tuberías Industriales</option>
                        <option value="Pisos Epóxicos Existentes">Pisos Epóxicos</option>
                        <option value="Drywall / Mampostería">Drywall / Mampostería</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Metros Cuadrados (m²)</label>
                      <input
                        type="number"
                        value={area.sqm}
                        onChange={(e) => handleUpdateArea(area.id, 'sqm', Number(e.target.value))}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Ubicación</label>
                      <select
                        value={area.location}
                        onChange={(e) => handleUpdateArea(area.id, 'location', e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="Exterior">Exterior</option>
                        <option value="Interior">Interior</option>
                        <option value="Sumergido / Enterrado">Sumergido / Enterrado</option>
                      </select>
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Condición Inicial Superficial</label>
                      <select
                        value={area.initialCondition}
                        onChange={(e) => handleUpdateArea(area.id, 'initialCondition', e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="Nuevo sin pintar">Nuevo sin pintar</option>
                        <option value="Óxido Grado A/B">Óxido Grado A/B (Leve a moderado)</option>
                        <option value="Óxido Severo Grado C/D">Óxido Severo Grado C/D (Picaduras profundas)</option>
                        <option value="Pintura Envejecida Fisurada">Pintura Envejecida Fisurada</option>
                        <option value="Contaminado con Aceites/Químicos">Contaminado con Aceites/Grasas</option>
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Altura de Trabajo (Metros)</label>
                      <input
                        type="number"
                        value={area.heightMeters}
                        onChange={(e) => handleUpdateArea(area.id, 'heightMeters', Number(e.target.value))}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-900">Total Áreas Calculadas:</span>
              <span className="font-bold text-blue-900 font-mono text-sm">
                {areas.reduce((acc, a) => acc + (Number(a.sqm) || 0), 0).toLocaleString()} m²
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: Condiciones */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Condiciones Ambientales y Operativas</h3>
                <p className="text-xs text-slate-500">Parámetros meteorológicos y agresividad según norma ISO 12944.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Paso 4 / 9
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Humedad */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Humedad Relativa (%)</span>
                  </label>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    conditions.humidity > 80 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {conditions.humidity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="98"
                  value={conditions.humidity}
                  onChange={(e) => setConditions({ ...conditions, humidity: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Límite máximo normativo para aplicación: 85% H.R.
                </p>
              </div>

              {/* Temp Ambiente */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                    <span>Temp. Ambiente (°C)</span>
                  </label>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {conditions.ambientTemp}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={conditions.ambientTemp}
                  onChange={(e) => setConditions({ ...conditions, ambientTemp: Number(e.target.value) })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Rango óptimo para curado epóxico: 15°C a 35°C
                </p>
              </div>

              {/* Temp Sustrato */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Thermometer className="w-3.5 h-3.5 text-red-500" />
                    <span>Temp. Sustrato (°C)</span>
                  </label>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {conditions.surfaceTemp}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={conditions.surfaceTemp}
                  onChange={(e) => setConditions({ ...conditions, surfaceTemp: Number(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Debe estar ≥ 3°C por encima del punto de rocío
                </p>
              </div>

              {/* Corrosividad ISO */}
              <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoría de Corrosividad Atmosférica (ISO 12944-2)
                </label>
                <select
                  value={conditions.corrosivity}
                  onChange={(e) => setConditions({ ...conditions, corrosivity: e.target.value as CorrosivityCategory })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium"
                >
                  <option value="C1 (Muy Baja)">C1 (Muy Baja) - Interiores climatizados con aire limpio (oficinas)</option>
                  <option value="C2 (Baja)">C2 (Baja) - Atmósferas rurales o interiores con condensación ocasional</option>
                  <option value="C3 (Media)">C3 (Media) - Atmósferas urbanas/industriales moderadas o cervecerías</option>
                  <option value="C4 (Alta)">C4 (Alta) - Áreas industriales químicas y zonas costeras con salinidad moderada</option>
                  <option value="C5 (Muy Alta - Marina/Industrial)">C5 (Muy Alta) - Zonas costeras de alta salinidad y plantas químicas agresivas</option>
                </select>
              </div>

              {/* Tipo de Tráfico */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">Exigencia Mecánica / Tráfico</label>
                <select
                  value={conditions.trafficType}
                  onChange={(e) => setConditions({ ...conditions, trafficType: e.target.value as any })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                >
                  <option value="Sin Tráfico">Sin Tráfico (Muros, vigas aéreas)</option>
                  <option value="Peatonal Ligero">Peatonal Ligero</option>
                  <option value="Peatonal Pesado">Peatonal Pesado</option>
                  <option value="Montacargas / Vehicular Pesado">Montacargas / Ruedas de Poliuretano</option>
                </select>
              </div>

              {/* Requisitos especiales */}
              <div className="md:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">Requisitos Técnicos Especiales</label>
                <textarea
                  value={conditions.specialRequirements}
                  onChange={(e) => setConditions({ ...conditions, specialRequirements: e.target.value })}
                  placeholder="Ej: Resistencia a solventes aromáticos, no inflamabilidad, certificación grado alimenticio FDA..."
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Evidencias */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Evidencias Fotográficas con Hash Criptográfico</h3>
                <p className="text-xs text-slate-500">Carga de registros fotográficos con generación de huella digital SHA-256 para peritaje técnico.</p>
              </div>
              <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Foto</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* List of evidences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidences.map((ev, index) => (
                <div key={ev.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <img
                    src={ev.thumbnailUrl}
                    alt={ev.fileName}
                    className="w-24 h-24 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 truncate" title={ev.fileName}>
                        {ev.fileName}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {ev.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {ev.caption}
                    </p>

                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono truncate" title={ev.sha256Hash}>
                      <Hash className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{ev.sha256Hash.substring(0, 18)}...</span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Detectado: <strong className="text-slate-700">{ev.anomalyDetected}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick pre-filled sample photos button for demo */}
            <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span>¿Desea agregar una imagen de muestra de corrosión para la prueba?</span>
              <button
                onClick={() => {
                  const sampleEv: PhotographicEvidence = {
                    id: `ev-sample-${Date.now()}`,
                    fileName: 'peritaje_falla_adherencia_viga.jpg',
                    fileUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=200',
                    caption: 'Fisuras de fatiga y óxido laminar en viga de soporte.',
                    anomalyDetected: 'Descascarillado',
                    sha256Hash: generateMockSha256('adherencia_viga'),
                    uploadedBy: 'Ingeniero Residente',
                    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    fileSizeKb: 1840,
                    status: 'Verificada',
                  };
                  setEvidences([...evidences, sampleEv]);
                }}
                className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                + Añadir Foto de Muestra
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Validación */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Validación de Requisitos en Tiempo Real</h3>
                <p className="text-xs text-slate-500">Comprobación automatizada de consistencia técnica previa a la inferencia de IA.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Paso 6 / 9
              </span>
            </div>

            <div className="space-y-3">
              {/* Check 1 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Completitud de Datos del Cliente & Contacto</h4>
                  <p className="text-xs text-slate-500">
                    Cliente: {clientData.companyName} ({clientData.taxId}) - Contacto: {clientData.contactName}
                  </p>
                </div>
              </div>

              {/* Check 2 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cuantificación Geométrica</h4>
                  <p className="text-xs text-slate-500">
                    {areas.length} zonas registradas con un metraje acumulado de {areas.reduce((a, b) => a + (Number(b.sqm) || 0), 0).toLocaleString()} m².
                  </p>
                </div>
              </div>

              {/* Check 3 */}
              <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                conditions.humidity > 80 ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'
              }`}>
                {conditions.humidity > 80 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Evaluación Climática & Temperatura</h4>
                  <p className="text-xs text-slate-600">
                    Humedad: {conditions.humidity}% | Temp Ambiente: {conditions.ambientTemp}°C | Temp Superficie: {conditions.surfaceTemp}°C | Corrosividad: {conditions.corrosivity}
                  </p>
                  {conditions.humidity > 80 && (
                    <p className="text-[11px] text-amber-800 font-semibold mt-1">
                      Nota: Se notificará al inspector técnico para restringir la aplicación a horarios con H.R. &lt; 85%.
                    </p>
                  )}
                </div>
              </div>

              {/* Check 4 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Evidencias con Verificación Criptográfica</h4>
                  <p className="text-xs text-slate-500">
                    {evidences.length} fotografías periciales con hash SHA-256 verificado en cadena de custodia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Clasificación IA */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Clasificación Técnica Inteligente con Gemini</h3>
                <p className="text-xs text-slate-500">Motor de razonamiento especializado en corrosión, esquemas multicapa y normatividad ISO 12944.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Paso 7 / 9
              </span>
            </div>

            {!classification && !isAiLoading && (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <Sparkles className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  Listo para procesar con Gemini 3.8 Flash
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  La IA analizará el sustrato ({areas[0]?.substrate}), el ambiente ({conditions.corrosivity}), la humedad ({conditions.humidity}%) y generará la especificación técnica.
                </p>
                <button
                  onClick={triggerAiClassification}
                  className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] hover:from-blue-900 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  Ejecutar Clasificación IA Ahora
                </button>
              </div>
            )}

            {isAiLoading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-base font-extrabold text-slate-900">
                  Gemini está diagnosticando la estructura...
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Calculando compatibilidad química, espesores EPS y perfiles SSPC...
                </p>
              </div>
            )}

            {classification && (
              <div className="space-y-4">
                <GeminiPanel classification={classification} />
                <div className="flex justify-end">
                  <button
                    onClick={triggerAiClassification}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    ↺ Re-ejecutar diagnóstico con Gemini
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 8: Resumen */}
        {currentStep === 8 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Resumen Técnico de la Solicitud</h3>
                <p className="text-xs text-slate-500">Revise la ficha consolidada antes de confirmar la apertura del expediente.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Paso 8 / 9
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Cliente & Proyecto */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-blue-900">
                  Expediente General
                </h4>
                <div className="text-xs space-y-1 text-slate-700">
                  <p><strong>Proyecto:</strong> {projectData.title || 'Recubrimiento Industrial'}</p>
                  <p><strong>Cliente:</strong> {clientData.companyName} (NIT {clientData.taxId})</p>
                  <p><strong>Contacto:</strong> {clientData.contactName} - {clientData.phone}</p>
                  <p><strong>Ubicación:</strong> {projectData.city}</p>
                  <p><strong>Tipo:</strong> {projectData.projectType} | <strong>Prioridad:</strong> {projectData.priority}</p>
                  <p><strong>Presupuesto Est.:</strong> {Number(projectData.budgetEstimated) > 0 ? `$${Number(projectData.budgetEstimated).toLocaleString()} USD` : 'Por definir (A cotizar)'}</p>
                </div>
              </div>

              {/* Box 2: Áreas & Condiciones */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-blue-900">
                  Dimensiones & Clima
                </h4>
                <div className="text-xs space-y-1 text-slate-700">
                  <p><strong>Área Total:</strong> {areas.reduce((a, b) => a + (Number(b.sqm) || 0), 0).toLocaleString()} m²</p>
                  <p><strong>Sustrato Principal:</strong> {areas[0]?.substrate}</p>
                  <p><strong>Humedad Relativa:</strong> {conditions.humidity}%</p>
                  <p><strong>Corrosividad ISO:</strong> {conditions.corrosivity}</p>
                  <p><strong>Evidencias Fotos:</strong> {evidences.length} archivos firmados</p>
                </div>
              </div>

              {/* Box 3: Clasificación IA Resumen */}
              <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Sistema Dictaminado por IA Gemini</span>
                  </h4>
                  {classification && (
                    <span className="text-xs font-bold font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {classification.confidenceScore}% Confianza
                    </span>
                  )}
                </div>
                <p className="text-xs font-extrabold text-slate-900">
                  {classification?.category || 'Sistema Epóxico / Poliuretano Industrial'}
                </p>
                <p className="text-xs text-slate-600">
                  {classification?.observations || 'Cumple con preparación de superficie y tiempos de curado normativos.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Confirmación */}
        {currentStep === 9 && (
          <div className="space-y-6 text-center py-6">
            {!confirmedProject ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  ¿Confirmar y Publicar Proyecto?
                </h3>
                <p className="text-xs text-slate-500">
                  Al confirmar, se generará el código oficial COL-2026-XXXX, se creará el expediente en el CRM y se iniciará la línea de tiempo de seguimiento.
                </p>
                <button
                  onClick={handleFinalizeProject}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Confirmar y Generar Proyecto
                </button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-md text-left">
                <div className="flex items-center space-x-3 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>¡Proyecto Creado Exitosamente!</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-1 font-mono text-xs text-slate-700 border border-slate-200">
                  <div><strong>Código Oficial:</strong> <span className="text-blue-600 font-bold">{confirmedProject.code}</span></div>
                  <div><strong>Nombre:</strong> {confirmedProject.title}</div>
                  <div><strong>Cliente:</strong> {confirmedProject.clientName}</div>
                  <div><strong>Estado:</strong> {confirmedProject.status}</div>
                  <div><strong>Línea de tiempo:</strong> Iniciada (3 hitos)</div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      const json = JSON.stringify(confirmedProject, null, 2);
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ficha_tecnica_${confirmedProject.code}.json`;
                      a.click();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Ficha JSON</span>
                  </button>

                  <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-900 cursor-pointer"
                  >
                    Ver en Panel de Proyectos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              onCancel();
            }
          }}
          className="flex items-center space-x-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Cancelar' : 'Anterior'}</span>
        </button>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Paso {currentStep} de {totalSteps}
        </div>

        {currentStep < totalSteps ? (
          <button
            onClick={() => {
              if (currentStep === 6 && !classification) {
                // If on validation, auto-trigger AI classification for step 7
                triggerAiClassification();
              }
              setCurrentStep(currentStep + 1);
            }}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          !confirmedProject && (
            <button
              onClick={handleFinalizeProject}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Completar Solicitud
            </button>
          )
        )}
      </div>
    </div>
  );
};
