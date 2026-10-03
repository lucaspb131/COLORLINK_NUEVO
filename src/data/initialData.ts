import { Client, Project, InventoryItem, User, AuditLog } from '../types';

export const CURRENT_USER: User = {
  id: 'usr-001',
  name: 'Ing. Carlos Mendoza',
  email: 'carlos.mendoza@colorlink.tech',
  role: 'Administrador',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  department: 'Dirección de Ingeniería y Recubrimientos',
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    taxId: '900.845.120-4',
    companyName: 'Petroquímica del Caribe S.A.',
    contactName: 'Ing. Roberto Silva',
    email: 'rsilva@petrocaribe.com.co',
    phone: '+57 310 445 8899',
    city: 'Cartagena',
    address: 'Zona Industrial Mamonal Km 7',
    industry: 'Petroquímica',
    status: 'Activo',
    createdAt: '2026-01-15',
    totalProjects: 4,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    taxId: '860.012.399-1',
    companyName: 'Constructora Metrópoli & Infraestructura',
    contactName: 'Arq. Mariana Restrepo',
    email: 'mrestrepo@metropoli-infra.co',
    phone: '+57 315 889 0012',
    city: 'Medellín',
    address: 'Cra 43A # 1Sur - 100, El Poblado',
    industry: 'Construcción',
    status: 'Activo',
    createdAt: '2026-02-01',
    totalProjects: 6,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    taxId: '800.223.771-8',
    companyName: 'Terminal Marítimo del Pacífico S.A.',
    contactName: 'Cap. Andrés Valencia',
    email: 'avalencia@termpacifico.com',
    phone: '+57 320 671 2244',
    city: 'Barranquilla',
    address: 'Puerto Industrial Vía 40 # 85-20',
    industry: 'Marino',
    status: 'Activo',
    createdAt: '2026-02-18',
    totalProjects: 3,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    taxId: '901.109.845-6',
    companyName: 'Siderúrgica Andina del Valle',
    contactName: 'Ing. Elena Gómez',
    email: 'egomez@siderandina.com',
    phone: '+57 300 901 3322',
    city: 'Cali',
    address: 'Parque Industrial Yumbo Manzana B',
    industry: 'Industrial',
    status: 'Activo',
    createdAt: '2026-03-05',
    totalProjects: 2,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    taxId: '890.301.200-9',
    companyName: 'Alimentos & Cervecería Continental',
    contactName: 'Ing. Felipe Morales',
    email: 'fmorales@continental-brew.com',
    phone: '+57 318 200 4567',
    city: 'Bogotá',
    address: 'Autopista Sur # 65-30',
    industry: 'Comercial',
    status: 'Activo',
    createdAt: '2026-03-12',
    totalProjects: 5,
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    code: 'COL-2026-0142',
    title: 'Recubrimiento Anticorrosivo Batería Tanques Mamonal',
    clientId: 'b0000000-0000-0000-0000-000000000001',
    clientName: 'Petroquímica del Caribe S.A.',
    city: 'Cartagena',
    projectType: 'Industrial',
    priority: 'Alta',
    budgetEstimated: 85000,
    status: 'En Ejecución',
    createdAt: '2026-02-10',
    updatedAt: '2026-09-20',
    deadline: '2026-10-30',
    totalSqm: 4200,
    activeAlerts: ['Humedad relativa superior al 80% en horario nocturno'],
    assignedEngineer: 'Ing. Carlos Mendoza',
    assignedSalesperson: 'David Cardona',
    areas: [
      {
        id: 'area-1',
        name: 'Manto Exterior Tanques TK-101 y TK-102',
        substrate: 'Acero al Carbono',
        sqm: 2800,
        location: 'Exterior',
        heightMeters: 14,
        initialCondition: 'Óxido Severo Grado C/D',
      },
      {
        id: 'area-2',
        name: 'Dique de Contención y Cubeto Secundario',
        substrate: 'Concreto / Hormigón',
        sqm: 1400,
        location: 'Exterior',
        heightMeters: 2.5,
        initialCondition: 'Pintura Envejecida Fisurada',
      }
    ],
    conditions: {
      humidity: 82,
      ambientTemp: 32,
      surfaceTemp: 38,
      corrosivity: 'C5 (Muy Alta - Marina/Industrial)',
      chemicalExposure: ['Vapores de Hidrocarburos', 'Salinidad Marina', 'Sulfatos'],
      trafficType: 'Peatonal Ligero',
      uvExposure: 'Alta Radiación Solar',
      specialRequirements: 'Resistencia a derrames intermitentes de crudo y salpicaduras marinas ISO 12944-6.',
    },
    evidences: [
      {
        id: 'ev-1',
        projectId: 'proj-001',
        fileName: 'inspeccion_corrosion_manto_tk101.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=200',
        caption: 'Desprendimiento de recubrimiento previo y corrosión laminar en zona de traslape.',
        anomalyDetected: 'Corrosión Puntual',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadedBy: 'Ing. Roberto Silva',
        uploadedAt: '2026-02-12 10:30',
        fileSizeKb: 3420,
        status: 'Verificada',
        technicalNotes: 'Profundidad de picadura estimada en 0.8 mm. Requiere granallado SSPC-SP 10.',
      },
      {
        id: 'ev-2',
        projectId: 'proj-001',
        fileName: 'cubeto_hormigon_grietas.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=200',
        caption: 'Fisuras por contracción y ataque químico superficial en hormigón del cubeto.',
        anomalyDetected: 'Fisuración',
        sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        uploadedBy: 'Ing. Carlos Mendoza',
        uploadedAt: '2026-02-13 14:15',
        fileSizeKb: 2890,
        status: 'Verificada',
        technicalNotes: 'Aplicar mortero epóxico de reparación antes del recubrimiento autonivelante.',
      }
    ],
    classification: {
      category: 'Sistema Tri-Capa Epoxi-Zinc / Epoxi Alto Sólidos / Poliuretano Alifático',
      coatingType: 'Poliamida Epoxi + Topcoat Uretano UV',
      confidenceScore: 97,
      complexity: 'Crítica',
      recommendedSystem: [
        {
          step: '1. Preparación de Superficie',
          action: 'Granallado abrasivo al metal cercano al blanco según SSPC-SP 10 / ISO 8501-1 Sa 2.5 con perfil de rugosidad 2.5 - 3.0 mils.',
          standard: 'SSPC-SP 10'
        },
        {
          step: '2. Capa Imprimante',
          action: 'Epóxico Rico en Zinc de 3 mils EPS (Espesor Película Seca). Máxima protección galvánica catódica.',
          standard: 'SSPC-Paint 20 Level 1'
        },
        {
          step: '3. Capa Barrera Intermedia',
          action: 'Epóxico Poliamida de Altos Sólidos pigmentado con Óxido de Hierro Micáceo (MIO) a 5 mils EPS.',
          standard: 'ISO 12944-5'
        },
        {
          step: '4. Capa de Acabado',
          action: 'Poliuretano Alifático Acrílico de 2.5 mils EPS resistente a radiación UV y atmósfera marina severa.',
          standard: 'ASTM D4541'
        }
      ],
      detectedConditions: [
        'Ambiente Marino / Industrial C5 con alta humedad relativa (82%)',
        'Contaminación salina y riesgo de condensación',
        'Sustrato con historial de picaduras de corrosión'
      ],
      missingData: [
        'Curva horaria de temperatura de punto de rocío',
        'Concentración de sales solubles residuales (Bresle test < 20 mg/m²)'
      ],
      observations: 'El régimen de aplicación no debe superar el 85% de humedad relativa ni aplicarse a menos de 3°C por encima del punto de rocío.',
      estimatedYieldGallons: 245,
      vocCompliance: 'Bajo VOC (< 220 g/L) certificado ISO 14001',
      classificationDate: '2026-02-14 09:40',
      modelUsed: 'gemini-3.8-flash'
    },
    timeline: [
      {
        id: 't-1',
        status: 'Borrador',
        label: 'Creación de Solicitud',
        description: 'Ingreso inicial de requerimiento de protección de tanques.',
        date: '2026-02-10 08:30',
        author: 'David Cardona',
        role: 'Asesor Comercial',
        completed: true
      },
      {
        id: 't-2',
        status: 'En Validación',
        label: 'Validación Técnica Inicial',
        description: 'Revisión de planos y verificación de condiciones climáticas de Cartagena.',
        date: '2026-02-12 11:00',
        author: 'Ing. Carlos Mendoza',
        role: 'Ingeniero Técnico',
        completed: true
      },
      {
        id: 't-3',
        status: 'Clasificado IA',
        label: 'Clasificación Gemini AI',
        description: 'Generación del sistema tri-capa normativo C5 con 97% de confianza.',
        date: '2026-02-14 09:40',
        author: 'Sistema COLORLINK IA',
        role: 'Motor IA Gemini',
        completed: true
      },
      {
        id: 't-4',
        status: 'Revisión Técnica',
        label: 'Aprobación de Ingeniería',
        description: 'Validación por inspector NACE / AMPP Level 3.',
        date: '2026-02-18 16:20',
        author: 'Ing. Carlos Mendoza',
        role: 'Director Técnico',
        completed: true
      },
      {
        id: 't-5',
        status: 'Presupuesto',
        label: 'Emisión Presupuestal',
        description: 'Presupuesto por USD $85,000 con desglose de insumos y mano de obra.',
        date: '2026-02-22 14:00',
        author: 'David Cardona',
        role: 'Asesor Comercial',
        completed: true
      },
      {
        id: 't-6',
        status: 'Aprobado',
        label: 'Aprobación del Cliente',
        description: 'Orden de compra recibida PO-449120.',
        date: '2026-03-01 10:15',
        author: 'Ing. Roberto Silva',
        role: 'Cliente Petrocaribe',
        completed: true
      },
      {
        id: 't-7',
        status: 'En Ejecución',
        label: 'Ejecución en Obra',
        description: 'Avance al 65%: granallado y primera capa de zinc culminados.',
        date: '2026-03-15 08:00',
        author: 'Ing. Carlos Mendoza',
        role: 'Ingeniero Residente',
        completed: true
      },
      {
        id: 't-8',
        status: 'Cierre',
        label: 'Inspección Final y Cierre',
        description: 'Prueba de adherencia pull-off y entrega de garantía de 7 años.',
        date: 'Pendiente',
        author: 'Auditor de Calidad',
        role: 'Auditor de Calidad',
        completed: false
      }
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    code: 'COL-2026-0178',
    title: 'Pintura y Señalización Piso Epóxico Bodega Logística',
    clientId: 'b0000000-0000-0000-0000-000000000005',
    clientName: 'Alimentos & Cervecería Continental',
    city: 'Bogotá',
    projectType: 'Comercial',
    priority: 'Media',
    budgetEstimated: 34000,
    status: 'Clasificado IA',
    createdAt: '2026-03-14',
    updatedAt: '2026-03-18',
    deadline: '2026-11-15',
    totalSqm: 3100,
    activeAlerts: [],
    assignedEngineer: 'Ing. Laura Pardo',
    assignedSalesperson: 'David Cardona',
    areas: [
      {
        id: 'area-b1',
        name: 'Losa de Concreto Almacén Central',
        substrate: 'Concreto / Hormigón',
        sqm: 2600,
        location: 'Interior',
        heightMeters: 8,
        initialCondition: 'Contaminado con Aceites/Químicos',
      },
      {
        id: 'area-b2',
        name: 'Demarcación y Pasillos Peatonales',
        substrate: 'Concreto / Hormigón',
        sqm: 500,
        location: 'Interior',
        heightMeters: 0,
        initialCondition: 'Nuevo sin pintar',
      }
    ],
    conditions: {
      humidity: 58,
      ambientTemp: 18,
      surfaceTemp: 16,
      corrosivity: 'C2 (Baja)',
      chemicalExposure: ['Ácido Láctico', 'Detergentes Industriales', 'Agua Caliente'],
      trafficType: 'Montacargas / Vehicular Pesado',
      uvExposure: 'Baja',
      specialRequirements: 'Grado alimenticio FDA / INVIMA, antiderrapante y alta resistencia al impacto.',
    },
    evidences: [
      {
        id: 'ev-3',
        projectId: 'proj-002',
        fileName: 'losa_concreto_manchas_grasa.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=200',
        caption: 'Superficie de hormigón con contaminación superficial por montacargas y aceites hidráulicos.',
        anomalyDetected: 'Ampollamiento',
        sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        uploadedBy: 'David Cardona',
        uploadedAt: '2026-03-15 11:20',
        fileSizeKb: 2150,
        status: 'Verificada',
        technicalNotes: 'Desengrase alcalino intensivo previo a fresado mecánico.',
      }
    ],
    classification: {
      category: 'Sistema Autonivelante Epóxico 100% Sólidos Grado Alimentario + Sellado Poliuretano',
      coatingType: 'Epoxi Libre de Solventes (100% Sólidos)',
      confidenceScore: 95,
      complexity: 'Media',
      recommendedSystem: [
        {
          step: '1. Descontaminación & Preparación',
          action: 'Desengrase con tensoactivos biodegradables y escarificado / desbastado mecánico con disco de diamante (CSP 3 según ICRI).',
          standard: 'ICRI Guideline No. 310.2R'
        },
        {
          step: '2. Imprimación Penetrante',
          action: 'Primer Epóxico libre de solventes 100% sólidos con alta penetración capilar (4-5 mils EPS).',
          standard: 'ASTM D7234'
        },
        {
          step: '3. Mortero / Capa Niveladora',
          action: 'Mortero epóxico autonivelante de 2 mm con árido de sílice seleccionado.',
          standard: 'ASTM C579'
        },
        {
          step: '4. Acabado Poliuretano Antibacteriano',
          action: 'Topcoat Uretano de alta dureza shore D con microesferas antideslizantes grado R10.',
          standard: 'DIN 51130 / FDA 21 CFR 175.300'
        }
      ],
      detectedConditions: [
        'Exposición a tráfico pesado continuo de ruedas duras de poliuretano',
        'Limpieza diaria con agentes químicos alcalinos y agua a presión',
        'Requisito de no toxicidad e inocuidad alimentaria'
      ],
      missingData: [
        'Prueba de humedad relativa de la losa según ASTM F2170 (Sonda In-Situ < 75%)',
        'Contenido de dureza superficial mediante esclerómetro'
      ],
      observations: 'El hormigón debe tener mínimo 28 días de vaciado y curado completo antes de aplicar el sistema epóxico.',
      estimatedYieldGallons: 190,
      vocCompliance: 'Cero VOC (0 g/L) - Seguro para plantas de bebidas y alimentos',
      classificationDate: '2026-03-16 15:10',
      modelUsed: 'gemini-3.8-flash'
    },
    timeline: [
      {
        id: 't-b1',
        status: 'Borrador',
        label: 'Creación de Solicitud',
        description: 'Solicitud para reacondicionamiento de piso sanitario.',
        date: '2026-03-14 09:00',
        author: 'David Cardona',
        role: 'Asesor Comercial',
        completed: true
      },
      {
        id: 't-b2',
        status: 'En Validación',
        label: 'Inspección Preliminar',
        description: 'Visita técnica y registro fotográfico de losas fisuradas.',
        date: '2026-03-15 14:00',
        author: 'Ing. Laura Pardo',
        role: 'Ingeniero Técnico',
        completed: true
      },
      {
        id: 't-b3',
        status: 'Clasificado IA',
        label: 'Clasificación Gemini AI',
        description: 'Generación del sistema autonivelante grado alimenticio con 95% de certeza.',
        date: '2026-03-16 15:10',
        author: 'Sistema COLORLINK IA',
        role: 'Motor IA Gemini',
        completed: true
      },
      {
        id: 't-b4',
        status: 'Revisión Técnica',
        label: 'Revisión Técnica Especializada',
        description: 'En espera de aprobación por parte del comité técnico.',
        date: '2026-03-18 10:00',
        author: 'Ing. Carlos Mendoza',
        role: 'Director Técnico',
        completed: false
      }
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    code: 'COL-2026-0205',
    title: 'Protección Pasiva Ignífuga y Acabado Estructura Metálica Puente Peatonal',
    clientId: 'b0000000-0000-0000-0000-000000000002',
    clientName: 'Constructora Metrópoli & Infraestructura',
    city: 'Medellín',
    projectType: 'Estructuras Metálicas',
    priority: 'Urgente',
    budgetEstimated: 52000,
    status: 'En Validación',
    createdAt: '2026-03-22',
    updatedAt: '2026-03-24',
    deadline: '2026-12-05',
    totalSqm: 1850,
    activeAlerts: ['Posible caso duplicado con tramo norte licitado en 2025'],
    assignedEngineer: 'Ing. Carlos Mendoza',
    assignedSalesperson: 'Andrea Ortiz',
    areas: [
      {
        id: 'area-c1',
        name: 'Vigas IPE y Celosías Principales',
        substrate: 'Acero al Carbono',
        sqm: 1350,
        location: 'Exterior',
        heightMeters: 6,
        initialCondition: 'Nuevo sin pintar',
      },
      {
        id: 'area-c2',
        name: 'Pasamanos y Barandas de Seguridad',
        substrate: 'Acero Galvanizado',
        sqm: 500,
        location: 'Exterior',
        heightMeters: 1.2,
        initialCondition: 'Nuevo sin pintar',
      }
    ],
    conditions: {
      humidity: 65,
      ambientTemp: 24,
      surfaceTemp: 26,
      corrosivity: 'C3 (Media)',
      chemicalExposure: ['Emisiones vehiculares CO2', 'Lluvia ácida urbana'],
      trafficType: 'Peatonal Pesado',
      uvExposure: 'Alta Radiación Solar',
      specialRequirements: 'Pintura intumescente con resistencia al fuego certificada R-60 / R-90 según UL 263 / ASTM E119.',
    },
    evidences: [],
    timeline: [
      {
        id: 't-c1',
        status: 'Borrador',
        label: 'Creación de Solicitud',
        description: 'Requerimiento de protección intumescente y acabado estético.',
        date: '2026-03-22 11:30',
        author: 'Andrea Ortiz',
        role: 'Asesor Comercial',
        completed: true
      },
      {
        id: 't-c2',
        status: 'En Validación',
        label: 'Validación Técnica Inicial',
        description: 'Revisión de planos estructurales y cálculo de masividad (Hp/A o A/V).',
        date: '2026-03-24 09:15',
        author: 'Ing. Carlos Mendoza',
        role: 'Ingeniero Técnico',
        completed: true
      }
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    code: 'COL-2026-0211',
    title: 'Recubrimiento Antifouling y Casco Barcaza Fluvial Río Magdalena',
    clientId: 'b0000000-0000-0000-0000-000000000003',
    clientName: 'Terminal Marítimo del Pacífico S.A.',
    city: 'Barranquilla',
    projectType: 'Marino',
    priority: 'Alta',
    budgetEstimated: 68000,
    status: 'Presupuesto',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-25',
    deadline: '2026-10-10',
    totalSqm: 2400,
    activeAlerts: [],
    assignedEngineer: 'Ing. Carlos Mendoza',
    assignedSalesperson: 'David Cardona',
    areas: [
      {
        id: 'area-d1',
        name: 'Obra Viva (Casco Sumergido)',
        substrate: 'Acero al Carbono',
        sqm: 1600,
        location: 'Sumergido / Enterrado',
        heightMeters: 4,
        initialCondition: 'Óxido Grado A/B',
      },
      {
        id: 'area-d2',
        name: 'Cubierta y Defensas de Atraque',
        substrate: 'Acero al Carbono',
        sqm: 800,
        location: 'Exterior',
        heightMeters: 1.5,
        initialCondition: 'Pintura Envejecida Fisurada',
      }
    ],
    conditions: {
      humidity: 78,
      ambientTemp: 31,
      surfaceTemp: 33,
      corrosivity: 'C5 (Muy Alta - Marina/Industrial)',
      chemicalExposure: ['Agua Salobre', 'Incrustaciones Biológicas', 'Fricción de Arena Fluvial'],
      trafficType: 'Peatonal Pesado',
      uvExposure: 'Alta Radiación Solar',
      specialRequirements: 'Antifouling libre de TBT con tecnología de autopulimentado (SPC) con durabilidad mínima de 36 meses.',
    },
    evidences: [
      {
        id: 'ev-4',
        projectId: 'proj-004',
        fileName: 'casco_barcaza_dique_seco.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=200',
        caption: 'Vista del casco en varadero mostrando desgaste por abrasión en proa.',
        anomalyDetected: 'Descascarillado',
        sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        uploadedBy: 'Cap. Andrés Valencia',
        uploadedAt: '2026-03-12 16:45',
        fileSizeKb: 3100,
        status: 'Verificada',
        technicalNotes: 'Eliminación completa de caracolejo e incrustaciones antes de chorreado con granalla.',
      }
    ],
    timeline: [
      {
        id: 't-d1',
        status: 'Borrador',
        label: 'Creación de Solicitud',
        description: 'Ingreso del proyecto de mantenimiento en dique seco.',
        date: '2026-03-10 10:00',
        author: 'David Cardona',
        role: 'Asesor Comercial',
        completed: true
      },
      {
        id: 't-d2',
        status: 'En Validación',
        label: 'Validación Técnica',
        description: 'Verificación de ventana de dique seco programada.',
        date: '2026-03-12 14:00',
        author: 'Ing. Carlos Mendoza',
        role: 'Ingeniero Técnico',
        completed: true
      },
      {
        id: 't-d3',
        status: 'Clasificado IA',
        label: 'Clasificación Gemini AI',
        description: 'Recomendación de sistema Epoxi-Alquitrán modificado + Antifouling SPC.',
        date: '2026-03-15 11:30',
        author: 'Sistema COLORLINK IA',
        role: 'Motor IA Gemini',
        completed: true
      },
      {
        id: 't-d4',
        status: 'Revisión Técnica',
        label: 'Revisión Especialista Marino',
        description: 'Aprobación de especificación técnica por inspector de buques.',
        date: '2026-03-20 16:00',
        author: 'Ing. Carlos Mendoza',
        role: 'Director Técnico',
        completed: true
      },
      {
        id: 't-d5',
        status: 'Presupuesto',
        label: 'Presupuesto Enviado',
        description: 'Enviado por USD $68,000 en espera de aprobación de gerencia.',
        date: '2026-03-25 09:30',
        author: 'David Cardona',
        role: 'Asesor Comercial',
        completed: true
      }
    ]
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    sku: 'CLR-EPX-ZINC-100',
    name: 'ColorZinc Pro Epóxico Rico en Zinc',
    category: 'Primers Epóxicos',
    brand: 'ColorLink Industrial',
    solidsByVolume: 65,
    theoreticalYieldSqmGal: 24.6,
    dryingTimeTouchHours: 1.5,
    recoatTimeHours: '6 a 24 horas',
    vocGramsLiter: 210,
    currentStockGallons: 420,
    unitPriceUSD: 85.00,
    technicalSheetUrl: 'https://colorlink.tech/specs/CLR-EPX-ZINC-100.pdf',
  },
  {
    id: 'inv-002',
    sku: 'CLR-EPX-BAR-200',
    name: 'ColorBar High Solids MIO Poliamida',
    category: 'Primers Epóxicos',
    brand: 'ColorLink Industrial',
    solidsByVolume: 80,
    theoreticalYieldSqmGal: 30.2,
    dryingTimeTouchHours: 3.0,
    recoatTimeHours: '8 a 48 horas',
    vocGramsLiter: 180,
    currentStockGallons: 650,
    unitPriceUSD: 62.50,
    technicalSheetUrl: 'https://colorlink.tech/specs/CLR-EPX-BAR-200.pdf',
  },
  {
    id: 'inv-003',
    sku: 'CLR-URE-TOP-300',
    name: 'ColorThane Alifático Gloss UV Shield',
    category: 'Acabados Poliuretano',
    brand: 'ColorLink High Tech',
    solidsByVolume: 58,
    theoreticalYieldSqmGal: 22.0,
    dryingTimeTouchHours: 2.0,
    recoatTimeHours: '12 a 36 horas',
    vocGramsLiter: 245,
    currentStockGallons: 310,
    unitPriceUSD: 74.00,
    technicalSheetUrl: 'https://colorlink.tech/specs/CLR-URE-TOP-300.pdf',
  },
  {
    id: 'inv-004',
    sku: 'CLR-FLR-SLV-400',
    name: 'ColorFloor 100% Sólidos Autonivelante Sanitario',
    category: 'Revestimientos Alto Desempeño',
    brand: 'ColorLink Flooring',
    solidsByVolume: 100,
    theoreticalYieldSqmGal: 37.8,
    dryingTimeTouchHours: 6.0,
    recoatTimeHours: '12 a 24 horas',
    vocGramsLiter: 0,
    currentStockGallons: 280,
    unitPriceUSD: 98.00,
    technicalSheetUrl: 'https://colorlink.tech/specs/CLR-FLR-SLV-400.pdf',
  },
  {
    id: 'inv-005',
    sku: 'CLR-PRM-CON-500',
    name: 'ColorPenet Primer Epoxi Hidro-Sellador',
    category: 'Selladores',
    brand: 'ColorLink Industrial',
    solidsByVolume: 50,
    theoreticalYieldSqmGal: 19.0,
    dryingTimeTouchHours: 2.0,
    recoatTimeHours: '4 a 12 horas',
    vocGramsLiter: 150,
    currentStockGallons: 195,
    unitPriceUSD: 45.00,
    technicalSheetUrl: 'https://colorlink.tech/specs/CLR-PRM-CON-500.pdf',
  },
  {
    id: 'inv-006',
    sku: 'CLR-MRN-AF-600',
    name: 'ColorOcean SPC Antifouling Autopulimentable',
    category: 'Revestimientos Alto Desempeño',
    brand: 'ColorLink Marine',
    solidsByVolume: 62,
    theoreticalYieldSqmGal: 23.5,
    dryingTimeTouchHours: 4.0,
    recoatTimeHours: '8 a 16 horas',
    vocGramsLiter: 230,
    currentStockGallons: 140,
    unitPriceUSD: 115.00,
    technicalSheetUrl: 'https://colorlink.tech/specs/CLR-MRN-AF-600.pdf',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: '2026-03-25 10:14:22',
    user: 'Ing. Carlos Mendoza',
    role: 'Administrador',
    action: 'Actualización de Estado',
    targetType: 'Proyecto',
    targetId: 'COL-2026-0142',
    details: 'Avanzado a estado "En Ejecución" tras verificación de granallado Sa 2.5',
    ipAddress: '190.84.112.45'
  },
  {
    id: 'aud-002',
    timestamp: '2026-03-24 16:32:05',
    user: 'Sistema COLORLINK IA',
    role: 'Motor IA Gemini',
    action: 'Clasificación Automática',
    targetType: 'Clasificación IA',
    targetId: 'COL-2026-0178',
    details: 'Clasificación Gemini completada con confianza del 95% para sustrato Concreto',
    ipAddress: '127.0.0.1 (API Gateway)'
  },
  {
    id: 'aud-003',
    timestamp: '2026-03-23 11:20:10',
    user: 'David Cardona',
    role: 'Asesor Comercial',
    action: 'Carga de Evidencia Fotográfica',
    targetType: 'Evidencia',
    targetId: 'ev-3',
    details: 'Carga de archivo losa_concreto_manchas_grasa.jpg con hash SHA-256 verificado',
    ipAddress: '186.155.80.12'
  }
];
