import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Download,
  Layers
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectsListProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onOpenWizard: () => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  onSelectProject,
  onOpenWizard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todas');

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = statusFilter === 'Todos' || p.status === statusFilter;
    const matchPriority = priorityFilter === 'Todas' || p.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

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

  const priorityColors: Record<string, string> = {
    'Baja': 'text-slate-500',
    'Media': 'text-blue-600',
    'Alta': 'text-amber-600 font-bold',
    'Urgente': 'text-rose-600 font-bold animate-pulse',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Portafolio de Proyectos de Recubrimiento</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión Integral de Proyectos & Obras
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión técnica, avance de etapas, presupuestos y cumplimiento de especificaciones ISO 12944.
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-300" />
          <span>Nueva Solicitud (Wizard)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, título, cliente o ciudad..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Borrador">Borrador</option>
            <option value="En Validación">En Validación</option>
            <option value="Clasificado IA">Clasificado IA</option>
            <option value="Revisión Técnica">Revisión Técnica</option>
            <option value="Presupuesto">Presupuesto</option>
            <option value="Aprobado">Aprobado</option>
            <option value="En Ejecución">En Ejecución</option>
            <option value="Cierre">Cierre</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium"
          >
            <option value="Todas">Todas las prioridades</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Código & Proyecto</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Área m²</th>
                <th className="py-3 px-4">Prioridad</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Diagnóstico IA</th>
                <th className="py-3 px-4">Presupuesto</th>
                <th className="py-3 px-4 text-right">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {p.code} • {p.projectType}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800">
                    {p.clientName}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                      <span>{p.city}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {p.totalSqm.toLocaleString()} m²
                  </td>

                  <td className="py-3 px-4">
                    <span className={priorityColors[p.priority]}>
                      {p.priority}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColors[p.status] || 'bg-slate-100'}`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {p.classification ? (
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={p.classification.category}>
                          {p.classification.complexity} ({p.classification.confidenceScore}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Pendiente</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    ${p.budgetEstimated.toLocaleString()} USD
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(p);
                      }}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
