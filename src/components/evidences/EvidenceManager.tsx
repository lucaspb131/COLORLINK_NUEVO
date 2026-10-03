import React, { useState } from 'react';
import { 
  Camera, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Hash, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Filter,
  Maximize2
} from 'lucide-react';
import { PhotographicEvidence, Project } from '../../types';

interface EvidenceManagerProps {
  projects: Project[];
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({ projects }) => {
  // Collect all evidences with their project title
  const allEvidences = projects.flatMap(p => 
    (p.evidences || []).map(ev => ({
      ...ev,
      projectTitle: p.title,
      projectCode: p.code,
      clientName: p.clientName
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<string>('Todas');
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x, 2x, 3x

  // Filtered list
  const filteredEvidences = allEvidences.filter(ev => {
    const matchSearch = ev.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchAnomaly = selectedAnomaly === 'Todas' || ev.anomalyDetected === selectedAnomaly;
    return matchSearch && matchAnomaly;
  });

  const selectedEvidence = activeEvidenceIndex !== null ? filteredEvidences[activeEvidenceIndex] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Módulo de Peritaje Técnico</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión y Auditoría de Evidencias Fotográficas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de microfotografías, firmas criptográficas SHA-256 para trazabilidad pericial y análisis de sustrato.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-blue-50 text-blue-800 font-bold px-3 py-1.5 rounded-lg border border-blue-200 font-mono">
            {allEvidences.length} Evidencias Registradas
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por foto, hash SHA-256, proyecto..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedAnomaly}
            onChange={(e) => setSelectedAnomaly(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium"
          >
            <option value="Todas">Todas las anomalías</option>
            <option value="Corrosión Puntual">Corrosión Puntual</option>
            <option value="Descascarillado">Descascarillado</option>
            <option value="Fisuración">Fisuración</option>
            <option value="Ampollamiento">Ampollamiento</option>
            <option value="Humedad Ascendente">Humedad Ascendente</option>
            <option value="Superficie Limpia">Superficie Limpia</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredEvidences.map((ev, idx) => (
          <div
            key={ev.id}
            onClick={() => {
              setActiveEvidenceIndex(idx);
              setZoomLevel(1);
            }}
            className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Image Thumbnail with Overlay */}
            <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
              <img
                src={ev.fileUrl}
                alt={ev.fileName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white border border-white/20">
                  {ev.anomalyDetected}
                </span>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-1 rounded-md bg-blue-600 text-white shadow-xs block">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[9px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded truncate block backdrop-blur-xs">
                  SHA-256: {ev.sha256Hash.substring(0, 16)}...
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-3.5 space-y-2">
              <div className="font-bold text-xs text-slate-800 truncate" title={ev.fileName}>
                {ev.fileName}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {ev.caption}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{ev.uploadedAt.split(' ')[0]}</span>
                </div>
                <span className="font-semibold text-blue-600 truncate max-w-[100px]" title={ev.projectTitle}>
                  {ev.projectCode}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inspection Modal with Interactive Zoom (1x, 2x, 3x) & Carousel */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {selectedEvidence.fileName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Proyecto: {selectedEvidence.projectTitle} ({selectedEvidence.projectCode})
                  </p>
                </div>
              </div>

              {/* Controls: Zoom, Close */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(1, prev - 1))}
                    className="p-1 rounded hover:bg-slate-700 text-slate-300"
                    title="Reducir Zoom"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold px-1.5 text-blue-400">
                    {zoomLevel}x
                  </span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 1))}
                    className="p-1 rounded hover:bg-slate-700 text-slate-300"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setActiveEvidenceIndex(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Image Canvas & Details Sidebar */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
              {/* Image Viewport */}
              <div className="lg:col-span-2 bg-black flex items-center justify-center p-4 relative overflow-auto select-none min-h-[360px]">
                <img
                  src={selectedEvidence.fileUrl}
                  alt={selectedEvidence.fileName}
                  className="max-h-[60vh] object-contain transition-transform duration-200 cursor-crosshair rounded"
                  style={{ transform: `scale(${zoomLevel})` }}
                />

                {/* Carousel previous / next */}
                {activeEvidenceIndex !== null && activeEvidenceIndex > 0 && (
                  <button
                    onClick={() => {
                      setActiveEvidenceIndex(activeEvidenceIndex - 1);
                      setZoomLevel(1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {activeEvidenceIndex !== null && activeEvidenceIndex < filteredEvidences.length - 1 && (
                  <button
                    onClick={() => {
                      setActiveEvidenceIndex(activeEvidenceIndex + 1);
                      setZoomLevel(1);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Technical Inspection Sidebar */}
              <div className="p-5 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/90 space-y-4 overflow-y-auto text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Diagnóstico Pericial
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                      {selectedEvidence.anomalyDetected}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {selectedEvidence.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Descripción / Observaciones
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
                    {selectedEvidence.caption}
                  </p>
                </div>

                {selectedEvidence.technicalNotes && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Notas del Inspector Técnico
                    </span>
                    <p className="text-blue-300 bg-blue-950/40 p-2.5 rounded-lg border border-blue-800/40">
                      {selectedEvidence.technicalNotes}
                    </p>
                  </div>
                )}

                {/* Metadata and Forensics */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cadena de Custodia & Criptografía
                  </span>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-[10px]">
                    <div className="text-slate-400 flex items-center space-x-1">
                      <Hash className="w-3 h-3 text-blue-400" />
                      <span>Hash Criptográfico SHA-256:</span>
                    </div>
                    <p className="text-blue-400 break-all select-all font-bold">
                      {selectedEvidence.sha256Hash}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Inspector:</span>
                      <strong className="text-slate-200">{selectedEvidence.uploadedBy}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Fecha y Hora:</span>
                      <strong className="text-slate-200">{selectedEvidence.uploadedAt}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tamaño:</span>
                      <strong className="text-slate-200">{selectedEvidence.fileSizeKb} KB</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Resolución:</span>
                      <strong className="text-slate-200">Alta Definición</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={selectedEvidence.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Imagen Original</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
