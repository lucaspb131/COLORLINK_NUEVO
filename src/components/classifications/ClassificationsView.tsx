import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Award,
  Activity,
  FileCheck
} from 'lucide-react';
import { Project } from '../../types';
import { GeminiPanel } from '../wizard/GeminiPanel';

interface ClassificationsViewProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

export const ClassificationsView: React.FC<ClassificationsViewProps> = ({
  projects,
  onSelectProject,
}) => {
  const [selectedComplexity, setSelectedComplexity] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Projects that have classifications
  const classifiedProjects = projects.filter(p => p.classification !== undefined);

  const filtered = classifiedProjects.filter(p => {
    const matchComplexity = selectedComplexity === 'Todas' || p.classification?.complexity === selectedComplexity;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.classification?.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchComplexity && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-2xl border border-indigo-900/50 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Motor de Inteligencia Artificial Generativa</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Diagnósticos y Especificaciones Técnicas con Gemini
          </h2>
          <p className="text-xs text-indigo-200/80 mt-0.5 max-w-2xl leading-relaxed">
            Catálogo consolidado de clasificaciones multicapa generadas con IA bajo estándares ISO 12944 y preparación de superficie SSPC.
          </p>
        </div>

        <div className="bg-indigo-900/60 border border-indigo-700/60 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-bold text-indigo-300 block">Model In Use</span>
          <span className="font-mono font-bold text-xs text-emerald-400">gemini-3.8-flash</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por sistema, proyecto, cliente..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedComplexity}
            onChange={(e) => setSelectedComplexity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium"
          >
            <option value="Todas">Todas las complejidades</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
        </div>
      </div>

      {/* List of Classifications Cards */}
      <div className="space-y-6">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                  {p.code}
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cliente: <strong>{p.clientName}</strong> • {p.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectProject(p)}
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <span>Ver Ficha Completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5">
              {p.classification && <GeminiPanel classification={p.classification} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
