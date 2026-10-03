import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Layers, 
  Filter, 
  Calendar, 
  MapPin, 
  Activity, 
  ShieldCheck,
  Droplets,
  DollarSign
} from 'lucide-react';
import { Project, Client } from '../../types';

interface AnalyticsViewProps {
  projects: Project[];
  clients: Client[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projects, clients }) => {
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [selectedType, setSelectedType] = useState('Todos');

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchCity = selectedCity === 'Todas' || p.city === selectedCity;
      const matchType = selectedType === 'Todos' || p.projectType === selectedType;
      return matchCity && matchType;
    });
  }, [projects, selectedCity, selectedType]);

  // Total budget and average ticket
  const totalBudget = filtered.reduce((a, b) => a + b.budgetEstimated, 0);
  const avgBudget = filtered.length ? Math.round(totalBudget / filtered.length) : 0;
  const totalSqm = filtered.reduce((a, b) => a + b.totalSqm, 0);

  // Corrosivity breakdown
  const corrosivityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'C1 (Muy Baja)': 0,
      'C2 (Baja)': 0,
      'C3 (Media)': 0,
      'C4 (Alta)': 0,
      'C5 (Muy Alta - Marina/Industrial)': 0,
    };
    filtered.forEach(p => {
      const cat = p.conditions.corrosivity;
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [filtered]);

  // Cities count
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(p => {
      counts[p.city] = (counts[p.city] || 0) + 1;
    });
    return counts;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Inteligencia de Negocio & Operaciones</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Analítica Predictiva y Métricas de Corrosión
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análisis de distribución de sustratos, exposición ambiental C1-C5 y proyección de consumo de recubrimientos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
          >
            <option value="Todas">Todas las ciudades</option>
            <option value="Bogotá">Bogotá</option>
            <option value="Medellín">Medellín</option>
            <option value="Cartagena">Cartagena</option>
            <option value="Barranquilla">Barranquilla</option>
            <option value="Cali">Cali</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
          >
            <option value="Todos">Todos los sectores</option>
            <option value="Industrial">Industrial</option>
            <option value="Comercial">Comercial</option>
            <option value="Marino">Marino</option>
            <option value="Estructuras Metálicas">Estructuras</option>
          </select>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Valor Total en Pipeline</span>
          <div className="text-2xl font-black text-slate-900 mt-1">${totalBudget.toLocaleString()} USD</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Ticket promedio: ${avgBudget.toLocaleString()} USD</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Superficie Total Estimada</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{totalSqm.toLocaleString()} m²</div>
          <div className="text-xs text-slate-500 mt-1">
            Proyección: ~{Math.ceil((totalSqm * 1.3) / 25).toLocaleString()} galones requeridos
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exposición Severa (C4 / C5)</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {(corrosivityCounts['C4 (Alta)'] + corrosivityCounts['C5 (Muy Alta - Marina/Industrial)'])} Proyectos
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            Exigen sistemas de 3 capas y zinc sacrificial
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ISO 12944 Corrosivity Spectrum */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Distribución por Corrosividad Atmosférica (ISO 12944)</span>
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Norma Mundial
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(corrosivityCounts).map(([cat, count]) => {
              const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
              const isHigh = cat.includes('C4') || cat.includes('C5');

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isHigh ? 'text-rose-900 font-bold' : 'text-slate-700'}>{cat}</span>
                    <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-gradient-to-r from-amber-500 to-rose-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Distribución Geográfica de Obras</span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              {Object.keys(cityCounts).length} Ciudades
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(cityCounts).map(([city, count]) => {
              const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
              return (
                <div key={city} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{city}</span>
                    <span className="text-slate-500 font-mono">{count} proyectos ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
