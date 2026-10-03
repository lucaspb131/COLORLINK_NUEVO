import React, { useState, useMemo } from 'react';
import { 
  Users, 
  FolderKanban, 
  Clock, 
  AlertOctagon, 
  Camera, 
  AlertTriangle,
  TrendingUp,
  Filter,
  CheckCircle2,
  BrainCircuit,
  ArrowUpRight,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Project, Client } from '../../types';

interface ExecutiveDashboardProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (project: Project) => void;
  onOpenWizard: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  projects,
  clients,
  onSelectProject,
  onOpenWizard,
}) => {
  // Interactive filters
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedClient, setSelectedClient] = useState<string>('Todos');
  const [selectedType, setSelectedType] = useState<string>('Todos');

  // Cities list from projects
  const cities = useMemo(() => {
    const set = new Set(projects.map(p => p.city));
    return ['Todas', ...Array.from(set)];
  }, [projects]);

  // Statuses list
  const statuses = ['Todos', 'Borrador', 'En Validación', 'Clasificado IA', 'Revisión Técnica', 'Presupuesto', 'Aprobado', 'En Ejecución', 'Cierre'];

  // Project types
  const projectTypes = ['Todos', 'Industrial', 'Comercial', 'Marino', 'Estructuras Metálicas', 'Infraestructura'];

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchCity = selectedCity === 'Todas' || p.city === selectedCity;
      const matchStatus = selectedStatus === 'Todos' || p.status === selectedStatus;
      const matchClient = selectedClient === 'Todos' || p.clientName === selectedClient;
      const matchType = selectedType === 'Todos' || p.projectType === selectedType;
      return matchCity && matchStatus && matchClient && matchType;
    });
  }, [projects, selectedCity, selectedStatus, selectedClient, selectedType]);

  // Executive KPIs
  const activeClientsCount = clients.filter(c => c.status === 'Activo').length;
  const activeProjectsCount = projects.filter(p => p.status === 'En Ejecución' || p.status === 'Aprobado').length;
  const pendingRequestsCount = projects.filter(p => p.status === 'Borrador' || p.status === 'En Validación').length;
  const escalatedCasesCount = projects.filter(p => p.priority === 'Urgente' || p.activeAlerts.length > 0).length;
  const totalEvidencesCount = projects.reduce((acc, p) => acc + (p.evidences?.length || 0), 0);
  const openIncidentsCount = projects.reduce((acc, p) => acc + (p.activeAlerts?.length || 0), 0);

  // Substrate distribution
  const substrateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProjects.forEach(p => {
      p.areas?.forEach(a => {
        counts[a.substrate] = (counts[a.substrate] || 0) + (a.sqm || 0);
      });
    });
    return counts;
  }, [filteredProjects]);

  const totalSqmFiltered = Object.values(substrateCounts).reduce((a, b) => a + b, 0) || 1;

  // Status count distribution
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProjects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [filteredProjects]);

  // Complexity count distribution from Gemini
  const complexityCounts = useMemo(() => {
    const counts = { Baja: 0, Media: 0, Alta: 0, Crítica: 0 };
    filteredProjects.forEach(p => {
      if (p.classification?.complexity) {
        counts[p.classification.complexity] = (counts[p.classification.complexity] || 0) + 1;
      }
    });
    return counts;
  }, [filteredProjects]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#3B82F6] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-300/30 text-xs font-semibold text-blue-100 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Centro de Control Operativo e Inteligencia Técnica</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Dashboard Ejecutivo COLORLINK
            </h1>
            <p className="text-blue-100/90 text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Monitoreo en tiempo real de recubrimientos protectores, clasificación de corrosión con Gemini 3.8 Flash y trazabilidad bajo norma ISO 12944.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenWizard}
              className="px-4 py-2.5 bg-white text-[#1E3A8A] font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Iniciar Wizard Técnico</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Clientes Activos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeClientsCount}</div>
          <div className="flex items-center text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+12% este mes</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Proyectos Activos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeProjectsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {projects.length} en portafolio
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Solicitudes Pend.</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{pendingRequestsCount}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            Requieren validación
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Casos Escalados</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{escalatedCasesCount}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            Prioridad alta / urgente
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Evidencias Fotos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalEvidencesCount}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            Hash SHA-256 verificado
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Incidencias Abiertas</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-orange-700">{openIncidentsCount}</div>
          <div className="text-[11px] text-orange-600 font-medium mt-1">
            Alertas de clima/norma
          </div>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filtros Dinámicos del Dashboard</span>
          </div>
          <button
            onClick={() => {
              setSelectedCity('Todas');
              setSelectedStatus('Todos');
              setSelectedClient('Todos');
              setSelectedType('Todos');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Ciudad</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Estado de Solicitud</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Client */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Cliente Corporativo</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Todos">Todos los clientes</option>
              {clients.map(cl => (
                <option key={cl.id} value={cl.companyName}>{cl.companyName}</option>
              ))}
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Proyecto</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Substrates & Área m² (Interactive Bar style) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Metros Cuadrados por Sustrato</span>
              </h3>
              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                Total: {totalSqmFiltered.toLocaleString()} m²
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(substrateCounts).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No hay áreas que coincidan con los filtros</p>
              ) : (
                Object.entries(substrateCounts).map(([substrate, sqm]) => {
                  const percentage = Math.round((sqm / totalSqmFiltered) * 100) || 0;
                  return (
                    <div key={substrate} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate">{substrate}</span>
                        <span className="text-slate-500 font-mono">{sqm.toLocaleString()} m² ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Norma de anclaje: SSPC-SP 10 / ICRI</span>
            <span className="font-semibold text-blue-600">Calculado en m²</span>
          </div>
        </div>

        {/* Chart 2: Pipeline de Estados de Solicitud */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Estados del Embudo de Proyectos</span>
              </h3>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                {filteredProjects.length} proyectos
              </span>
            </div>

            <div className="space-y-2">
              {statuses.filter(s => s !== 'Todos').map(st => {
                const count = statusCounts[st] || 0;
                const pct = filteredProjects.length ? Math.round((count / filteredProjects.length) * 100) : 0;
                return (
                  <div key={st} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700 font-medium">{st}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-bold font-mono text-slate-800 w-6 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Tasa de conversión a ejecución</span>
            <span className="font-bold text-emerald-600">
              {filteredProjects.length ? Math.round(((statusCounts['En Ejecución'] || 0) / filteredProjects.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Chart 3: Complejidad Técnica detectada por Gemini */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <span>Complejidad Técnica con Gemini</span>
              </h3>
              <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                IA Evaluada
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-2">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[11px] font-bold text-emerald-800 uppercase">Baja</div>
                <div className="text-2xl font-black text-emerald-700">{complexityCounts.Baja}</div>
                <div className="text-[10px] text-emerald-600">Sistemas C1/C2</div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                <div className="text-[11px] font-bold text-blue-800 uppercase">Media</div>
                <div className="text-2xl font-black text-blue-700">{complexityCounts.Media}</div>
                <div className="text-[10px] text-blue-600">Epóxico C3</div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                <div className="text-[11px] font-bold text-amber-800 uppercase">Alta</div>
                <div className="text-2xl font-black text-amber-700">{complexityCounts.Alta}</div>
                <div className="text-[10px] text-amber-600">Tri-capa C4</div>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
                <div className="text-[11px] font-bold text-rose-800 uppercase">Crítica</div>
                <div className="text-2xl font-black text-rose-700">{complexityCounts.Crítica}</div>
                <div className="text-[10px] text-rose-600">Marino C5 / Ácidos</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Algoritmo de clasificación</span>
            <span className="font-semibold text-indigo-600">Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>

      {/* Recientes Proyectos & Tabla Rápida */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Proyectos en Seguimiento Activo</h3>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              {filteredProjects.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Código & Proyecto</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Área Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Clasificación IA</th>
                <th className="py-3 px-4">Presupuesto</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => {
                const statusColors: Record<string, string> = {
                  'Borrador': 'bg-slate-100 text-slate-700 border-slate-200',
                  'En Validación': 'bg-amber-50 text-amber-800 border-amber-200',
                  'Clasificado IA': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  'Revisión Técnica': 'bg-blue-50 text-blue-700 border-blue-200',
                  'Presupuesto': 'bg-purple-50 text-purple-700 border-purple-200',
                  'Aprobado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  'En Ejecución': 'bg-teal-50 text-teal-800 border-teal-200',
                  'Cierre': 'bg-slate-200 text-slate-800 border-slate-300',
                };

                return (
                  <tr 
                    key={p.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectProject(p)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {p.code} • {p.projectType}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{p.clientName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                        <span>{p.city}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {p.totalSqm.toLocaleString()} m²
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColors[p.status] || 'bg-slate-100'}`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {p.classification ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-semibold text-slate-800 truncate max-w-[160px]" title={p.classification.category}>
                            {p.classification.complexity} ({p.classification.confidenceScore}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pendiente</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ${p.budgetEstimated.toLocaleString()} USD
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(p);
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
