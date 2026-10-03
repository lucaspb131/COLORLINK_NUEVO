import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Project, TimelineEvent, ProjectStatus } from '../../types';

interface ProjectTimelineProps {
  project: Project;
  onUpdateTimeline: (updatedProject: Project) => void;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  project,
  onUpdateTimeline,
}) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventStatus, setNewEventStatus] = useState<ProjectStatus>('Revisión Técnica');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [newEventAuthor, setNewEventAuthor] = useState('Ing. Carlos Mendoza');

  const allStatuses: { status: ProjectStatus; label: string; icon: string }[] = [
    { status: 'Borrador', label: 'Creación', icon: '📌' },
    { status: 'En Validación', label: 'Validación', icon: '🔍' },
    { status: 'Clasificado IA', label: 'Clasificación IA', icon: '🧠' },
    { status: 'Revisión Técnica', label: 'Revisión Técnica', icon: '📐' },
    { status: 'Presupuesto', label: 'Presupuesto', icon: '💰' },
    { status: 'Aprobado', label: 'Aprobación', icon: '✅' },
    { status: 'En Ejecución', label: 'Ejecución', icon: '🏗' },
    { status: 'Cierre', label: 'Cierre', icon: '🏁' },
  ];

  // Advance to next milestone
  const handleAdvanceMilestone = (status: ProjectStatus, label: string) => {
    const existingIndex = project.timeline.findIndex(t => t.status === status);
    
    let updatedEvents = [...project.timeline];
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (existingIndex >= 0) {
      updatedEvents[existingIndex] = {
        ...updatedEvents[existingIndex],
        completed: true,
        date: now,
      };
    } else {
      updatedEvents.push({
        id: `t-${Date.now()}`,
        status,
        label,
        description: `Hito alcanzado: ${label}`,
        date: now,
        author: newEventAuthor,
        role: 'Ingeniero Responsable',
        completed: true,
      });
    }

    const updatedProject: Project = {
      ...project,
      status,
      updatedAt: now.split(' ')[0],
      timeline: updatedEvents,
    };

    onUpdateTimeline(updatedProject);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Trazabilidad Operativa & Auditoría</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Línea de Tiempo del Proyecto {project.code}
          </h3>
          <p className="text-xs text-slate-500">
            Historial de estados con fecha, hora, rol responsable y bitácora técnica de avance.
          </p>
        </div>

        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono">
          Estado Actual: {project.status}
        </span>
      </div>

      {/* Horizontal Status Track Overview */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[700px] px-2 py-3 bg-slate-50 rounded-xl border border-slate-200/80">
          {allStatuses.map((st, i) => {
            const isCompleted = project.timeline.some(t => t.status === st.status && t.completed);
            const isCurrent = project.status === st.status;

            return (
              <React.Fragment key={st.status}>
                <div 
                  className={`flex flex-col items-center group cursor-pointer ${
                    isCurrent ? 'text-blue-600 font-bold' : isCompleted ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}
                  onClick={() => handleAdvanceMilestone(st.status, st.label)}
                  title={`Clic para marcar estado como ${st.label}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-blue-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-[11px] mt-1.5 text-center truncate max-w-[85px]">
                    {st.label}
                  </span>
                </div>

                {i < allStatuses.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed Vertical Event History */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Bitácora Detallada de Eventos Registrados
        </h4>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {project.timeline.map((event, idx) => (
            <div key={event.id} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                event.completed ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {event.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              </div>

              {/* Event Card */}
              <div className="bg-slate-50 hover:bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      {event.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {event.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{event.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.description}
                </p>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Responsable: <strong className="text-slate-800">{event.author}</strong> ({event.role})</span>
                  </div>

                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Auditado
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
