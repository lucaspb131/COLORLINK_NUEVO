import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  FileText, 
  Download, 
  Printer, 
  AlertTriangle,
  User,
  CheckCircle2
} from 'lucide-react';
import { Project } from '../../types';
import { ProjectTimeline } from '../timeline/ProjectTimeline';
import { GeminiPanel } from '../wizard/GeminiPanel';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onUpdateProject: (p: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'areas' | 'timeline' | 'ai' | 'evidencias'>('resumen');

  const printTechnicalSheet = () => {
    window.print();
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `COLORLINK_${project.code}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {project.code}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  • {project.clientName}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                {project.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadJson}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Descargar Ficha Técnica JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'resumen'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('areas')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'areas'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Áreas ({project.areas?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Clasificación IA Gemini</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Línea de Tiempo ({project.timeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('evidencias')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'evidencias'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidencias ({project.evidences?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Highlights Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado</span>
                  <div className="text-sm font-extrabold text-blue-800 mt-1">{project.status}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Área Total</span>
                  <div className="text-sm font-mono font-extrabold text-slate-900 mt-1">{project.totalSqm.toLocaleString()} m²</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presupuesto</span>
                  <div className="text-sm font-mono font-extrabold text-emerald-700 mt-1">${project.budgetEstimated.toLocaleString()} USD</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prioridad</span>
                  <div className="text-sm font-extrabold text-amber-700 mt-1">{project.priority}</div>
                </div>
              </div>

              {/* Conditions Summary */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Condiciones Ambientales Registradas (ISO 12944)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Humedad Relativa:</span>
                    <strong>{project.conditions.humidity}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Temp. Superficie:</span>
                    <strong>{project.conditions.surfaceTemp}°C</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Corrosividad:</span>
                    <strong className="text-blue-700">{project.conditions.corrosivity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tráfico Operativo:</span>
                    <strong>{project.conditions.trafficType}</strong>
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              {project.activeAlerts?.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Alertas Dinámicas de Auditoría</span>
                  </span>
                  {project.activeAlerts.map((alt, i) => (
                    <p key={i} className="text-xs text-amber-900 font-medium pl-5">
                      • {alt}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: AREAS */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              {project.areas?.map((a, i) => (
                <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {i + 1}
                      </span>
                      <strong className="text-slate-900 text-sm">{a.name}</strong>
                      <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                        {a.substrate}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1 pl-7">
                      Ubicación: {a.location} • Altura: {a.heightMeters}m • Estado Inicial: <strong>{a.initialCondition}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Metros Cuadrados</span>
                    <span className="font-mono text-base font-extrabold text-blue-900">{a.sqm.toLocaleString()} m²</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: AI CLASSIFICATION */}
          {activeTab === 'ai' && (
            <div>
              {project.classification ? (
                <GeminiPanel classification={project.classification} />
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No se ha generado clasificación de IA para este proyecto aún.
                </div>
              )}
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === 'timeline' && (
            <ProjectTimeline 
              project={project} 
              onUpdateTimeline={onUpdateProject} 
            />
          )}

          {/* TAB: EVIDENCIAS */}
          {activeTab === 'evidencias' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.evidences?.map(ev => (
                <div key={ev.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <img src={ev.fileUrl} alt={ev.fileName} className="w-full h-36 object-cover" />
                  <div className="p-3 space-y-1">
                    <strong className="text-slate-900 block truncate">{ev.fileName}</strong>
                    <p className="text-slate-500 line-clamp-2">{ev.caption}</p>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      SHA: {ev.sha256Hash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Asignado a: <strong>{project.assignedEngineer}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
