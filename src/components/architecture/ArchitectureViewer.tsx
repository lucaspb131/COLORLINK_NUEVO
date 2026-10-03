import React, { useState } from 'react';
import { 
  Code2, 
  Database, 
  Terminal, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Folder, 
  FolderOpen, 
  Cpu, 
  Layers, 
  ShieldCheck,
  Server,
  Play
} from 'lucide-react';
import { ARCHITECTURE_FILES, ProjectFile } from './architectureCodeData';

export const ArchitectureViewer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('fastapi-main');
  const [copied, setCopied] = useState(false);

  const selectedFile = ARCHITECTURE_FILES.find(f => f.id === selectedFileId) || ARCHITECTURE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.fileName;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1E3A8A] to-blue-900 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Arquitectura Empresarial End-to-End</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Código Fuente del Backend FastAPI, Streamlit, MySQL 8 & Docker
          </h2>
          <p className="text-xs text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
            Consulte, audite o descargue los scripts SQL para MySQL Workbench, la API REST en FastAPI con SQLAlchemy 2, la aplicación Streamlit y la orquestación Docker Compose.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            Stack: FastAPI + Streamlit + MySQL 8 + Docker
          </span>
        </div>
      </div>

      {/* Main IDE-like Viewer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[600px]">
        {/* Left: Directory Tree Sidebar */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/70 overflow-y-auto max-h-[650px] text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
            <span>Estructura del Proyecto</span>
            <span className="font-mono text-[10px] text-blue-400">colorlink/</span>
          </div>

          <div className="space-y-1">
            {ARCHITECTURE_FILES.map(file => {
              const isSelected = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="block truncate font-mono text-[11px]">{file.path}</span>
                    <span className="text-[10px] text-slate-500 block">{file.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-3 flex flex-col bg-slate-950 min-h-[500px]">
          {/* File Tab Header */}
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-blue-400">
                {selectedFile.path}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {selectedFile.language}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
          </div>

          {/* Code text area */}
          <div className="p-4 flex-1 overflow-auto bg-slate-950 font-mono text-[11.5px] leading-relaxed text-slate-300 select-all">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 border-t border-slate-900 bg-slate-900/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Archivo compatible para despliegue productivo local o en nube</span>
            <span className="font-mono text-blue-400">{selectedFile.fileName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
