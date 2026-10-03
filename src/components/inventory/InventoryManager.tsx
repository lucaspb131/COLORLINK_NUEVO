import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Droplet, 
  Clock, 
  Leaf, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryManagerProps {
  inventory: InventoryItem[];
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', 'Primers Epóxicos', 'Acabados Poliuretano', 'Selladores', 'Revestimientos Alto Desempeño'];

  const filteredItems = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalGallons = inventory.reduce((a, b) => a + b.currentStockGallons, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Catálogo Técnico de Recubrimientos</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Inventario & Fichas Técnicas de Pintura
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Especificaciones de sólidos por volumen, rendimientos teóricos, tiempos de repintado y normatividad VOC.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Stock Disponible</span>
            <span className="font-mono font-black text-base">{totalGallons.toLocaleString()} Galones</span>
          </div>
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
            placeholder="Buscar por producto, SKU, categoría..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid of Technical Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {item.sku}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-1 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-blue-600 font-semibold">{item.brand}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {item.category}
                </span>
              </div>

              {/* Technical Specifications Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Sólidos por Vol.</span>
                  <strong className="text-slate-800 font-mono">{item.solidsByVolume}%</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Rendimiento Teórico</span>
                  <strong className="text-slate-800 font-mono">{item.theoreticalYieldSqmGal} m²/gal</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Secado al Tacto</span>
                  <strong className="text-slate-800">{item.dryingTimeTouchHours} horas</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Repintado</span>
                  <strong className="text-slate-800 truncate block">{item.recoatTimeHours}</strong>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Leaf className="w-3 h-3 text-emerald-600" />
                    <span>VOC: {item.vocGramsLiter} g/L</span>
                  </span>
                  <span className="font-bold text-slate-900">${item.unitPriceUSD} USD / Gal</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 text-[10px] block">Stock en Almacén:</span>
                <span className={`font-mono font-bold ${item.currentStockGallons < 200 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {item.currentStockGallons} Galones
                </span>
              </div>

              <button
                onClick={() => alert(`Ficha técnica oficial de "${item.name}" disponible en catálogo COLORLINK.`)}
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Ficha</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
