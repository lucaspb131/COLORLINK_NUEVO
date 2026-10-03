import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Cpu, 
  BarChart, 
  FileText, 
  Layers, 
  Activity,
  Droplets,
  Award
} from 'lucide-react';
import { GeminiClassification } from '../../types';

interface GeminiPanelProps {
  classification: GeminiClassification;
  isLoading?: boolean;
}

export const GeminiPanel: React.FC<GeminiPanelProps> = ({
  classification,
  isLoading = false,
}) => {
  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'Crítica':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Alta':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Media':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-indigo-200/80 rounded-2xl p-6 shadow-md relative overflow-hidden space-y-6">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Gemini Badge & Model */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] via-indigo-600 to-[#3B82F6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Diagnóstico Técnico IA Gemini
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-mono">
                {classification.modelUsed || 'gemini-3.8-flash'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluación automatizada bajo normas internacionales SSPC / ISO 12944 y NACE/AMPP
            </p>
          </div>
        </div>

        {/* Date and ISO */}
        <div className="text-left sm:text-right">
          <span className="text-[11px] font-mono text-slate-500 block">
            Fecha: {classification.classificationDate}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
            ISO 12944-5 Verificado
          </span>
        </div>
      </div>

      {/* Top Cards: Categoría, Confianza, Complejidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Sistema Clasificado</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
              {classification.category}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Resina química: <strong className="text-slate-800">{classification.coatingType}</strong>
          </div>
        </div>

        {/* Confidence Card with Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <div className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Nivel de Confianza</span>
              </div>
              <span className="text-base font-extrabold font-mono text-emerald-700">
                {classification.confidenceScore}%
              </span>
            </div>

            {/* Visual Animated Confidence Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${classification.confidenceScore}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Certeza alta según matriz de sustrato y humedad</span>
          </div>
        </div>

        {/* Complexity Card with Badge */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Nivel de Complejidad</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs font-extrabold rounded-lg border uppercase tracking-wider ${getComplexityBadge(classification.complexity)}`}>
                {classification.complexity}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {classification.complexity === 'Crítica' || classification.complexity === 'Alta' 
                  ? 'Requiere Inspector NACE/AMPP' 
                  : 'Procedimiento Estándar'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Rendimiento teórico:</span>
            <strong className="text-slate-800 font-mono font-bold">~{classification.estimatedYieldGallons} Galones</strong>
          </div>
        </div>
      </div>

      {/* Recommended Multilayer System (Steps & Standards) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Sistema Multicapa Especificado por la IA</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            {classification.recommendedSystem?.length || 0} Fases Técnicas
          </span>
        </div>

        <div className="space-y-3">
          {classification.recommendedSystem?.map((step, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {step.step}
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  {step.action}
                </p>
              </div>

              <div className="shrink-0 pl-7 sm:pl-0">
                <span className="text-[10px] font-mono font-bold bg-white text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs">
                  {step.standard}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Conditions Detected vs Missing Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conditions Detected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 mb-3 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Condiciones Operativas Detectadas</span>
          </h5>
          <ul className="space-y-2">
            {classification.detectedConditions?.map((cond, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Data & Warnings */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Datos Faltantes Sugeridos por IA</span>
          </h5>
          <ul className="space-y-2">
            {classification.missingData?.map((item, i) => (
              <li key={i} className="text-xs text-amber-900 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Observations & VOC Footnote */}
      <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Observaciones Técnicas de Curado y Aplicación:</span>
        </div>
        <p className="leading-relaxed text-slate-600 pl-6">
          {classification.observations}
        </p>
        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between pl-6">
          <span>{classification.vocCompliance}</span>
          <span className="font-semibold text-blue-600">Sello de Calidad COLORLINK</span>
        </div>
      </div>
    </div>
  );
};
